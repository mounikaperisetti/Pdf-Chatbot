import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { 
  FiGrid, 
  FiUploadCloud, 
  FiMessageSquare, 
  FiClock, 
  FiSettings, 
  FiLogOut,
  FiFileText,
  FiBookOpen,
  FiChevronLeft,
  FiMenu
} from 'react-icons/fi';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { pdfs, activePdf, setActivePdf, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: FiGrid },
    { name: 'Upload PDF', path: '/upload', icon: FiUploadCloud },
    { name: 'Chat Room', path: '/chat', icon: FiMessageSquare },
    { name: 'History & Files', path: '/history', icon: FiClock },
    { name: 'Settings', path: '/settings', icon: FiSettings },
  ];

  const handlePdfSelect = (pdf) => {
    setActivePdf(pdf);
    // If not on chat page, navigate to chat page when a PDF is selected
    if (location.pathname !== '/chat') {
      navigate('/chat');
    }
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar container */}
      <aside className={`
        fixed bottom-0 top-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-0 lg:translate-x-0'}
        ${isOpen ? '' : 'max-lg:-translate-x-full'}
      `}>
        {/* Brand / Logo */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-6">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <FiBookOpen className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-800">DocuMind AI</span>
          </div>
          <button 
            onClick={toggleSidebar} 
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-50 hover:text-slate-600 lg:hidden"
          >
            <FiChevronLeft className="h-5 w-5" />
          </button>
        </div>

        {/* User Card */}
        {user && (
          <div className="border-b border-slate-100 px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-semibold text-slate-800">{user.fullName}</p>
                <p className="truncate text-xs text-slate-400">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center space-x-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                `}
                onClick={() => isOpen && toggleSidebar()}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}

          {/* Active PDF Context Section */}
          <div className="pt-6">
            <div className="px-4 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Selected Document</p>
            </div>
            <div className="space-y-1">
              {pdfs.length === 0 ? (
                <div className="px-4 py-3 text-xs italic text-slate-400">
                  No documents uploaded
                </div>
              ) : (
                <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                  {pdfs.map((pdf) => (
                    <button
                      key={pdf.id}
                      onClick={() => handlePdfSelect(pdf)}
                      className={`
                        flex w-full items-center space-x-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium transition-all duration-200
                        ${activePdf?.id === pdf.id 
                          ? 'bg-slate-100 text-blue-700 font-semibold border-l-2 border-blue-600' 
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}
                      `}
                    >
                      <FiFileText className={`h-4 w-4 flex-shrink-0 ${activePdf?.id === pdf.id ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span className="truncate flex-1">{pdf.originalName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Logout Section */}
        <div className="border-t border-slate-100 p-4">
          <button
            onClick={handleLogoutClick}
            className="flex w-full items-center space-x-3 rounded-lg px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <FiLogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
