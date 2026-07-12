import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export const useProjectComments = (projectId) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["project_comments", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data, error } = await supabase
        .from("project_comments")
        .select("*, profiles:user_id(name, avatar_url)")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!projectId,
  });

  const addComment = useMutation({
    mutationFn: async ({ project_id, comment }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("project_comments")
        .insert([{ project_id, user_id: user.id, comment }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(["project_comments", projectId]),
  });

  const deleteComment = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("project_comments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries(["project_comments", projectId]),
  });

  return {
    comments: data || [],
    isLoading,
    error,
    addComment,
    deleteComment,
  };
};
