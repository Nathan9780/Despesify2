import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export const useSubtasks = (taskId) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["subtasks", taskId],
    queryFn: async () => {
      if (!taskId) return [];
      const { data, error } = await supabase
        .from("subtasks")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!taskId,
  });

  const createSubtask = useMutation({
    mutationFn: async ({ task_id, description }) => {
      const { data, error } = await supabase
        .from("subtasks")
        .insert([{ task_id, description, completed: false }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(["subtasks", taskId]),
  });

  const toggleSubtask = useMutation({
    mutationFn: async ({ id, completed }) => {
      const { data, error } = await supabase
        .from("subtasks")
        .update({ completed })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(["subtasks", taskId]),
  });

  const deleteSubtask = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("subtasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries(["subtasks", taskId]),
  });

  return {
    subtasks: data || [],
    isLoading,
    error,
    createSubtask,
    toggleSubtask,
    deleteSubtask,
  };
};
