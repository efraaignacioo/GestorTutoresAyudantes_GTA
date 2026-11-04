import axios from "axios";

function serverMessage(data: unknown): string | undefined {
  if (typeof data !== "object" || data === null || !("message" in data))
    return undefined;
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
      if (status === 400)
        return (
          serverMessage(error.response.data) ?? "Datos rechazados por la API."
        );
      if (status === 401)
        return serverMessage(error.response.data) ?? "Acceso no autorizado.";
      if (status === 404)
        return "Recurso no encontrado o no disponible para tu cuenta.";
      if (status === 409)
        return "El correo ya está registrado. Intenta iniciar sesión.";
      if (status === 429)
        return "Demasiados intentos. Espera un minuto antes de volver a intentar.";
      if (status >= 500) {
        return writing
          ? "La API devolvió un error. Comprueba el resultado antes de repetir la escritura."
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
