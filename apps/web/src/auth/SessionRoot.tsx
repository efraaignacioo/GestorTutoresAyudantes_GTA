import { useEffect, useSyncExternalStore } from "react";
import App from "../App.tsx";
import Auth from "./Auth.tsx";
import { getSnapshot, subscribe } from "./session-store.ts";
import { closeSession } from "./session-lifecycle.ts";

export default function SessionRoot() {
  const { session, message } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );

  useEffect(() => {
    if (!session) return;
    const timer = window.setTimeout(
      () => {
        closeSession(session.id, "La sesión venció. Inicia sesión nuevamente.");
      },
      Math.max(0, session.expiresAt - Date.now()),
    );
    return () => window.clearTimeout(timer);
  }, [session]);

  if (!session) return <Auth notice={message} />;
  return (
    <App
      key={session.id}
      session={session}
      onLogout={() => closeSession(session.id)}
    />
  );
}
