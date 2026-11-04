import { useState } from "react";
import type { FormEvent } from "react";
import { authApi } from "../api.ts";
import { apiErrorMessage } from "../api-error.ts";
import { parseMe, parseToken, validatePassword } from "./auth-contract.ts";
import { openSession } from "./session-lifecycle.ts";

export default function Auth({ notice }: { notice: string }) {
  const [signup, setSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError("");
    let accountCreated = false;
    try {
      validatePassword(password, signup);
      setPending(true);
      const credentials = { email: email.trim().toLowerCase(), password };
      const body = signup
        ? { ...credentials, name: name.trim() || null }
        : credentials;
      const response = await authApi.post<unknown>(
        signup ? "/auth/signup" : "/auth/login",
        body,
      );
      accountCreated = signup;
      const token = parseToken(response.data);
      const identity = await authApi.get<unknown>("/auth/me", {
        headers: { Authorization: `Bearer ${token.access_token}` },
      });
      const user = parseMe(identity.data);
      setPassword("");
      openSession(token.access_token, user, token.expires_in);
    } catch (cause) {
      const message = apiErrorMessage(cause, signup);
      setError(
        accountCreated
          ? `${message} La cuenta se creó; intenta iniciar sesión antes de repetir el registro.`
          : message,
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <main>
      <header>
        <p className="eyebrow">Gestor de Tutores y Ayudantes</p>
        <h1>Portal Docente</h1>
        <p>Inicia sesión para gestionar tus asignaturas.</p>
      </header>
      {notice && (
        <p role="status" className="notice">
          {notice}
        </p>
      )}
      <section aria-labelledby="auth-heading">
        <h2 id="auth-heading">{signup ? "Crear cuenta" : "Iniciar sesión"}</h2>
        <form onSubmit={(event) => void handleSubmit(event)}>
          <div>
            <label htmlFor="email">Correo</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              maxLength={254}
              required
              disabled={pending}
            />
          </div>
          {signup && (
            <div>
              <label htmlFor="name">Nombre (opcional)</label>
              <input
                id="name"
                name="name"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={80}
                disabled={pending}
              />
            </div>
          )}
          <div>
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={signup ? "new-password" : "current-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={pending}
              aria-describedby="password-help"
            />
            <p id="password-help" className="muted">
              {signup
                ? "Al menos 15 caracteres; máximo 72 bytes UTF-8. No se recortan espacios."
                : "Usa la contraseña de tu cuenta."}
            </p>
          </div>
          <button type="submit" disabled={pending}>
            {pending ? "Procesando..." : signup ? "Crear cuenta" : "Entrar"}
          </button>
        </form>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setSignup((current) => !current);
            setPassword("");
            setError("");
          }}
        >
          {signup ? "Ya tengo cuenta" : "Necesito crear una cuenta"}
        </button>
        <p className="muted">
          La sesión termina al recargar o cerrar esta pestaña.
        </p>
      </section>
    </main>
  );
}
