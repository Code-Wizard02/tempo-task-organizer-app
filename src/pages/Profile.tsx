
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

export default function Profile() {
  const { user, profile, updateProfile } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Ensure we're not sending empty values
      const updatedProfile = {
        full_name: fullName || profile?.full_name || user.email?.split('@')[0] || "Usuario",
        bio: bio || "",
      };
      
      await updateProfile(updatedProfile);
      setIsEditing(false);
      toast({
        title: "Perfil actualizado",
        description: "Tu información ha sido actualizada correctamente.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error al actualizar",
        description: "No se pudo actualizar tu información. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Mi Perfil</CardTitle>
          <CardDescription>
            Gestiona tu información personal y preferencias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || "Usuario"} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(profile?.full_name || "Usuario")}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-1">
                  <h3 className="text-xl font-medium">{profile?.full_name || "Usuario"}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nombre completo</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Biografía</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Cuéntanos sobre ti..."
                      rows={4}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium">Nombre completo</h4>
                    <p className="text-sm text-muted-foreground">
                      {profile?.full_name || "No especificado"}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium">Biografía</h4>
                    <p className="text-sm text-muted-foreground">
                      {profile?.bio || "No especificada"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter>
          {isEditing ? (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          ) : (
            <Button type="button" onClick={() => setIsEditing(true)}>
              Editar perfil
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
