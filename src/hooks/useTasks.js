// src/hooks/useTasks.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export const useTasks = () => {
  const queryClient = useQueryClient();

  // Fetch tasks - busca sem join com employees até a migration ser aplicada
  const { data, isLoading, error } = useQuery({
    queryKey: ["tasks"],
    staleTime: 3 * 60 * 1000,
    queryFn: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return [];
      }

      const { data, error } = await supabase
        .from("tasks")
        .select("id, user_id, project_id, employee_id, priority, name, description, status, due_date, created_at, tags, position, completed_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Busca employees separadamente para não depender do join
  const { data: employeesData } = useQuery({
    queryKey: ["employees"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("employees")
        .select("id, name, role")
        .eq("user_id", user.id);
      if (error) return [];
      return data || [];
    },
  });

  // Enriquecer tasks com dados de employee do lado do cliente (sem join)
  const tasks = (data || []).map(task => {
    if (task.employee_id && employeesData) {
      const emp = employeesData.find(e => e.id === task.employee_id);
      return { ...task, employees: emp || null };
    }
    return { ...task, employees: null };
  });

  // Create Task - envia employee_id apenas se a coluna existir
  const createTask = useMutation({
    mutationFn: async (newTask) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Payload sem employee_id por padrão (até migration ser aplicada)
      const payload = {
        user_id: user.id,
        name: newTask.name,
        description: newTask.description || null,
        status: newTask.status || "pending",
        due_date: newTask.due_date || null,
        priority: newTask.priority || "medium",
        tags: newTask.tags || [],
        position: newTask.position || 0,
        completed_at: newTask.status === "completed" ? new Date().toISOString() : null,
      };

      if (newTask.employee_id) {
        payload.employee_id = newTask.employee_id;
      }

      const { data, error } = await supabase
        .from("tasks")
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Update Task
  const updateTask = useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Delete Task
  const deleteTask = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  return {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
  };
};
