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

function CardJogo({ jogo, onClick }) {
  const [hovered, setHovered] = useState(false);
  const isLava    = jogo.id === 'chao-e-lava';
  const isDungeon = jogo.id === 'dungeon-quiz';

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

          {/* Morcegos — dentro do overflow hidden */}
          {isDungeon && hovered && <MorcegosEfeito />}

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
