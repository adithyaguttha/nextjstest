'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, type User, type AuthError } from './supabase';
import type { AuthResponse } from '@supabase/supabase-js';

type AuthContextType = {
  user: (User & { 
    is_admin?: boolean;
    avatar_url?: string;
    name?: string;
  }) | null;
  loading: boolean;
  error: AuthError | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; message?: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<(User & { 
    is_admin?: boolean;
    avatar_url?: string;
    name?: string;
  }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  // Initialize auth state with retry logic
  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    const initializeAuth = async () => {
      try {
        // Clear any stale session data first
        const { error: clearError } = await supabase.auth.getSession();
        if (clearError) {
          console.error('Error clearing stale session:', clearError);
        }

        // Get initial session with retry logic
        const getSessionWithRetry = async () => {
          try {
            const result = await supabase.auth.getSession();
            return result;
          } catch (err) {
            if (retryCount < maxRetries) {
              retryCount++;
              console.log(`Retrying session fetch (${retryCount}/${maxRetries})...`);
              await new Promise(resolve => setTimeout(resolve, retryDelay));
              return getSessionWithRetry();
            }
            throw err;
          }
        };

        const { data: { session }, error: sessionError } = await getSessionWithRetry();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          if (mounted) {
            setError({ message: 'Failed to restore session. Please try logging in again.' });
            setLoading(false);
          }
          return;
        }

        if (session?.user && mounted) {
          try {
            // Fetch user profile with retry logic
            const getProfileWithRetry = async () => {
              try {
                const { data, error } = await supabase
                  .from('profiles')
                  .select('is_admin, avatar_url, name')
                  .eq('id', session.user.id)
                  .single();
                
                if (error) throw error;
                return data;
              } catch (err) {
                if (retryCount < maxRetries) {
                  retryCount++;
                  console.log(`Retrying profile fetch (${retryCount}/${maxRetries})...`);
                  await new Promise(resolve => setTimeout(resolve, retryDelay));
                  return getProfileWithRetry();
                }
                throw err;
              }
            };

            const profile = await getProfileWithRetry();

            // Ensure we have the latest session
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            if (!currentSession) {
              throw new Error('Session expired during initialization');
            }

            if (mounted) {
              setUser({
                id: currentSession.user.id,
                email: currentSession.user.email!,
                name: profile?.name || currentSession.user.user_metadata.name,
                created_at: currentSession.user.created_at,
                is_admin: profile?.is_admin || false,
                avatar_url: profile?.avatar_url,
              });
            }
          } catch (err) {
            console.error('Error setting up user:', err);
            // Don't set error here to prevent UI disruption
            // This allows the user to still be logged in even if profile fetch fails
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (mounted) {
          setError({ message: 'Failed to initialize authentication. Please refresh the page.' });
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeAuth();

    // Set up auth state change listener with debounce
    let authChangeTimeout: NodeJS.Timeout;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      // Clear any pending auth change
      clearTimeout(authChangeTimeout);

      // Debounce auth state changes
      authChangeTimeout = setTimeout(async () => {
        try {
          if (event === 'SIGNED_OUT') {
            setUser(null);
            setError(null);
            // Clear all auth-related storage
            localStorage.removeItem('supabase.auth.token');
            sessionStorage.removeItem('supabase.auth.token');
            // Clear any auth-related cookies
            document.cookie.split(";").forEach(cookie => {
              if (cookie.trim().startsWith('sb-')) {
                document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
              }
            });
          } else if (session?.user) {
            // Verify session is still valid
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            if (!currentSession) {
              setUser(null);
              return;
            }

            // Fetch fresh profile data
            const { data: profile } = await supabase
              .from('profiles')
              .select('is_admin, avatar_url, name')
              .eq('id', session.user.id)
              .single();

            if (mounted) {
              setUser({
                id: currentSession.user.id,
                email: currentSession.user.email!,
                name: profile?.name || currentSession.user.user_metadata.name,
                created_at: currentSession.user.created_at,
                is_admin: profile?.is_admin || false,
                avatar_url: profile?.avatar_url,
              });
              setError(null);
            }
          }
        } catch (err) {
          console.error('Auth state change error:', err);
          // Don't set error here to prevent UI disruption
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      }, 100); // 100ms debounce
    });

    return () => {
      mounted = false;
      clearTimeout(authChangeTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      // Add timeout promise to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Sign in request timed out')), 10000);
      });

      // Attempt to sign in with timeout
      const { data, error } = await Promise.race([
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
        timeoutPromise
      ]) as AuthResponse;

      if (error) {
        // Handle specific sign-in errors
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please try again.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Please confirm your email address before signing in.');
        }
        throw error;
      }

      if (data?.user) {
        // Fetch user profile with timeout
        const profilePromise = supabase
          .from('profiles')
          .select('is_admin, avatar_url')
          .eq('id', data.user.id)
          .single();

        const { data: profile, error: profileError } = await Promise.race([
          profilePromise,
          timeoutPromise
        ]) as { data: { is_admin: boolean; avatar_url: string } | null, error: Error | null };

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          // Continue with sign in even if profile fetch fails
          // We'll just use default values for is_admin and avatar_url
        }

        // Set user state with profile data
        setUser({
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata.name,
          created_at: data.user.created_at,
          is_admin: profile?.is_admin || false,
          avatar_url: profile?.avatar_url,
        });

        // Navigate to home page
        router.push('/');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      const errorMessage = (err as Error).message;
      
      // Handle specific error cases
      if (errorMessage.includes('Sign in request timed out')) {
        setError({ message: 'Sign in request took too long. Please try again.' });
      } else if (errorMessage.includes('fetch failed') || errorMessage.includes('network') || errorMessage.includes('ENOTFOUND')) {
        setError({ message: 'Unable to connect to authentication server. Please check your internet connection or contact support.' });
      } else {
        setError({ message: errorMessage });
      }
      
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      setLoading(true);

      // Add timeout promise to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Sign up request timed out')), 10000);
      });

      // Attempt to sign up with timeout
      const { data: authData, error: signUpError } = await Promise.race([
        supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
            emailRedirectTo: `${window.location.origin}/auth?tab=login`,
        },
        }),
        timeoutPromise
      ]) as AuthResponse;

      if (signUpError) {
        // Handle specific signup errors
        if (signUpError.message.includes('User already registered')) {
          throw new Error('An account with this email already exists.');
        } else if (signUpError.message.includes('Password should be at least')) {
          throw new Error('Password must be at least 6 characters long.');
        } else if (signUpError.message.includes('Invalid email')) {
          throw new Error('Please enter a valid email address.');
        }
        throw signUpError;
      }

      // Create or update profile entry in profiles table
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(
            {
              id: authData.user.id,
              email: email,
              name: name,
              phone: null,
              location: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              is_admin: false,
              avatar_url: null,
            },
            {
              onConflict: 'id',
              ignoreDuplicates: false
            }
          );

        if (profileError) {
          console.error('Error creating/updating profile:', profileError);
          // Log the full error details
          if (profileError.details) {
            console.error('Profile error details:', profileError.details);
          }
          if (profileError.hint) {
            console.error('Profile error hint:', profileError.hint);
          }
          throw new Error(`Failed to create user profile: ${profileError.message}`);
        }

        // Return success result
        return { 
          success: true,
          message: 'Please check your email to confirm your account.'
        };
      }

      return { success: false };
    } catch (err) {
      console.error('Signup error:', err);
      const errorMessage = (err as Error).message;
      
      // Handle specific error cases
      if (errorMessage.includes('Sign up request timed out')) {
        setError({ message: 'Sign up request took too long. Please try again.' });
      } else if (errorMessage.includes('fetch failed') || errorMessage.includes('network') || errorMessage.includes('ENOTFOUND')) {
        setError({ message: 'Unable to connect to authentication server. Please check your internet connection or contact support.' });
      } else {
        setError({ message: errorMessage });
      }
      
      return { 
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      setLoading(true);

      // First clear the user state
      setUser(null);

      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();

      // Clear all cookies
      document.cookie.split(";").forEach(cookie => {
        document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Small delay to ensure cleanup
      await new Promise(resolve => setTimeout(resolve, 100));

      // Force a hard refresh
      window.location.href = '/';
    } catch (err) {
      console.error('Sign out error:', err);
      setError({ message: (err as Error).message });
      
      // Even if there's an error, ensure we clear everything
      setUser(null);
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(";").forEach(cookie => {
        document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Force refresh even on error
      window.location.href = '/';
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading: loading || !initialized, // Only show loading if not initialized
      error, 
      signIn, 
      signUp, 
      signOut 
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