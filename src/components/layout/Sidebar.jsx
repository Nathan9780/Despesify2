import { Link, useLocation } from 'react-router-dom';

export function Sidebar() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: 'dashboard' },
    { name: 'Meus Projetos', path: '/projects', icon: 'folder_shared' },
    { name: 'Equipe', path: '/team', icon: 'group' },
    { name: 'Materiais', path: '/materials', icon: 'inventory_2' },
    { name: 'Investidores', path: '/investors', icon: 'payments' },
    { name: 'Mensagens', path: '/messages', icon: 'chat' },
  ];

  return (
    <nav className="w-[260px] h-screen fixed left-0 top-0 bg-secondary shadow-sm flex flex-col py-4 z-20">
      <div className="px-lateral_padding mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-title text-title">D</div>
        <div>
          <h1 className="font-title text-title text-on-secondary text-lg">Despesify 2</h1>
          <p className="font-label text-label text-on-secondary opacity-70">Financial PM</p>
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={isActive 
                ? "bg-secondary-container text-on-secondary-container rounded-lg mx-2 px-4 py-2 flex items-center gap-3 font-label text-label scale-[0.98] transition-transform duration-200"
                : "text-on-secondary opacity-80 hover:opacity-100 hover:bg-secondary-container/50 transition-colors mx-2 px-4 py-2 flex items-center gap-3 rounded-lg font-label text-label"}
            >
              <span className="material-symbols-outlined text-[20px]" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </div>
      <div className="mt-auto pt-4 border-t border-outline/20 flex flex-col gap-1">
        <Link
          to="/settings"
          className={location.pathname.startsWith('/settings')
            ? "bg-secondary-container text-on-secondary-container rounded-lg mx-2 px-4 py-2 flex items-center gap-3 font-label text-label scale-[0.98] transition-transform duration-200"
            : "text-on-secondary opacity-80 hover:opacity-100 hover:bg-secondary-container/50 transition-colors mx-2 px-4 py-2 flex items-center gap-3 rounded-lg font-label text-label"}
        >
          <span className="material-symbols-outlined text-[20px]" style={location.pathname.startsWith('/settings') ? { fontVariationSettings: "'FILL' 1" } : {}}>settings</span>
          Configurações
        </Link>
      </div>
    </nav>
  );
}
