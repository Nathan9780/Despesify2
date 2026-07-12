import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export const usePerformanceReviews = (employeeId) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["performance_reviews", employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      const { data, error } = await supabase
        .from("performance_reviews")
        .select("*, reviewer:reviewer_id(name)")
        .eq("employee_id", employeeId)
        .order("date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId,
  });

  const addReview = useMutation({
    mutationFn: async ({ employee_id, rating, comment }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("performance_reviews")
        .insert([{ employee_id, reviewer_id: user.id, rating, comment }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(["performance_reviews", employeeId]),
  });

  return {
    reviews: data || [],
    isLoading,
    error,
    addReview,
  };
};
