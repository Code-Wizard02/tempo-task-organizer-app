
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile } from '@/types/app-types';
import { error } from 'console';

// Authentication context type
type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{
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

  // Initial session check
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (!error && data) {
            setProfile(data);
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        setProfile(data || null);
      } else {
        setProfile(null);
      }
      
      setIsLoading(false);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const response = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      return {
        error: response.error,
        data: response.data?.session || null
      };
    } catch (error) {
      console.error("Sign in error:", error);
      return {
        error: error instanceof Error ? error : new Error('Unknown sign-in error'),
        data: null
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
          }
        }
      });

      console.log("Sign up response:", response);
      
      if (response.error) {
        console.error("Sign up error:", response.error);
        return {
          error: response.error,
          data: null
        };
      }
      return {
        error: null,
        data: response.data.session || null,
        message: "Check your email for the confirmation link."
      };
    } catch (error) {
      console.error("Sign up error:", error);
      return {
        error: error instanceof Error ? error : new Error('Unknown sign-up error'),
        data: null
      };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error("No user authenticated"), data: null };
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
        
      if (!error && data) {
        setProfile(data);
        return { data, error: null };
      }
      
      return { error, data: null };
    } catch (error) {
      console.error("Update profile error:", error);
      return { 
        error: error instanceof Error ? error : new Error('Unknown profile update error'), 
        data: null 
      };
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
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
