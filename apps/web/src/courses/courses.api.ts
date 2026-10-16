import { api } from "../api.ts";
import { parseCourse, parseCourses } from "./course-contract.ts";
import type { Course, CreateCourseInput } from "./course-contract.ts";

export async function listCourses(
  skip: number,
  take: number,
  signal?: AbortSignal,
): Promise<Course[]> {
  const response = await api.get<unknown>("/courses", {
    params: { skip, take },
    signal,
  });
  return parseCourses(response.data);
}

export async function createCourse(input: CreateCourseInput): Promise<Course> {
  const response = await api.post<unknown>("/courses", input);
  try {
    return parseCourse(response.data);
  } catch {
    throw new Error(
      "La API respondió a la creación con un formato inesperado. Comprueba el listado antes de repetir.",
    );
  }
}
