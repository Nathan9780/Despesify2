// src/components/ui/ThemeToggle.jsx
import React from "react";
import { useTheme } from "../../contexts/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-primary/5 text-[#1B4F72] hover:text-[#2980B9] transition-all"
      aria-label="Alternar tema"
      title={theme === "light" ? "Ativar modo escuro" : "Ativar modo claro"}
    >
      {theme === "light" ? (
        <span className="material-symbols-outlined text-[22px]">dark_mode</span>
      ) : (
        <span className="material-symbols-outlined text-[22px]">
          light_mode
        </span>
      )}
    </button>
  );
}
