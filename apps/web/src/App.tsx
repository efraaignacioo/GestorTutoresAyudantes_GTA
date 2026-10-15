import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiErrorMessage } from "./api-error.ts";
import { createCourse, listCourses } from "./courses/courses.api.ts";
import { createCourseInput, PAGE_SIZE } from "./courses/course-contract.ts";

export default function App() {
  const client = useQueryClient();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [term, setTerm] = useState("");
  const [skip, setSkip] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [inputError, setInputError] = useState("");

  const coursesQuery = useQuery({
    queryKey: ["courses", { skip, take: PAGE_SIZE }],
    queryFn: ({ signal }) => listCourses(skip, PAGE_SIZE, signal),
  });

  const createMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: async () => {
      setCode("");
      setName("");
      setTerm("");
      setInputError("");
      setFeedback(
        "Asignatura creada. Si el listado no se actualiza, reintenta solo la lectura.",
      );
      setSkip(0);
      await client.invalidateQueries({ queryKey: ["courses"] });
    },
  });

  const courses = coursesQuery.data;
  const busy = createMutation.isPending;

  const normalizedCode = code.trim();
  const normalizedName = name.trim();
  const normalizedTerm = term.trim();

  const isFormInvalid =
    busy ||
    normalizedCode.length === 0 ||
    normalizedCode.length > 20 ||
    normalizedName.length === 0 ||
    normalizedName.length > 150 ||
    normalizedTerm.length === 0 ||
    normalizedTerm.length > 20;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setFeedback("");
    setInputError("");
    createMutation.reset();

    try {
      const input = createCourseInput({ code, name, term });
      createMutation.mutate(input);
    } catch (error) {
      setInputError(apiErrorMessage(error));
    }
  }

  return (
    <main>
      <header>
        <p className="eyebrow">Gestor de Tutores y Ayudantes</p>
        <h1>Asignaturas y Ramos</h1>
        <p>
          Consulta y registra asignaturas asociadas al docente de demostración.
        </p>
        <p className="notice">
          Entorno didáctico sin inicio de sesión. No ingresar datos sensibles.
        </p>
      </header>

      <section aria-labelledby="create-heading">
        <h2 id="create-heading">Registrar Asignatura</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="course-code">Código de la asignatura</label>
            <input
              id="course-code"
              name="code"
              value={code}
              onChange={(event) => {
                setCode(event.target.value);
                setInputError("");
                setFeedback("");
                createMutation.reset();
              }}
              maxLength={20}
              required
              disabled={busy}
              aria-describedby="code-help"
              placeholder="ej. INF-210"
            />
            <p id="code-help" className="muted">
              Entre 1 y 20 caracteres; no se aceptan solo espacios.
            </p>
          </div>

          <div>
            <label htmlFor="course-name">Nombre de la asignatura</label>
            <input
              id="course-name"
              name="name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setInputError("");
                setFeedback("");
                createMutation.reset();
              }}
              maxLength={150}
              required
              disabled={busy}
              aria-describedby="name-help"
              placeholder="ej. Bases de Datos"
            />
            <p id="name-help" className="muted">
              Entre 1 y 150 caracteres.
            </p>
          </div>

          <div>
            <label htmlFor="course-term">Periodo académico / Semestre</label>
            <input
              id="course-term"
              name="term"
              value={term}
              onChange={(event) => {
                setTerm(event.target.value);
                setInputError("");
                setFeedback("");
                createMutation.reset();
              }}
              maxLength={20}
              required
              disabled={busy}
              aria-describedby="term-help"
              placeholder="ej. 2026-1"
            />
            <p id="term-help" className="muted">
              Entre 1 y 20 caracteres (ej. 2026-1).
            </p>
          </div>

          <button type="submit" disabled={isFormInvalid}>
            {busy ? "Creando y sincronizando..." : "Crear asignatura"}
          </button>
        </form>

        {inputError && (
          <p role="alert" className="error">
            {inputError}
          </p>
        )}
        {createMutation.isError && (
          <p role="alert" className="error">
            {apiErrorMessage(createMutation.error, true)}
          </p>
        )}
        {feedback && (
          <p role="status" className="success">
            {feedback}
          </p>
        )}
      </section>

      <section aria-labelledby="list-heading">
        <div className="section-heading">
          <h2 id="list-heading">Asignaturas registradas</h2>
          <button
            type="button"
            onClick={() => void coursesQuery.refetch()}
            disabled={coursesQuery.isFetching || busy}
          >
            Actualizar listado
          </button>
        </div>

        {coursesQuery.isPending && <p role="status">Cargando asignaturas...</p>}
        {coursesQuery.isFetching && !coursesQuery.isPending && (
          <p role="status">Actualizando listado...</p>
        )}

        {coursesQuery.isError && (
          <div role="alert" className="error">
            <p>{apiErrorMessage(coursesQuery.error)}</p>
            <p>
              {courses
                ? "Se muestran datos de una lectura anterior; podrían estar desactualizados."
                : "No se pudo consultar esta página. El error no significa que no existan asignaturas."}
            </p>
          </div>
        )}

        {!coursesQuery.isError &&
          !coursesQuery.isPending &&
          courses?.length === 0 && (
            <p>
              {skip === 0
                ? "No hay asignaturas. Registra la primera."
                : "No hay asignaturas en esta página. Vuelve a la anterior."}
            </p>
          )}

        {courses && courses.length > 0 && (
          <ul className="task-list" aria-label="Listado de asignaturas">
            {courses.map((course) => (
              <li key={course.id}>
                <strong>
                  {course.code} - {course.name}
                </strong>
                <p>Periodo: {course.term}</p>
                <p className="muted">
                  Registrada:{" "}
                  {new Date(course.createdAt).toLocaleString("es-CL")}
                </p>
              </li>
            ))}
          </ul>
        )}

        <nav className="pagination" aria-label="Paginación de asignaturas">
          <button
            type="button"
            onClick={() =>
              setSkip((current) => Math.max(0, current - PAGE_SIZE))
            }
            disabled={skip === 0 || coursesQuery.isFetching || busy}
          >
            Anterior
          </button>
          <span>Página {skip / PAGE_SIZE + 1}</span>
          <button
            type="button"
            onClick={() => setSkip((current) => current + PAGE_SIZE)}
            disabled={
              coursesQuery.isFetching ||
              coursesQuery.isError ||
              courses?.length !== PAGE_SIZE ||
              busy
            }
          >
            Siguiente
          </button>
        </nav>
        <p className="muted">
          Hasta 20 asignaturas por página. La API no devuelve un total.
        </p>
      </section>
    </main>
  );
}
