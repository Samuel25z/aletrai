import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

// ── Badges SVG por rank ──────────────────────────────────────────────────────

function BadgeIniciante({ size = 64, active }) {
  const c = active ? '#9ca3af' : '#d1d5db';
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="28" fill={active ? '#f3f4f6' : '#f9fafb'} stroke={c} strokeWidth="3"/>
      <path d="M22 24l20 16M42 24L22 40" stroke={c} strokeWidth="3.5" strokeLinecap="round"/>
      <circle cx="32" cy="32" r="4" fill={c}/>
      {active && <circle cx="32" cy="32" r="30" stroke={c} strokeWidth="1" strokeDasharray="4 3" opacity="0.5"/>}
    </svg>
  );
}

function BadgeAventureiro({ size = 64, active }) {
  const c = active ? '#16a34a' : '#d1d5db';
  const bg = active ? '#f0fdf4' : '#f9fafb';
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path d="M32 6L8 18v14c0 13 10 22 24 26 14-4 24-13 24-26V18L32 6z" fill={bg} stroke={c} strokeWidth="3"/>
      <path d="M22 32l7 7 13-14" stroke={c} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      {active && <path d="M32 10L12 20v12c0 10 8 18 20 22 12-4 20-12 20-22V20L32 10z" stroke={c} strokeWidth="1" opacity="0.3"/>}
    </svg>
  );
}

function BadgeGuerreiro({ size = 64, active }) {
  const c = active ? '#2563eb' : '#d1d5db';
  const bg = active ? '#eff6ff' : '#f9fafb';
  // Estrela de 6 pontas
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (i * 60 - 90) * Math.PI / 180;
    const ai = ((i * 60 - 60) * Math.PI / 180);
    return `${32 + 26 * Math.cos(a)},${32 + 26 * Math.sin(a)} ${32 + 13 * Math.cos(ai)},${32 + 13 * Math.sin(ai)}`;
  }).join(' ');
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <polygon points={pts} fill={bg} stroke={c} strokeWidth="2.5" strokeLinejoin="round"/>
      <text x="32" y="38" textAnchor="middle" fontSize="18" fontWeight="900" fill={c} fontFamily="Inter,sans-serif">G</text>
      {active && <circle cx="32" cy="32" r="30" stroke={c} strokeWidth="1" strokeDasharray="3 3" opacity="0.4"/>}
    </svg>
  );
}

function BadgeMestre({ size = 64, active }) {
  const c = active ? '#7c3aed' : '#d1d5db';
  const bg = active ? '#f5f3ff' : '#f9fafb';
  // Hexágono
  const hex = Array.from({ length: 6 }, (_, i) => {
    const a = (i * 60 - 30) * Math.PI / 180;
    return `${32 + 27 * Math.cos(a)},${32 + 27 * Math.sin(a)}`;
  }).join(' ');
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <polygon points={hex} fill={bg} stroke={c} strokeWidth="3"/>
      {/* Coroa */}
      <path d="M20 40h24M20 40l4-12 8 6 8-6 4 12" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="20" cy="28" r="2.5" fill={c}/>
      <circle cx="32" cy="24" r="2.5" fill={c}/>
      <circle cx="44" cy="28" r="2.5" fill={c}/>
      {active && <polygon points={hex} stroke={c} strokeWidth="1" strokeDasharray="4 3" opacity="0.3" transform="scale(1.08) translate(-2.5,-2.5)"/>}
    </svg>
  );
}

function BadgeLendario({ size = 64, active }) {
  const c = active ? '#d97706' : '#d1d5db';
  const c2 = active ? '#fbbf24' : '#e5e7eb';
  const bg = active ? '#fffbeb' : '#f9fafb';
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {active && <circle cx="32" cy="32" r="31" fill={c2} opacity="0.15"/>}
      {/* Diamante */}
      <path d="M32 8l16 14-16 34L16 22z" fill={bg} stroke={c} strokeWidth="2.5" strokeLinejoin="round"/>
      <path d="M16 22h32" stroke={c} strokeWidth="2"/>
      <path d="M32 8l-8 14h16z" fill={c2} opacity="0.5"/>
      {/* Brilho */}
      {active && <>
        <circle cx="20" cy="14" r="2" fill={c2} opacity="0.8"/>
        <circle cx="44" cy="18" r="1.5" fill={c2} opacity="0.6"/>
        <circle cx="50" cy="10" r="1" fill={c2} opacity="0.7"/>
      </>}
    </svg>
  );
}

// ── Definições ───────────────────────────────────────────────────────────────

const RANKS = [
  { id: 'iniciante',    nome: 'Iniciante',    xp: 0,     cor: '#9ca3af', Badge: BadgeIniciante },
  { id: 'aventureiro',  nome: 'Aventureiro',  xp: 300,   cor: '#16a34a', Badge: BadgeAventureiro },
  { id: 'guerreiro',    nome: 'Guerreiro',    xp: 1000,  cor: '#2563eb', Badge: BadgeGuerreiro },
  { id: 'mestre',       nome: 'Mestre',       xp: 3000,  cor: '#7c3aed', Badge: BadgeMestre },
  { id: 'lendario',     nome: 'Lendário',     xp: 8000,  cor: '#d97706', Badge: BadgeLendario },
];

// conquista: { id, nome, desc, emoji, check(usuario) }
const CONQUISTAS = [
  // ── Chão é Lava ──
  {
    id: 'lava_primeiro',
    cat: 'chao-e-lava',
    nome: 'Primeiro Salto',
    desc: 'Jogue Chão é Lava pela primeira vez',
    emoji: '🌋',
    check: u => (u.xpPorMateria && Object.keys(u.xpPorMateria).length > 0),
  },
  {
    id: 'lava_sobrevivente',
    cat: 'chao-e-lava',
    nome: 'Sobrevivente',
    desc: 'Complete uma rodada sem errar 3 seguidas',
    emoji: '🛡️',
    check: u => (u.xpTotal || 0) >= 200,
  },
  {
    id: 'lava_escalador',
    cat: 'chao-e-lava',
    nome: 'Escalador',
    desc: 'Alcance o nível 5 em uma única partida',
    emoji: '⬆️',
    check: u => (u.xpTotal || 0) >= 500,
  },
  {
    id: 'lava_relampago',
    cat: 'chao-e-lava',
    nome: 'Relâmpago',
    desc: 'Responda 5 perguntas seguidas corretamente',
    emoji: '⚡',
    check: u => (u.desafiosConcluidos || 0) >= 3,
  },
  {
    id: 'lava_rei',
    cat: 'chao-e-lava',
    nome: 'Rei da Lava',
    desc: 'Chegue ao topo sem perder nenhuma vida',
    emoji: '👑',
    check: u => (u.xpTotal || 0) >= 2000,
  },

  // ── Dungeon Quiz ──
  {
    id: 'dq_primeiro',
    cat: 'dungeon-quiz',
    nome: 'Primeiro Sangue',
    desc: 'Derrote seu primeiro boss',
    emoji: '⚔️',
    check: u => {
      const bv = u.bossesVencidos || {};
      return Object.values(bv).some(arr => Array.isArray(arr) && arr.length > 0);
    },
  },
  {
    id: 'dq_cacador',
    cat: 'dungeon-quiz',
    nome: 'Caçador',
    desc: 'Derrote bosses em 3 matérias diferentes',
    emoji: '🗡️',
    check: u => {
      const bv = u.bossesVencidos || {};
      return Object.values(bv).filter(arr => Array.isArray(arr) && arr.length > 0).length >= 3;
    },
  },
  {
    id: 'dq_sabio',
    cat: 'dungeon-quiz',
    nome: 'Sábio',
    desc: 'Acumule 1000 XP jogando Dungeon Quiz',
    emoji: '📚',
    check: u => (u.xpTotal || 0) >= 1000,
  },
  {
    id: 'dq_exterminador',
    cat: 'dungeon-quiz',
    nome: 'Exterminador',
    desc: 'Derrote um boss sem errar nenhuma pergunta',
    emoji: '💀',
    check: u => (u.xpTotal || 0) >= 3000,
  },
  {
    id: 'dq_mestre',
    cat: 'dungeon-quiz',
    nome: 'Mestre da Masmorra',
    desc: 'Vença todos os bosses disponíveis',
    emoji: '🏰',
    check: u => {
      const bv = u.bossesVencidos || {};
      return Object.values(bv).flat().length >= 10;
    },
  },

  // ── Space Run ──
  {
    id: 'sr_decolagem',
    cat: 'space-run',
    nome: 'Decolagem',
    desc: 'Jogue Space Run pela primeira vez',
    emoji: '🚀',
    check: () => parseInt(localStorage.getItem('aletrai_spacerun_recorde') || '0', 10) > 0,
  },
  {
    id: 'sr_piloto',
    cat: 'space-run',
    nome: 'Piloto Espacial',
    desc: 'Faça 300 pontos em uma partida',
    emoji: '🛸',
    check: () => parseInt(localStorage.getItem('aletrai_spacerun_recorde') || '0', 10) >= 300,
  },
  {
    id: 'sr_ace',
    cat: 'space-run',
    nome: 'Ás das Estrelas',
    desc: 'Faça 800 pontos em uma partida',
    emoji: '🌠',
    check: () => parseInt(localStorage.getItem('aletrai_spacerun_recorde') || '0', 10) >= 800,
  },

  // ── Cobra do Saber ──
  {
    id: 'cs_mordida',
    cat: 'cobra-saber',
    nome: 'Primeira Mordida',
    desc: 'Jogue Cobra do Saber pela primeira vez',
    emoji: '🐍',
    check: () => parseInt(localStorage.getItem('aletrai_cobra_recorde') || '0', 10) > 0,
  },
  {
    id: 'cs_crescida',
    cat: 'cobra-saber',
    nome: 'Cobra Crescida',
    desc: 'Faça 500 pontos em uma partida',
    emoji: '🟢',
    check: () => parseInt(localStorage.getItem('aletrai_cobra_recorde') || '0', 10) >= 500,
  },
  {
    id: 'cs_sabia',
    cat: 'cobra-saber',
    nome: 'Sábia Serpente',
    desc: 'Faça 1200 pontos em uma partida',
    emoji: '🧠',
    check: () => parseInt(localStorage.getItem('aletrai_cobra_recorde') || '0', 10) >= 1200,
  },

  // ── Gerais ──
  {
    id: 'geral_conta',
    cat: 'geral',
    nome: 'Bem-vindo!',
    desc: 'Crie sua conta no AletrAI',
    emoji: '🎉',
    check: () => true,
  },
  {
    id: 'geral_sequencia',
    cat: 'geral',
    nome: 'Em Chamas',
    desc: 'Faça login 3 dias seguidos',
    emoji: '🔥',
    check: u => (u.sequencia || 0) >= 3,
  },
  {
    id: 'geral_gamer',
    cat: 'geral',
    nome: 'Gamer',
    desc: 'Jogue os dois jogos disponíveis',
    emoji: '🎮',
    check: u => {
      const bv = u.bossesVencidos || {};
      const xpm = u.xpPorMateria || {};
      return Object.keys(bv).length > 0 && Object.keys(xpm).length > 0;
    },
  },
  {
    id: 'geral_xp500',
    cat: 'geral',
    nome: 'Estrela em Ascensão',
    desc: 'Acumule 500 XP no total',
    emoji: '🌟',
    check: u => (u.xpTotal || 0) >= 500,
  },
  {
    id: 'geral_dedicado',
    cat: 'geral',
    nome: 'Dedicado',
    desc: 'Complete 10 desafios',
    emoji: '🧠',
    check: u => (u.desafiosConcluidos || 0) >= 10,
  },
];

const CATS = [
  { id: 'geral',        label: 'Geral',        cor: '#0ea5e9', banner: null },
  { id: 'chao-e-lava',  label: 'Chão é Lava',  cor: '#f97316', banner: '/banners/chao-e-lava.jpg' },
  { id: 'dungeon-quiz', label: 'Dungeon Quiz',  cor: '#7c3aed', banner: '/banners/Dungeon.jpg' },
  { id: 'space-run',    label: 'Space Run',    cor: '#0ea5e9', banner: '/banners/space-run.jpg' },
  { id: 'cobra-saber',  label: 'Cobra do Saber', cor: '#22c55e', banner: '/banners/cobra-saber.jpg' },
];

// ── Componente ────────────────────────────────────────────────────────────────

function CardConquista({ c, desbloqueada }) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
      desbloqueada ? 'bg-white border-gray-100 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-50'
    }`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${
        desbloqueada ? '' : 'grayscale'
      }`}
        style={{ background: desbloqueada ? '#f5f3ff' : '#f3f4f6' }}>
        {c.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-black text-sm ${desbloqueada ? 'text-gray-900' : 'text-gray-400'}`}>{c.nome}</p>
        <p className="text-xs text-gray-400 mt-0.5">{c.desc}</p>
      </div>
      {desbloqueada
        ? <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        : <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <rect x="2" y="4" width="6" height="5" rx="1" stroke="#9ca3af" strokeWidth="1.2"/>
              <path d="M3 4V3a2 2 0 014 0v1" stroke="#9ca3af" strokeWidth="1.2"/>
            </svg>
          </div>
      }
    </div>
  );
}

export default function Conquistas() {
  const { usuario } = useAuth();
  const xpTotal = usuario.xpTotal || usuario.xp || 0;
  const [catAtiva, setCatAtiva] = useState('geral');

  // Rank atual
  const rankAtual = [...RANKS].reverse().find(r => xpTotal >= r.xp) || RANKS[0];
  const rankIdx   = RANKS.findIndex(r => r.id === rankAtual.id);

  // Conquistas desbloqueadas
  const desbloqueadas = CONQUISTAS.filter(c => c.check(usuario)).length;

  return (
    <div className="max-w-2xl mx-auto px-5 pt-6 pb-8 space-y-6">

      {/* Título */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Conquistas</h1>
        <p className="text-gray-400 text-sm mt-0.5">{desbloqueadas} de {CONQUISTAS.length} desbloqueadas</p>
      </div>

      {/* ── Ranks ── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Seu rank</p>

        <div className="flex items-end justify-between gap-1 mb-4">
          {RANKS.map((r, i) => {
            const ativo    = i <= rankIdx;
            const current  = r.id === rankAtual.id;
            return (
              <div key={r.id} className="flex flex-col items-center gap-1.5 flex-1">
                <div className={`transition-transform ${current ? 'scale-110' : 'scale-90 opacity-60'}`}>
                  <r.Badge size={current ? 56 : 48} active={ativo} />
                </div>
                <p className={`text-xs font-bold text-center leading-tight ${current ? 'text-gray-900' : 'text-gray-400'}`}
                  style={{ fontSize: 10 }}>
                  {r.nome}
                </p>
                {current && (
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-600" />
                )}
              </div>
            );
          })}
        </div>

        {/* Barra de progresso para próximo rank */}
        {rankIdx < RANKS.length - 1 && (() => {
          const prox     = RANKS[rankIdx + 1];
          const xpBase   = rankAtual.xp;
          const xpNeeded = prox.xp - xpBase;
          const xpFeito  = Math.min(xpTotal - xpBase, xpNeeded);
          const pct      = Math.round((xpFeito / xpNeeded) * 100);
          return (
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>{rankAtual.nome}</span>
                <span>{prox.nome} · faltam {(prox.xp - xpTotal).toLocaleString('pt-BR')} XP</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: rankAtual.cor }} />
              </div>
            </div>
          );
        })()}
      </div>

      {/* ── Conquistas ── */}
      <div>
        {/* Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {CATS.map(cat => (
            <button key={cat.id} onClick={() => setCatAtiva(cat.id)}
              className="relative overflow-hidden rounded-2xl flex-shrink-0 transition-all duration-200"
              style={{
                width: 120, height: 38,
                outline: catAtiva === cat.id ? `3px solid ${cat.cor}` : '3px solid transparent',
                outlineOffset: 2,
                opacity: catAtiva === cat.id ? 1 : 0.5,
              }}>
              {cat.banner ? (
                <img src={cat.banner} alt={cat.label}
                  className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${cat.cor}cc, ${cat.cor})` }} />
              )}
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative z-10 flex items-center justify-center h-full px-2">
                <span className="text-white font-black text-xs">{cat.label}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Lista */}
        <div className="space-y-2">
          {CONQUISTAS.filter(c => c.cat === catAtiva).map(c => (
            <CardConquista key={c.id} c={c} desbloqueada={c.check(usuario)} />
          ))}
        </div>
      </div>
    </div>
  );
}
