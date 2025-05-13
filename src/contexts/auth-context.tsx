
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

// Tipos
type User = {
  id: string;
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
};

// Mock de usuarios para demo
const mockUsers = [
  { id: '1', name: 'Demo User', email: 'demo@example.com', password: 'password123' }
];

// Crear contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Verificar si el usuario ya está autenticado
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Login
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));

      const foundUser = mockUsers.find(u => u.email === email && u.password === password);
      
      if (!foundUser) {
        throw new Error('Credenciales inválidas');
      }
      
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido ${userWithoutPassword.name}`,
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error de inicio de sesión",
        description: error.message || "Hubo un problema al iniciar sesión",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Register
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar si el correo ya existe
      if (mockUsers.some(u => u.email === email)) {
        throw new Error('Este correo ya está registrado');
      }
      
      // En una aplicación real, esto sería una llamada API para crear el usuario
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password // En un caso real, esto estaría hasheado
      };
      
      mockUsers.push(newUser);
      
      // Guardar usuario en el estado (sin la contraseña)
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada correctamente",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error de registro",
        description: error.message || "Hubo un problema al crear la cuenta",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
