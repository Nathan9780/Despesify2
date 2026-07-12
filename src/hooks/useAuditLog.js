import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export const useAuditLog = () => {
  return useQuery({
    queryKey: ["audit_log"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("audit_log")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
  });
};

export const logAction = async (action, details) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("audit_log").insert([{ user_id: user.id, action, details }]);
};
