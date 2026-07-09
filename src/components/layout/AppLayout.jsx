import { Outlet, Navigate } from 'react-router-dom';
import { Topbar } from './Topbar';

export function AppLayout() {
  const currentUserStr = localStorage.getItem('currentUser');

  if (!currentUserStr) {
    return <Navigate to="/login" replace />;
  }

  let currentUser;
  try {
    currentUser = JSON.parse(currentUserStr);
    if (!currentUser || typeof currentUser !== 'object') {
      throw new Error("Invalid user object");
    }
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
    <div className="bg-background text-on-background font-body text-body antialiased min-h-screen flex flex-col">
      <Topbar />
      <div className="mt-16 flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  );
}
