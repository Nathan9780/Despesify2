import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export function useNotifications() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) return [];

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Notifications error:", error);
        return []; // Fallback to empty if table doesn't exist or fails
      }
      return data;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("realtime_notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        async (payload) => {
          const { data: { user } } = await supabase.auth.getUser();
          if (payload.new.user_id === user?.id) {
            queryClient.setQueryData(["notifications"], (old) => {
              if (!old) return [payload.new];
              return [payload.new, ...old];
            });
          }
        }
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [queryClient]);

  const markAsRead = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const clearAll = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) return;
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const unreadCount = (data || []).filter(n => !n.is_read).length;

  return {
    notifications: data || [],
    unreadCount,
    isLoading,
    error,
    markAsRead,
    clearAll,
  };
}
