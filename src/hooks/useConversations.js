import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useEffect } from "react";

export const useConversations = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        console.warn("Usuário não autenticado, retornando lista vazia");
        return [];
      }

      const { data, error } = await supabase
        .from("conversations")
        .select(
          `
          *,
          user_profile:user_id (id, name, email),
          participant_profile:participant_id (id, name, email),
          messages: messages(
            id,
            content,
            created_at,
            is_read,
            user_id
          )
        `,
        )
        .or(`user_id.eq.${user.id},participant_id.eq.${user.id}`)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 0, // Sempre atualizar
  });

  // Realtime: ouvir novas conversas e atualizações
  useEffect(() => {
    const channel = supabase
      .channel("realtime_conversations")
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT, UPDATE, DELETE
          schema: "public",
          table: "conversations",
        },
        () => {
          // Recarregar lista de conversas quando houver qualquer mudança
          queryClient.invalidateQueries(["conversations"]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        () => {
          // Recarregar conversas quando uma nova mensagem chegar (atualiza preview)
          queryClient.invalidateQueries(["conversations"]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const createConversation = useMutation({
    mutationFn: async ({ name, type, target_user_id, projectId }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("conversations")
        .insert([
          {
            user_id: user.id,
            name: name,
            type: type || "default",
            participant_id: target_user_id || null,
            project_id: projectId || null,
          },
        ])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["conversations"]);
    },
  });

  const deleteConversation = useMutation({
    mutationFn: async (conversationId) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error: msgError } = await supabase
        .from("messages")
        .delete()
        .eq("conversation_id", conversationId);
      if (msgError) throw msgError;

      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", conversationId)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["conversations"]);
    },
  });

  return { conversations: data || [], isLoading, error, createConversation, deleteConversation };
};
