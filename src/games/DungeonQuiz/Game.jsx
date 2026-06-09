import React, { useState, useCallback } from 'react';
import { gerarPerguntasJogo } from '../../services/anthropic';
import { gerarConteudoJogo }  from '../../services/mock';
import BossCanvas from './BossCanvas';

// ─── Bosses da masmorra ───────────────────────────────────────────────────────
const BOSSES = [
  { nome: 'Goblin Rei',        emoji: '👺', hp: 3, cor: 'from-green-700 to-green-900',   xp: 50  },
  { nome: 'Esqueleto Guerreiro',emoji: '💀', hp: 4, cor: 'from-gray-600 to-gray-900',    xp: 80  },
  { nome: 'Mago das Sombras',   emoji: '🧙', hp: 5, cor: 'from-purple-700 to-purple-950', xp: 120 },
  { nome: 'Dragão de Gelo',     emoji: '🐉', hp: 6, cor: 'from-blue-700 to-blue-950',    xp: 180 },
  { nome: 'Senhor das Trevas',  emoji: '👿', hp: 7, cor: 'from-red-800 to-gray-950',      xp: 250 },
];

function getBoss(idx) {
  return BOSSES[Math.min(idx, BOSSES.length - 1)];
}

async function buscarPerguntas(tema, materia, modoIA, qtd = 5) {
  if (modoIA) {
    const ia = await gerarPerguntasJogo(tema, materia?.nome || tema, qtd);
    if (ia && ia.length >= 3) return ia.slice(0, qtd);
  }
  const cont = await gerarConteudoJogo(tema, 'quiz');
  const base = cont?.perguntas || [];
  return [...base].sort(() => Math.random() - 0.5).slice(0, qtd);
}

// ─── Barra de HP ─────────────────────────────────────────────────────────────
function BarraHP({ atual, max, cor = 'bg-red-500', label }) {
  const pct = Math.max(0, (atual / max) * 100);
  return (
    <div className="w-full">
      {label && <p className="text-xs text-gray-400 mb-1 font-semibold">{label}</p>}
      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full ${cor} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-right text-gray-500 mt-0.5">{atual}/{max}</p>
    </div>
  );
}

// ─── Tela de vitória (boss derrotado) ────────────────────────────────────────
function TelaVitoria({ boss, proxBoss, xpGanho, onProximo, onSair }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 p-6 text-center">
      <div className="text-7xl mb-4 animate-bounce">💥</div>
      <p className="text-amber-400 text-xs font-black uppercase tracking-widest mb-1">BOSS DERROTADO!</p>
      <h2 className="text-2xl font-black text-white mb-1">{boss.emoji} {boss.nome}</h2>
      <p className="text-gray-500 text-sm mb-6">Foi destruído!</p>
      <div className="bg-amber-500/20 border border-amber-500/40 rounded-2xl p-4 mb-6 w-full max-w-xs">
        <p className="text-3xl font-black text-amber-400">+{xpGanho} XP</p>
      </div>
      {proxBoss ? (
        <>
          <p className="text-gray-400 text-sm mb-3">Próximo desafio:</p>
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 mb-5 w-full max-w-xs">
            <span className="text-3xl">{proxBoss.emoji}</span>
            <div className="text-left">
              <p className="text-white font-bold">{proxBoss.nome}</p>
              <p className="text-gray-500 text-xs">{proxBoss.hp} vidas necessárias para derrotar</p>
            </div>
          </div>
          <button onClick={onProximo}
            className="w-full max-w-xs py-4 bg-gradient-to-r from-purple-600 to-blue-700 text-white font-black text-lg rounded-2xl mb-3">
            ⚔️ Enfrentar próximo boss
          </button>
        </>
      ) : (
        <p className="text-amber-400 font-bold text-lg mb-5">🏆 Masmorra concluída!</p>
      )}
      <button onClick={onSair} className="text-gray-600 hover:text-gray-400 text-sm">Sair</button>
    </div>
  );
}

// ─── Tela de derrota ─────────────────────────────────────────────────────────
function TelaDerrota({ boss, erradas, onTentar, onSair }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 p-5 text-center">
      <div className="text-7xl mb-3">💀</div>
      <p className="text-red-400 text-xs font-black uppercase tracking-widest mb-1">DERROTA</p>
      <h2 className="text-2xl font-black text-white mb-1">{boss.emoji} {boss.nome} venceu!</h2>
      <p className="text-gray-500 text-sm mb-5">Estude o que errou e tente novamente</p>

      {erradas.length > 0 && (
        <div className="w-full max-w-sm bg-gray-900/80 border border-amber-500/30 rounded-2xl p-4 mb-5 max-h-64 overflow-y-auto text-left">
          <p className="text-amber-400 text-xs font-black mb-3 uppercase">📚 O que errou:</p>
          {erradas.map((pe, i) => (
            <div key={i} className="mb-3 pb-2 border-b border-white/10 last:border-0 text-xs">
              <p className="text-white font-medium mb-1">{pe.pergunta}</p>
              <p className="text-red-400">❌ Você: {pe.opcoes[pe.respostaDada]}</p>
              <p className="text-green-400">✅ Certo: {pe.opcoes[pe.correta]}</p>
              {pe.explicacao && <p className="text-gray-400 mt-1 italic">{pe.explicacao}</p>}
            </div>
          ))}
        </div>
      )}

      <button onClick={onTentar}
        className="w-full max-w-xs py-4 bg-gradient-to-r from-purple-600 to-blue-700 text-white font-black text-lg rounded-2xl mb-3">
        🔄 Tentar novamente
      </button>
      <button onClick={onSair} className="text-gray-600 hover:text-gray-400 text-sm">Voltar ao menu</button>
    </div>
  );
}

// ─── Jogo principal ───────────────────────────────────────────────────────────
export default function Game({ tema, materia, modoIA, onSair }) {
  const [fase, setFase]         = useState('carregando'); // carregando | batalha | vitoria | derrota
  const [perguntas, setPerguntas] = useState([]);
  const [pergIdx, setPergIdx]   = useState(0);
  const [bossIdx, setBossIdx]   = useState(0);
  const [bossHp, setBossHp]     = useState(null);
  const [playerVidas, setPlayerVidas] = useState(3);
  const [erradas, setErradas]   = useState([]);
  const [xpTotal, setXpTotal]   = useState(0);
  const [feedback, setFeedback]   = useState(null); // null | 'certo' | 'errado'
  const [respondida, setRespondida] = useState(null);
  const [shake, setShake]         = useState(false);
  const [bossAnim, setBossAnim]   = useState('idle'); // idle | damage | death

  const boss = getBoss(bossIdx);

  // Carrega perguntas ao iniciar ou ao trocar de boss
  const carregarPerguntas = useCallback(async (bIdx) => {
    setFase('carregando');
    const b = getBoss(bIdx);
    const pergs = await buscarPerguntas(tema, materia, modoIA, b.hp + 2); // perguntas extras por segurança
    setPerguntas(pergs);
    setPergIdx(0);
    setBossHp(b.hp);
    setFeedback(null);
    setRespondida(null);
    setFase('batalha');
  }, [tema, materia, modoIA]);

  // Inicia ao montar
  React.useEffect(() => { carregarPerguntas(0); }, [carregarPerguntas]);

  function responder(opcaoIdx) {
    if (feedback !== null) return;
    const perg = perguntas[pergIdx];
    const correto = opcaoIdx === perg.correta;
    setRespondida(opcaoIdx);
    setFeedback(correto ? 'certo' : 'errado');

    if (correto) {
      const novoHp = bossHp - 1;
      setBossHp(novoHp);
      setBossAnim('damage');
      setTimeout(() => setBossAnim(novoHp <= 0 ? 'death' : 'idle'), 400);
      setTimeout(() => {
        if (novoHp <= 0) {
          setXpTotal(x => x + boss.xp);
          setFase('vitoria');
        } else {
          setPergIdx(i => i + 1);
          setFeedback(null);
          setRespondida(null);
        }
      }, novoHp <= 0 ? 1600 : 900);
    } else {
      setErradas(prev => [...prev, { ...perg, respostaDada: opcaoIdx }]);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      const novasVidas = playerVidas - 1;
      setPlayerVidas(novasVidas);
      setTimeout(() => {
        if (novasVidas <= 0) {
          setFase('derrota');
        } else {
          setPergIdx(i => i + 1);
          setFeedback(null);
          setRespondida(null);
        }
      }, 1000);
    }
  }

  function proxBoss() {
    const novoBossIdx = bossIdx + 1;
    setBossIdx(novoBossIdx);
    setErradas([]);
    carregarPerguntas(novoBossIdx);
  }

  function reiniciar() {
    setBossIdx(0);
    setPlayerVidas(3);
    setErradas([]);
    setXpTotal(0);
    carregarPerguntas(0);
  }

  // ─── Telas de estado ────────────────────────────────────────────────────────
  if (fase === 'carregando') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950">
        <div className="text-6xl mb-4 animate-bounce">{boss.emoji}</div>
        <p className="text-purple-400 text-sm font-black uppercase tracking-widest animate-pulse">
          {bossIdx === 0 ? 'Preparando a masmorra...' : `Invocando ${boss.nome}...`}
        </p>
        <p className="text-gray-600 text-xs mt-2">🧠 {modoIA ? 'Gerando perguntas com IA...' : 'Carregando banco de questões...'}</p>
      </div>
    );
  }

  if (fase === 'vitoria') {
    const proxBossData = bossIdx + 1 < BOSSES.length ? getBoss(bossIdx + 1) : null;
    return (
      <TelaVitoria
        boss={boss}
        proxBoss={proxBossData}
        xpGanho={boss.xp}
        onProximo={proxBoss}
        onSair={() => onSair({ xpGanho: xpTotal + boss.xp })}
      />
    );
  }

  if (fase === 'derrota') {
    return (
      <TelaDerrota
        boss={boss}
        erradas={erradas}
        onTentar={reiniciar}
        onSair={() => onSair({ xpGanho: Math.max(10, Math.floor(xpTotal / 2)) })}
      />
    );
  }

  // ─── Batalha ─────────────────────────────────────────────────────────────────
  const perg = perguntas[pergIdx];
  if (!perg) return null;

  const progBoss = Math.max(0, bossHp / boss.hp);

  return (
    <div className={`flex flex-col min-h-screen bg-gray-950 ${shake ? 'animate-bounce' : ''}`}>
      {/* Boss arena */}
      <div className={`bg-gradient-to-b ${boss.cor} pt-safe pb-4 px-5`}>
        {/* Boss info */}
        <div className="flex items-center justify-between mb-3 pt-4">
          <div>
            <p className="text-xs text-white/60 font-bold uppercase tracking-wide">Boss {bossIdx + 1}</p>
            <p className="text-white font-black text-lg">{boss.nome}</p>
          </div>
          {/* Vidas do player */}
          <div className="flex gap-1">
            {[0,1,2].map(i => (
              <span key={i} className={`text-xl ${i < playerVidas ? '' : 'opacity-20 grayscale'}`}>❤️</span>
            ))}
          </div>
        </div>

        {/* Boss HP */}
        <BarraHP atual={bossHp} max={boss.hp} cor="bg-red-500" />

        {/* Boss em pixel art */}
        <div className="flex justify-center my-2">
          <BossCanvas
            bossIdx={bossIdx}
            animState={bossAnim}
            onDeathEnd={() => {}}
          />
        </div>

        {/* Feedback de dano/erro */}
        {feedback === 'certo' && (
          <div className="text-center">
            <span className="text-green-300 font-black text-lg animate-bounce inline-block">⚔️ -{1} HP!</span>
          </div>
        )}
        {feedback === 'errado' && (
          <div className="text-center">
            <span className="text-red-300 font-black text-lg animate-bounce inline-block">💔 -1 vida!</span>
          </div>
        )}
      </div>

      {/* Pergunta + opções */}
      <div className="flex-1 bg-gray-950 px-4 py-5 flex flex-col">
        {/* Progresso das perguntas */}
        <div className="flex gap-1 mb-4">
          {Array.from({ length: boss.hp }).map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full ${
              i < boss.hp - bossHp ? 'bg-green-500' : 'bg-white/10'
            }`} />
          ))}
        </div>

        {/* Pergunta */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
          <p className="text-white font-semibold text-sm leading-relaxed">{perg.pergunta}</p>
        </div>

        {/* Opções */}
        <div className="space-y-2 flex-1">
          {perg.opcoes.map((op, i) => {
            let cls = 'bg-white/5 border-white/10 text-white hover:bg-white/15 hover:border-purple-400';
            if (feedback !== null) {
              if (i === perg.correta)    cls = 'bg-green-500/20 border-green-500 text-green-300';
              else if (i === respondida) cls = 'bg-red-500/20 border-red-500 text-red-300';
              else                       cls = 'bg-white/5 border-white/5 text-gray-600';
            }
            return (
              <button key={i} onClick={() => responder(i)} disabled={feedback !== null}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3 ${cls}`}>
                <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {['A','B','C','D'][i]}
                </span>
                {op}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex justify-between text-xs text-gray-700">
          <span>{tema}</span>
          <span>Pergunta {pergIdx + 1}</span>
        </div>
      </div>
    </div>
  );
}
