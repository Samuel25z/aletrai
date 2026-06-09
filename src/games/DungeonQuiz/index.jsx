import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MATERIAS } from '../../context/ChatContext';
import Game from './Game';

function TelaSetup({ onIniciar, onVoltar }) {
  const [tema, setTema] = useState('');
  const materia = null;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
      <button onClick={onVoltar} className="absolute top-4 left-4 text-gray-500 hover:text-white text-sm">← Voltar</button>

      <div className="w-full max-w-sm text-center">
        <div className="text-6xl mb-4">🗡️</div>
        <h1 className="text-2xl font-black text-white mb-1">Dungeon Quiz</h1>
        <p className="text-gray-500 text-sm mb-8">Qual assunto você quer enfrentar?</p>
        <input
          type="text" value={tema} onChange={e => setTema(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && tema.trim() && onIniciar({ materia, tema: tema.trim(), modoIA: true })}
          placeholder="Ex: Segunda Guerra, Frações, Fotossíntese..."
          autoFocus
          className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 text-sm mb-3 focus:outline-none focus:border-purple-500 placeholder-gray-600"
        />
        <button onClick={() => tema.trim() && onIniciar({ materia, tema: tema.trim(), modoIA: true })}
          disabled={!tema.trim()}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-700 hover:from-purple-500 hover:to-blue-600 disabled:opacity-40 text-white font-black text-base rounded-2xl mb-2 transition-all shadow-lg shadow-purple-900">
          🧠 ENTRAR COM IA
        </button>
        <button onClick={() => tema.trim() && onIniciar({ materia, tema: tema.trim(), modoIA: false })}
          disabled={!tema.trim()}
          className="w-full py-3 bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white font-bold text-base rounded-2xl border border-white/20 transition-all">
          ⚡ ENTRAR SEM IA (teste)
        </button>
      </div>
    </div>
  );
}

export default function DungeonQuiz() {
  const navigate = useNavigate();
  const { ganharXPMateria } = useAuth();
  const [fase, setFase] = useState('setup');
  const [config, setConfig] = useState(null);

  function iniciarJogo(cfg) { setConfig(cfg); setFase('jogando'); }

  function sairDoJogo(resultado) {
    if (resultado && config?.materia) ganharXPMateria(resultado.xpGanho, config.materia.id);
    navigate('/jogos');
  }

  if (fase === 'setup') return <TelaSetup onIniciar={iniciarJogo} onVoltar={() => navigate('/jogos')} />;

  return <Game tema={config.tema} materia={config.materia} modoIA={config.modoIA} onSair={sairDoJogo} />;
}
