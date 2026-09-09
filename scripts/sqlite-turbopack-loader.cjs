"use strict";

module.exports = function sqliteTurbopackLoader(source) {
  const dynamicWorkerUrl = "new URL(proxyUri, import.meta.url)";
  const runtimeWorkerUrl = "new URL(proxyUri, String(import.meta.url))";
  if (!source.includes(dynamicWorkerUrl)) {
    throw new Error("sqlite-wasmの動的Worker URLが見つかりません。");
  }
  return source.replace(dynamicWorkerUrl, runtimeWorkerUrl);
};
