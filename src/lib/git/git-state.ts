import type {
  GitAssertion,
  GitRepositoryState,
} from "../course/types.ts";

export type GitTree = Record<string, string>;
export type GitIndex = Record<string, string | null>;

export type GitCommit = {
  id: string;
  message: string;
  tree: GitTree;
  parents: string[];
  author: string;
  createdAt: string;
};

export type GitHead =
  | { kind: "branch"; name: string }
  | { kind: "detached"; commitId: string };

export type GitPullRequest = {
  number: number;
  title: string;
  body: string;
  base: string;
  head: string;
  state: "open" | "merged" | "closed";
  createdAt: string;
};

export type GitIssue = {
  number: number;
  title: string;
  body: string;
  state: "open" | "closed";
  createdAt: string;
};

export type GitRun = {
  id: number;
  branch: string;
  commitId: string;
  status: "queued" | "in_progress" | "completed";
  conclusion: "success" | "failure" | null;
  name: string;
  createdAt: string;
};

export type GitState = {
  initialized: boolean;
  workingTree: GitTree;
  index: GitIndex;
  commits: GitCommit[];
  branches: Record<string, string | null>;
  HEAD: GitHead;
  remotes: Record<string, string>;
  remoteRefs: Record<string, Record<string, string | null>>;
  pullRequests: GitPullRequest[];
  issues: GitIssue[];
  runs: GitRun[];
  mergedBranches: string[];
};

export type GitAssertionResult = {
  assertion: GitAssertion;
  passed: boolean;
  message: string;
};

export type GitGradeResult = {
  passed: boolean;
  score: number;
  total: number;
  results: GitAssertionResult[];
};

const EMPTY_TREE: GitTree = {};

export function createGitState(
  initial: GitRepositoryState = {},
): GitState {
  const branch = initial.branch?.trim() || "main";
  const remotes: Record<string, string> = initial.remote
    ? { origin: initial.remote }
    : {};

  return {
    initialized: initial.initialized ?? true,
    workingTree: { ...(initial.files ?? EMPTY_TREE) },
    index: {},
    commits: [],
    branches: Object.fromEntries(
      [...new Set([branch, ...(initial.branches ?? [])])].map((name) => [
        name,
        null,
      ]),
    ),
    HEAD: { kind: "branch", name: branch },
    remotes,
    remoteRefs: Object.fromEntries(
      Object.keys(remotes).map((name) => [name, {}]),
    ),
    pullRequests: [],
    issues: [],
    runs: [],
    mergedBranches: [],
  };
}

export function createUninitializedGitState(
  files: GitTree = {},
): GitState {
  return {
    ...createGitState({ files }),
    initialized: false,
  };
}

export function cloneGitState(state: GitState): GitState {
  return {
    ...state,
    workingTree: { ...state.workingTree },
    index: { ...state.index },
    commits: state.commits.map((commit) => ({
      ...commit,
      tree: { ...commit.tree },
      parents: [...commit.parents],
    })),
    branches: { ...state.branches },
    HEAD: { ...state.HEAD },
    remotes: { ...state.remotes },
    remoteRefs: Object.fromEntries(
      Object.entries(state.remoteRefs).map(([name, refs]) => [
        name,
        { ...refs },
      ]),
    ),
    pullRequests: state.pullRequests.map((pullRequest) => ({
      ...pullRequest,
    })),
    issues: state.issues.map((issue) => ({ ...issue })),
    runs: state.runs.map((run) => ({ ...run })),
    mergedBranches: [...state.mergedBranches],
  };
}

export function getHeadCommitId(state: GitState): string | null {
  return state.HEAD.kind === "branch"
    ? (state.branches[state.HEAD.name] ?? null)
    : state.HEAD.commitId;
}

export function getCommit(
  state: GitState,
  commitId: string | null,
): GitCommit | undefined {
  if (!commitId) return undefined;
  return state.commits.find((commit) => commit.id === commitId);
}

export function getHeadTree(state: GitState): GitTree {
  return getCommit(state, getHeadCommitId(state))?.tree ?? EMPTY_TREE;
}

export function getCurrentBranch(state: GitState): string | null {
  return state.HEAD.kind === "branch" ? state.HEAD.name : null;
}

export function isPathStaged(state: GitState, path: string): boolean {
  if (!Object.hasOwn(state.index, path)) return false;
  const staged = state.index[path];
  const committed = getHeadTree(state)[path];
  return staged === null ? committed !== undefined : staged !== committed;
}

function assertionMessage(assertion: GitAssertion, passed: boolean): string {
  const prefix = passed ? "達成" : "未達成";
  switch (assertion.kind) {
    case "staged":
      return `${prefix}: ${assertion.path} がステージ済み`;
    case "commit-count":
      return `${prefix}: コミット数が ${assertion.count}`;
    case "branch":
      return `${prefix}: 現在のブランチが ${assertion.name}`;
    case "remote":
      return `${prefix}: リモート ${assertion.name} が存在`;
    case "pushed":
      return `${prefix}: ${assertion.branch} が push 済み`;
    case "pr-open":
      return `${prefix}: ${assertion.head} → ${assertion.base} のPRが open`;
    case "clean":
      return `${prefix}: 作業ツリーに未記録の変更がない`;
    case "remote-tracked":
      return `${prefix}: ${assertion.remote}/${assertion.branch} を取得済み`;
    case "merged":
      return `${prefix}: ${assertion.branch} を統合済み`;
    case "initialized":
      return `${prefix}: Gitリポジトリを初期化済み`;
  }
}

export function gradeGitAssertions(
  state: GitState,
  assertions: ReadonlyArray<GitAssertion>,
): GitGradeResult {
  const results = assertions.map((assertion): GitAssertionResult => {
    let passed = false;

    switch (assertion.kind) {
      case "staged":
        passed = isPathStaged(state, assertion.path);
        break;
      case "commit-count":
        passed = state.commits.length === assertion.count;
        break;
      case "branch":
        passed = getCurrentBranch(state) === assertion.name;
        break;
      case "remote":
        passed = Object.hasOwn(state.remotes, assertion.name);
        break;
      case "pushed":
        passed = Object.values(state.remoteRefs).some(
          (refs) =>
            Object.hasOwn(refs, assertion.branch) &&
            refs[assertion.branch] === state.branches[assertion.branch],
        );
        break;
      case "pr-open":
        passed = state.pullRequests.some(
          (pullRequest) =>
            pullRequest.state === "open" &&
            pullRequest.base === assertion.base &&
            pullRequest.head === assertion.head,
        );
        break;
      case "clean":
        passed =
          Object.keys(state.index).length === 0 &&
          JSON.stringify(state.workingTree) === JSON.stringify(getHeadTree(state));
        break;
      case "remote-tracked":
        passed = Object.hasOwn(
          state.remoteRefs[assertion.remote] ?? {},
          assertion.branch,
        );
        break;
      case "merged":
        passed = state.mergedBranches.includes(assertion.branch);
        break;
      case "initialized":
        passed = state.initialized;
        break;
    }

    return {
      assertion,
      passed,
      message: assertionMessage(assertion, passed),
    };
  });

  const score = results.filter((result) => result.passed).length;
  return {
    passed: score === results.length,
    score,
    total: results.length,
    results,
  };
}
