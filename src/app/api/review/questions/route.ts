import { resolveReviewBatch } from "@/lib/course/server";
import {
  parseReviewBatchRequest,
  REVIEW_API_VERSION,
  type ReviewBatchError,
} from "@/lib/review-contract";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
} as const;

function invalidJson(): ReviewBatchError {
  return {
    version: REVIEW_API_VERSION,
    error: {
      code: "INVALID_REQUEST",
      message: "JSONリクエストを読み取れません。",
    },
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(invalidJson(), {
      status: 400,
      headers: NO_STORE_HEADERS,
    });
  }

  const parsed = parseReviewBatchRequest(body);
  if (!parsed.ok) {
    return Response.json(parsed.error, {
      status: 400,
      headers: NO_STORE_HEADERS,
    });
  }

  const result = resolveReviewBatch(parsed.value);
  if ("error" in result) {
    return Response.json(result, {
      status: 400,
      headers: NO_STORE_HEADERS,
    });
  }
  return Response.json(result, { headers: NO_STORE_HEADERS });
}
