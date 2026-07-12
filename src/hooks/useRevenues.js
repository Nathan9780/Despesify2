import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export const useRevenues = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["revenues"],
    queryFn: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return [];
      const { data, error } = await supabase
        .from("revenues")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: 0,
  });

  const createRevenue = useMutation({
    mutationFn: async (payload) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");
      const { data, error } = await supabase
        .from("revenues")
        .insert([{ ...payload, user_id: user.id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(["revenues"]),
  });

  const updateRevenue = useMutation({
    mutationFn: async ({ id, ...payload }) => {
      const { data, error } = await supabase
        .from("revenues")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(["revenues"]),
  });

  const deleteRevenue = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("revenues").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries(["revenues"]),
  });

  return {
    revenues: data || [],
    isLoading,
    error,
    createRevenue,
    updateRevenue,
    deleteRevenue,
  };
};
