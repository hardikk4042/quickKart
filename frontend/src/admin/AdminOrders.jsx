// src/admin/AdminOrders.jsx
import { useEffect, useState } from 'react';
import { mockOrders } from '@data/orders';
import { formatDate, statusLabel, statusColor } from '@utils/format';
import { Eye, Search } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState(mockOrders);
  const [query, setQuery]   = useState('');
  useEffect(() => { document.title = 'Orders — Admin'; }, []);

  const filtered = orders.filter(o =>
    o.id.includes(query.toUpperCase()) ||
    o.items?.some(i => i.name.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-dark-900">Orders</h1>
      </div>
      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" size={16} />
        <input type="text" value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search order ID or item..." className="input pl-9" />
      </div>
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-100 bg-dark-50">
                {['Order ID', 'Items', 'Amount', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-dark-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id} className="border-b border-dark-50 last:border-0 hover:bg-dark-50 transition-colors">
                  <td className="px-5 py-4"><span className="font-mono font-bold text-dark-900">#{o.id}</span></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1">
                        {o.items?.slice(0, 2).map(i => (
                          <img key={i.id} src={i.image} alt="" className="w-8 h-8 rounded-lg object-cover border-2 border-white" />
                        ))}
                      </div>
                      <span className="text-dark-500 text-xs">{o.items?.length} items</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-bold text-dark-900">₹{o.pricing?.total}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor(o.status)}`}>
                      {statusLabel(o.status)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-dark-500 text-xs">{formatDate(o.createdAt)}</td>
                  <td className="px-5 py-4">
                    <button className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors"><Eye size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
