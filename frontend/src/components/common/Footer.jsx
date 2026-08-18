// src/components/common/Footer.jsx
import { Link } from 'react-router-dom';
import { Zap, Heart, ShieldCheck, Truck, RefreshCw, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-dark-900 text-dark-100 border-t border-dark-800 pt-12 pb-24 md:pb-12 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Trust Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-10 border-b border-dark-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center flex-shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Superfast 10-30 Min Delivery</h4>
              <p className="text-xs text-dark-400">Delivered hot & fresh to your doorstep</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-green-500/10 text-green-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Quality & Freshness</h4>
              <p className="text-xs text-dark-400">Directly from verified local partners</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0">
              <RefreshCw size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Instant Support & Refund</h4>
              <p className="text-xs text-dark-400">Hassle-free resolutions in app</p>
            </div>
          </div>
        </div>

        {/* Footer Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10">
          {/* Brand Info */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center shadow-brand">
                <Zap size={18} className="text-dark-900" fill="currentColor" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">QuickKart</span>
            </div>
            <p className="text-xs text-dark-400 leading-relaxed">
              Your favorite local products, fresh produce, and daily essential groceries delivered to your home in 10 to 30 minutes.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-dark-400 mb-3">Top Categories</h5>
            <ul className="space-y-2 text-xs text-dark-300">
              <li><Link to="/category/fruits-vegetables" className="hover:text-brand-400 transition-colors">Fresh Vegetables & Fruits</Link></li>
              <li><Link to="/category/dairy-breakfast" className="hover:text-brand-400 transition-colors">Dairy, Milk & Eggs</Link></li>
              <li><Link to="/category/snacks" className="hover:text-brand-400 transition-colors">Cold Drinks & Munchies</Link></li>
              <li><Link to="/category/instant-food" className="hover:text-brand-400 transition-colors">Instant & Ready Food</Link></li>
              <li><Link to="/category/personal-care" className="hover:text-brand-400 transition-colors">Personal Care & Hygiene</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-dark-400 mb-3">Customer Care</h5>
            <ul className="space-y-2 text-xs text-dark-300">
              <li><Link to="/account" className="hover:text-brand-400 transition-colors">My Profile & Addresses</Link></li>
              <li><Link to="/orders" className="hover:text-brand-400 transition-colors">Order History & Tracking</Link></li>
              <li><Link to="/wishlist" className="hover:text-brand-400 transition-colors">Saved Wishlist</Link></li>
              <li><Link to="/notifications" className="hover:text-brand-400 transition-colors">Offers & Alerts</Link></li>
            </ul>
          </div>

          {/* Contact & Apps */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-dark-400 mb-3">Get in Touch</h5>
            <div className="space-y-2 text-xs text-dark-300">
              <p className="flex items-center gap-2"><Mail size={14} className="text-brand-400" /> support@quickkart.com</p>
              <p className="flex items-center gap-2"><Phone size={14} className="text-brand-400" /> +91 1800-QUICK-KART</p>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-dark-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-dark-500">
          <p>© {new Date().getFullYear()} QuickKart Commerce Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart size={12} className="text-red-500 fill-red-500" /> for fast customer discovery
          </p>
        </div>
      </div>
    </footer>
  );
}
