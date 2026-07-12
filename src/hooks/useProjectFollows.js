import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export const useProjectFollows = (projectId) => {
  const queryClient = useQueryClient();

  const { data: follows } = useQuery({
    queryKey: ["project_follows", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_follows")
        .select("user_id")
        .eq("project_id", projectId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!projectId,
  });

  const { data: isFollowing } = useQuery({
    queryKey: ["is_following", projectId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      const { data, error } = await supabase
        .from("project_follows")
        .select("id")
        .eq("project_id", projectId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) return false;
      return !!data;
    },
    enabled: !!projectId,
  });

  const toggleFollow = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: existing } = await supabase
        .from("project_follows")
        .select("id")
        .eq("project_id", projectId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (existing) {
        await supabase.from("project_follows").delete().eq("id", existing.id);
        return false;
      } else {
        await supabase.from("project_follows").insert([{ project_id: projectId, user_id: user.id }]);
        return true;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["project_follows", projectId]);
      queryClient.invalidateQueries(["is_following", projectId]);
    },
  });

  return { follows: follows || [], isFollowing: isFollowing || false, toggleFollow };
};
