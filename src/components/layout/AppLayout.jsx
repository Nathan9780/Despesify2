import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout() {
  const currentUserStr = localStorage.getItem('currentUser');

  if (!currentUserStr) {
    return <Navigate to="/login" replace />;
  }

  let currentUser;
  try {
    currentUser = JSON.parse(currentUserStr);
  } catch (e) {
    console.error('Failed to parse currentUser from localStorage', e);
    // Remove corrupted data and redirect to login
    localStorage.removeItem('currentUser');
    return <Navigate to="/login" replace />;
  }

  if (!currentUser.plan) {
    return <Navigate to="/select-plan" replace />;
  }

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
