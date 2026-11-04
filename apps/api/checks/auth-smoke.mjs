import "dotenv/config";
import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";

const base = new URL(process.env.TASKBOARD_API_URL ?? "http://localhost:3000");
assert.ok(
  ["localhost", "127.0.0.1", "[::1]"].includes(base.hostname),
  "Usa solo la API local.",
);
assert.equal(base.pathname, "/", "La URL debe ser un origen sin subruta.");
assert.ok(process.env.JWT_SECRET, "Falta JWT_SECRET en apps/api/.env.");

const suffix = randomUUID();
const password = `Prueba-${randomUUID()}!`;
const aliceEmail = `alice.${suffix}@example.test`;
const bobEmail = `bob.${suffix}@example.test`;
const cleanup = [];
let checks = 0;

async function request(method, path, expected, body, token) {
  const response = await fetch(new URL(path, base), {
    method,
    signal: AbortSignal.timeout(10_000),
    headers: {
      Accept: "application/json",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await response.json();
  assert.equal(response.status, expected, `${method} ${path}: HTTP inesperado`);
  assert.equal(
    JSON.stringify(data).includes('"passwordHash"'),
    false,
    "Hash expuesto en respuesta.",
  );
  checks++;
  return data;
}

function signed(claims, algorithm = "HS256") {
  const header = Buffer.from(
    JSON.stringify({ alg: algorithm, typ: "JWT" }),
  ).toString("base64url");
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  const input = `${header}.${payload}`;
  const signature = createHmac(
    algorithm === "HS384" ? "sha384" : "sha256",
    process.env.JWT_SECRET,
  )
    .update(input)
    .digest("base64url");
  return `${input}.${signature}`;
}

try {
  await request("GET", "/courses", 401);
  const alice = await request("POST", "/auth/signup", 201, {
    email: aliceEmail,
    password,
    name: "Alice test",
  });
  const bob = await request("POST", "/auth/signup", 201, {
    email: bobEmail,
    password,
    name: "Bob test",
  });

  assert.equal(alice.token_type, "Bearer");
  assert.equal(typeof alice.expires_in, "number");

  await request("POST", "/auth/signup", 409, {
    email: ` ${aliceEmail.toUpperCase()} `,
    password,
  });

  await request("POST", "/auth/signup", 400, {
    email: `weak.${suffix}@example.test`,
    password: "corta",
  });

  await request("POST", "/auth/signup", 400, {
    email: `bytes.${suffix}@example.test`,
    password: "😀".repeat(19),
  });

  const wrong = await request("POST", "/auth/login", 401, {
    email: aliceEmail,
    password: "Incorrecta-2026!",
  });

  const unknown = await request("POST", "/auth/login", 401, {
    email: `missing.${suffix}@example.test`,
    password,
  });

  assert.equal(wrong.message, unknown.message);

  await request("POST", "/auth/login", 200, {
    email: aliceEmail,
    password,
  });

  const me = await request(
    "GET",
    "/auth/me",
    200,
    undefined,
    alice.access_token,
  );
  const bobMe = await request(
    "GET",
    "/auth/me",
    200,
    undefined,
    bob.access_token,
  );

  assert.notEqual(me.sub, bobMe.sub);
  assert.equal(me.email, aliceEmail);

  const course = await request(
    "POST",
    "/courses",
    201,
    {
      code: `C-${suffix.slice(0, 8)}`,
      name: `Privada-${suffix}`,
      term: "2026-1",
    },
    alice.access_token,
  );
  cleanup.push({ id: course.id, token: alice.access_token });

  assert.equal(course.professorId, me.sub);

  const own = await request(
    "GET",
    "/courses?skip=0&take=20",
    200,
    undefined,
    alice.access_token,
  );
  const other = await request(
    "GET",
    "/courses?skip=0&take=20",
    200,
    undefined,
    bob.access_token,
  );

  assert.ok(Array.isArray(own) && own.some((item) => item.id === course.id));
  assert.ok(
    Array.isArray(other) &&
      other.every((item) => item.professorId === bobMe.sub),
  );
  assert.equal(
    other.some((item) => item.id === course.id),
    false,
  );

  await request(
    "GET",
    `/courses/${course.id}`,
    404,
    undefined,
    bob.access_token,
  );
  await request(
    "PATCH",
    `/courses/${course.id}`,
    404,
    { name: "Intento ajeno" },
    bob.access_token,
  );
  await request(
    "DELETE",
    `/courses/${course.id}`,
    404,
    undefined,
    bob.access_token,
  );

  await request(
    "GET",
    `/courses/${course.id}`,
    200,
    undefined,
    alice.access_token,
  );

  await request(
    "POST",
    "/courses",
    400,
    {
      code: `C2-${suffix.slice(0, 8)}`,
      name: "Suplantación",
      term: "2026-1",
      professorId: bobMe.sub,
    },
    alice.access_token,
  );

  await request("GET", "/courses?take=101", 400, undefined, alice.access_token);
  await request(
    "GET",
    "/courses/no-es-uuid",
    400,
    undefined,
    alice.access_token,
  );

  await request(
    "PATCH",
    `/courses/${course.id}`,
    400,
    { name: null },
    alice.access_token,
  );

  const patched = await request(
    "PATCH",
    `/courses/${course.id}`,
    200,
    { name: "Actualizada por su autora" },
    alice.access_token,
  );
  assert.equal(patched.name, "Actualizada por su autora");

  const now = Math.floor(Date.now() / 1000);
  const claims = {
    sub: me.sub,
    iss: "taskboard-api",
    aud: "taskboard-web",
    iat: now,
    exp: now + 60,
  };

  const control = await request(
    "GET",
    "/auth/me",
    200,
    undefined,
    signed({ ...claims, email: "correo-falso@example.test" }),
  );
  assert.equal(control.email, aliceEmail);

  await request(
    "GET",
    "/auth/me",
    401,
    undefined,
    signed({ ...claims, exp: now - 60 }),
  );

  await request(
    "GET",
    "/auth/me",
    401,
    undefined,
    signed({ ...claims, aud: "otra-app" }),
  );

  await request(
    "GET",
    "/auth/me",
    401,
    undefined,
    signed({ ...claims, iss: "otro-emisor" }),
  );

  await request("GET", "/auth/me", 401, undefined, signed(claims, "HS384"));

  await request(
    "GET",
    "/auth/me",
    401,
    undefined,
    signed({ ...claims, sub: "invalido" }),
  );

  await request(
    "GET",
    "/auth/me",
    401,
    undefined,
    signed({ ...claims, sub: randomUUID() }),
  );

  await request("GET", "/auth/me", 401, undefined, signed({ sub: me.sub }));

  const invalid = signed(claims).split(".");
  invalid[2] = `${invalid[2][0] === "a" ? "b" : "a"}${invalid[2].slice(1)}`;
  await request("GET", "/auth/me", 401, undefined, invalid.join("."));

  console.log(
    `Correcto: ${checks} comprobaciones HTTP. Sin tokens ni hashes en la salida.`,
  );
} finally {
  for (const item of cleanup) {
    try {
      await request(
        "DELETE",
        `/courses/${item.id}`,
        200,
        undefined,
        item.token,
      );
    } catch {
      console.error(
        `No se pudo limpiar la asignatura de prueba ${item.id}; revísala con su cuenta.`,
      );
    }
  }
}
