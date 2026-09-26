
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { activateCacheForUser } from '@/lib/dexieDb';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let authEventReceived = false;
    let sessionVersion = 0;
    let activeUserId: string | null = null;

    const applySession = async (nextSession: Session | null) => {
      const version = ++sessionVersion;
      const nextUserId = nextSession?.user.id ?? null;

      if (activeUserId !== nextUserId) {
        setUser(null);
        setSession(null);
      }

      try {
        await activateCacheForUser(nextUserId);
        if (version !== sessionVersion) return;
        activeUserId = nextUserId;
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
      } catch (error) {
        console.error('Failed to isolate the local cache for the active user:', error);
        if (version !== sessionVersion) return;
        activeUserId = null;
        setSession(null);
        setUser(null);
      } finally {
        if (version === sessionVersion) setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        authEventReceived = true;
        void applySession(nextSession);
      }
    );

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!authEventReceived) void applySession(currentSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName
        }
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      signUp,
      signIn,
      signOut,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
