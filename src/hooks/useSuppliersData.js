import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export const useSuppliersData = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .eq("user_id", user.id)
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });

  const createSupplier = useMutation({
    mutationFn: async (payload) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("suppliers")
        .insert([{ ...payload, user_id: user.id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(["suppliers"]),
  });

  const updateSupplier = useMutation({
    mutationFn: async ({ id, ...payload }) => {
      const { data, error } = await supabase
        .from("suppliers")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(["suppliers"]),
  });

  const deleteSupplier = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("suppliers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries(["suppliers"]),
  });

  return {
    suppliers: data || [],
    isLoading,
    error,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  };
};

export const useSupplierPurchases = (supplierId) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["supplier_purchases", supplierId],
    queryFn: async () => {
      if (!supplierId) return [];
      const { data, error } = await supabase
        .from("purchases")
        .select("*, materials(name)")
        .eq("supplier_id", supplierId)
        .order("date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!supplierId,
  });
  return { purchases: data || [], isLoading, error };
};
