import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(true);
    const [isTokenValid, setIsTokenValid] = useState(false);
    const navigate = useNavigate();

    // Verificar que el token en la URL es válido
    useEffect(() => {
        const checkSession = async () => {
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();

                if (session?.user) {
                    setIsTokenValid(true);
                } else {
                    setError(
                        "El enlace de recuperación no es válido o ha expirado. Por favor, solicita uno nuevo."
                    );
                }
            } catch (error) {
                console.error("Error al verificar la sesión:", error);
                setError(
                    "Ocurrió un error al validar tu solicitud. Por favor, intenta nuevamente."
                );
            } finally {
                setIsVerifying(false);
            }
        };

        checkSession();
    }, []);

    const validatePassword = () => {
        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return false;
        }

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!validatePassword()) {
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) {
                throw error;
            }

            toast({
                title: "Contraseña actualizada",
                description: "Tu contraseña ha sido actualizada exitosamente.",
            });

            // Redirigir al login después de un breve retraso
            setTimeout(() => {
                navigate("/login", {
                    state: { passwordResetSuccess: true },
                });
            }, 1500);
        } catch (error) {
            console.error("Error al actualizar la contraseña:", error);
            setError(
                "Ha ocurrido un error al actualizar tu contraseña. Por favor, inténtalo de nuevo."
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (isVerifying) {
        return (
            <div className="max-w-md mx-auto p-6 flex justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            </div>
        );
    }

    if (!isTokenValid) {
        return (
            <div className="max-w-md mx-auto p-6 space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold">Enlace inválido</h1>
                    <p className="text-destructive">{error}</p>
                    <Button onClick={() => navigate("/forgot-password")} className="mt-4">
                        Solicitar nuevo enlace
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto p-6 space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold">Establece una nueva contraseña</h1>
                <p className="text-muted-foreground">
                    Por favor, crea una nueva contraseña para tu cuenta.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="password">Nueva contraseña</Label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={cn(error && "border-destructive")}
                        disabled={isLoading}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={cn(error && "border-destructive")}
                        disabled={isLoading}
                    />
                    {error && <p className="text-sm text-destructive">{error}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                        <span className="flex items-center justify-center">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2"></span>
                            Actualizando contraseña...
                        </span>
                    ) : (
                        "Guardar nueva contraseña"
                    )}
                </Button>
            </form>
        </div>
    );
}