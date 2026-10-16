import axios from "axios";

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

export const api = axios.create({
  baseURL: url.origin,
  timeout: 10_000,
  withCredentials: false,
  headers: { Accept: "application/json" },
});
