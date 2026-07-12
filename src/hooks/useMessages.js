import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useEffect } from "react";

export const useMessages = (conversationId) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!conversationId,
    staleTime: 0, // Sempre buscar dados frescos
  });

  // Inscrever para atualizações em tempo real (canal único)
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`realtime_messages_${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          queryClient.setQueryData(["messages", conversationId], (old) => {
            if (!old) return [payload.new];
            // Prevenir duplicatas
            const isDuplicate = old.some((msg) => msg.id === payload.new.id);
            if (isDuplicate) return old;
            return [...old, payload.new];
          });
          // Atualizar lista de conversas para mostrar última mensagem
          queryClient.invalidateQueries(["conversations"]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  // Enviar mensagem
  const sendMessage = useMutation({
    mutationFn: async ({ conversationId, content }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("messages")
        .insert([
          {
            conversation_id: conversationId,
            user_id: user.id,
            content,
            is_read: false,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Atualizar a conversa com a última mensagem
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);

      return data;
    },
    onSuccess: (newMessage) => {
      // Adicionar a mensagem ao cache local imediatamente (otimista)
      // O realtime também vai receber, mas o check de duplicata evita dupla exibição
      queryClient.setQueryData(["messages", conversationId], (old) => {
        if (!old) return [newMessage];
        const isDuplicate = old.some((msg) => msg.id === newMessage.id);
        if (isDuplicate) return old;
        return [...old, newMessage];
      });
      // Invalidar lista de conversas para atualizar a última mensagem
      queryClient.invalidateQueries(["conversations"]);
    },
  });

  return {
    messages: data || [],
    isLoading,
    error,
    sendMessage,
  };
};
