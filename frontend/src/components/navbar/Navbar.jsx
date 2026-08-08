// src/components/navbar/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart, User, ChevronDown, Bell, Zap, LogOut, Settings, Package, Menu, X } from 'lucide-react';
import useCartStore from '@store/cartStore';
import useWishlistStore from '@store/wishlistStore';
import useAuthStore from '@store/authStore';
import useLocationStore from '@store/locationStore';
import useUiStore from '@store/uiStore';
import SearchBar from '@components/common/SearchBar';
import { mockNotifications } from '@data/notifications';

export default function Navbar() {
  const itemCount      = useCartStore(s => s.items.reduce((a, i) => a + i.quantity, 0));
  const wishCount      = useWishlistStore(s => s.items.length);
  const { isLoggedIn, user } = useAuthStore();
  const { selectedAddress } = useLocationStore();
  const { setLocationPickerOpen } = useUiStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [scrolled, setScrolled]       = useState(false);
  const navigate = useNavigate();
  const loc      = useLocation();
  const unread   = mockNotifications.filter(n => !n.read).length;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [loc.pathname]);

  const logout = () => {
    useAuthStore.getState().clearUser();
    localStorage.removeItem('qk_token');
    navigate('/');
    setUserMenuOpen(false);
  };

  return (
    <>
      <header className={`sticky top-0 z-40 bg-white transition-shadow duration-200 ${scrolled ? 'shadow-nav' : 'border-b border-dark-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-4 h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-1.5 flex-shrink-0">
              <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center shadow-brand">
                <Zap size={18} className="text-dark-900" fill="currentColor" />
              </div>
              <span className="text-lg font-extrabold text-dark-900 tracking-tight hidden xs:block">QuickKart</span>
            </Link>

            {/* Location (desktop) */}
            <button
              onClick={() => setLocationPickerOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-50 
                         hover:bg-brand-50 hover:border-brand-300 border border-dark-100 
                         transition-all text-left min-w-[140px] max-w-[200px]"
            >
              <div className="min-w-0">
                <p className="text-[10px] text-dark-400 font-medium leading-none">Delivering to</p>
                <p className="text-xs font-semibold text-dark-900 truncate">{selectedAddress?.label || 'Select'}</p>
              </div>
              <ChevronDown size={14} className="text-dark-400 flex-shrink-0 ml-auto" />
            </button>

            {/* Search (desktop) */}
            <div className="flex-1 hidden sm:block max-w-lg">
              <SearchBar />
            </div>

            {/* Nav Icons (desktop) */}
            <nav className="hidden md:flex items-center gap-1 ml-auto">
              <Link to="/notifications" className="relative p-2.5 hover:bg-dark-50 rounded-xl transition-colors">
                <Bell size={20} className="text-dark-600" />
                {unread > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unread}
                  </span>
                )}
              </Link>

              <Link to="/wishlist" className="relative p-2.5 hover:bg-dark-50 rounded-xl transition-colors">
                <Heart size={20} className="text-dark-600" />
                {wishCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishCount}
                  </span>
                )}
              </Link>

              <Link to="/cart" className="relative p-2.5 hover:bg-dark-50 rounded-xl transition-colors">
                <ShoppingCart size={20} className="text-dark-600" />
                {itemCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-brand-500 text-dark-900 text-[10px] font-bold rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-dark-50 transition-colors"
                >
                  <div className="w-7 h-7 bg-brand-100 rounded-full flex items-center justify-center">
                    <User size={15} className="text-brand-700" />
                  </div>
                  {isLoggedIn && <span className="text-sm font-medium text-dark-700 max-w-[80px] truncate">{user?.name}</span>}
                  <ChevronDown size={14} className="text-dark-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-dark-100 rounded-2xl shadow-card-hover py-2 animate-slide-down z-50">
                    {isLoggedIn ? (
                      <>
                        <div className="px-4 py-2 border-b border-dark-50 mb-1">
                          <p className="font-semibold text-dark-900 text-sm">{user?.name}</p>
                          <p className="text-xs text-dark-400">{user?.email}</p>
                        </div>
                        {user?.role === 'admin' && (
                          <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 hover:bg-dark-50 text-sm font-medium transition-colors" onClick={() => setUserMenuOpen(false)}>
                            <Settings size={16} className="text-dark-500" /> Admin Panel
                          </Link>
                        )}
                        {user?.role === 'store_manager' && (
                          <Link to="/store" className="flex items-center gap-3 px-4 py-2.5 hover:bg-dark-50 text-sm font-medium transition-colors" onClick={() => setUserMenuOpen(false)}>
                            <Package size={16} className="text-dark-500" /> Store Panel
                          </Link>
                        )}
                        {user?.role === 'delivery_partner' && (
                          <Link to="/delivery" className="flex items-center gap-3 px-4 py-2.5 hover:bg-dark-50 text-sm font-medium transition-colors" onClick={() => setUserMenuOpen(false)}>
                            <Package size={16} className="text-dark-500" /> Delivery Panel
                          </Link>
                        )}
                        <Link to="/account" className="flex items-center gap-3 px-4 py-2.5 hover:bg-dark-50 text-sm font-medium transition-colors" onClick={() => setUserMenuOpen(false)}>
                          <User size={16} className="text-dark-500" /> My Account
                        </Link>
                        <Link to="/orders" className="flex items-center gap-3 px-4 py-2.5 hover:bg-dark-50 text-sm font-medium transition-colors" onClick={() => setUserMenuOpen(false)}>
                          <Package size={16} className="text-dark-500" /> My Orders
                        </Link>
                        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-red-500 text-sm font-medium transition-colors border-t border-dark-50 mt-1">
                          <LogOut size={16} /> Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" className="flex items-center gap-3 px-4 py-2.5 hover:bg-dark-50 text-sm font-medium transition-colors" onClick={() => setUserMenuOpen(false)}>
                          Login
                        </Link>
                        <Link to="/register" className="flex items-center gap-3 px-4 py-2.5 hover:bg-brand-50 text-brand-600 text-sm font-semibold transition-colors" onClick={() => setUserMenuOpen(false)}>
                          Create Account
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </nav>

            {/* Mobile right */}
            <div className="flex items-center gap-1 ml-auto md:hidden">
              <Link to="/cart" className="relative p-2 hover:bg-dark-50 rounded-xl transition-colors">
                <ShoppingCart size={20} className="text-dark-700" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-brand-500 text-dark-900 text-[10px] font-bold rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
              <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 hover:bg-dark-50 rounded-xl transition-colors">
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <div className="sm:hidden pb-3">
            <SearchBar />
          </div>

          {/* Mobile location */}
          <div className="md:hidden pb-2 hidden sm:block">
            <button onClick={() => setLocationPickerOpen(true)} className="flex items-center gap-1 text-xs text-dark-500">
              📍 {selectedAddress?.label} · {selectedAddress?.city}
              <ChevronDown size={12} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-dark-50 bg-white animate-slide-down">
            <nav className="px-4 py-3 space-y-1">
              <button onClick={() => { setLocationPickerOpen(true); setMobileOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-dark-50 text-sm font-medium text-left">
                📍 {selectedAddress?.label} · {selectedAddress?.city}
              </button>
              {isLoggedIn ? (
                <>
                  <div className="px-4 py-2">
                    <p className="font-semibold text-sm">{user?.name}</p>
                    <p className="text-xs text-dark-400">{user?.email}</p>
                  </div>
                  <Link to="/account" className="block px-4 py-2.5 rounded-xl hover:bg-dark-50 text-sm font-medium">My Account</Link>
                  <Link to="/orders"  className="block px-4 py-2.5 rounded-xl hover:bg-dark-50 text-sm font-medium">My Orders</Link>
                  <Link to="/wishlist" className="block px-4 py-2.5 rounded-xl hover:bg-dark-50 text-sm font-medium">Wishlist</Link>
                  <Link to="/notifications" className="block px-4 py-2.5 rounded-xl hover:bg-dark-50 text-sm font-medium">Notifications</Link>
                  <button onClick={logout} className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-red-50 text-red-500 text-sm font-medium">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login"    className="block px-4 py-2.5 rounded-xl hover:bg-dark-50 text-sm font-medium">Login</Link>
                  <Link to="/register" className="block px-4 py-2.5 rounded-xl bg-brand-500 text-dark-900 text-sm font-bold text-center">Create Account</Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Overlay for user menu */}
      {userMenuOpen && <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />}
    </>
  );
}
