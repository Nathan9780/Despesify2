import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout() {
  return (
    <div className="bg-background text-on-background font-body text-body antialiased min-h-screen flex">
      <Sidebar />
      <div className="flex-1 ml-[260px] flex flex-col min-h-screen">
        <Topbar />
        <div className="mt-[70px] flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
