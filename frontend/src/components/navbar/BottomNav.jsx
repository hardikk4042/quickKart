// src/components/navbar/BottomNav.jsx
import { Link, useLocation } from 'react-router-dom';
import { Home, Grid3x3, ShoppingCart, Package, User } from 'lucide-react';
import useCartStore from '@store/cartStore';

const tabs = [
  { to: '/',          icon: Home,         label: 'Home'       },
  { to: '/category',  icon: Grid3x3,      label: 'Categories' },
  { to: '/cart',      icon: ShoppingCart, label: 'Cart',  badge: true },
  { to: '/orders',    icon: Package,      label: 'Orders'     },
  { to: '/account',   icon: User,         label: 'Account'    },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const itemCount = useCartStore(s => s.items.reduce((a, i) => a + i.quantity, 0));

  const isActive = (to) => {
    if (to === '/') return pathname === '/';
    return pathname.startsWith(to);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-dark-100 
                    flex md:hidden safe-area-inset-bottom">
      {tabs.map(({ to, icon: Icon, label, badge }) => {
        const active = isActive(to);
        return (
          <Link
            key={to}
            to={to}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 px-1 relative
                        transition-colors ${active ? 'text-brand-600' : 'text-dark-400 hover:text-dark-700'}`}
          >
            <div className="relative">
              <Icon
                size={22}
                className="transition-all"
                fill={active ? 'currentColor' : 'none'}
                strokeWidth={active ? 2.5 : 2}
              />
              {badge && itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-brand-500 text-dark-900 
                                 text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-medium ${active ? 'font-semibold' : ''}`}>{label}</span>
            {active && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-brand-500 rounded-full" />}
          </Link>
        );
      })}
    </nav>
  );
}
