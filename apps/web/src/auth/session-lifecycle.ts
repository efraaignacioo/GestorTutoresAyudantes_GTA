import { queryClient } from "../query-client.ts";
import type { AuthUser } from "./auth-contract.ts";
import { beginSession, dropSession } from "./session-store.ts";

export function openSession(token: string, user: AuthUser, expiresIn: number) {
  void queryClient.cancelQueries();
  queryClient.clear();
  return beginSession(token, user, expiresIn);
}

export function closeSession(expectedId: number, message = "Sesión cerrada.") {
  if (!dropSession(expectedId, message)) return;
  void queryClient.cancelQueries();
  queryClient.clear();
}
