// src/hooks/useAuth.js
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Pega a sessão atual
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);
            setLoading(false);
        };

        getSession();

        // Escuta mudanças de autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Login com email/senha
    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { data, error };
    };

    // Login com Google
    const signInWithGoogle = async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: window.location.origin + "/dashboard",
            },
        });
        return { data, error };
    };

    // Cadastro
    const signUp = async (email, password, metadata) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: metadata },
        });
        return { data, error };
    };

    // Logout
    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        return { error };
    };

    return {
        user,
        loading,
        signIn,
        signInWithGoogle,
        signUp,
        signOut,
    };
}