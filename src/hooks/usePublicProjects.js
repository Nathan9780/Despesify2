import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export const usePublicProjects = () => {
  return useQuery({
    queryKey: ["public-projects"],
    queryFn: async () => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const { data, error } = await supabase
        .from("projects")
        .select("*, investors:investments(count)")
        .eq("visibility", "public")
        .neq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};
