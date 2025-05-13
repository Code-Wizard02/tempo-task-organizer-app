
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { useState } from "react";

// Contextos
import { AuthProvider } from "@/contexts/auth-context";
import { TaskProvider } from "@/contexts/task-context";
import { SubjectProvider } from "@/contexts/subject-context";
import { ProfessorProvider } from "@/contexts/professor-context";
import { ScheduleProvider } from "@/contexts/schedule-context";

// Layouts
import { Layout } from "@/components/layout/layout";

// Páginas
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Subjects from "./pages/Subjects";
import Professors from "./pages/Professors";
import Schedule from "./pages/Schedule";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const [error, setError] = useState<Error | null>(null);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-4 rounded-lg border border-destructive bg-card p-6 shadow-lg">
          <h1 className="text-2xl font-bold text-destructive">Error en la aplicación</h1>
          <p className="text-muted-foreground">{error.message}</p>
          <pre className="mt-4 max-h-80 overflow-auto rounded bg-muted p-4 text-xs">
            {error.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Reiniciar aplicación
          </button>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <AuthProvider>
            <TaskProvider>
              <SubjectProvider>
                <ProfessorProvider>
                  <ScheduleProvider>
                    <Toaster />
                    <Sonner />
                    <Routes>
                      {/* Rutas públicas */}
                      <Route path="/" element={<Index />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />

                      {/* Rutas protegidas */}
                      <Route element={<Layout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/tasks" element={<Tasks />} />
                        <Route path="/subjects" element={<Subjects />} />
                        <Route path="/professors" element={<Professors />} />
                        <Route path="/schedule" element={<Schedule />} />
                        <Route path="/profile" element={<div className="p-4"><h1 className="text-xl font-semibold">Perfil - En desarrollo</h1></div>} />
                      </Route>

                      {/* Ruta para páginas no encontradas */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </ScheduleProvider>
                </ProfessorProvider>
              </SubjectProvider>
            </TaskProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
