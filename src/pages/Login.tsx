
import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login, isLoading } = useAuth();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email inválido";
    }

    if (!password.trim()) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        await login(email, password);
      } catch (error) {
        console.error("Error al iniciar sesión:", error);
      }
    }
  };

  return (
    <AuthLayout title="Iniciar Sesión">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={cn(errors.email && "border-destructive")}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Contraseña</Label>
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={cn(errors.password && "border-destructive")}
          />
          {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center justify-center">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2"></span>
              Iniciando sesión...
            </span>
          ) : (
            "Iniciar Sesión"
          )}
        </Button>
        <div className="text-center text-sm">
          ¿No tienes una cuenta?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Regístrate
          </Link>
        </div>
        
        <div className="text-center mt-4 text-xs text-muted-foreground">
          <p>Credenciales de prueba:</p>
          <p>Email: demo@example.com</p>
          <p>Contraseña: password123</p>
        </div>
      </form>
    </AuthLayout>
  );
}
