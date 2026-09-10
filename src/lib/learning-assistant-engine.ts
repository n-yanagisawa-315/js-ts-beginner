import type {
  InitProgressReport,
  MLCEngineInterface,
} from "@mlc-ai/web-llm";
import type { Question } from "@/lib/course/types";

const MODEL_ID = "Qwen3.5-4B-q4f16_1-MLC";
export const LOCAL_ASSISTANT_MODEL_ID = MODEL_ID;

export const FIRST_STEP_QUESTION =
  "正解を言わず、最初の一歩だけヒントをください";
export const SIMPLE_EXPLANATION_QUESTION =
  "この内容を、もっと簡単な言葉で説明して";
export const FAMILIAR_EXAMPLE_QUESTION = "身近な例に置き換えて説明して";

export type AssistantGrounding = {
  lessonSummary: string;
  slideLead?: string;
  points?: string[];
  firstStepHint?: string;
  unanswered?: boolean;
  restrictedAnswer?: string;
};

export function firstStepForQuestion(question: Question): string | undefined {
  return question.steps?.[0] ?? question.hints?.[0] ?? question.hint;
}

export function assistantQuestionDetails(question: Question): string {
  return [
    question.lead,
    question.scenario,
    question.options?.length
      ? `選択肢: ${question.options.join(" / ")}`
      : undefined,
    question.code ? `設問のコード:\n${question.code}` : undefined,
    question.starter
      ? `最初から入っているコード:\n${question.starter}`
      : undefined,
    question.fragments?.length
      ? `並べ替える断片:\n${question.fragments.join("\n")}`
      : undefined,
  ]
    .filter(Boolean)
    .join("\n");
}

let enginePromise: Promise<MLCEngineInterface> | null = null;
let worker: Worker | null = null;
let activeGenerationOwner: symbol | null = null;

export function supportsLocalAssistant() {
  return typeof window !== "undefined" && "gpu" in navigator;
}

export function loadLocalAssistant(
  onProgress: (report: InitProgressReport) => void,
) {
  if (!supportsLocalAssistant()) {
    return Promise.reject(
      new Error("このブラウザでは、端末内AIに必要なWebGPUを利用できません。"),
    );
  }

  if (!enginePromise) {
    enginePromise = import("@mlc-ai/web-llm")
      .then(({ CreateWebWorkerMLCEngine }) => {
        worker = new Worker(
          new URL("../workers/learning-assistant.worker.ts", import.meta.url),
          { type: "module" },
        );
        return CreateWebWorkerMLCEngine(worker, MODEL_ID, {
          initProgressCallback: onProgress,
        });
      })
      .catch((error) => {
        worker?.terminate();
        worker = null;
        enginePromise = null;
        throw error;
      });
  } else {
    void enginePromise.then((engine) => {
      if ("setInitProgressCallback" in engine) {
        engine.setInitProgressCallback(onProgress);
      }
    });
  }

  return enginePromise;
}

export async function askLocalAssistant(
  systemPrompt: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  owner: symbol,
  outputOptions: {
    allowAnswer?: boolean;
    preferHint?: boolean;
    fallback?: string;
    restrictedAnswer?: string;
  } = {},
) {
  activeGenerationOwner = owner;
  const engine = await loadLocalAssistant(() => undefined);
  if (activeGenerationOwner !== owner) {
    throw new DOMException("生成は中断されました。", "AbortError");
  }
  const latestUserMessage = messages.findLast((message) => message.role === "user");
  const requestMessages = messages.map((message, index) =>
    index === messages.length - 1 && message.role === "user"
      ? { ...message, content: `${message.content}\n/no_think` }
      : message,
  );
  try {
    const completion = await engine.chat.completions.create({
      messages: [{ role: "system", content: systemPrompt }, ...requestMessages],
      temperature: 0.2,
      max_tokens: 260,
      extra_body: { enable_thinking: false },
    });

    const content = completion.choices[0]?.message.content;
    if (typeof content === "string" && content.trim()) {
      const allowCode = /コード|プログラム|実装|書き方|記述/.test(
        latestUserMessage?.content ?? "",
      );
      return guardAssistantOutput(content, allowCode, outputOptions);
    }
    throw new Error(
      "回答を生成できませんでした。質問を短くして、もう一度試してください。",
    );
  } finally {
    if (activeGenerationOwner === owner) activeGenerationOwner = null;
  }
}

export function guardAssistantOutput(
  content: string,
  allowCode = false,
  outputOptions: {
    allowAnswer?: boolean;
    preferHint?: boolean;
    fallback?: string;
    restrictedAnswer?: string;
  } = {},
) {
  const cleaned = sanitizeAssistantOutput(content, allowCode, outputOptions);
  const fallback =
    outputOptions.fallback || "教材の要点をもう一度読み直してみましょう。";
  if (!cleaned) return fallback;
  if (isUnreliableAssistantOutput(cleaned)) return fallback;
  if (!outputOptions.allowAnswer && outputOptions.restrictedAnswer) {
    const rawForLeakCheck = content
      .replace(/<think\b[^>]*>[\s\S]*?<\/think>/gi, "")
      .replace(/<think\b[^>]*>[\s\S]*$/gi, "")
      .replace(/<\/?think\b[^>]*>/gi, "")
      .trim();
    if (
      containsRestrictedAnswer(rawForLeakCheck, outputOptions.restrictedAnswer) ||
      containsRestrictedAnswer(cleaned, outputOptions.restrictedAnswer)
    ) {
      return fallback;
    }
  }
  return cleaned;
}

export function sanitizeAssistantOutput(
  content: string,
  allowCode = false,
  {
    allowAnswer = false,
    preferHint = false,
  }: {
    allowAnswer?: boolean;
    preferHint?: boolean;
    fallback?: string;
    restrictedAnswer?: string;
  } = {},
) {
  let cleaned = content
    .replace(/<think\b[^>]*>[\s\S]*?<\/think>/gi, "")
    .replace(/<think\b[^>]*>[\s\S]*$/gi, "")
    .replace(/<\/?think\b[^>]*>/gi, "")
    .trim();

  if (preferHint) {
    const hint = cleaned.match(
      /(?:^|\n)\s*(?:#{1,6}\s*)?(?:\*\*)?ヒント\s*[:：]?(?:\*\*)?\s*/,
    );
    if (hint?.index !== undefined) {
      cleaned = cleaned.slice(hint.index + hint[0].length);
    }
  }

  if (!allowAnswer) {
    cleaned = cleaned.replace(
      /(?:^|\n)\s*(?:#{1,6}\s*)?(?:\*\*)?(?:正解|回答|完成コード)\s*[:：]?(?:\*\*)?\s*(?:\n|$)[\s\S]*$/i,
      "",
    );
    cleaned = cleaned.replace(
      /(?:^|\n)\s*(?:#{1,6}\s*)?(?:\*\*)?(?:正解|答え|回答)\s*(?:は|[:：])[\s\S]*$/i,
      "",
    );
    cleaned = cleaned
      .split(/(?<=[。！？\n])/)
      .filter(
        (sentence) =>
          !/(?:が|を)?正解です|正しい(?:選択|答え|回答)|答えは|回答は|完成コード/.test(
            sentence,
          ),
      )
      .join("");
  }

  if (preferHint) {
    cleaned = cleaned.replace(/\n\s*#{1,6}\s+[\s\S]*$/, "");
  }

  const explanationIndex = cleaned.search(
    /(?:^|\n)\s*(?:#{1,6}\s*)?(?:\*\*)?解説\s*[:：](?:\*\*)?/,
  );
  if (!preferHint && explanationIndex >= 0) {
    cleaned = cleaned
      .slice(explanationIndex)
      .replace(
        /^\s*(?:#{1,6}\s*)?(?:\*\*)?解説\s*[:：](?:\*\*)?\s*/,
        "",
      );
  }

  if (!allowCode) {
    cleaned = cleaned
      .replace(/\n*\s*(?:\*\*)?コード(?:例)?\s*[:：](?:\*\*)?[\s\S]*$/i, "")
      .replace(/```[\s\S]*?```/g, "");
  }

  const seen = new Set<string>();
  return cleaned
    .replace(/```(?:\w+)?\s*/g, "")
    .replace(/```/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/^\s*#{1,6}\s*/gm, "")
    .replace(/^\s*(?:解説|ヒント)\s*[:：]\s*/gm, "")
    .replace(/^\*{1,3}\s*/gm, "")
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => {
      const key = line.trim().replace(/[。.!！?？\s]/g, "");
      if (/^#+$/.test(key)) return false;
      if (!key || !seen.has(key)) {
        if (key) seen.add(key);
        return true;
      }
      return false;
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function isUnreliableAssistantOutput(content: string): boolean {
  const normalized = content
    .replace(/[`*_#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const compact = normalized.replace(/\s+/g, "");

  if (normalized.length > 500) return true;
  if (/(.{3,40})(?:\1){3,}/.test(compact)) return true;

  const arithmeticClaims = normalized.matchAll(
    /(-?\d+(?:\.\d+)?)\s*([+\-*/%])\s*(-?\d+(?:\.\d+)?)\s*(?:=|は)\s*(-?(?:\d+(?:\.\d+)?|Infinity|NaN))/g,
  );
  for (const claim of arithmeticClaims) {
    const left = Number(claim[1]);
    const right = Number(claim[3]);
    const stated = Number(claim[4]);
    const actual =
      claim[2] === "+"
        ? left + right
        : claim[2] === "-"
          ? left - right
          : claim[2] === "*"
            ? left * right
            : claim[2] === "/"
              ? left / right
              : left % right;
    if (
      !Object.is(actual, stated) &&
      !(Number.isNaN(actual) && Number.isNaN(stated))
    ) {
      return true;
    }
  }
  return false;
}

export function trustedAssistantAnswer(
  question: string,
  grounding: AssistantGrounding,
): string | null {
  if (question === FIRST_STEP_QUESTION && grounding.firstStepHint) {
    return safeTrustedAnswer(`まずは、${grounding.firstStepHint}`, grounding);
  }
  if (question === SIMPLE_EXPLANATION_QUESTION) {
    if (grounding.unanswered) {
      const topic = topicAnchor(grounding);
      return safeTrustedAnswer(
        topic
          ? `${topic}まずは、最初から用意されている名前や値だけを探してみてください。`
          : "問題文を「最初の状態」「行う操作」「確かめる結果」の3つに分けて読みましょう。まず、最初から用意されている名前や値を探してみてください。",
        grounding,
      );
    }
    return groundedSummary(grounding);
  }
  if (question === FAMILIAR_EXAMPLE_QUESTION) {
    if (grounding.unanswered) {
      const topic = topicAnchor(grounding);
      return safeTrustedAnswer(
        topic
          ? `身近な場面で言い直すと、${topic}いまやることは、最初の材料が何かだけ確かめるまでです。`
          : "手順書を上から一行ずつ進めるように考えてみましょう。材料（最初の値）→操作→できあがり（表示結果）の順で、今は最初の材料だけ見てください。",
        grounding,
      );
    }
    const lead = grounding.slideLead?.trim();
    return lead ? firstSentences(lead, 3) : groundedSummary(grounding);
  }
  return null;
}

function topicAnchor(grounding: AssistantGrounding): string {
  if (grounding.slideLead?.trim()) {
    return ensureSentence(firstSentences(grounding.slideLead, 2));
  }
  const points = grounding.points?.filter(Boolean).slice(0, 2) ?? [];
  if (points.length > 0) {
    return points.map((point) => ensureSentence(point)).join("");
  }
  if (grounding.lessonSummary.trim()) {
    return ensureSentence(firstSentences(grounding.lessonSummary, 2));
  }
  return "";
}

function ensureSentence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  return /[。！？]$/.test(trimmed) ? trimmed : `${trimmed}。`;
}

function safeTrustedAnswer(
  content: string,
  grounding: AssistantGrounding,
): string {
  const restricted = grounding.restrictedAnswer?.trim();
  if (!grounding.unanswered || !restricted) {
    return content;
  }
  const fallback =
    "いま見ている説明の「最初の状態」だけに目を向けて、完成形はまだ見ないようにしましょう。";
  const candidate =
    normalizeRestrictedText(restricted).length >= 2
      ? redactRestrictedAnswer(content, restricted)
      : content;
  return containsRestrictedAnswer(candidate, restricted) ? fallback : candidate;
}

export function containsRestrictedAnswer(
  content: string,
  restrictedAnswer: string | undefined,
): boolean {
  const answer = restrictedAnswer?.trim();
  if (!answer) return false;
  if (
    /(?:が|を)?正解です|正しい(?:選択|答え|回答)|答えは|回答は|完成コード/.test(
      content,
    )
  ) {
    return true;
  }
  const escaped = escapeRegExp(answer);
  if (
    new RegExp(
      `(?:正解|答え|回答)\\s*(?:は|[:：])?\\s*[「『\`']?${escaped}`,
      "i",
    ).test(content)
  ) {
    return true;
  }
  if (
    new RegExp(
      `[「『\`']${escaped}[」』\`']\\s*(?:が|を)?(?:正解|正しい)`,
      "i",
    ).test(content)
  ) {
    return true;
  }
  const normalizedAnswer = normalizeRestrictedText(answer);
  if (normalizedAnswer.length >= 2) {
    return normalizeRestrictedText(content).includes(normalizedAnswer);
  }
  return new RegExp(
    `(?:^|[「『\\s:：\`'])${escaped}(?:[」』\\s。！？]|です|になります|$)`,
    "i",
  ).test(content);
}

function redactRestrictedAnswer(content: string, answer: string): string {
  const escaped = escapeRegExp(answer.trim());
  if (!escaped) return content;
  return content.replace(new RegExp(escaped, "gi"), "その部分");
}

function normalizeRestrictedText(value: string): string {
  return value.toLowerCase().replace(/[\s`'"*_#;:：。、，,()[\]{}]/g, "");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function groundedSummary(grounding: AssistantGrounding): string {
  const points = grounding.points?.filter(Boolean).slice(0, 3) ?? [];
  if (points.length > 0) {
    return points
      .map((point) => (/[。！？]$/.test(point) ? point : `${point}。`))
      .join("");
  }
  if (grounding.slideLead?.trim()) {
    return firstSentences(grounding.slideLead, 3);
  }
  return grounding.lessonSummary;
}

function firstSentences(text: string, count: number): string {
  const sentences = text.match(/[^。！？]+[。！？]?/g) ?? [text];
  return sentences.slice(0, count).join("").trim();
}

export async function stopLocalAssistantGeneration(owner: symbol) {
  if (activeGenerationOwner !== owner) return;
  activeGenerationOwner = null;
  const engine = await enginePromise;
  if (activeGenerationOwner === null) engine?.interruptGenerate();
}
