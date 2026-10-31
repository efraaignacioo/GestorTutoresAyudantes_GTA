export interface AuthUser {
  sub: string;
  email: string;
  name: string | null;
}

export function subjectFromClaims(payload: unknown): string | undefined {
  if (typeof payload !== "object" || payload === null) return undefined;
  if (!("sub" in payload) || typeof payload.sub !== "string") return undefined;
  if (!("exp" in payload) || typeof payload.exp !== "number") return undefined;
  if (!Number.isSafeInteger(payload.exp) || payload.exp <= 0) return undefined;

  const uuidV4 =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4.test(payload.sub) ? payload.sub : undefined;
}
