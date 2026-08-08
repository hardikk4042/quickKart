// src/components/common/SearchBar.jsx
import { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { products } from '@data/products';

const POPULAR = ['milk', 'bread', 'eggs', 'chips', 'maggi', 'coffee'];

export default function SearchBar({ className = '', autoFocus = false }) {
  const [query, setQuery]     = useState('');
  const [focused, setFocused] = useState(false);
  const [recents, setRecents] = useState(() => {
    try { return JSON.parse(localStorage.getItem('qk_recents') || '[]'); } catch { return []; }
  });
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const suggestions = query.length > 1
    ? products
        .filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.tags.some(t => t.includes(query.toLowerCase())))
        .slice(0, 5)
    : [];

  useEffect(() => { if (autoFocus) inputRef.current?.focus(); }, [autoFocus]);

  const saveRecent = (q) => {
    const updated = [q, ...recents.filter(r => r !== q)].slice(0, 5);
    setRecents(updated);
    localStorage.setItem('qk_recents', JSON.stringify(updated));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    saveRecent(query.trim());
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setFocused(false);
    inputRef.current?.blur();
  };

  const handleSuggestion = (text) => {
    setQuery(text);
    saveRecent(text);
    navigate(`/search?q=${encodeURIComponent(text)}`);
    setFocused(false);
  };

  const clearRecent = (e, r) => {
    e.stopPropagation();
    const updated = recents.filter(x => x !== r);
    setRecents(updated);
    localStorage.setItem('qk_recents', JSON.stringify(updated));
  };

  const showDropdown = focused && (query.length > 1 ? suggestions.length > 0 : recents.length > 0 || POPULAR.length > 0);

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-300 pointer-events-none" size={18} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="Search for milk, bread, chips..."
          className="w-full bg-dark-50 border border-dark-100 focus:border-brand-500 focus:bg-white
                     focus:ring-2 focus:ring-brand-500/20 rounded-xl pl-10 pr-10 py-2.5 text-sm
                     font-medium text-dark-800 placeholder:text-dark-300 outline-none transition-all duration-200"
          aria-label="Search products"
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-300 hover:text-dark-600">
            <X size={16} />
          </button>
        )}
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-dark-100 rounded-2xl shadow-card-hover
                        z-50 overflow-hidden animate-slide-down">
          {query.length > 1 ? (
            // Suggestions
            <div className="py-2">
              {suggestions.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleSuggestion(p.name)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-dark-50 text-left transition-colors"
                >
                  <img src={p.image} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-dark-900 truncate">{p.name}</p>
                    <p className="text-xs text-dark-400">{p.weight} · ₹{p.price}</p>
                  </div>
                </button>
              ))}
              <button
                onClick={handleSubmit}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-brand-50 text-left border-t border-dark-50 transition-colors"
              >
                <Search size={16} className="text-brand-500 flex-shrink-0" />
                <span className="text-sm text-brand-600 font-medium">Search for "{query}"</span>
              </button>
            </div>
          ) : (
            // Recents + Popular
            <div className="py-2">
              {recents.length > 0 && (
                <>
                  <p className="text-xs text-dark-400 font-semibold px-4 py-1.5 uppercase tracking-wide">Recent</p>
                  {recents.map(r => (
                    <button key={r} onClick={() => handleSuggestion(r)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-2 hover:bg-dark-50 text-left">
                      <span className="flex items-center gap-2 text-sm text-dark-700">
                        <Clock size={14} className="text-dark-300" /> {r}
                      </span>
                      <button onClick={(e) => clearRecent(e, r)} className="text-dark-300 hover:text-dark-600">
                        <X size={14} />
                      </button>
                    </button>
                  ))}
                </>
              )}
              <p className="text-xs text-dark-400 font-semibold px-4 py-1.5 uppercase tracking-wide border-t border-dark-50 mt-1">Popular</p>
              <div className="flex flex-wrap gap-2 px-4 pb-3 pt-1">
                {POPULAR.map(s => (
                  <button key={s} onClick={() => handleSuggestion(s)}
                    className="chip chip-inactive">
                    <TrendingUp size={12} /> {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
