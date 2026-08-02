import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Resolve page title based on path
  const getPageTitle = (path) => {
    switch (path) {
      case '/dashboard':
        return 'Dashboard';
      case '/upload':
        return 'Upload PDF';
      case '/chat':
        return 'Chat Workspace';
      case '/history':
        return 'History & Files';
      case '/settings':
        return 'Settings';
      default:
        return 'AI PDF Chatbot';
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden lg:pl-72">
        {/* Top Navbar */}
        <TopNavbar 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          title={getPageTitle(location.pathname)} 
        />
        
        {/* Inner Page Viewport */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
