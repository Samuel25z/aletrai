import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, calcularNivelMateria } from '../context/AuthContext';
import { MATERIAS } from '../context/ChatContext';
import { gerarConteudoJogo } from '../services/mock';

// ─── Bosses por matéria ───────────────────────────────────────────────────────
const BOSSES_POR_MATERIA = {
  matematica: [
    { nivel: 3,  nome: 'A Esfinge das Frações',  emoji: '🦁', hp: 100, descricao: 'Ela devora quem não sabe dividir!' },
    { nivel: 6,  nome: 'O Dragão da Álgebra',     emoji: '🐉', hp: 150, descricao: 'Suas equações são como chamas!' },
    { nivel: 9,  nome: 'O Titã da Geometria',     emoji: '⚡', hp: 200, descricao: 'Formas e ângulos são suas armas.' },
    { nivel: 12, nome: 'O Senhor dos Números',    emoji: '👑', hp: 250, descricao: 'O mais poderoso de todos...' },
  ],
  historia: [
    { nivel: 3,  nome: 'O Fantasma do Passado',  emoji: '👻', hp: 100, descricao: 'Ele apaga a história dos fracos!' },
    { nivel: 6,  nome: 'O Guerreiro Antigo',      emoji: '⚔️', hp: 150, descricao: 'Lutou em mil batalhas.' },
    { nivel: 9,  nome: 'O Imperador Sombrio',     emoji: '🗡️', hp: 200, descricao: 'Dominou impérios inteiros.' },
    { nivel: 12, nome: 'O Mestre do Tempo',       emoji: '⏳', hp: 250, descricao: 'Controla o passado e o futuro.' },
  ],
  ciencias: [
    { nivel: 3,  nome: 'A Bactéria Mutante',      emoji: '🦠', hp: 100, descricao: 'Evoluiu para destruir!' },
    { nivel: 6,  nome: 'O Vírus Sombrio',          emoji: '☣️', hp: 150, descricao: 'Infecta tudo que toca.' },
    { nivel: 9,  nome: 'O Vulcão Irado',           emoji: '🌋', hp: 200, descricao: 'A natureza em fúria.' },
    { nivel: 12, nome: 'O Senhor da Evolução',     emoji: '🧬', hp: 250, descricao: 'Domina toda a vida.' },
  ],
  portugues: [
    { nivel: 3,  nome: 'O Gramático Malévolo',    emoji: '📜', hp: 100, descricao: 'Erra quem não sabe escrever!' },
    { nivel: 6,  nome: 'A Vírgula do Caos',        emoji: '✍️', hp: 150, descricao: 'Confunde até os melhores.' },
    { nivel: 9,  nome: 'O Mestre da Poesia Negra', emoji: '🖤', hp: 200, descricao: 'Suas palavras paralisam.' },
    { nivel: 12, nome: 'O Dicionário Vivo',        emoji: '📚', hp: 250, descricao: 'Sabe tudo, te derruba fácil.' },
  ],
};

const BOSS_GENERICO = (nivel) => ({
  nome: `Chefe do Nível ${nivel}`,
  emoji: ['👾', '🤖', '💀', '🧟'][Math.floor(nivel / 3) % 4],
  hp: 100 + (Math.floor(nivel / 3) - 1) * 50,
  descricao: 'Um adversário poderoso te espera!',
});

function getBoss(materiaId, xp) {
  const { nivel } = calcularNivelMateria(xp);
  const bossLevel = Math.floor(nivel / 3) * 3;
  const lista = BOSSES_POR_MATERIA[materiaId];
  if (lista) return lista.find(b => b.nivel === bossLevel) || BOSS_GENERICO(bossLevel);
  return BOSS_GENERICO(bossLevel);
}

// ─── Barra de HP ─────────────────────────────────────────────────────────────
function BarraHP({ atual, max, cor = 'bg-rose-500', label }) {
  const pct = Math.max(0, Math.round((atual / max) * 100));
  return (
    <div>
      {label && <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>}
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${cor} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-0.5 text-right">{atual}/{max}</p>
    </div>
  );
}

// ─── Tela de entrada ──────────────────────────────────────────────────────────
function TelaEntrada({ boss, materia, onIniciar, onVoltar }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white p-6 text-center">
      <div className="animate-bounce text-8xl mb-6">{boss.emoji}</div>
      <p className="text-rose-400 text-sm font-bold uppercase tracking-widest mb-2">BOSS BATTLE</p>
      <h1 className="text-3xl font-black mb-2">{boss.nome}</h1>
      <p className="text-gray-400 mb-1">{materia.emoji} {materia.nome}</p>
      <p className="text-gray-500 text-sm mb-8 italic">"{boss.descricao}"</p>

      <div className="bg-white/10 rounded-2xl p-5 w-full max-w-xs mb-8 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">HP do Boss</span>
          <span className="font-bold text-rose-400">{boss.hp} ❤️</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Suas vidas</span>
          <span className="font-bold text-green-400">3 💚</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Perguntas</span>
          <span className="font-bold text-blue-400">10 ❓</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Recompensa</span>
          <span className="font-bold text-amber-400">+300 XP ⚡</span>
        </div>
      </div>

      <button
        onClick={onIniciar}
        className="w-full max-w-xs py-4 bg-rose-500 hover:bg-rose-600 font-black text-lg rounded-2xl transition-colors shadow-lg shadow-rose-900 mb-3"
      >
        ⚔️ BATALHAR!
      </button>
      <button onClick={onVoltar} className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
        Voltar
      </button>
    </div>
  );
}

// ─── Tela de vitória ──────────────────────────────────────────────────────────
function TelaVitoria({ boss, xpGanho, onVoltar }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white p-6 text-center">
      <div className="text-8xl mb-4 animate-spin" style={{ animationDuration: '2s', animationIterationCount: 3 }}>💥</div>
      <p className="text-amber-400 text-sm font-bold uppercase tracking-widest mb-2">VITÓRIA!</p>
      <h1 className="text-3xl font-black mb-1">{boss.nome} foi derrotado!</h1>
      <p className="text-gray-400 mb-8">Você é incrível! 🎉</p>

      <div className="bg-amber-500/20 border border-amber-500/40 rounded-2xl p-6 mb-8 w-full max-w-xs">
        <p className="text-4xl font-black text-amber-400">+{xpGanho} XP</p>
        <p className="text-sm text-gray-400 mt-1">Bônus de boss vencido!</p>
      </div>

      <button
        onClick={onVoltar}
        className="w-full max-w-xs py-4 bg-amber-500 hover:bg-amber-600 font-black text-lg rounded-2xl transition-colors"
      >
        🏆 Ver meu progresso
      </button>
    </div>
  );
}

// ─── Tela de derrota ─────────────────────────────────────────────────────────
function TelaDerrota({ boss, onTentar, onVoltar }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white p-6 text-center">
      <div className="text-8xl mb-4">💀</div>
      <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-2">DERROTA</p>
      <h1 className="text-3xl font-black mb-1">{boss.nome} venceu...</h1>
      <p className="text-gray-400 mb-8">Mas você pode tentar de novo! 💪</p>

      <button
        onClick={onTentar}
        className="w-full max-w-xs py-4 bg-rose-500 hover:bg-rose-600 font-black text-lg rounded-2xl transition-colors mb-3"
      >
        🔄 Tentar novamente
      </button>
      <button onClick={onVoltar} className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
        Voltar ao início
      </button>
    </div>
  );
}

// ─── Batalha ─────────────────────────────────────────────────────────────────
function Batalha({ boss, tema, onVitoria, onDerrota }) {
  const PERGUNTAS_TOTAL = 10;
  const DANO_CORRETO = Math.ceil(boss.hp / PERGUNTAS_TOTAL);
  const [perguntas, setPerguntas] = useState(null);
  const [idx, setIdx] = useState(0);
  const [bossHp, setBossHp] = useState(boss.hp);
  const [playerVidas, setPlayerVidas] = useState(3);
  const [respostaSelecionada, setRespostaSelecionada] = useState(null);
  const [tempo, setTempo] = useState(15);
  const [feedback, setFeedback] = useState(null); // 'certo' | 'errado'
  const [carregando, setCarregando] = useState(true);
  const [shake, setShake] = useState(false);

  // Carrega perguntas
  useEffect(() => {
    gerarConteudoJogo(tema, 'quiz').then(cont => {
      if (cont?.perguntas) {
        // Repete perguntas se necessário para ter 10
        const base = cont.perguntas;
        const lista = [];
        while (lista.length < PERGUNTAS_TOTAL) lista.push(...base);
        setPerguntas(lista.slice(0, PERGUNTAS_TOTAL));
      }
      setCarregando(false);
    });
  }, [tema]);

  // Timer por pergunta
  useEffect(() => {
    if (carregando || feedback !== null || !perguntas) return;
    if (tempo <= 0) { errou(); return; }
    const t = setInterval(() => setTempo(p => p - 1), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempo, carregando, feedback, perguntas]);

  const errou = useCallback(() => {
    setFeedback('errado');
    setShake(true);
    setTimeout(() => setShake(false), 600);
    const novasVidas = playerVidas - 1;
    setPlayerVidas(novasVidas);
    setTimeout(() => {
      if (novasVidas <= 0) { onDerrota(); return; }
      proxima();
    }, 1200);
  }, [playerVidas, onDerrota]);

  function responder(opcaoIdx) {
    if (feedback !== null) return;
    setRespostaSelecionada(opcaoIdx);
    const pergunta = perguntas[idx];
    if (opcaoIdx === pergunta.correta) {
      const novoHp = Math.max(0, bossHp - DANO_CORRETO);
      setBossHp(novoHp);
      setFeedback('certo');
      setTimeout(() => {
        if (novoHp <= 0 || idx + 1 >= PERGUNTAS_TOTAL) { onVitoria(); return; }
        proxima();
      }, 1000);
    } else {
      errou();
    }
  }

  function proxima() {
    setIdx(i => i + 1);
    setRespostaSelecionada(null);
    setFeedback(null);
    setTempo(15);
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
        <div className="text-center">
          <div className="text-5xl animate-bounce mb-4">{boss.emoji}</div>
          <p className="text-gray-400">Preparando a batalha...</p>
        </div>
      </div>
    );
  }

  if (!perguntas) return null;
  const pergunta = perguntas[idx];

  return (
    <div className={`flex flex-col min-h-screen bg-gray-950 text-white p-4 ${shake ? 'animate-bounce' : ''}`}>
      {/* Header da batalha */}
      <div className="mb-4 space-y-3">
        {/* Boss HP */}
        <div className="flex items-center gap-3">
          <span className="text-3xl">{boss.emoji}</span>
          <div className="flex-1">
            <p className="text-xs text-rose-400 font-bold mb-1">{boss.nome}</p>
            <BarraHP atual={bossHp} max={boss.hp} cor="bg-rose-500" />
          </div>
        </div>
        {/* Player vidas + timer */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <span key={i} className={`text-xl ${i < playerVidas ? 'opacity-100' : 'opacity-20'}`}>💚</span>
            ))}
          </div>
          <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center font-black text-lg ${
            tempo <= 5 ? 'border-rose-500 text-rose-400 animate-pulse' : 'border-blue-500 text-blue-400'
          }`}>
            {tempo}
          </div>
          <div className="text-xs text-gray-400 font-semibold">{idx + 1}/{PERGUNTAS_TOTAL}</div>
        </div>
      </div>

      {/* Pergunta */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="bg-white/10 rounded-2xl p-5 mb-5">
          <p className="text-base font-semibold leading-snug text-center">{pergunta.pergunta}</p>
        </div>

        {/* Opções */}
        <div className="space-y-3">
          {pergunta.opcoes.map((opcao, i) => {
            let estilo = 'bg-white/10 border border-white/20 text-white hover:bg-white/20';
            if (feedback !== null) {
              if (i === pergunta.correta) estilo = 'bg-green-500/30 border border-green-500 text-green-300';
              else if (i === respostaSelecionada && feedback === 'errado') estilo = 'bg-rose-500/30 border border-rose-500 text-rose-300';
              else estilo = 'bg-white/5 border border-white/10 text-gray-600';
            }
            return (
              <button
                key={i}
                onClick={() => responder(i)}
                disabled={feedback !== null}
                className={`w-full py-3.5 px-4 rounded-xl text-sm font-medium text-left transition-all ${estilo}`}
              >
                <span className="font-bold mr-2 opacity-60">{['A', 'B', 'C', 'D'][i]}.</span>
                {opcao}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`mt-4 p-3 rounded-xl text-center font-bold text-sm ${
            feedback === 'certo' ? 'bg-green-500/20 text-green-400' : 'bg-rose-500/20 text-rose-400'
          }`}>
            {feedback === 'certo' ? `⚔️ Acertou! -${DANO_CORRETO} HP no boss!` : `💔 Errou! -1 vida`}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function BossBattle() {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, ganharXPMateria, vencerBoss } = useAuth();

  const materiaId = location.state?.materiaId || 'geral';
  const materia = MATERIAS.find(m => m.id === materiaId) || { id: 'geral', nome: 'Geral', emoji: '💬' };
  const xp = usuario?.xpPorMateria?.[materiaId] || 0;
  const boss = getBoss(materiaId, xp);
  const { nivel } = calcularNivelMateria(xp);
  const bossLevel = Math.floor(nivel / 3) * 3;

  const [fase, setFase] = useState('entrada'); // entrada | batalha | vitoria | derrota

  function handleVitoria() {
    const xpGanho = 300 + bossLevel * 20;
    ganharXPMateria(xpGanho, materiaId);
    vencerBoss(materiaId, bossLevel);
    setFase('vitoria');
  }

  if (fase === 'entrada') return (
    <TelaEntrada
      boss={boss}
      materia={materia}
      onIniciar={() => setFase('batalha')}
      onVoltar={() => navigate('/dashboard')}
    />
  );

  if (fase === 'batalha') return (
    <Batalha
      boss={boss}
      tema={materia.nome}
      onVitoria={handleVitoria}
      onDerrota={() => setFase('derrota')}
    />
  );

  if (fase === 'vitoria') return (
    <TelaVitoria
      boss={boss}
      xpGanho={300 + bossLevel * 20}
      onVoltar={() => navigate('/dashboard')}
    />
  );

  if (fase === 'derrota') return (
    <TelaDerrota
      boss={boss}
      onTentar={() => setFase('entrada')}
      onVoltar={() => navigate('/dashboard')}
    />
  );
}
