import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "./ui/Logo";

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const currentUserStr = localStorage.getItem("currentUser");
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

  const planNames = {
    citizen: {
      name: "Plano Pessoal",
      icon: "home",
      badge: "bg-primary-container text-on-primary-container",
    },
    enterprise: {
      name: "Plano Empresarial",
      icon: "business",
      badge: "bg-secondary-container text-on-secondary-container",
    },
    investor: {
      name: "Plano Investidor",
      icon: "payments",
      badge: "bg-tertiary-fixed text-on-tertiary-fixed",
    },
  };

  const planInfo = currentUser?.plan
    ? planNames[currentUser.plan]
    : {
        name: "Sem Plano",
        icon: "person",
        badge: "bg-surface-variant text-on-surface-variant",
      };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "dashboard" },
    { name: "Meus Projetos", path: "/projects", icon: "folder_shared" },
    { name: "Equipe", path: "/team", icon: "group" },
    { name: "Materiais", path: "/materials", icon: "inventory_2" },
    { name: "Investidores", path: "/investors", icon: "payments" },
    { name: "Mensagens", path: "/messages", icon: "chat" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  return (
    <nav className="w-[260px] h-screen fixed left-0 top-0 bg-secondary shadow-sm flex flex-col py-4 z-20">
      {/* Brand logo & active user profile */}
      <div className="px-lateral_padding mb-6 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Logo variant="icon" className="w-16 h-16 shadow-sm" imgClassName="w-16 h-16" />
          <div>
            <h1 className="font-title text-title text-on-secondary text-xl leading-tight">
              Despesify 2
            </h1>
            <p className="font-label text-[10px] text-on-secondary opacity-70">
              Unified Management
            </p>
          </div>
        </div>

        {/* User Card */}
        {currentUser && (
          <div className="mt-3 p-3 bg-surface-container/10 border border-white/10 rounded-xl flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-on-secondary opacity-80">
                account_circle
              </span>
              <span className="font-label text-xs text-on-secondary font-bold truncate max-w-[160px]">
                {currentUser.name}
              </span>
            </div>
            <div
              className={`px-2 py-0.5 rounded text-[9px] font-label font-bold flex items-center gap-1.5 w-fit ${planInfo.badge}`}
            >
              <span className="material-symbols-outlined text-[12px]">
                {planInfo.icon}
              </span>
              {planInfo.name}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={
                isActive
                  ? "bg-secondary-container text-on-secondary-container rounded-lg mx-2 px-4 py-2 flex items-center gap-3 font-label text-label scale-[0.98] transition-transform duration-200"
                  : "text-on-secondary opacity-80 hover:opacity-100 hover:bg-secondary-container/50 transition-colors mx-2 px-4 py-2 flex items-center gap-3 rounded-lg font-label text-label"
              }
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Sidebar Footer Actions */}
      <div className="mt-auto pt-4 border-t border-white/10 flex flex-col gap-1">
        <Link
          to="/settings"
          className={
            location.pathname.startsWith("/settings")
              ? "bg-secondary-container text-on-secondary-container rounded-lg mx-2 px-4 py-2 flex items-center gap-3 font-label text-label scale-[0.98] transition-transform duration-200"
              : "text-on-secondary opacity-80 hover:opacity-100 hover:bg-secondary-container/50 transition-colors mx-2 px-4 py-2 flex items-center gap-3 rounded-lg font-label text-label"
          }
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={
              location.pathname.startsWith("/settings")
                ? { fontVariationSettings: "'FILL' 1" }
                : {}
            }
          >
            settings
          </span>
          Configurações
        </Link>
        <button
          onClick={handleLogout}
          className="text-error-container hover:text-white hover:bg-error/20 transition-colors mx-2 px-4 py-2 flex items-center gap-3 rounded-lg font-label text-label text-left w-[calc(100%-16px)] cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Sair da Conta
        </button>
      </div>
    </nav>
  );
}
