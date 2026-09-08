function tokenize(code: string) {
  const pattern =
    /(\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:0x[\da-fA-F]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?)\b|\b(?:import|from|export|default|const|let|var|function|return|class|extends|new|async|await|if|else|typeof|type|interface|as|true|false|null|undefined|this)\b|\b[A-Za-z_$][\w$]*\b)/g;
  const parts: {
    text: string;
    kind: "kw" | "id" | "str" | "cmt" | "num" | "plain";
  }[] = [];
  let last = 0;
  for (const match of code.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > last) {
      parts.push({ text: code.slice(last, index), kind: "plain" });
    }
    const token = match[0];
    const kind = token.startsWith("//") || token.startsWith("/*")
      ? "cmt"
      : token.startsWith("\"") || token.startsWith("'") || token.startsWith("`")
        ? "str"
        : /^\d/.test(token) || token.startsWith("0x")
          ? "num"
          : /^(?:import|from|export|default|const|let|var|function|return|class|extends|new|async|await|if|else|typeof|type|interface|as|true|false|null|undefined|this)$/.test(
              token,
            )
            ? "kw"
            : "id";
    parts.push({ text: token, kind });
    last = index + token.length;
  }
  if (last < code.length) parts.push({ text: code.slice(last), kind: "plain" });
  return parts;
}

const COLOR = {
  kw: "#f92672",
  id: "#66d9ef",
  str: "#e6db74",
  cmt: "#8f908a",
  num: "#ae81ff",
  plain: "#f8f8f2",
} as const;

export function CodeHighlight({ code }: { code: string }) {
  return (
    <>
      {tokenize(code).map((part, index) => (
        <span
          key={`${index}-${part.kind}-${part.text.slice(0, 12)}`}
          style={{ color: COLOR[part.kind] }}
        >
          {part.text}
        </span>
      ))}
    </>
  );
}
