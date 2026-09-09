import type {
  InitProgressReport,
  MLCEngineInterface,
} from "@mlc-ai/web-llm";
import type { Question } from "@/lib/course/types";

const MODEL_ID = "Qwen3.5-2B-q4f16_1-MLC";

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
    });

    const content = completion.choices[0]?.message.content;
    if (typeof content === "string" && content.trim()) {
      const allowCode = /コード|プログラム|実装|書き方|記述/.test(
        latestUserMessage?.content ?? "",
      );
      const cleaned = sanitizeAssistantOutput(content, allowCode, outputOptions);
      if (cleaned) {
        return isUnreliableAssistantOutput(cleaned) ||
          containsRestrictedAnswer(cleaned, outputOptions.restrictedAnswer)
          ? outputOptions.fallback || "教材の要点をもう一度確認してみましょう。"
          : cleaned;
      }
    }
    throw new Error(
      "回答を生成できませんでした。質問を短くして、もう一度試してください。",
    );
  } finally {
    if (activeGenerationOwner === owner) activeGenerationOwner = null;
  }
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
      return safeTrustedAnswer(
        "問題文を「最初の状態」「行う操作」「確かめる結果」の3つに分けて読みましょう。まず、最初から用意されている名前や値を探してみてください。",
        grounding,
      );
    }
    return groundedSummary(grounding);
  }
  if (question === FAMILIAR_EXAMPLE_QUESTION) {
    if (grounding.unanswered) {
      return safeTrustedAnswer(
        "料理の手順のように、材料（最初の値）→操作→できあがり（表示結果）の順で考えてみましょう。今は最初の材料が何かだけ確認してください。",
        grounding,
      );
    }
    const lead = grounding.slideLead?.trim();
    return lead ? firstSentences(lead, 3) : groundedSummary(grounding);
  }
  return null;
}

function safeTrustedAnswer(
  content: string,
  grounding: AssistantGrounding,
): string {
  const restricted = grounding.restrictedAnswer?.trim();
  if (!grounding.unanswered || !restricted || restricted.length < 2) {
    return content;
  }
  return content.replaceAll(restricted, "その部分");
}

export function containsRestrictedAnswer(
  content: string,
  restrictedAnswer: string | undefined,
): boolean {
  const answer = restrictedAnswer?.trim();
  if (!answer) return false;
  const escaped = answer.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (
    new RegExp(
      `(?:正解|答え|回答)\\s*(?:は|[:：])?\\s*[「『\\x60]?${escaped}`,
      "i",
    ).test(content)
  ) {
    return true;
  }
  const normalize = (value: string) =>
    value.toLowerCase().replace(/[\s`'"*_#;:：。、，,()[\]{}]/g, "");
  const normalizedAnswer = normalize(answer);
  if (normalizedAnswer.length >= 2) {
    return normalize(content).includes(normalizedAnswer);
  }
  return new RegExp(
    `(?:^|[「『\\s:：])${escaped}(?:[」』\\s。！？]|です|になります|$)`,
    "i",
  ).test(content);
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
