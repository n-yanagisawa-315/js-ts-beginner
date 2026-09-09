import type {
  InitProgressReport,
  MLCEngineInterface,
} from "@mlc-ai/web-llm";

const MODEL_ID = "Qwen3.5-0.8B-q4f16_1-MLC";

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
      const cleaned = sanitizeAssistantOutput(content, allowCode);
      if (cleaned) return cleaned;
    }
    throw new Error(
      "回答を生成できませんでした。質問を短くして、もう一度試してください。",
    );
  } finally {
    if (activeGenerationOwner === owner) activeGenerationOwner = null;
  }
}

export function sanitizeAssistantOutput(content: string, allowCode = false) {
  let cleaned = content
    .replace(/<think\b[^>]*>[\s\S]*?<\/think>/gi, "")
    .replace(/<think\b[^>]*>[\s\S]*$/gi, "")
    .replace(/<\/?think\b[^>]*>/gi, "")
    .trim();

  const explanationIndex = cleaned.search(
    /(?:^|\n)\s*(?:\*\*)?解説\s*[:：](?:\*\*)?/,
  );
  if (explanationIndex >= 0) {
    cleaned = cleaned
      .slice(explanationIndex)
      .replace(/^\s*(?:\*\*)?解説\s*[:：](?:\*\*)?\s*/, "");
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
    .replace(/^\*{1,3}\s*/gm, "")
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => {
      const key = line.trim().replace(/[。.!！?？\s]/g, "");
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

export async function stopLocalAssistantGeneration(owner: symbol) {
  if (activeGenerationOwner !== owner) return;
  activeGenerationOwner = null;
  const engine = await enginePromise;
  if (activeGenerationOwner === null) engine?.interruptGenerate();
}
