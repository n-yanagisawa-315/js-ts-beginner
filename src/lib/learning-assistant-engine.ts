import type {
  InitProgressReport,
  MLCEngineInterface,
} from "@mlc-ai/web-llm";

const MODEL_ID = "Qwen3.5-0.8B-q4f16_1-MLC";

let enginePromise: Promise<MLCEngineInterface> | null = null;
let worker: Worker | null = null;

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
) {
  const engine = await loadLocalAssistant(() => undefined);
  const completion = await engine.chat.completions.create({
    messages: [{ role: "system", content: systemPrompt }, ...messages],
    temperature: 0.35,
    max_tokens: 420,
  });

  const content = completion.choices[0]?.message.content;
  if (typeof content === "string" && content.trim()) return content.trim();
  throw new Error("回答を生成できませんでした。質問を短くして、もう一度試してください。");
}

export async function stopLocalAssistantGeneration() {
  const engine = await enginePromise;
  engine?.interruptGenerate();
}
