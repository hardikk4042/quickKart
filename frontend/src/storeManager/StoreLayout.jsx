/**
 * @file StoreLayout.jsx
 * @description Main layout component for the Store Manager dashboard interface.
 * Provides sidebar navigation links, user profile details, and main outlet container.
 */
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingBag, Package, Layers, Zap, LogOut, Truck, CheckSquare, Settings, Loader2, Store, Users, MapPin, PackageOpen } from 'lucide-react';
import useAuthStore from '@store/authStore';
import { storeService } from '@services/store.api';


// Navigation sidebar items configuration
const NAV = [
  { to: '/store',           icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/store/orders',    icon: ShoppingBag,     label: 'Orders'    },
  { to: '/store/products',  icon: Package,         label: 'Products'  },
  { to: '/store/inventory', icon: Layers,          label: 'Inventory' },
];

export default function StoreLayout() {
  const { pathname } = useLocation();
  const { user, clearUser } = useAuthStore();
  const navigate = useNavigate();

  const logout = () => { clearUser(); localStorage.removeItem('qk_token'); navigate('/login'); };
  const isActive = (to) => to === '/store' ? pathname === '/store' : pathname.startsWith(to);

  return (
    <div className="flex h-screen overflow-hidden bg-dark-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-dark-100 flex flex-col hidden md:flex">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-dark-100">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-brand">
            <Zap size={18} fill="currentColor" className="text-dark-900" />
          </div>
          <div>
            <p className="font-extrabold text-dark-900 text-sm">QuickKart</p>
            <p className="text-dark-400 text-xs">Store Manager</p>
          </div>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-0.5">
          {NAV.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive(to)
                  ? 'bg-brand-500 text-dark-900'
                  : 'text-dark-500 hover:bg-dark-50 hover:text-dark-900'
              }`}
            >
              <Icon size={17} /> {label}
            </Link>
          ))}
        </nav>

        {/* User profile & actions footer */}
        <div className="p-4 border-t border-dark-100">
          <p className="text-xs font-semibold text-dark-900 mb-0.5">{user?.name}</p>
          <p className="text-xs text-dark-400 mb-3">{user?.email}</p>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-xs text-dark-400 hover:text-error transition-colors"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
}
