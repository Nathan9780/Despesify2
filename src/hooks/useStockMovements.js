import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export const useStockMovements = (materialId) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["stock_movements", materialId],
    queryFn: async () => {
      if (!materialId) return [];
      const { data, error } = await supabase
        .from("stock_movements")
        .select("*, profiles:user_id(name)")
        .eq("material_id", materialId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!materialId,
  });

  const recordMovement = useMutation({
    mutationFn: async ({ material_id, quantity_change, type, notes }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("stock_movements")
        .insert([{ material_id, quantity_change, type, user_id: user.id, notes }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["stock_movements", materialId]);
      queryClient.invalidateQueries(["materials"]);
    },
  });

  return {
    movements: data || [],
    isLoading,
    error,
    recordMovement,
  };
};
