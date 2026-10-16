import axios from "axios";

function serverMessage(data: unknown): string | undefined {
  if (typeof data !== "object" || data === null || !("message" in data)) {
    return undefined;
  }
  const message = (data as { message: unknown }).message;
  if (typeof message === "string") return message;
  if (
    Array.isArray(message) &&
    message.every((item) => typeof item === "string")
  ) {
    return message.join(". ");
  }
  return undefined;
}

export function apiErrorMessage(error: unknown, writing = false): string {
  if (axios.isAxiosError<unknown>(error)) {
    if (error.response) {
      const status = error.response.status;
      if (status === 400) {
        return (
          serverMessage(error.response.data) ??
          "La API rechazó los datos enviados."
        );
      }
      if (status === 404) {
        return "Ruta no encontrada. Comprueba la ruta y la URL de la API.";
      }
      if (status === 409) {
        return (
          serverMessage(error.response.data) ??
          "Conflicto con un registro existente."
        );
      }
      if (status >= 500) {
        return writing
          ? "La API devolvió un error. Comprueba el listado antes de repetir la creación."
          : "La API devolvió un error interno. Revisa la terminal del backend.";
      }
      return `La API respondió HTTP ${status}.`;
    }

    const uncertain = writing
      ? " No se puede confirmar si se guardó: recupera la conexión y consulta antes de repetir."
      : "";

    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return `Se agotó el tiempo de espera de 10 segundos.${uncertain}`;
    }
    return `No se recibió una respuesta accesible. Revisa API, red y CORS.${uncertain}`;
  }

  return error instanceof Error
    ? error.message
    : "Ocurrió un error inesperado.";
}
