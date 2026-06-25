import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export const useInvestors = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["investors"],
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
        .from("investors")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  // ... resto do CRUD (createInvestor, updateInvestor, deleteInvestor) com a mesma verificação
  // Certifique-se de que cada mutation também verifica o usuário

  return { investors: data || [], isLoading, error };
};
