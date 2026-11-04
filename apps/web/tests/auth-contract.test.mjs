import test from "node:test";
import assert from "node:assert/strict";
import {
  parseMe,
  parseToken,
  validatePassword,
} from "../src/auth/auth-contract.ts";
import {
  beginSession,
  dropSession,
  getSession,
} from "../src/auth/session-store.ts";

const user = {
  sub: "3e8dbe3d-f82c-44ca-bf5c-e8c918a101c1",
  email: "a@example.test",
  name: null,
};

test("extrae solo el contrato público de identidad", () => {
  assert.deepEqual(parseMe({ ...user, passwordHash: "no-debe-salir" }), user);
  assert.throws(() => parseMe({ ...user, sub: "invalido" }));
  assert.throws(() => parseMe({ sub: user.sub, email: user.email }));
});

test("valida el contrato de token sin aceptar vigencias inválidas", () => {
  const token = {
    access_token: "valor-de-prueba",
    token_type: "Bearer",
    expires_in: 900,
  };
  assert.deepEqual(parseToken(token), token);
  for (const bad of [
    null,
    {},
    { ...token, access_token: "" },
    { ...token, token_type: "Basic" },
    { ...token, expires_in: "900" },
    { ...token, expires_in: 0 },
  ]) {
    assert.throws(() => parseToken(bad));
  }
});

test("distingue longitud en caracteres y en bytes", () => {
  assert.doesNotThrow(() => validatePassword("a".repeat(15), true));
  assert.doesNotThrow(() => validatePassword("a".repeat(72), true));
  assert.doesNotThrow(() => validatePassword("😀".repeat(18), true));
  assert.throws(() => validatePassword("a".repeat(14), true));
  assert.throws(() => validatePassword("a".repeat(73), true));
  assert.throws(() => validatePassword("😀".repeat(19), true));
});

test("login no aplica otra vez el mínimo de registro", () => {
  assert.doesNotThrow(() => validatePassword("anterior", false));
  assert.throws(() => validatePassword("", false));
});

test("una respuesta de sesión antigua no cierra una sesión nueva", () => {
  const first = beginSession("mismo-token-posible", user, 900);
  const second = beginSession("mismo-token-posible", user, 900);
  assert.notEqual(first.id, second.id);
  assert.equal(dropSession(first.id, "respuesta tardía"), false);
  assert.equal(getSession()?.id, second.id);
  assert.equal(dropSession(second.id, "cierre actual"), true);
  assert.equal(getSession(), null);
});
