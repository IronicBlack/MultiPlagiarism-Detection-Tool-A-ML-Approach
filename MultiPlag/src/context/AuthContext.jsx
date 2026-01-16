import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [demoAttempts, setDemoAttempts] = useState(3);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    const storedAttempts = localStorage.getItem('demoAttempts');
    if (storedAttempts) {
      setDemoAttempts(parseInt(storedAttempts, 10));
    }

    return () => subscription?.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    if (error) throw error;
    return data.user;
  };

  const register = async ({ name, email, password, institution }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          institution
        }
      }
    });
    if (error) throw error;
    return data.user;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  };

  const resetDemoAttempts = () => {
    setDemoAttempts(3);
    localStorage.setItem('demoAttempts', '3');
  };

  const useDemoAttempt = () => {
    if (demoAttempts > 0) {
      const newAttempts = demoAttempts - 1;
      setDemoAttempts(newAttempts);
      localStorage.setItem('demoAttempts', newAttempts.toString());
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      resetPassword,
      demoAttempts,
      useDemoAttempt,
      resetDemoAttempts 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);