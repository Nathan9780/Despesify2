import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export const useBudgets = (month, year) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["budgets", month, year],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user.id)
        .eq("month", month)
        .eq("year", year);
      if (error) throw error;
      return data || [];
    },
    enabled: !!month && !!year,
  });

  const setBudget = useMutation({
    mutationFn: async ({ category, limit_amount }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: existing } = await supabase
        .from("budgets")
        .select("id")
        .eq("user_id", user.id)
        .eq("category", category)
        .eq("month", month)
        .eq("year", year)
        .maybeSingle();
      if (existing) {
        const { data, error } = await supabase
          .from("budgets")
          .update({ limit_amount })
          .eq("id", existing.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("budgets")
          .insert([{ user_id: user.id, category, month, year, limit_amount }])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => queryClient.invalidateQueries(["budgets", month, year]),
  });

  return {
    budgets: data || [],
    isLoading,
    error,
    setBudget,
  };
};
