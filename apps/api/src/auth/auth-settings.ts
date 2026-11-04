export interface AuthSettings {
  secret: string;
  expiresIn: number;
  issuer: string;
  audience: string;
}

export const AUTH_SETTINGS = Symbol("AUTH_SETTINGS");

export function readAuthSettings(
  env: Record<string, string | undefined>,
): AuthSettings {
  const secret = env.JWT_SECRET;
  if (!secret || new TextEncoder().encode(secret).length < 32) {
    throw new Error("JWT_SECRET debe contener al menos 32 bytes aleatorios.");
  }
  if (secret === "PEGAR_AQUI_EL_RESULTADO_ALEATORIO") {
    throw new Error(
      "Reemplaza el marcador JWT_SECRET por un secreto aleatorio.",
    );
  }
  const raw = env.JWT_EXPIRES_IN ?? "900";
  if (!/^\d+$/.test(raw)) {
    throw new Error("JWT_EXPIRES_IN debe ser un entero en segundos.");
  }
  const expiresIn = Number(raw);
  if (!Number.isSafeInteger(expiresIn) || expiresIn < 60 || expiresIn > 3600) {
    throw new Error("JWT_EXPIRES_IN debe estar entre 60 y 3600 segundos.");
  }
  return {
    secret,
    expiresIn,
    issuer: "taskboard-api",
    audience: "taskboard-web",
  };
}
