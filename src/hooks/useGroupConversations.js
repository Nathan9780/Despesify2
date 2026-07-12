import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export const useGroupConversations = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["group_conversations"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data: memberships, error: mErr } = await supabase
        .from("group_participants")
        .select("group_id")
        .eq("user_id", user.id);
      if (mErr) throw mErr;
      if (!memberships || memberships.length === 0) return [];
      const groupIds = memberships.map(m => m.group_id);
      const { data, error } = await supabase
        .from("group_conversations")
        .select("*, group_participants(*, profiles:user_id(name, email))")
        .in("id", groupIds)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const createGroup = useMutation({
    mutationFn: async ({ name, project_id, participant_ids }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: group, error: gErr } = await supabase
        .from("group_conversations")
        .insert([{ name, project_id, created_by: user.id }])
        .select()
        .single();
      if (gErr) throw gErr;
      const members = [...new Set([...participant_ids, user.id])].map(uid => ({
        group_id: group.id,
        user_id: uid,
      }));
      const { error: pErr } = await supabase
        .from("group_participants")
        .insert(members);
      if (pErr) throw pErr;
      return group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["group_conversations"]);
      queryClient.invalidateQueries(["conversations"]);
    },
  });

  const deleteGroup = useMutation({
    mutationFn: async (groupId) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error: msgError } = await supabase
        .from("messages")
        .delete()
        .eq("conversation_id", groupId);
      if (msgError) throw msgError;

      const { error: partError } = await supabase
        .from("group_participants")
        .delete()
        .eq("group_id", groupId);
      if (partError) throw partError;

      const { error } = await supabase
        .from("group_conversations")
        .delete()
        .eq("id", groupId)
        .eq("created_by", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["group_conversations"]);
    },
  });

  const sendGroupMessage = useMutation({
    mutationFn: async ({ group_id, content }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("messages")
        .insert([{ conversation_id: group_id, user_id: user.id, content, is_read: false }])
        .select()
        .single();
      if (error) throw error;
      await supabase.from("group_conversations").update({ updated_at: new Date().toISOString() }).eq("id", group_id);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(["group_conversations"]),
  });

  return {
    groups: data || [],
    isLoading,
    error,
    createGroup,
    deleteGroup,
    sendGroupMessage,
  };
};
