import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export const useProjectFiles = (projectId) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["project_files", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data, error } = await supabase
        .from("project_files")
        .select("*")
        .eq("project_id", projectId)
        .order("uploaded_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!projectId,
  });

  const uploadFile = useMutation({
    mutationFn: async ({ projectId, file, fileName }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const filePath = `${user.id}/${projectId}/${Date.now()}_${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from("project-files")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: fileRecord, error: dbError } = await supabase
        .from("project_files")
        .insert([{ project_id: projectId, file_path: filePath, file_name: fileName, user_id: user.id }])
        .select()
        .single();
      if (dbError) throw dbError;
      return fileRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["project_files", projectId]);
    },
  });

  const deleteFile = useMutation({
    mutationFn: async ({ id, filePath }) => {
      await supabase.storage.from("project-files").remove([filePath]);
      const { error } = await supabase.from("project_files").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["project_files", projectId]);
    },
  });

  const getFileUrl = (filePath) => {
    const { data } = supabase.storage.from("project-files").getPublicUrl(filePath);
    return data?.publicUrl;
  };

  return {
    files: data || [],
    isLoading,
    error,
    uploadFile,
    deleteFile,
    getFileUrl,
  };
};
