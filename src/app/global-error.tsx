"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="ja">
      <body>
        <main
          style={{
            display: "grid",
            minHeight: "100vh",
            placeItems: "center",
            padding: "24px",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <section aria-labelledby="global-error-title">
            <p>エラー</p>
            <h1 id="global-error-title">アプリを表示できませんでした</h1>
            <p>一時的な問題の可能性があります。もう一度読み込んでください。</p>
            <button type="button" onClick={reset}>
              もう一度試す
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
