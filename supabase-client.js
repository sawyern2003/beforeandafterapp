import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from './supabase-config.js';

// Create Supabase client
export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

// Authentication service
export class AuthService {
    constructor() {
        this.user = null;
        this.subscription = null;
        this.setupAuthListener();
    }

    // Set up authentication state listener
    setupAuthListener() {
        this.subscription = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                this.user = session.user;
                this.onUserChange?.(this.user);
            } else if (event === 'SIGNED_OUT') {
                this.user = null;
                this.onUserChange?.(null);
            }
        });
    }

    // Sign up with email and password
    async signUp(email, password) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`
                }
            });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Sign up error:', error);
            return { success: false, error: error.message };
        }
    }

    // Sign in with email and password
    async signIn(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: error.message };
        }
    }

    // Sign out
    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        }
    }

    // Get current user
    async getCurrentUser() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) throw error;
            this.user = user;
            return user;
        } catch (error) {
            console.error('Get user error:', error);
            return null;
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.user;
    }

    // Check if user has pro subscription
    async hasProSubscription() {
        if (!this.user) return false;
        
        try {
            const { data, error } = await supabase
                .from('subscriptions')
                .select('status, current_period_end')
                .eq('user_id', this.user.id)
                .eq('status', 'active')
                .single();

            if (error) throw error;
            
            // Check if subscription is still valid
            if (data && data.current_period_end) {
                const endDate = new Date(data.current_period_end);
                return endDate > new Date();
            }
            
            return false;
        } catch (error) {
            console.error('Check subscription error:', error);
            return false;
        }
    }

    // Cleanup
    destroy() {
        if (this.subscription) {
            this.subscription.data?.unsubscribe();
        }
    }
}

// Create global auth service instance
export const authService = new AuthService(); 