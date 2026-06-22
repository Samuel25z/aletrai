import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Partículas de fogo que saem para fora do card
const CHAMAS = [
  { left: '4%',  delay: '0s',     dur: '0.8s',  size: 14, cor: '#ff6b00' },
  { left: '11%', delay: '0.18s',  dur: '0.95s', size: 20, cor: '#ffd000' },
  { left: '19%', delay: '0.05s',  dur: '0.7s',  size: 11, cor: '#ff3300' },
  { left: '27%', delay: '0.32s',  dur: '1.0s',  size: 22, cor: '#ff6b00' },
  { left: '35%', delay: '0.12s',  dur: '0.75s', size: 16, cor: '#ffd000' },
  { left: '43%', delay: '0.25s',  dur: '0.85s', size: 24, cor: '#ff4500' },
  { left: '50%', delay: '0.0s',   dur: '0.9s',  size: 18, cor: '#ff6b00' },
  { left: '58%', delay: '0.22s',  dur: '0.7s',  size: 13, cor: '#ffd000' },
  { left: '66%', delay: '0.38s',  dur: '1.0s',  size: 20, cor: '#ff3300' },
  { left: '74%', delay: '0.08s',  dur: '0.8s',  size: 17, cor: '#ff6b00' },
  { left: '82%', delay: '0.15s',  dur: '0.9s',  size: 15, cor: '#ffd000' },
  { left: '91%', delay: '0.28s',  dur: '0.75s', size: 12, cor: '#ff4500' },
  { left: '97%', delay: '0.1s',   dur: '0.85s', size: 16, cor: '#ff6b00' },
];

function FogoEfeito() {
  return (
    <>
      <style>{`
        @keyframes chamaSubir {
          0%   { transform: translateY(0) scaleX(1) rotate(0deg); opacity: 1; }
          40%  { transform: translateY(-22px) scaleX(0.75) rotate(-4deg); opacity: 0.8; }
          100% { transform: translateY(-60px) scaleX(0.2) rotate(6deg); opacity: 0; }
        }
        @keyframes brasaFlutuar {
          0%   { transform: translateY(0) translateX(0); opacity: 1; }
          100% { transform: translateY(-80px) translateX(8px); opacity: 0; }
        }
      `}</style>

      {/* Chamas principais */}
      <div style={{ position: 'absolute', bottom: -2, left: 0, right: 0, height: 0, pointerEvents: 'none', zIndex: 30 }}>
        {CHAMAS.map((c, i) => (
          <div key={i} style={{
            position: 'absolute',
            bottom: 0,
            left: c.left,
            width: c.size,
            height: c.size * 1.8,
            borderRadius: '50% 50% 35% 35% / 60% 60% 40% 40%',
            background: `radial-gradient(ellipse at 50% 90%, ${c.cor} 0%, #ff220088 60%, transparent 100%)`,
            animation: `chamaSubir ${c.dur} ${c.delay} infinite ease-out`,
            filter: 'blur(1px)',
          }} />
        ))}

        {/* Brasas — pontinhos que flutuam */}
        {[...Array(8)].map((_, i) => (
          <div key={`brasa-${i}`} style={{
            position: 'absolute',
            bottom: 0,
            left: `${10 + i * 12}%`,
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: '#ffd700',
            animation: `brasaFlutuar ${0.9 + i * 0.15}s ${i * 0.1}s infinite ease-out`,
            boxShadow: '0 0 4px #ff6b00',
          }} />
        ))}
      </div>
    </>
  );
}

const MORCEGOS = [
  { top: 15,  dur: 2.6, size: 26, dir:  1, offset: 0.1  },
  { top: 60,  dur: 3.2, size: 17, dir: -1, offset: 0.55 },
  { top: 90,  dur: 2.9, size: 22, dir:  1, offset: 0.75 },
  { top: 35,  dur: 3.5, size: 13, dir:  1, offset: 0.35 },
  { top: 75,  dur: 2.3, size: 19, dir: -1, offset: 0.6  },
  { top: 110, dur: 2.7, size: 15, dir:  1, offset: 0.85 },
  { top: 50,  dur: 3.0, size: 11, dir: -1, offset: 0.2  },
];

function MorcegosEfeito() {
  return (
    <>
      <style>{`
        @keyframes voarDir {
          from { left: -50px; }
          to   { left: 110%;  }
        }
        @keyframes voarEsq {
          from { left: 110%;  }
          to   { left: -50px; }
        }
        @keyframes baterAsas {
          0%, 100% { transform: scaleY(1); }
          50%       { transform: scaleY(0.3); }
        }
      `}</style>
      {MORCEGOS.map((m, i) => {
        // Delay negativo = morcego já nasce no meio do voo
        const flyDelay = `${-(m.offset * m.dur).toFixed(2)}s`;
        const wingDelay = `${-(m.offset * 0.22).toFixed(2)}s`;
        return (
          <span key={i} style={{
            position: 'absolute',
            top: m.top,
            fontSize: m.size,
            pointerEvents: 'none',
            zIndex: 10,
            transform: m.dir === -1 ? 'scaleX(-1)' : 'none',
            animation: `${m.dir === 1 ? 'voarDir' : 'voarEsq'} ${m.dur}s ${flyDelay} infinite linear,
                        baterAsas 0.22s ${wingDelay} infinite ease-in-out`,
            filter: 'drop-shadow(0 0 5px rgba(100,0,180,0.9))',
          }}>🦇</span>
        );
      })}
    </>
  );
}

// ── Nave igual à do Space Run (replica drawNave do jogo) ────────────────────
function NaveSVG({ size = 46 }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="-40 -24 80 48" style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id="naveFlame" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ff5000" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ff8a00" />
          <stop offset="1" stopColor="#ffe066" />
        </linearGradient>
      </defs>
      <polygon points="-22,-7 -38,0 -22,7" fill="url(#naveFlame)" />
      <polygon points="26,0 -18,-13 -12,0 -18,13" fill="#cbd5e1" />
      <polygon points="-4,-10 -20,-22 -14,-7" fill="#7c3aed" />
      <polygon points="-4,10 -20,22 -14,7" fill="#7c3aed" />
      <ellipse cx="6" cy="0" rx="8" ry="5" fill="#38bdf8" />
      <ellipse cx="8" cy="-1" rx="3" ry="2" fill="#e0f2fe" />
    </svg>
  );
}

// ── Asteroide igual ao do jogo (replica drawAsteroide) ──────────────────────
function AsteroideSVG({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="-20 -20 40 40" style={{ display: 'block' }}>
      <polygon points="16,2 11,12 2,16 -9,13 -16,3 -12,-9 -2,-16 10,-11"
        fill="#6b7280" stroke="#9ca3af" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="-4" cy="-3" r="3.6" fill="#4b5563" />
      <circle cx="5" cy="4" r="2.6" fill="#4b5563" />
    </svg>
  );
}

// ── Cobra igual à do jogo (replica drawCobra) ───────────────────────────────
function CobraSVG({ size = 30 }) {
  const n = 6;
  const segs = [];
  for (let i = 0; i < n; i++) {
    const x = 116 - i * 18;
    const head = i === 0;
    const r = head ? 15 : 12;
    const fill = head ? '#16a34a' : (i % 2 === 0 ? '#22c55e' : '#4ade80');
    segs.push({ x, r, fill, head });
  }
  return (
    <svg height={size} width={size * (132 / 34)} viewBox="0 0 132 34"
      style={{ display: 'block', overflow: 'visible' }}>
      {segs.slice().reverse().map((s, i) => (
        <rect key={i} x={s.x - s.r} y={17 - s.r} width={s.r * 2} height={s.r * 2}
          rx={s.head ? 7 : 5} fill={s.fill} />
      ))}
      {/* olhos na cabeça (à direita), olhando pra frente */}
      <circle cx="121" cy="12" r="3" fill="#fff" />
      <circle cx="121" cy="22" r="3" fill="#fff" />
      <circle cx="123" cy="12" r="1.4" fill="#0f172a" />
      <circle cx="123" cy="22" r="1.4" fill="#0f172a" />
    </svg>
  );
}

// ── Space Run: cena espacial estilo Star Wars ──────────────────────────────
const ASTEROIDES = [
  { top: 18,  dur: 2.4, size: 26, delay: 0   },
  { top: 78,  dur: 3.1, size: 16, delay: 0.8 },
  { top: 108, dur: 2.0, size: 34, delay: 0.3 },
  { top: 40,  dur: 2.8, size: 13, delay: 1.4 },
  { top: 95,  dur: 3.4, size: 20, delay: 0.6 },
];
const STREAKS = [22, 40, 58, 78, 100, 120];
const LASERS = [
  { top: 56, dur: 0.7, delay: 0.0,  cor: '#ff3b3b' },
  { top: 62, dur: 0.7, delay: 0.35, cor: '#3bff6b' },
  { top: 59, dur: 0.7, delay: 0.7,  cor: '#ff3b3b' },
];

function EspacoEfeito() {
  return (
    <>
      <style>{`
        @keyframes esTravessia { from { left: 108%; } to { left: -18%; } }
        @keyframes esNave { 0% { left: -18%; transform: translateY(0); }
                            50% { transform: translateY(-6px); }
                            100% { left: 108%; transform: translateY(0); } }
        @keyframes esLaser { from { left: 24%; opacity: 1; } to { left: 115%; opacity: 0.2; } }
        @keyframes esStreak { from { transform: translateX(0); opacity: 0; }
                              20% { opacity: 1; } to { transform: translateX(-130px); opacity: 0; } }
        @keyframes esBoom { 0%,100% { transform: scale(0.2); opacity: 0; }
                            40% { transform: scale(1.25); opacity: 1; } 70% { transform: scale(0.9); opacity: 0.7; } }
        @keyframes esSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
      {/* hiperespaço — riscos de luz */}
      {STREAKS.map((top, i) => (
        <span key={`st-${i}`} style={{
          position: 'absolute', top, right: `${5 + i * 14}%`, width: 30, height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9))',
          animation: `esStreak ${0.5 + (i % 3) * 0.15}s ${i * 0.12}s infinite linear`,
          zIndex: 8,
        }} />
      ))}
      {/* asteroides girando */}
      {ASTEROIDES.map((a, i) => (
        <span key={`as-${i}`} style={{
          position: 'absolute', top: a.top, left: '108%',
          animation: `esTravessia ${a.dur}s ${-a.delay}s infinite linear`,
          filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.5))', zIndex: 9,
        }}>
          <span style={{ display: 'inline-block', animation: `esSpin ${a.dur}s linear infinite` }}>
            <AsteroideSVG size={a.size} />
          </span>
        </span>
      ))}
      {/* nave do jogo atravessando */}
      <span style={{
        position: 'absolute', top: 50, left: '-18%',
        animation: 'esNave 3.2s 0s infinite ease-in-out',
        filter: 'drop-shadow(0 0 6px rgba(120,180,255,0.9))', zIndex: 12,
      }}>
        <NaveSVG size={48} />
      </span>
      {/* tiros de blaster saindo da nave */}
      {LASERS.map((l, i) => (
        <span key={`la-${i}`} style={{
          position: 'absolute', top: l.top, left: '24%', width: 26, height: 3, borderRadius: 2,
          background: `linear-gradient(90deg, transparent, ${l.cor})`,
          boxShadow: `0 0 8px ${l.cor}`,
          animation: `esLaser ${l.dur}s ${l.delay}s infinite linear`, zIndex: 11,
        }} />
      ))}
      {/* explosão (asteroide destruído) */}
      <span style={{
        position: 'absolute', top: 62, left: '74%',
        animation: 'esBoom 1.6s 0.4s infinite ease-out', zIndex: 11,
      }}>
        <svg width="34" height="34" viewBox="-20 -20 40 40" style={{ display: 'block' }}>
          <polygon points="0,-19 5,-6 18,-7 8,2 13,15 0,7 -13,15 -8,2 -18,-7 -5,-6"
            fill="#ff8a00" />
          <circle cx="0" cy="0" r="6" fill="#ffe066" />
        </svg>
      </span>
    </>
  );
}

// ── Cobra do Saber: cobra correndo ATRÁS das bolinhas coloridas ─────────────
// A cobra fica atrás (menos avançada) e persegue as bolinhas que vão na frente.
const BOLINHAS = [
  { cor: '#0ea5e9', delay: 0.81 },
  { cor: '#f59e0b', delay: 0.69 },
  { cor: '#a855f7', delay: 0.57 },
  { cor: '#ec4899', delay: 0.45 },
];

function CobraEfeito() {
  return (
    <>
      <style>{`
        @keyframes cbCorrer { from { left: -22%; } to { left: 116%; } }
        @keyframes cbSerpentear { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
      `}</style>
      {/* bolinhas coloridas na frente (fugindo) */}
      {BOLINHAS.map((b, i) => (
        <span key={`bo-${i}`} style={{
          position: 'absolute', top: 64, left: '-22%',
          animation: `cbCorrer 3s -${b.delay}s infinite linear`, zIndex: 9,
        }}>
          <span style={{
            display: 'inline-block', width: 14, height: 14, borderRadius: '50%',
            background: b.cor, boxShadow: `0 0 8px ${b.cor}`,
            animation: `cbSerpentear 0.7s ${i * 0.1}s infinite ease-in-out`,
          }} />
        </span>
      ))}
      {/* cobra do jogo logo atrás, perseguindo */}
      <span style={{
        position: 'absolute', top: 54, left: '-22%',
        animation: 'cbCorrer 3s -0.2s infinite linear', zIndex: 10,
        filter: 'drop-shadow(0 0 5px rgba(34,197,94,0.8))',
      }}>
        <span style={{ display: 'inline-block', animation: 'cbSerpentear 0.7s 0.35s infinite ease-in-out' }}>
          <CobraSVG size={30} />
        </span>
      </span>
    </>
  );
}

function CardJogo({ jogo, onClick }) {
  const [hovered, setHovered] = useState(false);
  const isLava    = jogo.id === 'chao-e-lava';
  const isDungeon = jogo.id === 'dungeon-quiz';
  const isSpace   = jogo.id === 'space-run';
  const isCobra   = jogo.id === 'cobra-saber';

  return (
    <div className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>

      {isLava && hovered && <FogoEfeito />}

      <button onClick={onClick}
        className="w-full rounded-2xl border border-gray-100 shadow-sm text-left transition-all duration-300 overflow-hidden block"
        style={{
          boxShadow: isLava && hovered    ? '0 0 24px rgba(255,100,0,0.4)'
                   : isDungeon && hovered ? '0 0 24px rgba(124,58,237,0.45)'
                   : isSpace && hovered   ? '0 0 24px rgba(14,165,233,0.45)'
                   : isCobra && hovered   ? '0 0 24px rgba(34,197,94,0.45)'
                   : '',
        }}>

        <div className="relative group" style={{ height: 140, overflow: 'hidden' }}>
          {jogo.banner ? (
            <img src={jogo.banner} alt={jogo.nome}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl"
              style={{ background: jogo.bg }}>
              {jogo.emoji}
            </div>
          )}

          {/* Efeitos de hover — dentro do overflow hidden */}
          {isDungeon && hovered && <MorcegosEfeito />}
          {isSpace   && hovered && <EspacoEfeito />}
          {isCobra   && hovered && <CobraEfeito />}

          {/* Overlay + botão play */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-2xl"
                style={{ boxShadow: '0 0 0 5px rgba(255,255,255,0.25)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M8 5.14v14l11-7-11-7z" fill="#7c3aed" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}


const JOGOS = [
  {
    id: 'chao-e-lava',
    nome: 'Chão é Lava',
    desc: 'Suba, responda e sobreviva',
    tag: 'Roguelike',
    disponivel: true,
    rota: '/jogos/chao-e-lava',
    cor: '#f97316',
    bg: '#fff7ed',
    emoji: '🌋',
    banner: '/banners/chao-e-lava.jpg',
  },
  {
    id: 'dungeon-quiz',
    nome: 'Dungeon Quiz',
    desc: 'Derrote bosses respondendo perguntas',
    tag: 'RPG',
    disponivel: true,
    rota: '/jogos/dungeon-quiz',
    cor: '#7c3aed',
    bg: '#f5f3ff',
    emoji: '🗡️',
    banner: '/banners/Dungeon.jpg',
  },
  {
    id: 'space-run',
    nome: 'Space Run',
    desc: 'Voe, colete estrelas e responda',
    tag: 'Endless',
    disponivel: true,
    rota: '/jogos/space-run',
    cor: '#0ea5e9',
    bg: '#f0f9ff',
    emoji: '🚀',
    banner: '/banners/space-run.jpg',
  },
  {
    id: 'cobra-saber',
    nome: 'Cobra do Saber',
    desc: 'Guie a cobra até a resposta certa',
    tag: 'Arcade',
    disponivel: true,
    rota: '/jogos/cobra-saber',
    cor: '#22c55e',
    bg: '#f0fdf4',
    emoji: '🐍',
    banner: '/banners/cobra-saber.jpg',
  },
];

export default function Jogos() {
  const navigate = useNavigate();
  const disponiveis = JOGOS.filter(j => j.disponivel);
  const emBreve = JOGOS.filter(j => !j.disponivel);

  return (
    <div className="max-w-2xl mx-auto px-5 pt-6 pb-8">
      <div className="flex items-center gap-3 mb-6 mt-1">
        <div className="flex-1 h-px bg-gray-200" />
        <div className="bg-violet-600 px-5 py-2 rounded-full">
          <h1 className="text-2xl text-white"
            style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.06em' }}>
            Escolha um jogo
          </h1>
        </div>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <div className="space-y-4">
        {disponiveis.map(jogo => (
          <CardJogo key={jogo.id} jogo={jogo} onClick={() => navigate(`/lobby/${jogo.id}`)} />
        ))}
      </div>

      {emBreve.length > 0 && (
        <>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-8 mb-3">Em breve</p>
          <div className="grid grid-cols-2 gap-3">
            {emBreve.map(jogo => (
              <div key={jogo.id} className="bg-white rounded-2xl p-4 border border-gray-100 opacity-60">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl mb-3"
                  style={{ background: jogo.bg }}>
                  {jogo.emoji}
                </div>
                <p className="text-gray-900 font-black text-sm">{jogo.nome}</p>
                <p className="text-gray-400 text-xs mt-0.5">{jogo.desc}</p>
                <p className="text-gray-300 text-xs font-bold mt-3">Em breve</p>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}
