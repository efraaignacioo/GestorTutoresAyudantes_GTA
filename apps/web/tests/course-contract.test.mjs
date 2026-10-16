import test from "node:test";
import assert from "node:assert/strict";
import {
  createCourseInput,
  parseCourse,
  parseCourses,
} from "../src/courses/course-contract.ts";

const course = {
  id: "00000000-0000-4000-8000-000000000002",
  code: "INF-210",
  name: "Bases de Datos",
  term: "2026-1",
  professorId: "00000000-0000-4000-8000-000000000001",
  createdAt: "2026-10-15T12:00:00.000Z",
  updatedAt: "2026-10-15T12:00:00.000Z",
};

test("acepta un listado vacío como respuesta válida", () => {
  assert.deepEqual(parseCourses([]), []);
});

test("acepta una asignatura completa con todos sus campos", () => {
  assert.deepEqual(parseCourses([course]), [course]);
});

test("rechaza un envoltorio que no pertenece al contrato", () => {
  assert.throws(() => parseCourses({ items: [course] }), /arreglo JSON/);
});

test("rechaza un curso con campos requeridos ausentes", () => {
  const incomplete = { ...course };
  delete incomplete.code;
  assert.throws(() => parseCourse(incomplete));
});

test("rechaza una fecha inválida", () => {
  assert.throws(() => parseCourse({ ...course, createdAt: "no-es-fecha" }));
  assert.throws(() => parseCourse({ ...course, updatedAt: "no-es-fecha" }));
});

test("normaliza código a mayúsculas y quita espacios de los textos", () => {
  assert.deepEqual(
    createCourseInput({
      code: " inf-210 ",
      name: " Bases de Datos ",
      term: " 2026-1 ",
    }),
    {
      code: "INF-210",
      name: "Bases de Datos",
      term: "2026-1",
    },
  );
});

test("rechaza un código compuesto únicamente por espacios", () => {
  assert.throws(
    () =>
      createCourseInput({
        code: "   ",
        name: "Bases de Datos",
        term: "2026-1",
      }),
    /1 y 20/,
  );
});

test("rechaza un nombre compuesto únicamente por espacios", () => {
  assert.throws(
    () =>
      createCourseInput({
        code: "INF-210",
        name: "   ",
        term: "2026-1",
      }),
    /1 y 150/,
  );
});

test("acepta límites de caracteres permitidos y rechaza si se exceden", () => {
  assert.equal(
    createCourseInput({
      code: "A".repeat(20),
      name: "B".repeat(150),
      term: "C".repeat(20),
    }).code.length,
    20,
  );
  assert.throws(
    () =>
      createCourseInput({
        code: "A".repeat(21),
        name: "B",
        term: "C",
      }),
    /1 y 20/,
  );
  assert.throws(
    () =>
      createCourseInput({
        code: "A",
        name: "B".repeat(151),
        term: "C",
      }),
    /1 y 150/,
  );
});
