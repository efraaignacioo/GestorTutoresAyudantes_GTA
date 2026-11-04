export interface AuthUser {
  sub: string;
  email: string;
  name: string | null;
}

export interface TokenResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseToken(value: unknown): TokenResponse {
  if (
    !isRecord(value) ||
    typeof value.access_token !== "string" ||
    value.access_token.length === 0 ||
    value.token_type !== "Bearer" ||
    typeof value.expires_in !== "number" ||
    !Number.isSafeInteger(value.expires_in) ||
    value.expires_in < 60 ||
    value.expires_in > 3600
  ) {
    throw new Error("La API devolvió una respuesta de acceso incompatible.");
  }
  return {
    access_token: value.access_token,
    token_type: "Bearer",
    expires_in: value.expires_in,
  };
}

export function parseMe(value: unknown): AuthUser {
  const uuidV4 =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (
    !isRecord(value) ||
    typeof value.sub !== "string" ||
    !uuidV4.test(value.sub) ||
    typeof value.email !== "string" ||
    value.email.length === 0 ||
    !(value.name === null || typeof value.name === "string")
  ) {
    throw new Error("La API devolvió una identidad incompatible.");
  }
  return { sub: value.sub, email: value.email, name: value.name };
}

export function validatePassword(password: string, signup: boolean): void {
  const characters = Array.from(password).length;
  const bytes = new TextEncoder().encode(password).length;
  if (characters < (signup ? 15 : 1) || characters > 72 || bytes > 72) {
    throw new Error(
      signup
        ? "La contraseña necesita al menos 15 caracteres y como máximo 72 bytes UTF-8."
        : "La contraseña debe contener entre 1 y 72 bytes UTF-8.",
    );
  }
}
