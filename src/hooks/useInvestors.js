import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export const useInvestors = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["investors"],
    queryFn: async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const user = userData?.user;
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

  const createInvestor = useMutation({
    mutationFn: async (newInvestor) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const user = userData?.user;
      if (userError || !user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("investors")
        .insert([{ ...newInvestor, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investors"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const updateInvestor = useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const user = userData?.user;
      if (userError || !user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("investors")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investors"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const deleteInvestor = useMutation({
    mutationFn: async (id) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const user = userData?.user;
      if (userError || !user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("investors")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investors"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  return {
    investors: data || [],
    isLoading,
    error,
    createInvestor,
    updateInvestor,
    deleteInvestor,
  };
};
