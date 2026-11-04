import type { AuthUser } from "./auth-contract.ts";

export interface Session {
  readonly id: number;
  readonly accessToken: string;
  readonly user: Readonly<AuthUser>;
  readonly expiresAt: number;
}

interface Snapshot {
  readonly session: Session | null;
  readonly message: string;
}

let serial = 0;
let snapshot: Snapshot = { session: null, message: "" };
const listeners = new Set<() => void>();

export function getSnapshot(): Snapshot {
  return snapshot;
}

export function getSession(): Session | null {
  return snapshot.session;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notify() {
  for (const listener of listeners) listener();
}

export function beginSession(
  token: string,
  user: AuthUser,
  expiresIn: number,
): Session {
  const session: Session = Object.freeze({
    id: ++serial,
    accessToken: token,
    user: Object.freeze({ ...user }),
    expiresAt: Date.now() + expiresIn * 1000,
  });
  snapshot = { session, message: "" };
  notify();
  return session;
}

export function dropSession(expectedId: number, message: string): boolean {
  if (snapshot.session?.id !== expectedId) return false;
  snapshot = { session: null, message };
  notify();
  return true;
}
