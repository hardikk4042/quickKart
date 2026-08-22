// src/admin/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import {
  ShoppingBag, Users, TrendingUp, Package, AlertTriangle,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { products } from '@data/products';

const revenueData = [
  { day: 'Mon', revenue: 12400, orders: 54 },
  { day: 'Tue', revenue: 18200, orders: 78 },
  { day: 'Wed', revenue: 15800, orders: 67 },
  { day: 'Thu', revenue: 22100, orders: 93 },
  { day: 'Fri', revenue: 28900, orders: 121 },
  { day: 'Sat', revenue: 35600, orders: 148 },
  { day: 'Sun', revenue: 31200, orders: 130 },
];

const categoryData = [
  { name: 'Dairy',   value: 28, color: '#3B82F6' },
  { name: 'Snacks',  value: 22, color: '#F59E0B' },
  { name: 'Fruits',  value: 18, color: '#22C55E' },
  { name: 'Beverages', value: 15, color: '#8B5CF6' },
  { name: 'Others',  value: 17, color: '#E5E7EB' },
];

const STATS = [
  { label: 'Total Orders',       value: '1,248',   sub: '+12% from yesterday', icon: ShoppingBag,  trend: 'up',   color: 'bg-blue-50',    iconColor: 'text-blue-500' },
  { label: 'Revenue Today',      value: '₹35,600', sub: '+8.2% from yesterday', icon: TrendingUp,   trend: 'up',   color: 'bg-green-50',   iconColor: 'text-green-500' },
  { label: 'Active Users',       value: '3,842',   sub: '+4.1% from last week', icon: Users,        trend: 'up',   color: 'bg-purple-50',  iconColor: 'text-purple-500' },
  { label: 'Low Stock Items',    value: '14',      sub: 'Needs restocking',      icon: AlertTriangle,trend: 'down', color: 'bg-amber-50',   iconColor: 'text-amber-500' },
];

function StatCard({ stat }) {
  const { label, value, sub, icon: Icon, trend, color, iconColor } = stat;
  return (
    <div className="bg-white rounded-2xl shadow-card p-5 flex items-start gap-4">
      <div className={`${color} p-3 rounded-xl flex-shrink-0`}>
        <Icon size={20} className={iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-extrabold text-dark-900">{value}</p>
        <p className="text-sm font-medium text-dark-600">{label}</p>
        <div className={`flex items-center gap-1 text-xs mt-1 ${trend === 'up' ? 'text-green-600' : 'text-amber-600'}`}>
          {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {sub}
        </div>
      </div>
    </div>
  );
}

const recentOrders = [
  { id: 'QK10293', customer: 'Hardik',      amount: 224, status: 'out_for_delivery', time: '5 min ago' },
  { id: 'QK10292', customer: 'Priya Sharma', amount: 480, status: 'packing',         time: '12 min ago' },
  { id: 'QK10291', customer: 'Arjun Mehta', amount: 175, status: 'delivered',        time: '28 min ago' },
  { id: 'QK10290', customer: 'Nisha Rao',   amount: 892, status: 'confirmed',        time: '34 min ago' },
  { id: 'QK10289', customer: 'Raj Kumar',   amount: 310, status: 'delivered',        time: '1 hr ago' },
];

const STATUS_COLORS = {
  confirmed:        'text-blue-600   bg-blue-50',
  packing:          'text-amber-600  bg-amber-50',
  out_for_delivery: 'text-brand-600  bg-brand-50',
  delivered:        'text-green-600  bg-green-50',
  cancelled:        'text-red-600    bg-red-50',
};

export default function AdminDashboard() {
  useEffect(() => { document.title = 'Admin Dashboard — QuickKart'; }, []);
  const lowStock = products.filter(p => p.inStock && p.reviewCount < 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-dark-900">Dashboard</h1>
        <p className="text-dark-400 text-sm">Welcome back — here's what's happening today.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map(s => <StatCard key={s.label} stat={s} />)}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-card p-5">
          <h2 className="font-bold text-dark-900 mb-4">Weekly Revenue & Orders</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#888' }} />
              <YAxis tick={{ fontSize: 11, fill: '#888' }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                formatter={(v, n) => [n === 'revenue' ? `₹${v.toLocaleString()}` : v, n === 'revenue' ? 'Revenue' : 'Orders']}
              />
              <Line type="monotone" dataKey="revenue" stroke="#F6C90E" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="orders"  stroke="#22C55E" strokeWidth={2} dot={false} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category pie */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <h2 className="font-bold text-dark-900 mb-4">Sales by Category</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`, 'Share']} />
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-dark-600">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-dark-900">Recent Orders</h2>
            <a href="/admin/orders" className="text-xs text-brand-600 font-semibold hover:text-brand-700">View all</a>
          </div>
          <div className="space-y-3">
            {recentOrders.map(o => (
              <div key={o.id} className="flex items-center gap-3 py-2 border-b border-dark-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-dark-900">#{o.id}</p>
                  <p className="text-xs text-dark-400">{o.customer} · {o.time}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${STATUS_COLORS[o.status]}`}>
                  {o.status.replace('_', ' ')}
                </span>
                <span className="font-bold text-dark-900 text-sm whitespace-nowrap">₹{o.amount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-dark-900 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" /> Low Stock Alert
            </h2>
            <a href="/admin/inventory" className="text-xs text-brand-600 font-semibold">Manage</a>
          </div>
          <div className="space-y-3">
            {lowStock.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center gap-3 py-2 border-b border-dark-50 last:border-0">
                <img src={p.image} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-dark-900 truncate">{p.name}</p>
                  <p className="text-xs text-dark-400">{p.brand}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs bg-amber-50 text-amber-700 font-semibold px-2 py-1 rounded-full">Low</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Finalized admin panel components

// UI polish and final bug fixes applied
