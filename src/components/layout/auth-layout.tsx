
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
}

export function AuthLayout({ children, title }: AuthLayoutProps) {
  const { user, isLoading } = useAuth();

  // Si está cargando, mostramos un spinner
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Si hay un usuario autenticado, redirigimos al dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-primary">{title}</h1>
            <p className="text-muted-foreground">Gestiona tu tiempo y tareas de forma eficiente</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
