import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useEffect } from "react";

export const useExpenses = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) return [];

      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 0,
  });

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel("realtime_expenses")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expenses" },
        () => queryClient.invalidateQueries(["expenses"])
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [queryClient]);

  // Criar despesa
  const createExpense = useMutation({
    mutationFn: async (payload) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("expenses")
        .insert([{ ...payload, user_id: user.id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(["expenses"]),
  });

  // Atualizar despesa
  const updateExpense = useMutation({
    mutationFn: async ({ id, ...payload }) => {
      const { data, error } = await supabase
        .from("expenses")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(["expenses"]),
  });

  // Deletar despesa
  const deleteExpense = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries(["expenses"]),
  });

  return {
    expenses: data || [],
    isLoading,
    error,
    createExpense,
    updateExpense,
    deleteExpense,
  };
};
