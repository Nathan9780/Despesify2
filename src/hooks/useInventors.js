// src/hooks/useInvestors.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export const useInvestors = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["investors"],
    queryFn: async () => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const { data, error } = await supabase
        .from("investors")
        .select("*, investments(amount)")
        .eq("user_id", userId)
        .order("name");

      if (error) throw error;
      return data;
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

  // Propostas
  const { data: proposals, isLoading: proposalsLoading } = useQuery({
    queryKey: ["proposals"],
    queryFn: async () => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const { data, error } = await supabase
        .from("proposals")
        .select("*, investors(name)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const updateProposalStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      const { data, error } = await supabase
        .from("proposals")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["proposals"]);
      queryClient.invalidateQueries(["dashboard"]);
    },
  });

  return {
    investors: data || [],
    isLoading,
    error,
    createInvestor,
    proposals: proposals || [],
    proposalsLoading,
    updateProposalStatus,
  };
};
