import { NextResponse } from "next/server";
import { SEED_ORDERS } from "@/lib/order-project";

export function GET(request: Request) {
  if (new URL(request.url).searchParams.get("fail") === "1") {
    return NextResponse.json(
      { error: "教材用に再現した一時的な読込失敗です。" },
      { status: 503 },
    );
  }
  return NextResponse.json(SEED_ORDERS, {
    headers: { "cache-control": "no-store" },
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "JSON形式の注文を送ってください。" },
      { status: 400 },
    );
  }

  if (
    !body ||
    typeof body !== "object" ||
    !("customer" in body) ||
    typeof body.customer !== "string" ||
    !body.customer.trim() ||
    !("item" in body) ||
    typeof body.item !== "string" ||
    !body.item.trim() ||
    !("total" in body) ||
    typeof body.total !== "number" ||
    !Number.isFinite(body.total) ||
    body.total <= 0
  ) {
    return NextResponse.json(
      { error: "customer、item、正のtotalが必要です。" },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      id: `ORD-${Date.now()}`,
      customer: body.customer.trim(),
      item: body.item.trim(),
      total: Math.round(body.total),
      status: "unpaid",
    },
    { status: 201 },
  );
}
