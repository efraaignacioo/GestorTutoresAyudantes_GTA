export interface Course {
  id: string;
  code: string;
  name: string;
  term: string;
  professorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseInput {
  code: string;
  name: string;
  term: string;
}

export const PAGE_SIZE = 20;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDateString(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function isCourse(value: unknown): value is Course {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    value.id.length > 0 &&
    typeof value.code === "string" &&
    value.code.length > 0 &&
    typeof value.name === "string" &&
    value.name.length > 0 &&
    typeof value.term === "string" &&
    value.term.length > 0 &&
    typeof value.professorId === "string" &&
    value.professorId.length > 0 &&
    isDateString(value.createdAt) &&
    isDateString(value.updatedAt)
  );
}

export function parseCourse(value: unknown): Course {
  if (!isCourse(value)) {
    throw new Error(
      "Respuesta incompatible: se esperaba una asignatura con el contrato del backend.",
    );
  }
  return value;
}

export function parseCourses(value: unknown): Course[] {
  if (!Array.isArray(value)) {
    throw new Error(
      "Respuesta incompatible: GET /courses debe devolver un arreglo JSON.",
    );
  }
  return value.map((item: unknown) => parseCourse(item));
}

export function createCourseInput(data: {
  code: string;
  name: string;
  term: string;
}): CreateCourseInput {
  const code = data.code.trim().toUpperCase();
  const name = data.name.trim();
  const term = data.term.trim();

  if (code.length === 0 || code.length > 20) {
    throw new Error(
      "El código debe tener entre 1 y 20 caracteres, sin espacios exteriores.",
    );
  }
  if (name.length === 0 || name.length > 150) {
    throw new Error(
      "El nombre debe tener entre 1 y 150 caracteres, sin espacios exteriores.",
    );
  }
  if (term.length === 0 || term.length > 20) {
    throw new Error(
      "El periodo debe tener entre 1 y 20 caracteres, sin espacios exteriores.",
    );
  }

  return { code, name, term };
}
