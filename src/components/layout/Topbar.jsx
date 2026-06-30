import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Logo } from "./ui/Logo";
import { supabase } from "../../lib/supabase";

export function Topbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: "dashboard" },
    { to: "/projects", label: "Projetos", icon: "folder_open" },
    { to: "/team", label: "Equipe", icon: "group" },
    { to: "/materials", label: "Materiais", icon: "inventory_2" },
    { to: "/investors", label: "Investidores", icon: "payments" },
    { to: "/messages", label: "Mensagens", icon: "chat" },
  ];

  const userName = user?.user_metadata?.full_name || 
                   user?.user_metadata?.name || 
                   user?.email?.split('@')[0] || 
                   "Usuário";

  const userInitial = userName.charAt(0).toUpperCase();

  const notifications = [
    { id: 1, text: "Novo investidor interessado", time: "5 min" },
    { id: 2, text: "Pagamento pendente para João Silva", time: "1 hora" },
    { id: 3, text: "Nova mensagem recebida", time: "3 horas" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 px-6 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md border-b border-outline-variant/30 flex items-center justify-between shadow-sm select-none">
      {/* Esquerda: Logo */}
      <Link to="/dashboard" className="flex items-center gap-2">
        <Logo variant="icon" className="h-8 w-8" />
        <span className="font-bold text-lg hidden sm:inline font-body">
          <span className="text-[#9CA3AF]">espes</span>
          <span className="text-[#4bc9c4]">ify</span>
        </span>
      </Link>

      {/* Centro: Links de Navegação (Desktop) */}
      <nav className="hidden md:flex items-center gap-2 h-full">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:-translate-y-[1px] font-label ${
                isActive
                  ? "text-[#2980B9] bg-[#2980B9]/5 border-b-2 border-[#4bc9c4] shadow-sm font-bold"
                  : "text-[#74777C] hover:text-[#2980B9] hover:bg-[#2980B9]/5"
              }`
            }
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Direita: Ações */}
      <div className="flex items-center gap-4">
        {/* Notificações */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-full hover:bg-primary/5 text-[#1B4F72] hover:text-[#2980B9] transition-all relative"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-[#DC2626] text-white text-[8px] font-bold rounded-full flex items-center justify-center animate-pulse">
              3
            </span>
          </button>

          {/* Painel de Notificações Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-xl shadow-lg border border-outline-variant/30 py-3 z-50 animate-fade-in font-body">
              <div className="px-4 pb-2 border-b border-outline-variant/20 flex justify-between items-center">
                <span className="font-bold text-xs text-gray-800 dark:text-gray-200">Notificações</span>
                <span className="text-[10px] text-blue-600 cursor-pointer hover:underline">Limpar</span>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {notifications.map((notif) => (
                  <div key={notif.id} className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-zinc-800/50 flex gap-2 border-b border-outline-variant/10 last:border-0 cursor-pointer">
                    <span className="material-symbols-outlined text-sm text-blue-500 mt-0.5">info</span>
                    <div>
                      <p className="text-xs text-gray-700 dark:text-gray-300 leading-normal">{notif.text}</p>
                      <span className="text-[9px] text-gray-400 mt-1 block">{notif.time} atrás</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Configurações (Acesso Rápido) */}
        <Link
          to="/settings"
          className="p-2 rounded-full hover:bg-primary/5 text-[#1B4F72] hover:text-[#2980B9] transition-all hidden sm:block"
        >
          <span className="material-symbols-outlined text-[22px]">settings</span>
        </Link>

        {/* Avatar / Dropdown de Usuário */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 p-1 rounded-full hover:bg-primary/5 transition-all outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-[#2980B9]/20 flex items-center justify-center text-[#2980B9] font-bold text-sm border border-[#2980B9]/10 shadow-sm">
              {userInitial}
            </div>
            <span className="hidden sm:inline text-xs font-semibold text-gray-700 dark:text-gray-300">
              {userName}
            </span>
            <span className="material-symbols-outlined text-[18px] text-[#74777C]">expand_more</span>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-xl shadow-lg border border-outline-variant/30 py-2 z-50 animate-fade-in font-label">
              <div className="px-4 py-2 border-b border-outline-variant/20 mb-1">
                <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{userName}</p>
                <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
              </div>
              <Link
                to="/settings"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
              >
                <span className="material-symbols-outlined text-sm">person</span>
                Meu Perfil
              </Link>
              <Link
                to="/settings"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
              >
                <span className="material-symbols-outlined text-sm">settings</span>
                Configurações
              </Link>
              <div className="border-t border-outline-variant/20 my-1"></div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 w-full text-left transition font-semibold"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                Sair da Conta
              </button>
            </div>
          )}
        </div>

        {/* Menu Hambúrguer (Mobile) */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-full hover:bg-primary/5 text-[#1B4F72] hover:text-[#2980B9] transition-all md:hidden outline-none"
        >
          <span className="material-symbols-outlined text-[24px]">
            {isMobileMenuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Menu Overlay Lateral/Mobile */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-16 bg-black/20 backdrop-blur-sm z-40 transition-all md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="absolute top-16 left-0 right-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-outline-variant/30 p-4 flex flex-col gap-2.5 z-50 md:hidden shadow-lg animate-slide-down font-label">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </header>
  );
}
