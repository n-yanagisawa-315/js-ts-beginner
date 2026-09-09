import {
  cloneGitState,
  getCommit,
  getCurrentBranch,
  getHeadCommitId,
  getHeadTree,
  type GitCommit,
  type GitState,
  type GitTree,
} from "./git-state.ts";

export type GitFileStatus = {
  path: string;
  index: "added" | "modified" | "deleted" | null;
  workingTree: "untracked" | "modified" | "deleted" | null;
};

export type GitCommandResult = {
  state: GitState;
  output: string[];
  exitCode: 0 | 1;
  error: string | null;
};

class CommandError extends Error {}

const UNSAFE_UNQUOTED = new Set([";", "|", "&", ">", "<", "`"]);

export function tokenizeCommand(command: string): string[] {
  const tokens: string[] = [];
  let token = "";
  let quote: "'" | '"' | null = null;
  let escaping = false;
  let active = false;

  for (const character of command) {
    if (escaping) {
      token += character;
      escaping = false;
      active = true;
      continue;
    }
    if (character === "\\") {
      if (quote === "'") token += character;
      else escaping = true;
      active = true;
      continue;
    }
    if (quote) {
      if (character === quote) quote = null;
      else token += character;
      active = true;
      continue;
    }
    if (character === "'" || character === '"') {
      quote = character;
      active = true;
      continue;
    }
    if (/\s/.test(character)) {
      if (active) {
        tokens.push(token);
        token = "";
        active = false;
      }
      continue;
    }
    if (UNSAFE_UNQUOTED.has(character)) {
      throw new CommandError(`安全でない記号 "${character}" は使用できません`);
    }
    token += character;
    active = true;
  }

  if (escaping) throw new CommandError("末尾のバックスラッシュが不完全です");
  if (quote) throw new CommandError("引用符が閉じられていません");
  if (active) tokens.push(token);
  return tokens;
}

function fail(message: string): never {
  throw new CommandError(message);
}

function requireInitialized(state: GitState) {
  if (!state.initialized) fail("not a git repository (run git init)");
}

function nextTimestamp(state: GitState): string {
  const sequence =
    state.commits.length +
    state.pullRequests.length +
    state.issues.length +
    state.runs.length;
  return new Date(Date.UTC(2025, 0, 1, 0, 0, sequence)).toISOString();
}

function hash(input: string): string {
  let value = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    value ^= input.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return (value >>> 0).toString(16).padStart(8, "0");
}

function createCommit(
  state: GitState,
  message: string,
  tree: GitTree,
  parents: string[],
): GitCommit {
  const seed = `${state.commits.length}:${message}:${parents.join(",")}:${JSON.stringify(tree)}`;
  return {
    id: hash(seed),
    message,
    tree: { ...tree },
    parents: [...parents],
    author: "Learner <learner@example.com>",
    createdAt: nextTimestamp(state),
  };
}

function applyIndex(state: GitState): GitTree {
  const tree = { ...getHeadTree(state) };
  for (const [path, content] of Object.entries(state.index)) {
    if (content === null) delete tree[path];
    else tree[path] = content;
  }
  return tree;
}

function sameTree(left: GitTree, right: GitTree): boolean {
  const paths = new Set([...Object.keys(left), ...Object.keys(right)]);
  for (const path of paths) {
    if (left[path] !== right[path]) return false;
  }
  return true;
}

function isWorkingTreeClean(state: GitState): boolean {
  return Object.keys(state.index).length === 0 &&
    sameTree(state.workingTree, getHeadTree(state));
}

export function getGitStatus(state: GitState): GitFileStatus[] {
  const head = getHeadTree(state);
  const stagedTree = applyIndex(state);
  const paths = new Set([
    ...Object.keys(head),
    ...Object.keys(state.index),
    ...Object.keys(state.workingTree),
  ]);

  return [...paths].sort().flatMap((path) => {
    const before = head[path];
    const staged = stagedTree[path];
    const working = state.workingTree[path];
    let index: GitFileStatus["index"] = null;
    let workingTree: GitFileStatus["workingTree"] = null;

    if (before !== staged) {
      index = before === undefined
        ? "added"
        : staged === undefined
          ? "deleted"
          : "modified";
    }
    if (staged !== working) {
      workingTree = staged === undefined
        ? "untracked"
        : working === undefined
          ? "deleted"
          : "modified";
    }

    return index || workingTree ? [{ path, index, workingTree }] : [];
  });
}

function readFlag(
  args: string[],
  shortName: string,
  longName: string,
): string | undefined {
  const index = args.findIndex(
    (argument) => argument === shortName || argument === longName,
  );
  if (index < 0) return undefined;
  if (!args[index + 1] || args[index + 1].startsWith("-")) {
    fail(`${args[index]} requires a value`);
  }
  return args[index + 1];
}

function positionals(args: string[], flagsWithValues: string[]): string[] {
  const values: string[] = [];
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (flagsWithValues.includes(argument)) {
      index += 1;
    } else if (!argument.startsWith("-")) {
      values.push(argument);
    }
  }
  return values;
}

function branchTip(state: GitState, branch: string): string | null {
  if (!Object.hasOwn(state.branches, branch)) {
    fail(`branch '${branch}' not found`);
  }
  return state.branches[branch];
}

function isAncestor(
  state: GitState,
  possibleAncestor: string | null,
  commitId: string | null,
): boolean {
  if (possibleAncestor === null) return true;
  const pending = commitId ? [commitId] : [];
  const visited = new Set<string>();
  while (pending.length > 0) {
    const current = pending.pop()!;
    if (current === possibleAncestor) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    pending.push(...(getCommit(state, current)?.parents ?? []));
  }
  return false;
}

function findCommonAncestor(
  state: GitState,
  left: string | null,
  right: string | null,
): string | null {
  const leftAncestors = new Set<string>();
  const pending = left ? [left] : [];
  while (pending.length > 0) {
    const current = pending.pop()!;
    if (leftAncestors.has(current)) continue;
    leftAncestors.add(current);
    pending.push(...(getCommit(state, current)?.parents ?? []));
  }
  const rightPending = right ? [right] : [];
  while (rightPending.length > 0) {
    const current = rightPending.shift()!;
    if (leftAncestors.has(current)) return current;
    rightPending.push(...(getCommit(state, current)?.parents ?? []));
  }
  return null;
}

function mergeTrees(
  base: GitTree,
  current: GitTree,
  incoming: GitTree,
): GitTree {
  const result = { ...current };
  const paths = new Set([
    ...Object.keys(base),
    ...Object.keys(current),
    ...Object.keys(incoming),
  ]);
  for (const path of paths) {
    const baseValue = base[path];
    const currentValue = current[path];
    const incomingValue = incoming[path];
    const currentChanged = currentValue !== baseValue;
    const incomingChanged = incomingValue !== baseValue;
    if (currentChanged && incomingChanged && currentValue !== incomingValue) {
      fail(`CONFLICT (content): Merge conflict in ${path}`);
    }
    if (!currentChanged && incomingChanged) {
      if (incomingValue === undefined) delete result[path];
      else result[path] = incomingValue;
    }
  }
  return result;
}

function handleGitInit(state: GitState, args: string[]): string[] {
  const branch = readFlag(args, "-b", "--initial-branch");
  const unsupported = positionals(args, ["-b", "--initial-branch"]);
  if (unsupported.length > 0) fail("git init: directories are not supported");
  const wasInitialized = state.initialized;
  state.initialized = true;
  if (branch) {
    state.branches = { [branch]: null };
    state.HEAD = { kind: "branch", name: branch };
  } else if (!Object.keys(state.branches).length) {
    state.branches.main = null;
    state.HEAD = { kind: "branch", name: "main" };
  }
  return [
    wasInitialized
      ? "Reinitialized existing Git repository"
      : "Initialized empty Git repository",
  ];
}

function handleGitStatus(state: GitState): string[] {
  requireInitialized(state);
  const branch = getCurrentBranch(state);
  const lines = [
    branch ? `On branch ${branch}` : `HEAD detached at ${getHeadCommitId(state)}`,
  ];
  const statuses = getGitStatus(state);
  if (statuses.length === 0) return [...lines, "nothing to commit, working tree clean"];
  for (const status of statuses) {
    if (status.index) lines.push(`staged: ${status.index.padEnd(8)} ${status.path}`);
    if (status.workingTree) {
      lines.push(`working: ${status.workingTree.padEnd(8)} ${status.path}`);
    }
  }
  return lines;
}

function handleGitAdd(state: GitState, args: string[]): string[] {
  requireInitialized(state);
  if (args.length === 0) fail("Nothing specified, nothing added");
  const addAll = args.some((argument) => [".", "-A", "--all"].includes(argument));
  const head = getHeadTree(state);
  const paths = addAll
    ? new Set([...Object.keys(head), ...Object.keys(state.workingTree)])
    : new Set(args.filter((argument) => !argument.startsWith("-")));
  for (const path of paths) {
    if (!Object.hasOwn(state.workingTree, path) && !Object.hasOwn(head, path)) {
      fail(`pathspec '${path}' did not match any files`);
    }
  }
  for (const path of paths) {
    const content = state.workingTree[path];
    if (content === head[path]) delete state.index[path];
    else state.index[path] = content ?? null;
  }
  return [];
}

function handleGitCommit(state: GitState, args: string[]): string[] {
  requireInitialized(state);
  const branch = getCurrentBranch(state);
  if (!branch) fail("cannot commit in detached HEAD in this simulator");
  const message = readFlag(args, "-m", "--message");
  if (!message) fail("commit message is required: git commit -m \"message\"");
  if (Object.keys(state.index).length === 0) fail("nothing to commit");
  const parent = getHeadCommitId(state);
  const commit = createCommit(
    state,
    message,
    applyIndex(state),
    parent ? [parent] : [],
  );
  state.commits.push(commit);
  state.branches[branch] = commit.id;
  state.index = {};
  return [`[${branch} ${commit.id.slice(0, 7)}] ${message}`];
}

function handleGitLog(state: GitState, args: string[]): string[] {
  requireInitialized(state);
  const oneline = args.includes("--oneline");
  const limitText = readFlag(args, "-n", "--max-count");
  const limit = limitText ? Number(limitText) : Number.POSITIVE_INFINITY;
  if (!Number.isInteger(limit) && limit !== Number.POSITIVE_INFINITY) {
    fail("log limit must be an integer");
  }
  const lines: string[] = [];
  let commitId = getHeadCommitId(state);
  while (commitId && lines.length < limit) {
    const commit = getCommit(state, commitId);
    if (!commit) break;
    lines.push(
      oneline
        ? `${commit.id.slice(0, 7)} ${commit.message}`
        : `commit ${commit.id}\nAuthor: ${commit.author}\n\n    ${commit.message}`,
    );
    commitId = commit.parents[0] ?? null;
  }
  return lines.length ? lines : ["No commits yet"];
}

function handleGitBranch(state: GitState, args: string[]): string[] {
  requireInitialized(state);
  if (args.length === 0) {
    const current = getCurrentBranch(state);
    return Object.keys(state.branches)
      .sort()
      .map((branch) => `${branch === current ? "*" : " "} ${branch}`);
  }
  if (args[0] === "-d" || args[0] === "-D") {
    const branch = args[1];
    if (!branch) fail("branch name is required");
    if (branch === getCurrentBranch(state)) fail("cannot delete checked out branch");
    branchTip(state, branch);
    delete state.branches[branch];
    return [`Deleted branch ${branch}`];
  }
  const name = args[0];
  if (name.startsWith("-")) fail(`unknown branch option: ${name}`);
  if (Object.hasOwn(state.branches, name)) fail(`branch '${name}' already exists`);
  state.branches[name] = getHeadCommitId(state);
  return [];
}

function handleGitSwitch(state: GitState, args: string[]): string[] {
  requireInitialized(state);
  if (!isWorkingTreeClean(state)) fail("local changes would be overwritten by switch");
  const create = args[0] === "-c" || args[0] === "--create";
  const branch = args[create ? 1 : 0];
  if (!branch) fail("branch name is required");
  if (create) {
    if (Object.hasOwn(state.branches, branch)) fail(`branch '${branch}' already exists`);
    state.branches[branch] = getHeadCommitId(state);
  } else {
    branchTip(state, branch);
  }
  state.HEAD = { kind: "branch", name: branch };
  state.workingTree = {
    ...(getCommit(state, state.branches[branch])?.tree ?? {}),
  };
  state.index = {};
  return [`Switched to ${create ? "a new branch" : "branch"} '${branch}'`];
}

function handleGitMerge(state: GitState, args: string[]): string[] {
  requireInitialized(state);
  if (args[0] === "--abort") {
    const hasConflictMarker = Object.values(state.workingTree).some((content) =>
      content.includes("<<<<<<<"),
    );
    if (!hasConflictMarker) fail("There is no merge to abort");
    state.workingTree = { ...getHeadTree(state) };
    state.index = {};
    return ["Merge aborted"];
  }
  if (!isWorkingTreeClean(state)) fail("commit or stash changes before merge");
  const currentBranch = getCurrentBranch(state);
  const incomingBranch = args[0];
  if (!currentBranch || !incomingBranch) fail("current and incoming branches are required");
  const currentTip = branchTip(state, currentBranch);
  const incomingTip = branchTip(state, incomingBranch);
  if (currentTip === incomingTip || isAncestor(state, incomingTip, currentTip)) {
    state.mergedBranches.push(incomingBranch);
    return ["Already up to date."];
  }
  if (isAncestor(state, currentTip, incomingTip)) {
    state.branches[currentBranch] = incomingTip;
    state.workingTree = {
      ...(getCommit(state, incomingTip)?.tree ?? {}),
    };
    state.mergedBranches.push(incomingBranch);
    return ["Fast-forward"];
  }
  const ancestor = findCommonAncestor(state, currentTip, incomingTip);
  const tree = mergeTrees(
    getCommit(state, ancestor)?.tree ?? {},
    getCommit(state, currentTip)?.tree ?? {},
    getCommit(state, incomingTip)?.tree ?? {},
  );
  const commit = createCommit(
    state,
    `Merge branch '${incomingBranch}'`,
    tree,
    [currentTip, incomingTip].filter((id): id is string => Boolean(id)),
  );
  state.commits.push(commit);
  state.branches[currentBranch] = commit.id;
  state.workingTree = { ...tree };
  state.mergedBranches.push(incomingBranch);
  return [`Merge made by the 'ort' strategy.`, commit.id.slice(0, 7)];
}

function handleGitRemote(state: GitState, args: string[]): string[] {
  requireInitialized(state);
  if (args.length === 0) return Object.keys(state.remotes).sort();
  if (args[0] === "-v") {
    return Object.entries(state.remotes).flatMap(([name, url]) => [
      `${name}\t${url} (fetch)`,
      `${name}\t${url} (push)`,
    ]);
  }
  if (args[0] === "add") {
    const [, name, url] = args;
    if (!name || !url) fail("usage: git remote add <name> <url>");
    if (Object.hasOwn(state.remotes, name)) fail(`remote ${name} already exists`);
    state.remotes[name] = url;
    state.remoteRefs[name] = {};
    return [];
  }
  if (args[0] === "remove" || args[0] === "rm") {
    const name = args[1];
    if (!name || !Object.hasOwn(state.remotes, name)) fail(`No such remote: '${name}'`);
    delete state.remotes[name];
    delete state.remoteRefs[name];
    return [];
  }
  fail(`unsupported remote action: ${args[0]}`);
}

function handleGitPush(state: GitState, args: string[]): string[] {
  requireInitialized(state);
  const values = positionals(args, []);
  const remote = values[0] ?? "origin";
  const branch = values[1] ?? getCurrentBranch(state);
  if (!branch) fail("push branch is required");
  if (!Object.hasOwn(state.remotes, remote)) fail(`'${remote}' does not appear to be a repository`);
  const tip = branchTip(state, branch);
  if (!tip) fail(`src refspec ${branch} does not match any`);
  const previous = state.remoteRefs[remote]?.[branch] ?? null;
  if (previous && !isAncestor(state, previous, tip) && !args.includes("--force")) {
    fail("rejected (non-fast-forward)");
  }
  state.remoteRefs[remote] ??= {};
  state.remoteRefs[remote][branch] = tip;
  state.runs.push({
    id: state.runs.length + 1,
    branch,
    commitId: tip,
    status: "completed",
    conclusion: "success",
    name: "CI",
    createdAt: nextTimestamp(state),
  });
  return [`${remote}: ${branch} -> ${branch}`];
}

function handleGitPull(state: GitState, args: string[]): string[] {
  requireInitialized(state);
  if (!isWorkingTreeClean(state)) fail("cannot pull with local changes");
  const current = getCurrentBranch(state);
  const remote = args[0] ?? "origin";
  const branch = args[1] ?? current;
  if (!current || !branch) fail("pull branch is required");
  if (!Object.hasOwn(state.remotes, remote)) fail(`No such remote '${remote}'`);
  const remoteTip = state.remoteRefs[remote]?.[branch];
  if (remoteTip === undefined) {
    state.remoteRefs[remote] ??= {};
    state.remoteRefs[remote][branch] = state.branches[current];
    return ["Already up to date."];
  }
  const localTip = state.branches[current];
  if (localTip === remoteTip || isAncestor(state, remoteTip, localTip)) {
    return ["Already up to date."];
  }
  if (!isAncestor(state, localTip, remoteTip)) fail("divergent branches; merge required");
  state.branches[current] = remoteTip;
  state.workingTree = { ...(getCommit(state, remoteTip)?.tree ?? {}) };
  return ["Fast-forward"];
}

function handleGit(state: GitState, args: string[]): string[] {
  const [command, ...rest] = args;
  switch (command) {
    case "init": return handleGitInit(state, rest);
    case "status": return handleGitStatus(state);
    case "add": return handleGitAdd(state, rest);
    case "commit": return handleGitCommit(state, rest);
    case "log": return handleGitLog(state, rest);
    case "branch": return handleGitBranch(state, rest);
    case "switch": return handleGitSwitch(state, rest);
    case "merge": return handleGitMerge(state, rest);
    case "remote": return handleGitRemote(state, rest);
    case "push": return handleGitPush(state, rest);
    case "pull": return handleGitPull(state, rest);
    default: fail(command ? `git: '${command}' is not a supported command` : "usage: git <command>");
  }
}

function handleGhPr(state: GitState, args: string[]): string[] {
  const [action, ...rest] = args;
  if (action === "create") {
    const base = readFlag(rest, "-B", "--base") ?? "main";
    const head = readFlag(rest, "-H", "--head") ?? getCurrentBranch(state);
    const title = readFlag(rest, "-t", "--title");
    const body = readFlag(rest, "-b", "--body") ?? "";
    if (!head || !title) fail("pr create requires --title and a head branch");
    branchTip(state, base);
    const headTip = branchTip(state, head);
    if (!headTip) fail("head branch has no commits");
    if (!Object.values(state.remoteRefs).some((refs) => refs[head] === headTip)) {
      fail(`head branch '${head}' must be pushed first`);
    }
    if (state.pullRequests.some((pr) => pr.state === "open" && pr.base === base && pr.head === head)) {
      fail("a pull request already exists for this branch");
    }
    const pullRequest = {
      number: state.pullRequests.length + 1,
      title,
      body,
      base,
      head,
      state: "open" as const,
      createdAt: nextTimestamp(state),
    };
    state.pullRequests.push(pullRequest);
    return [`Created pull request #${pullRequest.number}: ${title}`];
  }
  if (action === "status") {
    const open = state.pullRequests.filter((pr) => pr.state === "open");
    return open.length
      ? open.map((pr) => `#${pr.number} ${pr.title} (${pr.head} -> ${pr.base})`)
      : ["No open pull requests"];
  }
  if (action === "merge") {
    const numberText = positionals(rest, [])[0];
    const number = numberText ? Number(numberText.replace(/^#/, "")) : NaN;
    const pullRequest = state.pullRequests.find((pr) =>
      Number.isNaN(number)
        ? pr.state === "open" && pr.head === getCurrentBranch(state)
        : pr.number === number,
    );
    if (!pullRequest || pullRequest.state !== "open") fail("open pull request not found");
    const baseTip = branchTip(state, pullRequest.base);
    const headTip = branchTip(state, pullRequest.head);
    if (!headTip) fail("head branch has no commits");
    const baseTree = getCommit(state, baseTip)?.tree ?? {};
    const headTree = getCommit(state, headTip)?.tree ?? {};
    const ancestor = findCommonAncestor(state, baseTip, headTip);
    const tree = mergeTrees(
      getCommit(state, ancestor)?.tree ?? {},
      baseTree,
      headTree,
    );
    const commit = createCommit(
      state,
      `Merge pull request #${pullRequest.number}`,
      tree,
      [baseTip, headTip].filter((id): id is string => Boolean(id)),
    );
    state.commits.push(commit);
    state.branches[pullRequest.base] = commit.id;
    pullRequest.state = "merged";
    if (getCurrentBranch(state) === pullRequest.base) {
      state.workingTree = { ...tree };
    }
    return [`✓ Pull request #${pullRequest.number} merged`];
  }
  fail(`unsupported gh pr action: ${action ?? ""}`);
}

function handleGhIssue(state: GitState, args: string[]): string[] {
  const [action, ...rest] = args;
  if (action === "create") {
    const title = readFlag(rest, "-t", "--title");
    const body = readFlag(rest, "-b", "--body") ?? "";
    if (!title) fail("issue create requires --title");
    const issue = {
      number: state.issues.length + 1,
      title,
      body,
      state: "open" as const,
      createdAt: nextTimestamp(state),
    };
    state.issues.push(issue);
    return [`Created issue #${issue.number}: ${title}`];
  }
  if (action === "list") {
    const issues = state.issues.filter((issue) => issue.state === "open");
    return issues.length
      ? issues.map((issue) => `#${issue.number}\t${issue.title}\tOPEN`)
      : ["No open issues"];
  }
  fail(`unsupported gh issue action: ${action ?? ""}`);
}

function handleGh(state: GitState, args: string[]): string[] {
  requireInitialized(state);
  const [group, action, ...rest] = args;
  if (group === "auth" && action === "status") {
    return ["github.com", "  ✓ Logged in to github.com as learner"];
  }
  if (group === "repo" && action === "view") {
    const remote = state.remotes.origin ?? Object.values(state.remotes)[0];
    if (!remote) fail("no repository remote configured");
    return [`Repository: ${remote}`, `Default branch: main`];
  }
  if (group === "pr") return handleGhPr(state, [action, ...rest]);
  if (group === "issue") return handleGhIssue(state, [action, ...rest]);
  if (group === "run" && action === "list") {
    return state.runs.length
      ? [...state.runs].reverse().map(
          (run) =>
            `${run.conclusion ?? run.status}\t${run.name}\t${run.branch}\t${run.commitId.slice(0, 7)}`,
        )
      : ["No workflow runs"];
  }
  fail(`gh: unsupported command '${[group, action].filter(Boolean).join(" ")}'`);
}

export function executeGitCommand(
  state: GitState,
  command: string,
): GitCommandResult {
  try {
    const tokens = tokenizeCommand(command.trim());
    if (tokens.length === 0) return { state, output: [], exitCode: 0, error: null };
    const draft = cloneGitState(state);
    const [program, ...args] = tokens;
    const output =
      program === "git"
        ? handleGit(draft, args)
        : program === "gh"
          ? handleGh(draft, args)
          : fail(`command not found: ${program}`);
    return { state: draft, output, exitCode: 0, error: null };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "unknown command error";
    return {
      state,
      output: [message],
      exitCode: 1,
      error: message,
    };
  }
}
