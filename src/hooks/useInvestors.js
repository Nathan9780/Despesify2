import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export const useInvestors = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["investors"],
    queryFn: async () => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return [];
      const { data, error } = await supabase
        .from("investors")
        .select("*")
        .eq("user_id", userId)
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });

  const createInvestor = useMutation({
    mutationFn: async (newInvestor) => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const { data, error } = await supabase
        .from("investors")
        .insert([{ ...newInvestor, user_id: userId }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["investors"]);
      queryClient.invalidateQueries(["dashboard"]);
    },
  });

  const updateInvestor = useMutation({
    mutationFn: async ({ id, ...updates }) => {
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
      queryClient.invalidateQueries(["investors"]);
    },
  });

  const deleteInvestor = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("investors").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["investors"]);
      queryClient.invalidateQueries(["dashboard"]);
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
