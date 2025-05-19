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

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
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
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('is_admin, avatar_url, name')
              .eq('id', session.user.id)
              .single();

            if (profileError) {
              console.error('Error fetching profile:', profileError);
              // Continue with sign in even if profile fetch fails
            }

            setUser({
              id: session.user.id,
              email: session.user.email!,
              name: profile?.name || session.user.user_metadata.name,
              created_at: session.user.created_at,
              is_admin: profile?.is_admin || false,
              avatar_url: profile?.avatar_url,
            });
          } catch (err) {
            console.error('Error setting up user:', err);
            // Don't set error here, just log it
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

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      try {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setError(null);
          // Clear any sensitive data
          localStorage.removeItem('supabase.auth.token');
        } else if (session?.user) {
          // Fetch fresh profile data on auth state change
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin, avatar_url, name')
            .eq('id', session.user.id)
            .single();

          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: profile?.name || session.user.user_metadata.name,
            created_at: session.user.created_at,
            is_admin: profile?.is_admin || false,
            avatar_url: profile?.avatar_url,
          });
          setError(null);
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        // Don't set error here to prevent UI disruption
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
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

      // First clear the user state to prevent any race conditions
      setUser(null);

      // Clear all local storage items that might contain session data
      localStorage.clear(); // Clear all local storage instead of just one item
      sessionStorage.clear(); // Also clear session storage

      // Sign out from Supabase and wait for it to complete
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Small delay to ensure all cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Clear any cookies that might contain session data
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });

      // Use replace instead of push to prevent back navigation
      router.replace('/');

      // Force a hard refresh after a small delay to ensure all cleanup is done
      setTimeout(() => {
        // Clear any remaining session data
        window.location.replace('/');
      }, 100);

    } catch (err) {
      console.error('Sign out error:', err);
      setError({ message: (err as Error).message });
      
      // Even if there's an error, ensure we clear everything
      setUser(null);
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });

      router.replace('/');
      
      // Force refresh even on error
      setTimeout(() => {
        window.location.replace('/');
      }, 100);
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