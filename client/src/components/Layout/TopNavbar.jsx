import React from 'react';
import useAuth from '../../hooks/useAuth';
import { FiMenu, FiFileText } from 'react-icons/fi';

const TopNavbar = ({ toggleSidebar, title }) => {
  const { activePdf, user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm shadow-slate-100">
      <div className="flex items-center space-x-4">
        {/* Mobile menu trigger */}
        <button
          onClick={toggleSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 lg:hidden"
        >
          <FiMenu className="h-5 w-5" />
        </button>
        
        {/* Title */}
        <h1 className="text-xl font-bold tracking-tight text-slate-800">{title}</h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Active PDF indicator badge */}
        {activePdf ? (
          <div className="hidden sm:flex items-center space-x-2 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 max-w-xs md:max-w-md">
            <FiFileText className="h-3.5 w-3.5 flex-shrink-0 text-blue-500 animate-pulse" />
            <span className="truncate">Context: {activePdf.originalName}</span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center space-x-2 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500">
            <FiFileText className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
            <span>No Active PDF Context</span>
          </div>
        )}

        {/* User initials block */}
        {user && (
          <div className="flex items-center space-x-2.5">
            <span className="hidden md:inline text-sm font-medium text-slate-600">Hi, {user.fullName.split(' ')[0]}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-sm shadow-blue-500/10">
              {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopNavbar;
