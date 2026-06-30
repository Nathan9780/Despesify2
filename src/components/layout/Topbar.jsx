import { useLocation } from "react-router-dom";
import { Logo } from "./ui/Logo";

export function Topbar() {
  <header className="flex items-center justify-between px-6 py-3 bg-white border-b">
    <Logo className="h-8" />
    {/* Restante do header */}
  </header>;

  const location = useLocation();

  const titleMap = {
    "/dashboard": "Dashboard",
    "/projects": "Meus Projetos",
    "/team": "Equipe",
    "/materials": "Materiais",
    "/investors": "Investidores",
    "/messages": "Mensagens",
    "/settings": "Configurações",
  };

  const title = titleMap[location.pathname] || "Despesify 2";

  return (
    <header className="h-[70px] fixed top-0 right-0 left-[260px] z-10 bg-surface flex justify-between items-center px-lateral_padding w-[calc(100%-260px)] border-b border-outline-variant">
      <div className="flex items-center gap-4">
        <h2 className="font-title text-title text-primary">{title}</h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Q Search..."
            className="pl-10 pr-4 py-2 rounded-full bg-surface-container-lowest border border-outline-variant text-body font-body text-on-surface focus:outline-none focus:border-primary w-64 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container">
            <span className="material-symbols-outlined">help</span>
          </button>
          <button className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container">
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              account_circle
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
