// src/hooks/useMaterials.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export const useMaterials = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["materials"],
    queryFn: async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (userError || !userId) {
        console.warn("Usuário não autenticado, retornando lista vazia");
        return [];
      }
      const { data, error } = await supabase
        .from("materials")
        .select("*")
        .eq("user_id", userId)
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });

  const createMaterial = useMutation({
    mutationFn: async (newMaterial) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (userError || !userId) throw new Error("Usuário não autenticado");
      const { data, error } = await supabase
        .from("materials")
        .insert([{ ...newMaterial, user_id: userId }])
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

  return {
    materials: data || [],
    isLoading,
    error,
    createMaterial,
    updateMaterial,
    deleteMaterial,
  };
};
