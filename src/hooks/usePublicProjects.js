import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export const usePublicProjects = () => {
  return useQuery({
    queryKey: ["public-projects"],
    queryFn: async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      // Não precisa de usuário autenticado para ver projetos públicos, mas se quiser excluir os próprios, pegue o id
      const userId = user?.id;
      let query = supabase
        .from("projects")
        .select("*")
        .eq("visibility", "public")
        .order("created_at", { ascending: false });

      if (userId) {
        query = query.neq("user_id", userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });
};
