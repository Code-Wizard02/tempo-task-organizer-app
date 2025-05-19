
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signUp, isLoading } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }

    if (!email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else {
      // Expresión regular más robusta para validar emails
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "Formato de email inválido";
      }
    }

    if (!password.trim()) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        const {error, data}= await signUp(email, password, name);
        console.log("Respuesta completa:",{error, data});
        if (error){
          console.error("Error al registrarse:", error);
          if(error.message?.includes("security purposes")||error.message?.includes("after")){
            toast({
            title: "Demasiados intentos ",
            description: "Por razones de seguridad, debes esperar unos segundos antes de intentar registrarte nuevamente.", 
            variant: "destructive",
          });
          } else {
            toast({
            title: "Error al registrarse",
            description: error.message === "Unable to validate email address: invalid format" 
              ? "El formato del correo electrónico es inválido" 
              : (error.message || "Error inesperado"),
            variant: "destructive",
          });
        }
      } else {
        console.log("Registro exitoso:", data);
        toast({
          title: "Registro exitoso",
          description: "Ahora puedes iniciar sesión con tu cuenta.",
          variant: "default",
        });
          setTimeout(() => {
            navigate("/login");
        }, 1500); // 1.5 segundos
    }

        
      } catch (error) {
        console.error("Error al registrarse:", error);
        toast({
          title: "Error al registrarse",
          description: "Ha ocurrido un error inesperado",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre completo</Label>
        <Input
          id="name"
          placeholder="Tu nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={cn(errors.name && "border-destructive")}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>
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
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={cn(errors.password && "border-destructive")}
        />
        {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirmar contraseña</Label>
        <Input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={cn(errors.confirmPassword && "border-destructive")}
        />
        {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <span className="flex items-center justify-center">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2"></span>
            Registrando...
          </span>
        ) : (
          "Registrarse"
        )}
      </Button>
      <div className="text-center text-sm">
        ¿Ya tienes una cuenta?{" "}
        <Link to="/login" className="text-primary hover:underline">
          Iniciar sesión
        </Link>
      </div>
    </form>
  );
}
