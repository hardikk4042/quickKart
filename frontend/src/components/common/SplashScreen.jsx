// src/components/common/SplashScreen.jsx
//
// Replicates the GSAP convertToPath stroke-draw effect:
// Each letter's outline is drawn progressively via stroke-dashoffset,
// one letter at a time with a stagger. After all letters are drawn,
// the solid fill fades in. Then the screen fades out.
//
// No GSAP, no extra dependencies — pure SVG + CSS transitions.

import { useEffect, useState } from 'react';

const BRAND = '#F6C90E';

// ── Letter definitions ────────────────────────────────────────────────────────
// x positions pre-calculated for Outfit 800 at fontSize=88, viewBox width=500
// so the word is visually centred. Adjust if you switch fonts.
const LETTERS = [
  { char: 'Q', x:  19, color: '#FFFFFF' },
  { char: 'u', x:  86, color: '#FFFFFF' },
  { char: 'i', x: 141, color: '#FFFFFF' },
  { char: 'c', x: 165, color: '#FFFFFF' },
  { char: 'k', x: 217, color: '#FFFFFF' },
  { char: 'K', x: 277, color: BRAND     },
  { char: 'a', x: 341, color: BRAND     },
  { char: 'r', x: 396, color: BRAND     },
  { char: 't', x: 436, color: BRAND     },
];

const LETTER_DRAW_DUR = 0.52;   // seconds: how long one letter takes to draw
const LETTER_STAGGER  = 0.36;   // seconds: gap between each letter start
const TOTAL_DRAW_MS   = ((LETTERS.length - 1) * LETTER_STAGGER + LETTER_DRAW_DUR) * 1000;
// = 8 * 0.36 + 0.52 = 3.4s

export default function SplashScreen({ onDone }) {
  // 'idle' → 'draw' → 'fill' → 'fade' → 'done'
  const [phase, setPhase] = useState('idle');

  useEffect(() => {
    // double rAF so React has committed the DOM before transitions start
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setPhase('draw'))
    );
    const t1 = setTimeout(() => setPhase('fill'), TOTAL_DRAW_MS + 120);
    const t2 = setTimeout(() => setPhase('fade'), TOTAL_DRAW_MS + 820);
    const t3 = setTimeout(() => { setPhase('done'); onDone?.(); }, TOTAL_DRAW_MS + 1680);
    return () => { cancelAnimationFrame(raf); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  if (phase === 'done') return null;

  const drawing = phase === 'draw' || phase === 'fill' || phase === 'fade';
  const filling = phase === 'fill' || phase === 'fade';
  const fading  = phase === 'fade';

  return (
    <>
      <style>{`
        @keyframes qk-progress {
          from { width: 0 }
          to   { width: 100% }
        }
        @keyframes qk-glow {
          0%, 100% { opacity: .22; transform: scaleX(1)   scaleY(1);   }
          50%       { opacity: .38; transform: scaleX(1.05) scaleY(1.1); }
        }
      `}</style>

      {/* ── Full-screen overlay ─────────────────────────────────────── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#090909',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        opacity:    fading ? 0 : 1,
        transition: fading ? 'opacity 0.86s cubic-bezier(0.4,0,0.2,1)' : 'none',
        overflow: 'hidden',
      }}>

        {/* background grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `linear-gradient(rgba(246,201,14,.035) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(246,201,14,.035) 1px, transparent 1px)`,
          backgroundSize: '44px 44px',
        }} />

        {/* ambient glow behind text */}
        <div style={{
          position: 'absolute',
          width: '560px', height: '180px',
          background: `radial-gradient(ellipse at 50% 50%,
                         rgba(246,201,14,.14) 0%,
                         rgba(246,201,14,.04) 45%,
                         transparent 70%)`,
          pointerEvents: 'none',
          animation: drawing ? 'qk-glow 2.8s ease-in-out infinite' : 'none',
          opacity: drawing ? 1 : 0,
          transition: 'opacity .6s ease',
        }} />

        {/* ── Main SVG ─────────────────────────────────────────────── */}
        {/*
          viewBox is 500 × 105. Font-size 88. Baseline at y=88.
          Each letter is two stacked <text> nodes:
            [1] stroke-only  → stroke-dashoffset animates 1200 → 0
            [2] fill-only    → opacity 0 → 1 after strokes finish
        */}
        <svg
          viewBox="0 0 500 105"
          style={{ width: 'min(500px, 93vw)', height: 'auto', overflow: 'visible', display: 'block' }}
          aria-label="QuickKart"
        >
          {LETTERS.map(({ char, x, color }, i) => {
            const delay    = `${i * LETTER_STAGGER}s`;
            const dur      = `${LETTER_DRAW_DUR}s`;
            const glowColor = color === BRAND
              ? 'rgba(246,201,14,0.55)'
              : 'rgba(255,255,255,0.35)';

            return (
              <g key={i}>
                {/* ── stroke draw layer ── */}
                <text
                  x={x} y={88}
                  fontFamily="'Outfit', 'Inter', sans-serif"
                  fontWeight="800"
                  fontSize="88"
                  fill="none"
                  stroke={color}
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  style={{
                    strokeDasharray: 1200,
                    strokeDashoffset: drawing ? 0 : 1200,
                    transition: drawing
                      ? `stroke-dashoffset ${dur} cubic-bezier(0.4,0,0.2,1) ${delay}`
                      : 'none',
                    // subtle letter glow that appears as the stroke draws
                    filter: drawing
                      ? `drop-shadow(0 0 8px ${glowColor})`
                      : 'none',
                  }}
                >
                  {char}
                </text>

                {/* ── fill layer (fades in after all strokes done) ── */}
                <text
                  x={x} y={88}
                  fontFamily="'Outfit', 'Inter', sans-serif"
                  fontWeight="800"
                  fontSize="88"
                  fill={color}
                  stroke="none"
                  style={{
                    opacity:    filling ? 1 : 0,
                    transition: filling
                      ? `opacity 0.38s ease ${i * 0.045}s`
                      : 'none',
                    filter: filling
                      ? `drop-shadow(0 0 14px ${glowColor})`
                      : 'none',
                  }}
                >
                  {char}
                </text>
              </g>
            );
          })}
        </svg>

        {/* ── Animated underline ──────────────────────────────────── */}
        <div style={{
          width: 'min(480px, 90vw)',
          height: '2px',
          marginTop: '8px',
          borderRadius: '2px',
          background: `linear-gradient(90deg, transparent, #fff 35%, ${BRAND} 65%, transparent)`,
          transformOrigin: 'center',
          transform:  filling ? 'scaleX(1)' : 'scaleX(0)',
          transition: filling ? 'transform 0.6s cubic-bezier(0.4,0,0.2,1)' : 'none',
          opacity: 0.5,
        }} />

        {/* ── Tagline ─────────────────────────────────────────────── */}
        <p style={{
          marginTop: '22px',
          fontFamily: "'Outfit', sans-serif",
          fontSize: '11px',
          fontWeight: '600',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: '#3D3D3D',
          opacity:    filling ? 1 : 0,
          transition: filling ? 'opacity 0.5s ease 0.2s' : 'none',
        }}>
          Everything you need&nbsp;·&nbsp;Delivered fast
        </p>

        {/* ── Bottom progress bar ─────────────────────────────────── */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px',
          background: '#161616',
        }}>
          <div style={{
            height: '100%',
            background: `linear-gradient(90deg, ${BRAND}, #fff)`,
            width: 0,
            animation: drawing
              ? `qk-progress ${TOTAL_DRAW_MS + 400}ms cubic-bezier(.4,0,.2,1) forwards`
              : 'none',
          }} />
        </div>
      </div>
    </>
  );
}
