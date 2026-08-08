// src/pages/Notifications.jsx
import { useState } from 'react';
import { Bell, BellOff, Check } from 'lucide-react';
import { mockNotifications } from '@data/notifications';
import { timeAgo } from '@utils/format';
import EmptyState from '@components/common/EmptyState';

export default function Notifications() {
  const [notifs, setNotifs] = useState(mockNotifications);

  const markAllRead = () => setNotifs(n => n.map(x => ({ ...x, read: true })));
  const markRead    = (id) => setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x));

  const unread = notifs.filter(n => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 pb-24 md:pb-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-dark-900">
          Notifications {unread > 0 && <span className="ml-2 text-sm bg-error text-white px-2 py-0.5 rounded-full font-semibold">{unread}</span>}
        </h1>
        {unread > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1.5 text-sm text-brand-600 font-semibold hover:text-brand-700">
            <Check size={14} /> Mark all read
          </button>
        )}
      </div>

      {notifs.length === 0 ? (
        <EmptyState type="notif" title="No notifications" subtitle="You're all caught up!" />
      ) : (
        <div className="space-y-2">
          {notifs.map(n => (
            <button
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`w-full flex items-start gap-4 p-4 rounded-2xl text-left transition-all
                          ${n.read ? 'bg-white border border-dark-50' : 'bg-brand-50 border border-brand-200'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0
                               ${n.read ? 'bg-dark-100' : 'bg-brand-100'}`}>
                {n.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${n.read ? 'text-dark-700' : 'text-dark-900'}`}>{n.title}</p>
                <p className="text-xs text-dark-500 mt-0.5 leading-relaxed">{n.body}</p>
                <p className="text-xs text-dark-400 mt-1">{timeAgo(n.time)}</p>
              </div>
              {!n.read && <div className="w-2 h-2 bg-brand-500 rounded-full flex-shrink-0 mt-1.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
