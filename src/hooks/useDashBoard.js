// src/hooks/useDashboard.js
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

// Buscar todos os dados de uma vez (ou em paralelo)
export const useDashboard = () => {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const userId = (await supabase.auth.getUser()).data.user?.id;

      // Executar consultas em paralelo
      const [
        { count: totalProjects },
        { data: finances },
        { count: activeEmployees },
        { data: materials },
        { data: investments },
        { data: unreadMessages },
      ] = await Promise.all([
        supabase
          .from("projects")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId),
        supabase.from("projects").select("budget, spent").eq("user_id", userId),
        supabase
          .from("employees")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("status", "active"),
        supabase
          .from("materials")
          .select("id, quantity, unit_price")
          .eq("user_id", userId),
        supabase.from("investments").select("amount").eq("user_id", userId),
        supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("is_read", false),
      ]);

      // Calcular financeiro
      const totalBudget = finances.reduce((sum, p) => sum + p.budget, 0);
      const totalSpent = finances.reduce((sum, p) => sum + p.spent, 0);
      const available = totalBudget - totalSpent;

      // Calcular estoque
      const stockValue = materials.reduce(
        (sum, m) => sum + m.quantity * m.unit_price,
        0,
      );

      return {
        projects: { total: totalProjects || 0 },
        finances: { totalBudget, totalSpent, available },
        employees: { active: activeEmployees || 0 },
        materials: { stockValue },
        investments: {
          totalRaised: investments.reduce((s, i) => s + i.amount, 0),
        },
        messages: { unread: unreadMessages || 0 },
      };
    },
  });
};
