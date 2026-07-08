// src/components/layout/WithPlan.jsx
import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export function WithPlan({ allowedPlans, children, fallbackMessage }) {
  const navigate = useNavigate();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const currentUserStr = localStorage.getItem("currentUser");
  let plan = "citizen"; // default fallback

  if (currentUserStr) {
    try {
      const user = JSON.parse(currentUserStr);
      plan = (user.plan || "citizen").toLowerCase();
    } catch (e) {
      console.error(e);
    }
  }

  // Verifica rigorosamente os planos permitidos
  const isAllowed = allowedPlans.map(p => p.toLowerCase()).includes(plan);

  useEffect(() => {
    if (!isAllowed) {
      const plansList = allowedPlans.join(" ou ");
      Swal.fire({
        icon: "warning",
        title: "Acesso Restrito",
        text: fallbackMessage || `Plano restrito, mude para um superior. Você precisa do plano ${plansList} para acessar este recurso.`,
        confirmButtonText: "Fazer Upgrade",
        cancelButtonText: "Voltar",
        showCancelButton: true,
        buttonsStyling: false,
        customClass: {
          popup: 'rounded-2xl shadow-2xl border border-gray-100 font-sans bg-white dark:bg-[#1A2438] dark:border-[#374151]',
          title: 'text-2xl font-bold text-gray-800 dark:text-white',
          htmlContainer: 'text-gray-500 dark:text-gray-300 mt-2',
          actions: 'flex gap-3 w-full justify-center mt-6',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors w-full sm:w-auto',
          cancelButton: 'bg-gray-100 dark:bg-[#0F1829] hover:bg-gray-200 dark:hover:bg-[#1A2438] text-gray-700 dark:text-gray-300 px-6 py-2.5 rounded-xl font-medium transition-colors w-full sm:w-auto'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/select-plan");
        } else {
          setShouldRedirect(true);
        }
      });
    }
  }, [isAllowed, allowedPlans, fallbackMessage, navigate]);

  if (!isAllowed) {
    if (shouldRedirect) {
      return <Navigate to="/dashboard" replace />;
    }
    // Mostra um fundo vazio enquanto o alerta está na tela
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
