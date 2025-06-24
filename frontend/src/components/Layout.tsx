import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { UserProfile } from './UserProfile';
import { PanelLeft } from 'lucide-react';

export function Layout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const activeSection = location.pathname.split('/')[1] || 'dashboard';

  return (
    <div className="min-h-screen w-full flex bg-background">
      <div
        className={`fixed left-0 top-0 z-50 h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <AppSidebar
          isCollapsed={isCollapsed}
          activeSection={activeSection}
        />
      </div>

      <div
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-sm">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2"
          >
            <PanelLeft className="h-6 w-6" />
          </button>
          <UserProfile />
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
