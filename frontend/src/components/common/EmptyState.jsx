// src/components/common/EmptyState.jsx
import { Link } from 'react-router-dom';

const illustrations = {
  cart:       '🛒',
  wishlist:   '❤️',
  orders:     '📦',
  search:     '🔍',
  products:   '📋',
  notif:      '🔔',
  error:      '⚠️',
  offline:    '📡',
  default:    '🌟',
};

export default function EmptyState({
  type = 'default',
  icon,
  title = 'Nothing here',
  subtitle,
  action,
  actionHref,
  actionLabel = 'Go Back',
  className = '',
}) {
  const emoji = icon || illustrations[type] || illustrations.default;

  return (
    <div className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}>
      <div className="text-6xl mb-5 animate-bounce-sm">{emoji}</div>
      <h3 className="text-xl font-bold text-dark-800 mb-2">{title}</h3>
      {subtitle && <p className="text-dark-400 text-sm max-w-xs leading-relaxed mb-6">{subtitle}</p>}
      {(action || actionHref) && (
        actionHref ? (
          <Link to={actionHref} className="btn-primary">{actionLabel}</Link>
        ) : (
          <button onClick={action} className="btn-primary">{actionLabel}</button>
        )
      )}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <EmptyState
      type="error"
      title="Something went wrong"
      subtitle={message || 'We ran into an issue. Please try again.'}
      action={onRetry}
      actionLabel="Try Again"
    />
  );
}

export function OfflineState() {
  return (
    <EmptyState
      type="offline"
      title="You're offline"
      subtitle="Check your internet connection and try again."
      action={() => window.location.reload()}
      actionLabel="Reload"
    />
  );
}
