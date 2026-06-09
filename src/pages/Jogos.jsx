import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ConfigAPI() {
  const salva = !!localStorage.getItem('aletrai_claude_key');
  const [aberta, setAberta] = useState(false);
  const [chave, setChave] = useState('');
  const [status, setStatus] = useState(salva ? 'salva' : 'vazia');

  function salvar() {
    if (!chave.startsWith('sk-ant')) return;
    localStorage.setItem('aletrai_claude_key', chave);
    setStatus('salva');
    setChave('');
    setAberta(false);
  }

  function remover() {
    localStorage.removeItem('aletrai_claude_key');
    setStatus('vazia');
    setAberta(false);
  }

  return (
    <div className="mx-4 mb-4">
      <button
        onClick={() => setAberta(a => !a)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all"
        style={{
          background: status === 'salva' ? 'rgba(0,200,100,0.08)' : 'rgba(255,255,255,0.04)',
          borderColor: status === 'salva' ? 'rgba(0,200,100,0.25)' : 'rgba(255,255,255,0.1)',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">🔑</span>
          <span className="text-sm font-semibold text-white/80">Chave da API Claude</span>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${status === 'salva' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-gray-500'}`}>
          {status === 'salva' ? '✓ Configurada' : 'Não configurada'}
        </span>
      </button>

      {aberta && (
        <div className="mt-2 bg-gray-900 border border-white/10 rounded-2xl p-4 space-y-3">
          <p className="text-xs text-gray-500">Cole sua chave da API Anthropic para que a IA gere perguntas personalizadas nos jogos.</p>
          <input
            type="password"
            value={chave}
            onChange={e => setChave(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && salvar()}
            placeholder="sk-ant-..."
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 placeholder-gray-700"
          />
          <div className="flex gap-2">
            <button onClick={salvar} disabled={!chave.startsWith('sk-ant')}
              className="flex-1 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-30 text-white text-sm font-bold rounded-xl transition-colors">
              Salvar
            </button>
            {status === 'salva' && (
              <button onClick={remover}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-bold rounded-xl border border-red-500/20 transition-colors">
                Remover
              </button>
            )}
          </div>
          <a href="https://console.anthropic.com" target="_blank" rel="noreferrer"
            className="block text-center text-xs text-violet-400 hover:underline">
            Obter chave em console.anthropic.com →
          </a>
        </div>
      )}
    </div>
  );
}

const JOGOS = [
  {
    id: 'chao-e-lava',
    nome: 'Chão é Lava',
    desc: 'Suba, aprenda e sobreviva',
    tag: 'ROGUELIKE',
    disponivel: true,
    rota: '/jogos/chao-e-lava',
    bg: 'from-orange-500 to-red-700',
    brilho: '#ff330044',
    emoji: '🌋',
    estrelas: 4,
  },
  {
    id: 'dungeon-quiz',
    nome: 'Dungeon Quiz',
    desc: 'Derrote bosses respondendo perguntas',
    tag: 'RPG',
    disponivel: true,
    rota: '/jogos/dungeon-quiz',
    bg: 'from-blue-600 to-purple-800',
    brilho: '#6600ff22',
    emoji: '🗡️',
    estrelas: 4,
  },
  {
    id: 'space-run',
    nome: 'Space Run',
    desc: 'Nave em modo endless runner',
    tag: 'ENDLESS',
    disponivel: false,
    bg: 'from-cyan-600 to-blue-900',
    brilho: '#00ccff22',
    emoji: '🚀',
    estrelas: 0,
  },
  {
    id: 'word-blast',
    nome: 'Word Blast',
    desc: 'Forme palavras antes do tempo',
    tag: 'PUZZLE',
    disponivel: false,
    bg: 'from-green-500 to-teal-800',
    brilho: '#00ff8822',
    emoji: '💥',
    estrelas: 0,
  },
];

function Estrelas({ n }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`text-xs ${i <= n ? 'text-amber-400' : 'text-white/20'}`}>★</span>
      ))}
    </div>
  );
}

export default function Jogos() {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  return (
    <div className="min-h-screen bg-gray-950 pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <p className="text-gray-500 text-sm">Olá, {usuario?.nome?.split(' ')[0]} 👋</p>
        <h1 className="text-2xl font-black text-white mt-0.5">Escolha um jogo</h1>
        <p className="text-gray-600 text-xs mt-1">Aprenda jogando — cada boss tem perguntas sobre o seu tema</p>
      </div>

      {/* Destaque — jogo principal */}
      <div className="px-4 mb-4">
        <div
          onClick={() => navigate('/jogos/chao-e-lava')}
          className="relative rounded-3xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
          style={{ background: 'linear-gradient(135deg, #ff5500, #cc0000)' }}
        >
          {/* Fundo decorativo */}
          <div className="absolute inset-0 opacity-20">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="absolute rounded-full bg-white"
                style={{
                  width: 4 + (i % 3) * 4,
                  height: 4 + (i % 3) * 4,
                  top: `${(i * 37) % 100}%`,
                  left: `${(i * 53) % 100}%`,
                  opacity: 0.3 + (i % 4) * 0.1,
                }}
              />
            ))}
          </div>

          <div className="relative p-5 flex items-center gap-4">
            <div className="text-7xl drop-shadow-lg">🌋</div>
            <div className="flex-1 text-white">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">ROGUELIKE</span>
                <span className="bg-amber-400/30 text-amber-300 text-xs font-bold px-2 py-0.5 rounded-full">⚡ DISPONÍVEL</span>
              </div>
              <h2 className="text-2xl font-black leading-tight">Chão é Lava</h2>
              <p className="text-white/70 text-sm mt-0.5">Suba. Aprenda. Responda. Sobreviva.</p>
              <Estrelas n={4} />
            </div>
          </div>
          <div className="px-5 pb-4">
            <div className="bg-white text-orange-600 font-black text-sm py-2.5 rounded-2xl text-center">
              🎮 JOGAR AGORA
            </div>
          </div>
        </div>
      </div>

      {/* Grid — Dungeon Quiz disponível + em breve */}
      <div className="px-4">
        {JOGOS.filter(j => j.disponivel && j.id !== 'chao-e-lava').map(jogo => (
          <div key={jogo.id} onClick={() => navigate(jogo.rota)}
            className="rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform mb-3">
            <div className={`bg-gradient-to-br ${jogo.bg} p-5 flex items-center gap-4`}>
              <div className="text-5xl">{jogo.emoji}</div>
              <div className="flex-1 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-black/30 text-white/80 text-xs font-bold px-2 py-0.5 rounded-full">{jogo.tag}</span>
                  <span className="bg-blue-400/30 text-blue-200 text-xs font-bold px-2 py-0.5 rounded-full">⚡ DISPONÍVEL</span>
                </div>
                <h3 className="text-xl font-black">{jogo.nome}</h3>
                <p className="text-white/70 text-sm">{jogo.desc}</p>
                <Estrelas n={jogo.estrelas} />
              </div>
              <span className="text-white/60 text-2xl">›</span>
            </div>
          </div>
        ))}

        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3 mt-1">Em breve</p>
        <div className="grid grid-cols-2 gap-3">
          {JOGOS.filter(j => !j.disponivel).map(jogo => (
            <div key={jogo.id}
              className="relative rounded-2xl overflow-hidden opacity-60"
            >
              <div className={`bg-gradient-to-br ${jogo.bg} p-4`}>
                <div className="text-4xl mb-2">{jogo.emoji}</div>
                <span className="bg-black/30 text-white/70 text-xs font-bold px-2 py-0.5 rounded-full">
                  {jogo.tag}
                </span>
                <h3 className="text-white font-black text-base mt-2 leading-tight">{jogo.nome}</h3>
                <p className="text-white/60 text-xs mt-0.5">{jogo.desc}</p>
                <div className="mt-3 bg-black/30 rounded-xl py-1.5 text-center">
                  <span className="text-white/50 text-xs font-bold">EM BREVE</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-700 text-xs mt-4 mb-2">Mais jogos chegando em breve 👾</p>
      </div>

      {/* Config API */}
      <ConfigAPI />
    </div>
  );
}
