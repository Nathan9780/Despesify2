// src/hooks/useDashboard.js
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export const useDashboard = () => {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      // Se não houver usuário logado, retorna dados vazios
      if (userError || !userId) {
        return {
          projects: { total: 0 },
          finances: { totalBudget: 0, totalSpent: 0, available: 0 },
          employees: { active: 0 },
          materials: { stockValue: 0 },
          investments: { totalRaised: 0 },
          messages: { unread: 0 },
        };
      }

      // Executar consultas em paralelo com tratamento de erro individual
      const [
        projectsResult,
        financesResult,
        employeesResult,
        materialsResult,
        investmentsResult,
        messagesResult,
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

      // Extrair dados de forma segura (garantir que sejam arrays)
      const financesData = financesResult.data ?? []; // ← FIX: se for null, vira array vazio
      const materialsData = materialsResult.data ?? [];
      const investmentsData = investmentsResult.data ?? [];

      // Calcular financeiro
      const totalBudget = financesData.reduce(
        (sum, p) => sum + (p.budget || 0),
        0,
      );
      const totalSpent = financesData.reduce(
        (sum, p) => sum + (p.spent || 0),
        0,
      );
      const available = totalBudget - totalSpent;

      // Calcular estoque
      const stockValue = materialsData.reduce(
        (sum, m) => sum + (m.quantity || 0) * (m.unit_price || 0),
        0,
      );

      // Total captado
      const totalRaised = investmentsData.reduce(
        (s, i) => s + (i.amount || 0),
        0,
      );

      return {
        projects: { total: projectsResult.count || 0 },
        finances: { totalBudget, totalSpent, available },
        employees: { active: employeesResult.count || 0 },
        materials: { stockValue },
        investments: { totalRaised },
        messages: { unread: messagesResult.count || 0 },
      };
    },
  });
};
