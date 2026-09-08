import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const FILES: Record<string, string> = {
  javascript: "javascript-core.html",
  typescript: "typescript-core.html",
  node: "node-core.html",
};

export function generateStaticParams() {
  return Object.keys(FILES).map((topic) => ({ topic }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ topic: string }> },
) {
  const { topic } = await params;
  const fileName = FILES[topic];
  if (!fileName) return new NextResponse("Not found", { status: 404 });

  const [html, css] = await Promise.all([
    fs.readFile(path.join(process.cwd(), "reference", fileName), "utf8"),
    fs.readFile(path.join(process.cwd(), "assets", "reference.css"), "utf8"),
  ]);
  const rendered = html.replace(
    '<link rel="stylesheet" href="../assets/reference.css">',
    `<style>${css}</style>`,
  );
  return new NextResponse(rendered, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
