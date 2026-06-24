// src/hooks/useEmployees.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export const useEmployees = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("user_id", userId)
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const createEmployee = useMutation({
    mutationFn: async (newEmployee) => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const { data, error } = await supabase
        .from("employees")
        .insert([{ ...newEmployee, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["employees"]);
      queryClient.invalidateQueries(["dashboard"]);
    },
  });

  const updateEmployee = useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from("employees")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["employees"]);
      queryClient.invalidateQueries(["dashboard"]);
    },
  });

  const deleteEmployee = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("employees").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["employees"]);
      queryClient.invalidateQueries(["dashboard"]);
    },
  });

  return {
    employees: data || [],
    isLoading,
    error,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  };
};
