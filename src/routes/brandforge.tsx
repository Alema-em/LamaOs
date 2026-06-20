import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/brandforge")({
  head: () => ({ meta: [{ title: "Projects — LamaOS" }] }),
  component: () => <Navigate to="/projects" replace />,
});
