import axios from "axios";
import { getSession } from "./auth/session-store.ts";
import { closeSession } from "./auth/session-lifecycle.ts";

const rawUrl = import.meta.env.VITE_API_URL?.trim();
if (!rawUrl) {
  throw new Error(
    "Falta VITE_API_URL. Configura apps/web/.env y reinicia Vite.",
  );
}

const url = new URL(rawUrl);
if (
  !["http:", "https:"].includes(url.protocol) ||
  url.username ||
  url.password ||
  url.pathname !== "/" ||
  url.search ||
  url.hash
) {
  throw new Error(
    "VITE_API_URL debe ser un origen HTTP(S), sin ruta ni credenciales.",
  );
}

const options = {
  baseURL: url.origin,
  timeout: 10_000,
  withCredentials: false,
  headers: { Accept: "application/json" },
};

// Registro, acceso y comprobación inicial de identidad.
export const authApi = axios.create(options);

// Operaciones que requieren una sesión local.
export const api = axios.create(options);

const requestSessions = new WeakMap<object, number>();

api.interceptors.request.use((config) => {
  const session = getSession();
  if (!session)
    throw new Error("Inicia sesión antes de consultar asignaturas.");
  config.headers.set("Authorization", `Bearer ${session.accessToken}`);
  requestSessions.set(config, session.id);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      error.config
    ) {
      const sessionId = requestSessions.get(error.config);
      if (sessionId !== undefined) {
        closeSession(
          sessionId,
          "Tu sesión dejó de ser válida. Inicia sesión nuevamente.",
        );
      }
    }
    return Promise.reject(error);
  },
);
