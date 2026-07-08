// src/hooks/useInvitations.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

/**
 * Hook para gerenciar o sistema de solicitações entre Empresa e Investidor.
 * 
 * Requer migration SQL no Supabase:
 * CREATE TABLE IF NOT EXISTS invitations (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 *   receiver_email TEXT NOT NULL,
 *   status TEXT DEFAULT 'pending', -- pending | accepted | rejected
 *   sender_role TEXT NOT NULL, -- 'enterprise' | 'investor'
 *   message TEXT,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Ver convites" ON invitations FOR SELECT USING (
 *   auth.uid() = sender_id OR
 *   receiver_email = (SELECT email FROM auth.users WHERE id = auth.uid())
 * );
 * CREATE POLICY "Criar convites" ON invitations FOR INSERT WITH CHECK (auth.uid() = sender_id);
 * CREATE POLICY "Atualizar convites" ON invitations FOR UPDATE USING (
 *   auth.uid() = sender_id OR
 *   receiver_email = (SELECT email FROM auth.users WHERE id = auth.uid())
 * );
 */

const TABLE = "invitations";

export const useInvitations = () => {
  const queryClient = useQueryClient();

  // Buscar convites recebidos (pelo e-mail do usuário logado)
  const {
    data: receivedInvitations,
    isLoading: isLoadingReceived,
    error: receivedError,
  } = useQuery({
    queryKey: [TABLE, "received"],
    staleTime: 60 * 1000,
    queryFn: async () => {
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user?.email) return [];

      const { data, error } = await supabase
        .from(TABLE)
        .select("*")
        .eq("receiver_email", user.email)
        .order("created_at", { ascending: false });

      if (error) {
        // Tabela ainda não criada no Supabase — retorna vazio silenciosamente
        if (error.code === "42P01") return [];
        throw error;
      }
      return data || [];
    },
  });

  // Buscar convites enviados (pelo sender_id do usuário logado)
  const {
    data: sentInvitations,
    isLoading: isLoadingSent,
    error: sentError,
  } = useQuery({
    queryKey: [TABLE, "sent"],
    staleTime: 60 * 1000,
    queryFn: async () => {
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) return [];

      const { data, error } = await supabase
        .from(TABLE)
        .select("*")
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        if (error.code === "42P01") return [];
        throw error;
      }
      return data || [];
    },
  });

  /**
   * Enviar solicitação para outro usuário
   * @param {object} payload - { receiver_email, message?, sender_role }
   */
  const sendInvitation = useMutation({
    mutationFn: async ({ receiver_email, message, sender_role }) => {
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) throw new Error("Usuário não autenticado");

      // Impede enviar para si mesmo
      if (user.email === receiver_email) {
        throw new Error("Você não pode enviar uma solicitação para si mesmo.");
      }

      // Verifica solicitação duplicada pendente
      const { data: existing } = await supabase
        .from(TABLE)
        .select("id, status")
        .eq("sender_id", user.id)
        .eq("receiver_email", receiver_email)
        .eq("status", "pending")
        .maybeSingle();

      if (existing) {
        throw new Error("Você já possui uma solicitação pendente para este usuário.");
      }

      const { data, error } = await supabase
        .from(TABLE)
        .insert([{
          sender_id: user.id,
          receiver_email,
          message: message || null,
          sender_role: sender_role || "enterprise",
          status: "pending",
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TABLE] });
    },
  });

  /**
   * Aceitar ou recusar uma solicitação
   * @param {object} params - { id, status: 'accepted' | 'rejected' }
   */
  const respondInvitation = useMutation({
    mutationFn: async ({ id, status }) => {
      if (!["accepted", "rejected"].includes(status)) {
        throw new Error("Status inválido. Use 'accepted' ou 'rejected'.");
      }

      const { data, error } = await supabase
        .from(TABLE)
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [TABLE] });
      // Se aceito, atualiza lista de investidores
      if (data?.status === "accepted") {
        queryClient.invalidateQueries({ queryKey: ["investors"] });
      }
    },
  });

  const isLoading = isLoadingReceived || isLoadingSent;
  const error = receivedError || sentError;

  return {
    receivedInvitations: receivedInvitations || [],
    sentInvitations: sentInvitations || [],
    isLoading,
    error,
    sendInvitation,
    respondInvitation,
  };
};
