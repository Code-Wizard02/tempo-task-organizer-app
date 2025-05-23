import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import type { Profile } from "@/types/app-types";
import { set } from "date-fns";

// Authentication context type
type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{
    error: Error | null;
    data: Profile | null;
  }>;
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Function to fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      console.log("Obteniendo perfil para el usuario:", userId);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Timeout al obtener el perfil")),
          250
        )
      );
      const profilePromise = supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      const { data, error } = await Promise.race([
        profilePromise,
        timeoutPromise.then(() => {
          throw new Error("Timeout al obtener el perfil");
        }),
      ]);

      // const { data, error } = await supabase
      //   .from("profiles")
      //   .select("*")
      //   .eq("id", userId)
      //   .single();

      console.log("Resultado de la consulta de perfil:", { data, error });

      if (error) {
        console.error("Error al obtener el perfil:", error);
        // throw new Error("Error al obtener el perfil");
        return null;
      }

      if (data) {
        setProfile(data);
        console.log("Perfil obtenido:", data);
      } else {
        console.error("No se encontró el perfil para el usuario:", userId);
      }
      return data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      // setProfile(null);
      return null;
    }
  };

  // Initial session check
  useEffect(() => {
    // const checkSession = async () => {
    //   setIsLoading(true);
    //   try {
    //     // Get current session
    //     const { data: { session } } = await supabase.auth.getSession();
    //     setSession(session);
    //     setUser(session?.user ?? null);

    //     if (session?.user) {
    //       await fetchProfile(session.user.id);
    //     }
    //   } catch (error) {
    //     console.error("Error checking session:", error);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };

    // checkSession();
    const checkSession = async () => {
      setIsLoading(true);
      console.log("Iniciando verificación de sesión...");
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        console.log("Resultado de getSession:", { session, error });

        if (error) {
          console.error("Error al obtener la sesión:", error);
          throw new Error("Error al obtener la sesión");
        }

        if (!session || !session.access_token) {
          console.error("Token inválido o sesión no encontrada:", error);
          setSession(null);
          setUser(null);
          setProfile(null);
          localStorage.removeItem("authToken"); // Limpia el token almacenado
          return;
        }

        console.log("Sesión válida, usuario:", session.user);
        localStorage.setItem("authToken", session.access_token);

        setSession(session);
        setUser(session.user);
        if (session?.user) {
          try {
            // Usar createProfileIfNotExists en lugar de fetchProfile para evitar llamadas duplicadas
            const profile = await createProfileIfNotExists(session.user);
            if (profile) {
              setProfile(profile);
            } else {
              console.warn("No se pudo cargar o crear el perfil del usuario");
            }
          } catch (profileError) {
            console.error("Error al cargar/crear perfil:", profileError);
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setSession(null);
        setUser(null);
        setProfile(null);
        localStorage.removeItem("authToken");
      } finally {
        console.log("Finalizando verificación de sesión...");
        setIsLoading(false);

        setSessionChecked(true);
      }
    };

    let isCheckingSession = false;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Si la sesión ya está establecida, no volvemos a verificarla
        if (isCheckingSession || (session && user)) {
          console.log(
            "La pestaña volvió a estar activa, pero ya tenemos sesión"
          );
          return;
        }
        console.log("La pestaña volvió a estar activa, verificando sesión...");
        // console.log("NO SE HACE NADA");
        // return;
        // Solo verifica la sesión si no hay una sesión activa
        if (!session || !user) {
          checkSession();
        }
        isCheckingSession = true;
        checkSession().finally(() => {
          isCheckingSession = false;
        });
      }
    };

    checkSession();

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Listen for auth changes
    //   const {
    //     data: { subscription },
    //   } = supabase.auth.onAuthStateChange(async (_event, session) => {
    //     setIsLoading(true);
    //     setSession(session);
    //     setUser(session?.user ?? null);

    //     if (session?.user) {
    //       await fetchProfile(session.user.id);
    //     } else {
    //       setProfile(null);
    //     }

    //     setIsLoading(false);
    //   });

    //   return () => {
    //     subscription.unsubscribe();
    //   };
    // }, []);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth state changed:", event);

      // Si es el mismo usuario, no hacemos nada
      if (newSession?.user?.id === session?.user?.id) {
        console.log("Mismo usuario, ignorando cambio de estado");
        return;
      }

      setIsLoading(true);
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        // Intentar obtener el perfil, pero no bloquear si falla
        try {
          const profile = await fetchProfile(newSession.user.id);
          if (!profile) {
            console.warn("No se pudo obtener el perfil, pero continuamos");
          }
        } catch (error) {
          console.error("Error al obtener el perfil:", error);
        }
      } else {
        setProfile(null);
      }

      setIsLoading(false);
    });

    // Limpieza
    return () => {
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const response = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // if (response.data?.session) {
      //   localStorage.setItem("authToken", response.data.session.access_token);
      // }

      return {
        error: response.error,
        data: response.data?.session || null,
      };
    } catch (error) {
      console.error("Sign in error:", error);
      return {
        error:
          error instanceof Error ? error : new Error("Unknown sign-in error"),
        data: null,
      };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const response = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      console.log("Sign up response:", response);

      if (response.error) {
        console.error("Sign up error:", response.error);
        return {
          error: response.error,
          data: null,
        };
      }
      return {
        error: null,
        data: response.data.session || null,
        message: "Check your email for the confirmation link.",
      };
    } catch (error) {
      console.error("Sign up error:", error);
      return {
        error:
          error instanceof Error ? error : new Error("Unknown sign-up error"),
        data: null,
      };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      console.log("Signing out...");
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      // localStorage.clear();
      // window.location.reload();
      console.log("Signed out successfully");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error("No user authenticated"), data: null };

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (!error && data) {
        setProfile((prev) => ({ ...(prev as Profile), ...data }));
        return { data, error: null };
      }

      return { error, data: null };
    } catch (error) {
      console.error("Update profile error:", error);
      return {
        error:
          error instanceof Error
            ? error
            : new Error("Unknown profile update error"),
        data: null,
      };
    }
  };

  const createProfileIfNotExists = async (user: User) => {
    try {
      // Verificar si ya existe un perfil
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!data && !error) {
        // Crear perfil si no existe
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert([
            {
              id: user.id,
              full_name: user.user_metadata?.full_name || "",
              email: user.email,
              avatar_url: user.user_metadata?.avatar_url || "",
            },
          ])
          .select("*")
          .single();

        if (createError) {
          console.error("Error al crear el perfil:", createError);
          return null;
        }

        return newProfile;
      }

      return data;
    } catch (error) {
      console.error("Error checking/creating profile:", error);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}
