import React from 'react';
import { useNavigate } from 'react-router-dom';

const JOGOS = [
  {
    id: 'chao-e-lava',
    nome: 'Chão é Lava',
    tagline: 'Suba. Aprenda. Responda. Sobreviva.',
    descricao: 'Platformer roguelike com pixel art. Suba pelos andares, enfrente inimigos e responda perguntas nos bosses. A lava não para!',
    emoji: '🌋',
    tag: 'ROGUELIKE',
    cor: 'from-orange-600 to-red-700',
    borda: 'border-orange-500',
    disponivel: true,
  },
  {
    id: 'dungeon-quiz',
    nome: 'Dungeon Quiz',
    tagline: 'Em breve',
    descricao: 'Explore masmorras respondendo perguntas para abrir portas e derrotar monstros.',
    emoji: '🗡️',
    tag: 'RPG',
    cor: 'from-blue-700 to-purple-800',
    borda: 'border-blue-600',
    disponivel: false,
  },
  {
    id: 'space-run',
    nome: 'Space Run',
    tagline: 'Em breve',
    descricao: 'Nave espacial em endless runner — acerte as perguntas para disparar e desviar dos asteroides.',
    emoji: '🚀',
    tag: 'ENDLESS',
    cor: 'from-cyan-700 to-blue-900',
    borda: 'border-cyan-600',
    disponivel: false,
  },
];

export default function GameHub() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="px-5 py-4 flex items-center gap-3 border-b border-white/10">
        <button onClick={() => navigate('/chat')}
          className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1">
          ← Voltar ao Chat
        </button>
      </header>

      <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        <div className="text-center mb-8">
          <p className="text-xs text-violet-400 font-bold tracking-widest uppercase mb-2">Modo Jogo</p>
          <h1 className="text-3xl font-black text-white">Escolha seu jogo</h1>
          <p className="text-gray-500 text-sm mt-2">Aprenda enquanto joga. Cada derrota te ensina algo novo.</p>
        </div>

        <div className="space-y-4">
          {JOGOS.map(jogo => (
            <div
              key={jogo.id}
              onClick={() => jogo.disponivel && navigate(`/jogos/${jogo.id}`)}
              className={`relative rounded-2xl border overflow-hidden transition-all ${
                jogo.disponivel
                  ? `${jogo.borda} cursor-pointer hover:scale-[1.02] active:scale-[0.98]`
                  : 'border-white/10 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className={`bg-gradient-to-br ${jogo.cor} p-5`}>
                <div className="flex items-start gap-4">
                  <div className="text-5xl flex-shrink-0">{jogo.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-black text-white">{jogo.nome}</h2>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-black/30 text-white/80">{jogo.tag}</span>
                    </div>
                    <p className="text-white/70 text-xs font-semibold mb-2">{jogo.tagline}</p>
                    <p className="text-white/60 text-xs leading-relaxed">{jogo.descricao}</p>
                  </div>
                </div>
                {jogo.disponivel && (
                  <div className="mt-4 flex items-center justify-end">
                    <span className="bg-white/20 text-white text-sm font-bold px-4 py-1.5 rounded-full">
                      Jogar →
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-600 text-xs mt-8">
          Novos jogos chegando em breve 👾
        </p>
      </div>
    </div>
  );
}
