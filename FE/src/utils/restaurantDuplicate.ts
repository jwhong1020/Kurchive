import type { DuplicateCandidate, DuplicateConflict } from "../types/restaurantDuplicate";

function asCandidates(value: unknown): DuplicateCandidate[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (c): c is DuplicateCandidate =>
      c != null && typeof c === "object" && typeof (c as DuplicateCandidate).id === "number"
  );
}

/** 409 응답에서 중복 식당 정보 파싱 */
export function parseDuplicateConflict(error: unknown): DuplicateConflict | null {
  const err = error as {
    response?: { status?: number; data?: Record<string, unknown> };
  };
  if (err?.response?.status !== 409) return null;

  const body = err.response.data;
  if (!body || typeof body !== "object") return null;

  const message =
    (typeof body.message === "string" && body.message) ||
    "이미 등록된 식당이거나 유사한 식당이 있습니다.";

  const nested = body.data;
  const data =
    nested && typeof nested === "object"
      ? (nested as Record<string, unknown>)
      : body;

  const exact = asCandidates(data.exact_matches);
  if (exact.length > 0) {
    return { message, kind: "exact", candidates: exact };
  }

  const nearby = asCandidates(data.nearby_candidates ?? data.candidates);
  if (nearby.length > 0) {
    return { message, kind: "nearby", candidates: nearby };
  }

  return null;
}
