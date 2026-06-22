import React, { useState, useEffect, useRef, useCallback } from 'react';
import { gerarPerguntasJogo } from '../../services/anthropic';
import { gerarConteudoJogo } from '../../services/mock';

async function buscarPerguntas(tema, materia, qtd = 12) {
  const ia = await gerarPerguntasJogo(tema, materia || tema, qtd);
  if (ia && ia.length >= 3) return ia;
  const cont = await gerarConteudoJogo(tema, 'quiz');
  const base = cont?.perguntas || [];
  return [...base].sort(() => Math.random() - 0.5);
}

// ─── Grade ────────────────────────────────────────────────────────────────────
const COLS = 15, ROWS = 17, CELL = 26;
const W = COLS * CELL, H = ROWS * CELL;
const LETRAS = ['A', 'B', 'C', 'D'];
const CORES_ORB = ['#0ea5e9', '#f59e0b', '#a855f7', '#ec4899'];

function celulasLivres(snake) {
  const ocup = new Set(snake.map(s => `${s.x},${s.y}`));
  const livres = [];
  for (let x = 0; x < COLS; x++)
    for (let y = 1; y < ROWS; y++) // y=0 reservado para visual de respiro
      if (!ocup.has(`${x},${y}`)) livres.push({ x, y });
  return livres;
}

function novosOrbes(perg, snake) {
  const livres = celulasLivres(snake).sort(() => Math.random() - 0.5);
  return perg.opcoes.slice(0, 4).map((op, i) => ({
    ...livres[i], idx: i, letra: LETRAS[i], texto: op, cor: CORES_ORB[i],
  }));
}

// ─── Desenho ──────────────────────────────────────────────────────────────────
function drawCobra(ctx, snake, dir, t) {
  for (let i = snake.length - 1; i >= 0; i--) {
    const s = snake[i];
    const cx = s.x * CELL + CELL / 2, cy = s.y * CELL + CELL / 2;
    const cabeca = i === 0;
    const tom = cabeca ? '#16a34a' : (i % 2 === 0 ? '#22c55e' : '#4ade80');
    ctx.fillStyle = tom;
    const r = cabeca ? CELL / 2 - 1 : CELL / 2 - 3;
    ctx.beginPath();
    ctx.roundRect(cx - r, cy - r, r * 2, r * 2, cabeca ? 7 : 5);
    ctx.fill();
    if (cabeca) {
      // olhos na direção do movimento
      ctx.fillStyle = '#fff';
      const ox = dir.x * 4, oy = dir.y * 4;
      const perpX = dir.y * 5, perpY = dir.x * 5;
      ctx.beginPath(); ctx.arc(cx + ox + perpX, cy + oy + perpY, 3, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + ox - perpX, cy + oy - perpY, 3, 0, 7); ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.arc(cx + ox * 1.4 + perpX, cy + oy * 1.4 + perpY, 1.4, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + ox * 1.4 - perpX, cy + oy * 1.4 - perpY, 1.4, 0, 7); ctx.fill();
    }
  }
}

function drawOrbe(ctx, o, t) {
  const cx = o.x * CELL + CELL / 2, cy = o.y * CELL + CELL / 2;
  const pulse = 1 + Math.sin(t * 0.12 + o.idx) * 0.08;
  ctx.save();
  ctx.shadowColor = o.cor; ctx.shadowBlur = 12;
  ctx.fillStyle = o.cor;
  ctx.beginPath(); ctx.arc(cx, cy, (CELL / 2 - 2) * pulse, 0, 7); ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px Inter, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(o.letra, cx, cy + 0.5);
}

// ─── Tela fim ─────────────────────────────────────────────────────────────────
function TelaFim({ pontos, recorde, onTentar, onSair }) {
  const novoRecorde = pontos >= recorde && pontos > 0;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
      style={{ background: 'rgba(5,20,10,0.93)' }}>
      <div className="text-6xl mb-3">🐍</div>
      <h2 className="text-3xl font-black text-white mb-1">Fim de jogo</h2>
      {novoRecorde && <p className="text-yellow-400 font-black mb-1">🏆 Novo recorde!</p>}
      <p className="text-green-300 text-lg font-bold mb-1">{pontos} pontos</p>
      <p className="text-gray-400 text-sm mb-6">Recorde: {Math.max(pontos, recorde)}</p>
      <button onClick={onTentar}
        className="w-full max-w-xs py-3.5 rounded-2xl font-black text-white text-base mb-3"
        style={{ background: 'linear-gradient(90deg,#16a34a,#22c55e)', boxShadow: '0 8px 24px rgba(34,197,94,0.4)' }}>
        🐍 Jogar de novo
      </button>
      <button onClick={onSair} className="text-gray-400 hover:text-white text-sm font-bold">Voltar ao menu</button>
    </div>
  );
}

// ─── Game ─────────────────────────────────────────────────────────────────────
export default function Game({ tema, materia, onSair }) {
  const canvasRef = useRef(null);
  const [estado, setEstado] = useState('carregando');
  const [vidas, setVidas] = useState(3);
  const [pontos, setPontos] = useState(0);
  const [perguntas, setPerguntas] = useState([]);
  const [pergAtual, setPergAtual] = useState(null);
  const [flash, setFlash] = useState(null); // 'ok' | 'erro'
  const [recorde, setRecorde] = useState(() => parseInt(localStorage.getItem('aletrai_cobra_recorde') || '0', 10));

  const gs = useRef(null);
  const raf = useRef(null);
  const pergIdx = useRef(0);

  // refs espelho para uso dentro do loop de animação
  const pergAtualRef = useRef(pergAtual);
  const perguntasRef = useRef(perguntas);
  useEffect(() => { pergAtualRef.current = pergAtual; }, [pergAtual]);
  useEffect(() => { perguntasRef.current = perguntas; }, [perguntas]);

  useEffect(() => {
    let vivo = true;
    (async () => {
      const pergs = await buscarPerguntas(tema, materia, 14);
      if (!vivo) return;
      setPerguntas(pergs);
      iniciarPartida(pergs);
      setEstado('jogando');
    })();
    return () => { vivo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function novaCobra() {
    const cy = Math.floor(ROWS / 2);
    return [{ x: 5, y: cy }, { x: 4, y: cy }, { x: 3, y: cy }];
  }

  function carregarPergunta(pergs, snake) {
    if (!pergs.length) return;
    const p = pergs[pergIdx.current % pergs.length];
    pergIdx.current++;
    setPergAtual(p);
    gs.current.orbs = novosOrbes(p, snake);
  }

  function iniciarPartida(pergs) {
    gs.current = {
      snake: novaCobra(), dir: { x: 1, y: 0 }, nextDir: { x: 1, y: 0 },
      orbs: [], acc: 0, intervalo: 175, t: 0, crescer: 0,
    };
    pergIdx.current = 0;
    setVidas(3); setPontos(0); setFlash(null);
    carregarPergunta(pergs, gs.current.snake);
  }

  const perderVida = useCallback((reset = true) => {
    setVidas(v => {
      const nv = v - 1;
      if (nv <= 0) { finalizar(); }
      else if (reset && gs.current) {
        gs.current.snake = novaCobra();
        gs.current.dir = { x: 1, y: 0 };
        gs.current.nextDir = { x: 1, y: 0 };
      }
      return nv;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function finalizar() {
    cancelAnimationFrame(raf.current);
    setEstado('fim');
    setPontos(p => {
      if (p > recorde) { localStorage.setItem('aletrai_cobra_recorde', String(p)); setRecorde(p); }
      return p;
    });
  }

  function mostrarFlash(tipo) {
    setFlash(tipo);
    setTimeout(() => setFlash(null), 350);
  }

  // Loop
  useEffect(() => {
    if (estado !== 'jogando') return;
    const ctx = canvasRef.current.getContext('2d');
    let last = performance.now();

    function loop(now) {
      const g = gs.current;
      const dt = now - last; last = now;
      g.acc += dt; g.t++;

      if (g.acc >= g.intervalo) {
        g.acc = 0;
        // aplica direção
        g.dir = g.nextDir;
        const head = g.snake[0];
        const nh = { x: head.x + g.dir.x, y: head.y + g.dir.y };

        // parede
        if (nh.x < 0 || nh.x >= COLS || nh.y < 1 || nh.y >= ROWS) {
          mostrarFlash('erro'); perderVida(); raf.current = requestAnimationFrame(loop); return;
        }
        // auto-colisão
        if (g.snake.some(s => s.x === nh.x && s.y === nh.y)) {
          mostrarFlash('erro'); perderVida(); raf.current = requestAnimationFrame(loop); return;
        }

        g.snake.unshift(nh);

        // orbe?
        const orbe = g.orbs.find(o => o.x === nh.x && o.y === nh.y);
        if (orbe) {
          if (orbe.idx === pergAtualRef.current?.correta) {
            setPontos(p => p + 100);
            g.crescer += 2;
            mostrarFlash('ok');
            carregarPergunta(perguntasRef.current, g.snake);
            g.intervalo = Math.max(95, g.intervalo - 4); // acelera devagar
          } else {
            setPontos(p => Math.max(0, p - 20));
            mostrarFlash('erro');
            g.orbs = g.orbs.filter(o => o !== orbe);
            perderVida(false);
          }
        }

        // crescimento
        if (g.crescer > 0) g.crescer--;
        else g.snake.pop();
      }

      // ─── render ───
      ctx.fillStyle = '#06140c';
      ctx.fillRect(0, 0, W, H);
      // grade sutil
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, H); ctx.stroke(); }
      for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(W, y * CELL); ctx.stroke(); }

      for (const o of g.orbs) drawOrbe(ctx, o, g.t);
      drawCobra(ctx, g.snake, g.dir, g.t);

      raf.current = requestAnimationFrame(loop);
    }
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado]);

  // Teclado
  useEffect(() => {
    function virar(dx, dy) {
      const g = gs.current; if (!g) return;
      if (g.dir.x === -dx && g.dir.y === -dy) return; // não inverte 180°
      g.nextDir = { x: dx, y: dy };
    }
    function kd(e) {
      const k = e.key;
      if (k === 'ArrowUp' || k === 'w' || k === 'W') virar(0, -1);
      else if (k === 'ArrowDown' || k === 's' || k === 'S') virar(0, 1);
      else if (k === 'ArrowLeft' || k === 'a' || k === 'A') virar(-1, 0);
      else if (k === 'ArrowRight' || k === 'd' || k === 'D') virar(1, 0);
    }
    window.addEventListener('keydown', kd);
    return () => window.removeEventListener('keydown', kd);
  }, []);

  function virarTouch(dx, dy) {
    const g = gs.current; if (!g) return;
    if (g.dir.x === -dx && g.dir.y === -dy) return;
    g.nextDir = { x: dx, y: dy };
  }

  function tentarDeNovo() { iniciarPartida(perguntas); setEstado('jogando'); }

  const xpGanho = Math.max(10, Math.floor(pontos / 4));
  const Dpad = ({ icon, dx, dy, cls }) => (
    <button onTouchStart={(e) => { e.preventDefault(); virarTouch(dx, dy); }}
      onMouseDown={() => virarTouch(dx, dy)}
      className={`w-14 h-14 rounded-2xl bg-white/10 active:bg-white/25 text-white text-xl font-black flex items-center justify-center ${cls}`}>
      {icon}
    </button>
  );

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-y-auto py-4"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #0c2a18 0%, #04100a 70%)' }}>

      {/* HUD topo */}
      <div className="flex items-center justify-between mb-2" style={{ width: W }}>
        <button onClick={() => onSair({ xpGanho })}
          className="text-gray-400 hover:text-white text-sm font-bold px-1">← Sair</button>
        <div className="flex items-center gap-3">
          <span className="text-lg">{'❤️'.repeat(Math.max(0, vidas))}</span>
          <span className="px-3 py-1 rounded-full bg-green-500/15 border border-green-400/30 text-green-300 font-black text-sm">
            {pontos} pts
          </span>
        </div>
      </div>

      {/* Pergunta atual */}
      <div className="mb-2 px-3 py-2.5 rounded-xl text-center transition-colors"
        style={{
          width: W,
          background: flash === 'ok' ? 'rgba(34,197,94,0.25)' : flash === 'erro' ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
        <p className="text-white text-sm font-bold leading-snug min-h-[20px]">
          {pergAtual?.pergunta || 'Carregando...'}
        </p>
      </div>

      <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ width: W, height: H }}>
        <canvas ref={canvasRef} width={W} height={H} style={{ display: 'block', width: W, height: H }} />

        {estado === 'carregando' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: '#06140c' }}>
            <div className="text-5xl mb-3 animate-pulse">🐍</div>
            <p className="text-green-300 font-bold">Preparando o tabuleiro...</p>
            <p className="text-gray-500 text-xs mt-1">Gerando perguntas sobre {tema}</p>
          </div>
        )}

        {estado === 'fim' && (
          <TelaFim pontos={pontos} recorde={recorde}
            onTentar={tentarDeNovo} onSair={() => onSair({ xpGanho })} />
        )}
      </div>

      {/* Legenda das opções */}
      {pergAtual && estado === 'jogando' && (
        <div className="grid grid-cols-2 gap-1.5 mt-2" style={{ width: W }}>
          {pergAtual.opcoes.slice(0, 4).map((op, i) => (
            <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs"
              style={{ background: 'rgba(255,255,255,0.05)' }}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-white font-black shrink-0"
                style={{ background: CORES_ORB[i] }}>{LETRAS[i]}</span>
              <span className="text-gray-200 truncate">{op}</span>
            </div>
          ))}
        </div>
      )}

      {/* D-pad mobile */}
      {estado === 'jogando' && (
        <div className="mt-3 grid grid-cols-3 gap-1.5 lg:hidden" style={{ width: 180 }}>
          <div /><Dpad icon="▲" dx={0} dy={-1} /><div />
          <Dpad icon="◀" dx={-1} dy={0} /><div /><Dpad icon="▶" dx={1} dy={0} />
          <div /><Dpad icon="▼" dx={0} dy={1} /><div />
        </div>
      )}

      <p className="text-gray-500 text-xs mt-2 hidden lg:block">Use as setas (ou WASD) para guiar a cobra até a resposta certa.</p>
    </div>
  );
}
