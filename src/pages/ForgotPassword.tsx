import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validateEmail = (email: string) => {
        return /\S+@\S+\.\S+/.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!validateEmail(email)) {
            setError("Por favor, introduce un correo electrónico válido.");
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) {
                throw error;
            }

            setEmailSent(true);
            toast({
                title: "Correo enviado",
                description: "Se ha enviado un enlace de recuperación a tu correo electrónico.",
            });
        } catch (error) {
            console.error("Error al enviar el correo de recuperación:", error);
            setError(
                "Ha ocurrido un error al enviar el correo de recuperación. Por favor, inténtalo de nuevo."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold">Recuperar contraseña</h1>
                <p className="text-muted-foreground">
                    Ingresa tu correo electrónico para recibir un enlace de recuperación.
                </p>
            </div>

            {emailSent ? (
                <div className="space-y-4">
                    <div className="bg-primary/10 p-4 rounded-md">
                        <p className="text-center text-primary">
                            Se ha enviado un enlace de recuperación a <strong>{email}</strong>.
                            Por favor, revisa tu bandeja de entrada.
                        </p>
                    </div>
                    <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">
                            ¿No has recibido el correo?
                        </p>
                        <Button
                            variant="outline"
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="w-full"
                        >
                            Reenviar correo
                        </Button>
                    </div>
                    <div className="text-center">
                        <Link to="/login" className="text-primary hover:underline text-sm">
                            Volver a inicio de sesión
                        </Link>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="tu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={cn(error && "border-destructive")}
                            disabled={isLoading}
                        />
                        {error && <p className="text-sm text-destructive">{error}</p>}
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2"></span>
                                Enviando...
                            </span>
                        ) : (
                            "Enviar enlace de recuperación"
                        )}
                    </Button>
                    <div className="text-center">
                        <Link to="/login" className="text-primary hover:underline text-sm">
                            Volver a inicio de sesión
                        </Link>
                    </div>
                </form>
            )}
        </div>
    );
}