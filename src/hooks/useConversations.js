import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

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
          messages: messages(
            id,
            content,
            created_at,
            is_read,
            user_id
          )
        `,
        )
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const createConversation = useMutation({
    mutationFn: async ({ name, type, participantId, projectId }) => {
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
            participant_id: participantId || null,
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

  return { conversations: data || [], isLoading, error, createConversation };
};
