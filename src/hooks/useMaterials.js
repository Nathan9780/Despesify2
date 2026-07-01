// src/hooks/useMaterials.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export const useMaterials = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["materials"],
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
        .from("materials")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;

      // Calcular status e totalPrice para cada material
      return (data || []).map((m) => {
        const quantity = m.quantity || 0;
        const minStock = m.minimum_quantity || 0;
        let status = "available";
        if (quantity <= 0) status = "out";
        else if (quantity <= minStock) status = "low";

        return {
          ...m,
          totalPrice: quantity * (m.unit_price || 0),
          status,
        };
      });
    },
    staleTime: 60000,
  });

  // Criar material
  const createMaterial = useMutation({
    mutationFn: async (newMaterial) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("materials")
        .insert([{ ...newMaterial, user_id: user.id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["materials"]);
      queryClient.invalidateQueries(["dashboard"]);
    },
  });

  // Atualizar material
  const updateMaterial = useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from("materials")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["materials"]);
      queryClient.invalidateQueries(["dashboard"]);
    },
  });

  // Excluir material
  const deleteMaterial = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("materials").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["materials"]);
      queryClient.invalidateQueries(["dashboard"]);
    },
  });

  // Adicionar entrada no estoque
  const addStock = useMutation({
    mutationFn: async ({ id, quantity }) => {
      const { data: material } = await supabase
        .from("materials")
        .select("quantity")
        .eq("id", id)
        .single();

      const newQuantity = (material?.quantity || 0) + quantity;
      const { data, error } = await supabase
        .from("materials")
        .update({ quantity: newQuantity })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["materials"]);
      queryClient.invalidateQueries(["dashboard"]);
    },
  });

  // Remover saída do estoque
  const removeStock = useMutation({
    mutationFn: async ({ id, quantity }) => {
      const { data: material } = await supabase
        .from("materials")
        .select("quantity")
        .eq("id", id)
        .single();

      const newQuantity = Math.max((material?.quantity || 0) - quantity, 0);
      const { data, error } = await supabase
        .from("materials")
        .update({ quantity: newQuantity })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["materials"]);
      queryClient.invalidateQueries(["dashboard"]);
    },
  });

  return {
    materials: data || [],
    isLoading,
    error,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    addStock,
    removeStock,
  };
};
