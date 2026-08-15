// src/pages/Account.jsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Package, Heart, Tag, Bell, Settings, LogOut, ChevronRight } from 'lucide-react';
import useAuthStore from '@store/authStore';
import { useAuth } from '@hooks/useAuth';
import { userAPI } from '@services/user.api';
import { formatDate } from '@utils/format';
import { mockUser } from '@data/notifications';

const MENU = [
  { icon: MapPin,     label: 'Addresses',     to: '/account/addresses', sub: 'Manage delivery addresses' },
  { icon: Package,    label: 'My Orders',      to: '/orders',            sub: 'Track & manage orders' },
  { icon: Heart,      label: 'Wishlist',       to: '/wishlist',          sub: 'Saved products' },
  { icon: Tag,        label: 'My Coupons',     to: '/account/coupons',   sub: 'Available discount codes' },
  { icon: Bell,       label: 'Notifications',  to: '/notifications',     sub: 'Order & offer alerts' },
  { icon: Settings,   label: 'Settings',       to: '/account/settings',  sub: 'App preferences' },
];

export default function Account() {
  const { isLoggedIn, user, updateUser } = useAuthStore();
  const { logout } = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      userAPI.getMe().then(u => updateUser(u)).catch(() => {});
    }
  }, [isLoggedIn, updateUser]);

  const displayUser = isLoggedIn ? user : mockUser;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 pb-24 md:pb-8">
      <h1 className="text-2xl font-bold text-dark-900 mb-6">My Account</h1>

      {/* Profile card */}
      <div className="bg-gradient-to-br from-dark-900 to-dark-800 rounded-3xl p-6 mb-6 text-white shadow-card">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center text-2xl font-extrabold text-dark-900 flex-shrink-0">
            {displayUser?.avatarUrl ? (
              <img src={displayUser.avatarUrl} alt={displayUser.name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              displayUser?.name?.[0]?.toUpperCase() || '?'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold truncate">{displayUser?.name}</h2>
            <p className="text-dark-300 text-sm truncate">{displayUser?.email}</p>
            <p className="text-dark-300 text-sm">{displayUser?.phone || 'No phone added'}</p>
          </div>
          {isLoggedIn && (
            <Link to="/account/edit" className="flex-shrink-0 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold transition-colors">
              Edit
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-white/10">
          {[
            { label: 'Orders',      value: displayUser?.totalOrders || 0 },
            { label: 'Role',        value: displayUser?.role || 'CUSTOMER' },
            { label: 'Member since', value: formatDate(displayUser?.createdAt || displayUser?.joinedAt) },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-sm font-bold text-brand-400 truncate">{s.value}</p>
              <p className="text-xs text-dark-300">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {!isLoggedIn && (
        <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <p className="text-sm text-dark-700 font-medium">Login to access your account features</p>
          <Link to="/login" className="btn-primary text-xs px-4 py-2">Login</Link>
        </div>
      )}

      {/* Menu */}
      <div className="bg-white rounded-3xl shadow-card overflow-hidden mb-4 border border-dark-100">
        {MENU.map((item, i) => (
          <Link
            key={item.label}
            to={item.to}
            className={`flex items-center gap-4 px-5 py-4 hover:bg-dark-50 transition-colors
                        ${i < MENU.length - 1 ? 'border-b border-dark-50' : ''}`}
          >
            <div className="w-10 h-10 bg-dark-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <item.icon size={18} className="text-dark-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-dark-900 text-sm">{item.label}</p>
              <p className="text-xs text-dark-400">{item.sub}</p>
            </div>
            <ChevronRight size={16} className="text-dark-300 flex-shrink-0" />
          </Link>
        ))}
      </div>

      {/* Logout */}
      {isLoggedIn && (
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-error/30
                     text-error hover:bg-red-50 font-semibold text-sm transition-all"
        >
          <LogOut size={16} /> Logout
        </button>
      )}
    </div>
  );
}
