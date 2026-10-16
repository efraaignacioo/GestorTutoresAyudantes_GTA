import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, Link, RouterProvider } from "react-router-dom";
import App from "./App.tsx";
import { queryClient } from "./query-client.ts";
import "./index.css";

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  {
    path: "*",
    element: (
      <main>
        <h1>Página no encontrada</h1>
        <p>
          La dirección no corresponde a una pantalla de Gestor de Tutores y
          Ayudantes.
        </p>
        <Link to="/">Volver al inicio</Link>
      </main>
    ),
  },
]);

const root = document.getElementById("root");
if (!root) throw new Error("Falta el elemento #root en index.html.");

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
