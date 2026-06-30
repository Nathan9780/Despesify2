// src/hooks/useEmployees.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export const useEmployees = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.warn("Usuário não autenticado, retornando lista vazia");
        return [];
      }

      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  // Criar funcionário
  const createEmployee = useMutation({
    mutationFn: async (newEmployee) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("employees")
        .insert([{ ...newEmployee, user_id: user.id }])
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

  // Atualizar funcionário
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

  // Pagar funcionário (atualiza status e datas de pagamento)
  const payEmployee = useMutation({
    mutationFn: async ({ id, lastPayment, nextPayment }) => {
      const { data, error } = await supabase
        .from("employees")
        .update({
          status: "paid",
          last_payment: lastPayment || new Date().toISOString(),
          next_payment: nextPayment || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
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

  // Excluir funcionário
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
    payEmployee,
    deleteEmployee,
  };
};