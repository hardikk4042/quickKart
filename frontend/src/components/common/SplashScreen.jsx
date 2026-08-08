// src/components/common/SplashScreen.jsx
import { useEffect, useState } from 'react';

const BRAND = '#F6C90E';

const LETTERS = [
  { char: 'Q', yellow: false },
  { char: 'u', yellow: false },
  { char: 'i', yellow: false },
  { char: 'c', yellow: false },
  { char: 'k', yellow: false },
  { char: 'K', yellow: true  },
  { char: 'a', yellow: true  },
  { char: 'r', yellow: true  },
  { char: 't', yellow: true  },
];

// Stagger timing per letter
const LETTER_DELAY  = 0.11;   // seconds between each letter
const LETTER_DUR    = 0.55;   // seconds each letter takes to appear
const TOTAL_DRAW_MS = (LETTERS.length - 1) * LETTER_DELAY * 1000 + LETTER_DUR * 1000;

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('idle');  // idle → draw → fill → fade → done

  useEffect(() => {
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setPhase('draw'))
    );
    const t1 = setTimeout(() => setPhase('fill'), TOTAL_DRAW_MS + 100);
    const t2 = setTimeout(() => setPhase('fade'), TOTAL_DRAW_MS + 700);
    const t3 = setTimeout(() => { setPhase('done'); onDone?.(); }, TOTAL_DRAW_MS + 1500);
    return () => { cancelAnimationFrame(raf); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  if (phase === 'done') return null;

  const drawn  = phase !== 'idle';
  const filled = phase === 'fill' || phase === 'fade';
  const fading = phase === 'fade';

  return (
    <>
      {/* ── Keyframe styles injected inline ──────────────────── */}
      <style>{`
        @keyframes qk-rise {
          0%   { opacity: 0; transform: translateY(22px) scale(0.88); filter: blur(6px); }
          60%  { opacity: 1; filter: blur(0px); }
          100% { opacity: 1; transform: translateY(0px)  scale(1);    filter: blur(0px); }
        }
        @keyframes qk-fill-in {
          0%   { -webkit-text-stroke-color: currentColor; color: transparent; }
          100% { color: currentColor; -webkit-text-stroke-color: transparent; }
        }
        @keyframes qk-glow-pulse {
          0%, 100% { opacity: 0.35; transform: scale(1);    }
          50%       { opacity: 0.55; transform: scale(1.06); }
        }
        @keyframes qk-dot-blink {
          0%, 100% { opacity: 0.2; }
          50%       { opacity: 0.7; }
        }
        @keyframes qk-bar {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes qk-underline {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}</style>

      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: '#0A0A0A',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          opacity:    fading ? 0 : 1,
          transition: fading ? 'opacity 0.8s cubic-bezier(0.4,0,0.2,1)' : 'none',
          overflow: 'hidden',
        }}
      >

        {/* ── Subtle background grid ─────────────────────────── */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage:
            `linear-gradient(rgba(246,201,14,0.04) 1px, transparent 1px),
             linear-gradient(90deg, rgba(246,201,14,0.04) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }} />

        {/* ── Radial glow behind text ───────────────────────── */}
        <div style={{
          position: 'absolute',
          width: '520px', height: '200px',
          background: `radial-gradient(ellipse at center, rgba(246,201,14,0.12) 0%, transparent 70%)`,
          animation: drawn ? 'qk-glow-pulse 2.4s ease-in-out infinite' : 'none',
          opacity: drawn ? 1 : 0,
          transition: 'opacity 0.6s ease',
          pointerEvents: 'none',
        }} />

        {/* ── Letters ───────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'baseline',
          gap: '1px',
          position: 'relative', zIndex: 1,
        }}>
          {LETTERS.map(({ char, yellow }, i) => {
            const color  = yellow ? BRAND : '#FFFFFF';
            const delay  = `${i * LETTER_DELAY}s`;

            return (
              <span
                key={i}
                style={{
                  fontFamily:  "'Outfit', 'Inter', sans-serif",
                  fontWeight:  '800',
                  fontSize:    'clamp(72px, 14vw, 100px)',
                  lineHeight:  '1',
                  color:       filled ? color : 'transparent',
                  WebkitTextStroke: filled ? '0px' : `2px ${color}`,
                  display:     'inline-block',
                  opacity:     0,
                  // letter rises up and strokes appear, staggered
                  animation: drawn
                    ? `qk-rise ${LETTER_DUR}s cubic-bezier(0.2,0,0.2,1) ${delay} forwards`
                    : 'none',
                  // fill transition after rise
                  transition: filled
                    ? `color 0.3s ease ${i * 0.04}s, -webkit-text-stroke 0.3s ease ${i * 0.04}s`
                    : 'none',
                  // subtle per-letter drop shadow for depth
                  textShadow: filled
                    ? yellow
                      ? `0 0 40px rgba(246,201,14,0.4), 0 4px 20px rgba(0,0,0,0.5)`
                      : `0 0 40px rgba(255,255,255,0.12), 0 4px 20px rgba(0,0,0,0.5)`
                    : 'none',
                }}
              >
                {char}
              </span>
            );
          })}
        </div>

        {/* ── Animated underline ────────────────────────────── */}
        <div style={{
          width: 'clamp(300px, 64vw, 460px)',
          height: '3px',
          marginTop: '10px',
          borderRadius: '2px',
          background: `linear-gradient(90deg, transparent 0%, #FFFFFF 30%, ${BRAND} 70%, transparent 100%)`,
          transformOrigin: 'left center',
          transform: 'scaleX(0)',
          animation: filled
            ? 'qk-underline 0.6s cubic-bezier(0.4,0,0.2,1) forwards'
            : 'none',
          opacity: 0.6,
        }} />

        {/* ── Decorative dots ───────────────────────────────── */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '4px', height: '4px',
              borderRadius: '50%',
              background: BRAND,
              top:  `${20 + Math.sin(i * 1.3) * 30}%`,
              left: `${8 + i * 21}%`,
              opacity: drawn ? 1 : 0,
              animation: drawn
                ? `qk-dot-blink 1.8s ease-in-out infinite ${i * 0.3}s`
                : 'none',
              transition: 'opacity 0.4s ease',
            }}
          />
        ))}
        {[...Array(5)].map((_, i) => (
          <div
            key={`r${i}`}
            style={{
              position: 'absolute',
              width: '3px', height: '3px',
              borderRadius: '50%',
              background: '#FFFFFF',
              top:  `${55 + Math.cos(i * 1.1) * 28}%`,
              right: `${6 + i * 18}%`,
              opacity: drawn ? 1 : 0,
              animation: drawn
                ? `qk-dot-blink 2.2s ease-in-out infinite ${i * 0.25}s`
                : 'none',
              transition: 'opacity 0.4s ease',
            }}
          />
        ))}

        {/* ── Tagline ───────────────────────────────────────── */}
        <p style={{
          marginTop: '28px',
          fontFamily: "'Outfit', sans-serif",
          fontSize:   '11px',
          fontWeight: '600',
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          color: '#444',
          opacity:    filled ? 1 : 0,
          transition: filled ? 'opacity 0.5s ease 0.25s' : 'none',
          position: 'relative', zIndex: 1,
        }}>
          Everything you need&nbsp;·&nbsp;Delivered fast
        </p>

        {/* ── Progress bar ──────────────────────────────────── */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '2px', background: '#1A1A1A',
        }}>
          <div style={{
            height: '100%',
            background: `linear-gradient(90deg, ${BRAND}, #FFFFFF)`,
            animation: drawn
              ? `qk-bar ${TOTAL_DRAW_MS + 300}ms cubic-bezier(0.4,0,0.2,1) forwards`
              : 'none',
            width: 0,
          }} />
        </div>
      </div>
    </>
  );
}
