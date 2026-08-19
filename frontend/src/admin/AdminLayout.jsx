// src/admin/AdminLayout.jsx
import { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Package, Grid3x3, Store, Layers,
  ShoppingBag, Tag, Truck, BarChart2, Settings, Zap, LogOut, Menu, X, ChevronRight
} from 'lucide-react';
import useAuthStore from '@store/authStore';

const NAV = [
  { to: '/admin',              icon: LayoutDashboard, label: 'Dashboard'        },
  { to: '/admin/orders',       icon: ShoppingBag,     label: 'Orders'           },
  { to: '/admin/products',     icon: Package,         label: 'Products'         },
  { to: '/admin/categories',   icon: Grid3x3,         label: 'Categories'       },
  { to: '/admin/users',        icon: Users,           label: 'Users'            },
  { to: '/admin/inventory',    icon: Layers,          label: 'Inventory'        },
  { to: '/admin/coupons',      icon: Tag,             label: 'Coupons'          },
  { to: '/admin/stores',       icon: Store,           label: 'Stores'           },
  { to: '/admin/delivery',     icon: Truck,           label: 'Delivery'         },
  { to: '/admin/analytics',    icon: BarChart2,       label: 'Analytics'        },
  { to: '/admin/settings',     icon: Settings,        label: 'Settings'         },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  const { user, clearUser } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const logout = () => { clearUser(); localStorage.removeItem('qk_token'); navigate('/login'); };

  const isActive = (to) => to === '/admin' ? pathname === '/admin' : pathname.startsWith(to);

  const Sidebar = () => (
    <aside className="w-60 bg-dark-900 h-screen flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-dark-700">
        <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-brand flex-shrink-0">
          <Zap size={18} fill="currentColor" className="text-dark-900" />
        </div>
        <div>
          <p className="font-extrabold text-white text-sm leading-tight">QuickKart</p>
          <p className="text-dark-400 text-xs">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {NAV.map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                        ${isActive(to) ? 'bg-brand-500 text-dark-900' : 'text-dark-300 hover:bg-dark-700 hover:text-white'}`}
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-dark-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center font-bold text-brand-700 text-sm">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user?.name || 'Admin'}</p>
            <p className="text-dark-400 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-xl text-xs font-medium transition-colors">
          <LogOut size={14} /> Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-dark-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-dark-100 px-4 sm:px-6 h-14 flex items-center justify-between flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-dark-50 rounded-xl">
            <Menu size={20} />
          </button>
          <nav className="hidden sm:flex items-center gap-1.5 text-xs text-dark-400">
            <span>Admin</span>
            <ChevronRight size={12} />
            <span className="text-dark-900 font-medium capitalize">
              {pathname.split('/').pop() || 'Dashboard'}
            </span>
          </nav>
          <div className="flex items-center gap-2 ml-auto">
            <Link to="/" target="_blank" className="text-xs text-dark-500 hover:text-dark-900 border border-dark-200 px-3 py-1.5 rounded-lg transition-colors">
              View Store ↗
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Finalized admin panel components
