import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export const useTimeEntries = (taskId) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["time_entries", taskId],
    queryFn: async () => {
      if (!taskId) return [];
      const { data, error } = await supabase
        .from("time_entries")
        .select("*")
        .eq("task_id", taskId)
        .order("start_time", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!taskId,
  });

  const startTimer = useMutation({
    mutationFn: async ({ task_id }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("time_entries")
        .insert([{ task_id, user_id: user.id, start_time: new Date().toISOString() }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(["time_entries", taskId]),
  });

  const stopTimer = useMutation({
    mutationFn: async (id) => {
      const endTime = new Date().toISOString();
      const { data: entry } = await supabase
        .from("time_entries")
        .select("start_time")
        .eq("id", id)
        .single();
      const startTime = new Date(entry.start_time);
      const duration = Math.round((new Date() - startTime) / 1000);
      const { data, error } = await supabase
        .from("time_entries")
        .update({ end_time: endTime, duration })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(["time_entries", taskId]),
  });

  const totalDuration = (data || []).reduce((sum, e) => sum + (e.duration || 0), 0);

  return {
    entries: data || [],
    isLoading,
    error,
    startTimer,
    stopTimer,
    totalDuration,
  };
};
