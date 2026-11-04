import test from "node:test";
import assert from "node:assert/strict";
import { readAuthSettings } from "../src/auth/auth-settings.ts";
import { subjectFromClaims } from "../src/auth/auth-user.ts";

const secret = "a".repeat(64); // Solo dato de prueba, nunca secreto del servidor.
const id = "3e8dbe3d-f82c-44ca-bf5c-e8c918a101c1";

test("exige un secreto y rechaza un secreto corto", () => {
  assert.throws(() => readAuthSettings({}));
  assert.throws(() => readAuthSettings({ JWT_SECRET: "corto" }));
});

test("aplica 900 segundos y fija emisor y audiencia", () => {
  const settings = readAuthSettings({ JWT_SECRET: secret });
  assert.equal(settings.expiresIn, 900);
  assert.equal(settings.issuer, "taskboard-api");
  assert.equal(settings.audience, "taskboard-web");
});

test("rechaza vigencias inválidas sin confundir NaN con un valor ausente", () => {
  for (const value of ["", "abc", "0", "59", "3601", "900s", "1.5", " 900 "]) {
    assert.throws(() =>
      readAuthSettings({ JWT_SECRET: secret, JWT_EXPIRES_IN: value }),
    );
  }
});

test("admite los límites de vigencia", () => {
  for (const value of ["60", "900", "3600"]) {
    assert.equal(
      readAuthSettings({ JWT_SECRET: secret, JWT_EXPIRES_IN: value }).expiresIn,
      Number(value),
    );
  }
});

test("requiere sub UUID v4 y exp entero", () => {
  assert.equal(subjectFromClaims({ sub: id, exp: 2_000_000_000 }), id);
  for (const claims of [
    null,
    {},
    { sub: "otro", exp: 1 },
    { sub: id },
    { sub: id, exp: "2000000000" },
    { sub: id, exp: 1.5 },
  ]) {
    assert.equal(subjectFromClaims(claims), undefined);
  }
});
