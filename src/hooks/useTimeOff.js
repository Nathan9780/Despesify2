import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export const useTimeOff = (employeeId) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["time_off", employeeId],
    queryFn: async () => {
      let query = supabase.from("time_off").select("*, employees!inner(name)");
      if (employeeId) {
        query = query.eq("employee_id", employeeId);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];
        const { data: emps } = await supabase.from("employees").select("id").eq("user_id", user.id);
        if (!emps || emps.length === 0) return [];
        query = query.in("employee_id", emps.map(e => e.id));
      }
      const { data, error } = await query.order("start_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const addTimeOff = useMutation({
    mutationFn: async ({ employee_id, start_date, end_date, type }) => {
      const { data, error } = await supabase
        .from("time_off")
        .insert([{ employee_id, start_date, end_date, type }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(["time_off"]),
  });

  const deleteTimeOff = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("time_off").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries(["time_off"]),
  });

  return {
    timeOffs: data || [],
    isLoading,
    error,
    addTimeOff,
    deleteTimeOff,
  };
};
