import React from "react";

export function Logo({
  className = "h-12 w-auto",
  variant = "full",
  imgClassName = "h-12 w-auto",
}) {
  // Ícone apenas (imagem)
  if (variant === "icon") {
    return (
      <img
        src="/logo.png"
        alt="Despesify"
        className={imgClassName || className}
      />
    );
  }

  // Versão completa (imagem + texto)
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src="/logo.png"
        alt="Despesify"
        className={imgClassName || "h-12 w-auto"}
      />
      <span className="font-bold text-2xl tracking-tight">
        <span className="text-gray-300">espes</span>
        <span className="text-[#4bc9c4]">ify</span>
      </span>
    </div>
  );
}
