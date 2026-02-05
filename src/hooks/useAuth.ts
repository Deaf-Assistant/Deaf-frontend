'use client'

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// Extended user type with profile data
export interface AuthUser extends Partial<SupabaseUser> {
    id: string;
    email?: string;
    name?: string;
    role?: string;
}

interface UseAuthReturn {
    user: AuthUser | null;
    loading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (email: string, password: string) => Promise<{ user: AuthUser; token?: string }>;
    logout: () => Promise<void>;
    register: (data: { email: string; password: string; name: string; role: string }) => Promise<{ user: AuthUser | null; token?: string }>;
    refreshUser: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    // Fetch user profile from users table
    const fetchUserProfile = useCallback(async (userId: string): Promise<AuthUser | null> => {
        const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }

        return profile;
    }, [supabase]);

    // Get current user with profile
    const getCurrentUser = useCallback(async (): Promise<AuthUser | null> => {
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) return null;

        const profile = await fetchUserProfile(authUser.id);

        return {
            ...authUser,
            ...profile,
        };
    }, [supabase, fetchUserProfile]);

    // Refresh user data
    const refreshUser = useCallback(async () => {
        setLoading(true);
        try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        } catch (error) {
            console.error('Error refreshing user:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, [getCurrentUser]);

    // Initialize auth state
    useEffect(() => {
        refreshUser();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    const profile = await fetchUserProfile(session.user.id);
                    setUser({ ...session.user, ...profile });
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                }
                setLoading(false);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase, refreshUser, fetchUserProfile]);

    // Login function
    const login = useCallback(async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        const profile = await fetchUserProfile(data.user.id);
        const fullUser: AuthUser = { ...data.user, ...profile };

        setUser(fullUser);

        return {
            user: fullUser,
            token: data.session?.access_token,
        };
    }, [supabase, fetchUserProfile]);

    // Logout function
    const logout = useCallback(async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setUser(null);
    }, [supabase]);

    // Register function
    const register = useCallback(async (data: {
        email: string;
        password: string;
        name: string;
        role: string
    }) => {
        const { email, password, name, role } = data;

        // Sign up with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name, role } },
        });

        if (authError) throw authError;

        // Create user profile in users table
        if (authData.user) {
            const { error: profileError } = await supabase.from('users').insert({
                id: authData.user.id,
                email,
                name,
                role,
            });

            if (profileError) {
                console.error('Error creating profile:', profileError);
            }
        }

        return {
            user: authData.user ? { ...authData.user, name, role } : null,
            token: authData.session?.access_token,
        };
    }, [supabase]);

    // Check if user is admin
    const isAdmin = user?.role === 'ADMIN' ||
        user?.role === 'INTERPRETER' ||
        user?.role === 'LECTURER';

    return {
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin,
        login,
        logout,
        register,
        refreshUser,
    };
}

export default useAuth;
