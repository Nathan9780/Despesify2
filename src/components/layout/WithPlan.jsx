// src/components/layout/WithPlan.jsx
import React from "react";
import { Link } from "react-router-dom";

export function WithPlan({ allowedPlans, children, fallbackMessage }) {
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

  if (!isAllowed) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white/80 backdrop-blur-md rounded-xl p-8 max-w-md text-center shadow-lg border border-gray-200">
          <span className="material-symbols-outlined text-6xl text-blue-500 mb-4 block">
            workspace_premium
          </span>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Acesso Restrito
          </h2>
          <p className="text-gray-500 mb-6">
            {fallbackMessage || "Acesse este recurso com o plano Profissional ou Empresarial."}
          </p>
          <Link to="/select-plan" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium inline-block transition">
            Fazer Upgrade
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
