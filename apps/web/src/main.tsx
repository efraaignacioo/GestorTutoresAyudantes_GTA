import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, Link, RouterProvider } from "react-router-dom";
import { queryClient } from "./query-client.ts";
import SessionRoot from "./auth/SessionRoot.tsx";
import "./index.css";

const router = createBrowserRouter([
  { path: "/", element: <SessionRoot /> },
  {
    path: "*",
    element: (
      <main>
        <h1>Página no encontrada</h1>
        <Link to="/">Volver al inicio</Link>
      </main>
    ),
  },
]);

const root = document.getElementById("root");
if (!root) throw new Error("No se encontró el elemento #root.");

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
