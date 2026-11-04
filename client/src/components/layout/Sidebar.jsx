import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  AlertTriangle,
  LogOut,
  Shirt,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { logout, user } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/orders', label: 'Orders', icon: ClipboardList },
    { to: '/complaints', label: 'Complaints', icon: AlertTriangle },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-gray-200 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo / Brand Header */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md">
                <Shirt size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-none">
                  LaundryMate
                </h1>
                <p className="text-xs font-semibold text-blue-600 tracking-wider uppercase mt-1">
                  Staff Portal
                </p>
              </div>
            </div>

            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation - Exactly 4 items: Dashboard, Orders, Complaints, Logout */}
          <nav className="p-4 space-y-2 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-base font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  <Icon size={22} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Area with Staff Info and Logout */}
        <div className="p-4 border-t border-gray-100">
          <div className="px-4 py-3 bg-gray-50 rounded-xl mb-3">
            <p className="text-xs text-gray-500 font-medium">Logged in as</p>
            <p className="text-sm font-bold text-gray-900 truncate">
              {user?.name || 'Staff Member'}
            </p>
            <p className="text-xs text-blue-600 font-medium">{user?.email}</p>
          </div>

          {/* 4th Item: Logout */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 text-base font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={22} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
