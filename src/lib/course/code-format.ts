/** テンプレート字下げで崩れた継続行を揃える（先頭行は据え置き） */
export function dedentContinuation(code: string): string {
  const lines = code.replace(/\r\n/g, "\n").split("\n");
  if (lines.length <= 1) return code;
  const continuation = lines.slice(1).filter((line) => line.trim().length > 0);
  if (continuation.length === 0) return code;
  const indents = continuation.map(
    (line) => line.match(/^[ \t]*/)?.[0]?.length ?? 0,
  );
  const min = Math.min(...indents);
  if (min <= 0) return code;
  return [
    lines[0],
    ...lines.slice(1).map((line) =>
      line.trim().length === 0 ? "" : line.slice(min),
    ),
  ].join("\n");
}
