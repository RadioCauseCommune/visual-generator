import { supabase } from './supabase';

export const authService = {
    async signUp(email: string, pass: string) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password: pass,
        });
        if (error) throw error;
        return data;
    },

    async signIn(email: string, pass: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: pass,
        });
        if (error) throw error;
        return data;
    },

    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    async getCurrentUser() {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    onAuthStateChange(callback: (user: any) => void) {
        return supabase.auth.onAuthStateChange((_event, session) => {
            callback(session?.user ?? null);
        });
    }
};
