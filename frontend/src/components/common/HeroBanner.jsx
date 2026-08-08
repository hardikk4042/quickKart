// src/components/common/HeroBanner.jsx
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const banners = [
  {
    id: 1,
    tag: '⚡ 10–30 Minute Delivery',
    title: 'Fresh groceries at\nyour doorstep',
    subtitle: 'Order now and get everything you need delivered fast',
    cta: 'Shop Now',
    ctaHref: '/category/fruits-vegetables',
    gradient: 'from-green-900 via-green-800 to-emerald-700',
    accent: '#22C55E',
    emoji: '🥦',
    emojiSize: 'text-8xl sm:text-[10rem]',
  },
  {
    id: 2,
    tag: '🎉 Weekend Offers',
    title: 'Up to 40% OFF\non snacks & beverages',
    subtitle: 'Limited time deals on your favourite brands',
    cta: 'Grab Deals',
    ctaHref: '/search?q=deals',
    gradient: 'from-amber-900 via-orange-800 to-yellow-700',
    accent: '#F6C90E',
    emoji: '🍿',
    emojiSize: 'text-8xl sm:text-[10rem]',
  },
  {
    id: 3,
    tag: '🌟 New Arrivals',
    title: 'Explore premium\npersonal care',
    subtitle: 'Top brands delivered in minutes',
    cta: 'Explore',
    ctaHref: '/category/personal-care',
    gradient: 'from-purple-900 via-violet-800 to-indigo-700',
    accent: '#8B5CF6',
    emoji: '✨',
    emojiSize: 'text-8xl sm:text-[10rem]',
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const total = banners.length;

  useEffect(() => {
    const timer = setInterval(() => setCurrent(c => (c + 1) % total), 4500);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent(c => (c - 1 + total) % total);
  const next = () => setCurrent(c => (c + 1) % total);

  return (
    <div className="relative rounded-3xl overflow-hidden h-48 sm:h-56">
      {banners.map((b, i) => (
        <div
          key={b.id}
          className={`absolute inset-0 bg-gradient-to-br ${b.gradient} transition-opacity duration-700
                      ${i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <div className="relative h-full flex items-center px-6 sm:px-10 overflow-hidden">
            {/* Text */}
            <div className="relative z-10 max-w-xs sm:max-w-sm">
              <span className="inline-block text-xs font-semibold text-white/80 bg-white/10 
                               px-3 py-1 rounded-full mb-3">
                {b.tag}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-2 whitespace-pre-line">
                {b.title}
              </h2>
              <p className="text-white/70 text-xs sm:text-sm mb-4 hidden sm:block">{b.subtitle}</p>
              <Link
                to={b.ctaHref}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-sm
                           transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ backgroundColor: b.accent, color: '#0F0F0F' }}
              >
                {b.cta}
              </Link>
            </div>
            {/* Emoji */}
            <div className={`absolute right-4 sm:right-10 bottom-0 ${b.emojiSize} 
                             opacity-20 sm:opacity-30 leading-none select-none pointer-events-none`}>
              {b.emoji}
            </div>
          </div>
        </div>
      ))}

      {/* Arrows */}
      <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-white/10 
                                        hover:bg-white/20 text-white rounded-full transition-all">
        <ChevronLeft size={16} />
      </button>
      <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-white/10 
                                        hover:bg-white/20 text-white rounded-full transition-all">
        <ChevronRight size={16} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 
                        ${i === current ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/40'}`}
          />
        ))}
      </div>
    </div>
  );
}
