import React, { useState, useEffect, useRef, useCallback } from 'react';
import { criarBanco } from '../../services/bancoPerguntas';

// ─── Constantes ───────────────────────────────────────────────────────────────
const W = 420, H = 640;
const SHIP_X = 90;
const GRAV = 0; // voo livre vertical
const MOVE_SPD = 5.2;

function rand(a, b) { return a + Math.random() * (b - a); }

// ─── Desenho ──────────────────────────────────────────────────────────────────
function drawNave(ctx, x, y, invuln, t) {
  ctx.save();
  ctx.translate(x, y);
  if (invuln && Math.floor(t / 4) % 2 === 0) ctx.globalAlpha = 0.4;

  // chama do motor
  const flameLen = 14 + Math.sin(t * 0.6) * 5;
  const g = ctx.createLinearGradient(-22 - flameLen, 0, -22, 0);
  g.addColorStop(0, 'rgba(255,80,0,0)');
  g.addColorStop(0.5, '#ff8a00');
  g.addColorStop(1, '#ffe066');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-22, -7); ctx.lineTo(-22 - flameLen, 0); ctx.lineTo(-22, 7);
  ctx.closePath(); ctx.fill();

  // corpo
  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.moveTo(26, 0); ctx.lineTo(-18, -13); ctx.lineTo(-12, 0); ctx.lineTo(-18, 13);
  ctx.closePath(); ctx.fill();
  // asa superior/inferior
  ctx.fillStyle = '#7c3aed';
  ctx.beginPath(); ctx.moveTo(-4, -10); ctx.lineTo(-20, -22); ctx.lineTo(-14, -7); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-4, 10); ctx.lineTo(-20, 22); ctx.lineTo(-14, 7); ctx.closePath(); ctx.fill();
  // cabine
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath(); ctx.ellipse(6, 0, 8, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e0f2fe';
  ctx.beginPath(); ctx.ellipse(8, -1, 3, 2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawAsteroide(ctx, a) {
  ctx.save();
  ctx.translate(a.x, a.y);
  ctx.rotate(a.rot);
  ctx.fillStyle = '#6b7280';
  ctx.strokeStyle = '#9ca3af';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < a.verts.length; i++) {
    const v = a.verts[i];
    const px = Math.cos(v.ang) * v.r, py = Math.sin(v.ang) * v.r;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // crateras
  ctx.fillStyle = '#4b5563';
  ctx.beginPath(); ctx.arc(-a.r * 0.2, -a.r * 0.15, a.r * 0.18, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(a.r * 0.25, a.r * 0.2, a.r * 0.13, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawEstrela(ctx, s, t) {
  ctx.save();
  ctx.translate(s.x, s.y);
  const pulse = 0.8 + Math.sin(t * 0.2 + s.x) * 0.2;
  ctx.scale(pulse, pulse);
  ctx.fillStyle = '#fbbf24';
  ctx.shadowColor = '#fbbf24';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const ang = (i * Math.PI) / 4;
    const r = i % 2 === 0 ? 9 : 3.5;
    const px = Math.cos(ang) * r, py = Math.sin(ang) * r;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

// ─── Telas ──────────────────────────────────────────────────────────────────
function TelaFim({ pontos, recorde, onTentar, onSair }) {
  const novoRecorde = pontos >= recorde && pontos > 0;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
      style={{ background: 'rgba(6,8,20,0.92)' }}>
      <div className="text-6xl mb-3">💥</div>
      <h2 className="text-3xl font-black text-white mb-1">Fim de jogo</h2>
      {novoRecorde && <p className="text-yellow-400 font-black mb-1">🏆 Novo recorde!</p>}
      <p className="text-cyan-300 text-lg font-bold mb-1">{pontos} pontos</p>
      <p className="text-gray-400 text-sm mb-6">Recorde: {Math.max(pontos, recorde)}</p>
      <button onClick={onTentar}
        className="w-full max-w-xs py-3.5 rounded-2xl font-black text-white text-base mb-3"
        style={{ background: 'linear-gradient(90deg,#0ea5e9,#6366f1)', boxShadow: '0 8px 24px rgba(14,165,233,0.4)' }}>
        🚀 Jogar de novo
      </button>
      <button onClick={onSair} className="text-gray-400 hover:text-white text-sm font-bold">Voltar ao menu</button>
    </div>
  );
}

function Pergunta({ perg, onResponder, cor = '#0ea5e9' }) {
  const [escolhida, setEscolhida] = useState(null);
  const letras = ['A', 'B', 'C', 'D'];

  function clique(i) {
    if (escolhida !== null) return;
    setEscolhida(i);
    setTimeout(() => onResponder(i === perg.correta), 750);
  }

  return (
    <div className="absolute inset-0 flex flex-col justify-center px-5"
      style={{ background: 'rgba(6,8,20,0.94)' }}>
      <p className="text-cyan-400 text-xs font-black uppercase tracking-widest text-center mb-2">
        {perg._reforco ? '🔁 Revisão — você errou esta antes' : '⚠ Campo de asteroides — responda!'}
      </p>
      <div className="bg-white/5 border border-cyan-500/30 rounded-2xl p-4 mb-4">
        <p className="text-white font-bold text-base leading-snug text-center">{perg.pergunta}</p>
      </div>
      <div className="space-y-2.5">
        {perg.opcoes.map((op, i) => {
          let estilo = 'bg-white/8 border-white/10 text-white';
          if (escolhida !== null) {
            if (i === perg.correta) estilo = 'bg-green-500/25 border-green-400 text-green-200';
            else if (i === escolhida) estilo = 'bg-red-500/25 border-red-400 text-red-200';
            else estilo = 'bg-white/5 border-white/10 text-gray-500';
          }
          return (
            <button key={i} onClick={() => clique(i)}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left text-sm font-semibold transition-all ${estilo}`}>
              <span className="w-7 h-7 rounded-lg flex items-center justify-center font-black shrink-0"
                style={{ background: 'rgba(255,255,255,0.1)' }}>{letras[i]}</span>
              {op}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Game ─────────────────────────────────────────────────────────────────────
export default function Game({ tema, materia, onSair }) {
  const canvasRef = useRef(null);
  const [estado, setEstado] = useState('carregando'); // carregando | jogando | pergunta | fim
  const [vidas, setVidas] = useState(3);
  const [pontos, setPontos] = useState(0);
  const [pergAtual, setPergAtual] = useState(null);
  const [recorde, setRecorde] = useState(() => parseInt(localStorage.getItem('aletrai_spacerun_recorde') || '0', 10));

  const gs = useRef(null);
  const raf = useRef(null);
  const teclas = useRef({ up: false, down: false });
  const bancoRef = useRef(null);
  const proximaRef = useRef(null); // próxima pergunta já pronta

  // Inicializa banco de perguntas e a partida
  useEffect(() => {
    let vivo = true;
    (async () => {
      const banco = criarBanco(tema, materia || tema);
      bancoRef.current = banco;
      await banco.prefetch();
      proximaRef.current = await banco.proxima();
      if (!vivo) return;
      iniciarPartida();
      setEstado('jogando');
    })();
    return () => { vivo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function iniciarPartida() {
    gs.current = {
      shipY: H / 2, shipVY: 0,
      asteroides: [], estrelas: [], starfield: [],
      dist: 0, vel: 3.2, t: 0,
      proxAst: 50, proxStar: 80, proxPergunta: 60 * 14,
      invuln: 0,
    };
    for (let i = 0; i < 60; i++) {
      gs.current.starfield.push({ x: rand(0, W), y: rand(0, H), z: rand(0.3, 1.4) });
    }
    setVidas(3); setPontos(0);
  }

  const perderVida = useCallback(() => {
    setVidas(v => {
      const nv = v - 1;
      if (nv <= 0) finalizar();
      else if (gs.current) gs.current.invuln = 70;
      return nv;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function finalizar() {
    cancelAnimationFrame(raf.current);
    setEstado('fim');
    setPontos(p => {
      if (p > recorde) { localStorage.setItem('aletrai_spacerun_recorde', String(p)); setRecorde(p); }
      return p;
    });
  }

  function abrirPergunta() {
    const p = proximaRef.current;
    if (!p) { gs.current.proxPergunta = gs.current.t + 60 * 8; return; } // ainda carregando
    setPergAtual(p);
    setEstado('pergunta');
    // pré-carrega a próxima em segundo plano
    if (bancoRef.current) bancoRef.current.proxima().then(n => { proximaRef.current = n; });
  }

  function responder(acertou) {
    if (bancoRef.current) bancoRef.current.registrar(pergAtual, acertou);
    setEstado('jogando');
    setPergAtual(null);
    if (acertou) {
      setPontos(p => p + 150);
      // limpa asteroides como recompensa
      if (gs.current) gs.current.asteroides = [];
    } else {
      perderVida();
    }
    if (gs.current) gs.current.proxPergunta = gs.current.t + 60 * 16;
  }

  // Loop principal
  useEffect(() => {
    if (estado !== 'jogando') return;
    const ctx = canvasRef.current.getContext('2d');

    function loop() {
      const g = gs.current;
      g.t++;
      g.vel += 0.0016; // acelera com o tempo
      g.dist += g.vel;

      // movimento da nave
      if (teclas.current.up) g.shipVY -= 0.9;
      if (teclas.current.down) g.shipVY += 0.9;
      g.shipVY += GRAV;
      g.shipVY *= 0.88;
      g.shipVY = Math.max(-MOVE_SPD, Math.min(MOVE_SPD, g.shipVY));
      g.shipY += g.shipVY;
      if (g.shipY < 28) { g.shipY = 28; g.shipVY = 0; }
      if (g.shipY > H - 28) { g.shipY = H - 28; g.shipVY = 0; }

      if (g.invuln > 0) g.invuln--;

      // spawn asteroides
      if (--g.proxAst <= 0) {
        const r = rand(16, 34);
        const verts = [];
        const n = 8;
        for (let i = 0; i < n; i++) verts.push({ ang: (i / n) * Math.PI * 2, r: r * rand(0.75, 1.15) });
        g.asteroides.push({ x: W + 40, y: rand(40, H - 40), r, verts, rot: 0, vrot: rand(-0.04, 0.04), vx: g.vel * rand(0.9, 1.3) });
        g.proxAst = rand(28, 55) - Math.min(g.dist / 400, 14);
      }
      // spawn estrelas
      if (--g.proxStar <= 0) {
        g.estrelas.push({ x: W + 20, y: rand(40, H - 40), col: false });
        g.proxStar = rand(50, 110);
      }
      // pergunta periódica
      if (g.t >= g.proxPergunta) { abrirPergunta(); return; }

      // atualiza asteroides
      for (const a of g.asteroides) { a.x -= a.vx; a.rot += a.vrot; }
      g.asteroides = g.asteroides.filter(a => a.x > -50);
      // colisão asteroide
      if (g.invuln === 0) {
        for (const a of g.asteroides) {
          const dx = a.x - SHIP_X, dy = a.y - g.shipY;
          if (Math.hypot(dx, dy) < a.r + 13) { a.x = -999; perderVida(); break; }
        }
      }
      // atualiza estrelas
      for (const s of g.estrelas) {
        s.x -= g.vel;
        if (!s.col && Math.hypot(s.x - SHIP_X, s.y - g.shipY) < 22) {
          s.col = true; setPontos(p => p + 10);
        }
      }
      g.estrelas = g.estrelas.filter(s => s.x > -30 && !s.col);
      // starfield
      for (const st of g.starfield) {
        st.x -= g.vel * st.z * 0.5;
        if (st.x < 0) { st.x = W; st.y = rand(0, H); }
      }
      setPontos(p => p + (g.t % 6 === 0 ? 1 : 0));

      // ─── render ───
      ctx.fillStyle = '#060814';
      ctx.fillRect(0, 0, W, H);
      // nebulosa sutil
      const neb = ctx.createRadialGradient(W * 0.7, H * 0.3, 0, W * 0.7, H * 0.3, 300);
      neb.addColorStop(0, 'rgba(99,102,241,0.12)');
      neb.addColorStop(1, 'transparent');
      ctx.fillStyle = neb; ctx.fillRect(0, 0, W, H);
      // estrelas de fundo
      for (const st of g.starfield) {
        ctx.fillStyle = `rgba(255,255,255,${0.3 + st.z * 0.4})`;
        ctx.fillRect(st.x, st.y, st.z * 1.6, st.z * 1.6);
      }
      for (const s of g.estrelas) drawEstrela(ctx, s, g.t);
      for (const a of g.asteroides) drawAsteroide(ctx, a);
      drawNave(ctx, SHIP_X, g.shipY, g.invuln > 0, g.t);

      raf.current = requestAnimationFrame(loop);
    }
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado]);

  // Teclado
  useEffect(() => {
    function kd(e) {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') teclas.current.up = true;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') teclas.current.down = true;
    }
    function ku(e) {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') teclas.current.up = false;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') teclas.current.down = false;
    }
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    return () => { window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); };
  }, []);

  function tentarDeNovo() { iniciarPartida(); setEstado('jogando'); }

  const xpGanho = Math.max(10, Math.floor(pontos / 5));

  const CSS_W = `min(${W}px, 100vw)`;
  const CSS_H = `min(${H}px, calc(100vw * ${H / W}), calc(100dvh - 90px))`;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center px-1"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #0e1430 0%, #04060f 70%)' }}>

      {/* HUD topo */}
      <div className="flex items-center justify-between mb-2" style={{ width: CSS_W, maxWidth: '100%' }}>
        <button onClick={() => onSair({ xpGanho })}
          className="text-gray-400 hover:text-white text-sm font-bold px-2">← Sair</button>
        <div className="flex items-center gap-3">
          <span className="text-white font-black text-lg">{'❤️'.repeat(Math.max(0, vidas))}</span>
          <span className="px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 font-black text-sm">
            {pontos} pts
          </span>
        </div>
      </div>

      <div className="relative rounded-2xl overflow-hidden shadow-2xl"
        style={{ width: CSS_W, height: CSS_H, aspectRatio: `${W} / ${H}` }}>
        <canvas ref={canvasRef} width={W} height={H} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }} />

        {estado === 'carregando' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: '#060814' }}>
            <div className="text-5xl mb-3 animate-bounce">🚀</div>
            <p className="text-cyan-300 font-bold">Preparando a missão...</p>
            <p className="text-gray-500 text-xs mt-1">Gerando perguntas sobre {tema}</p>
          </div>
        )}

        {estado === 'pergunta' && pergAtual && (
          <Pergunta perg={pergAtual} onResponder={responder} />
        )}

        {estado === 'fim' && (
          <TelaFim pontos={pontos} recorde={recorde}
            onTentar={tentarDeNovo} onSair={() => onSair({ xpGanho })} />
        )}

        {/* Botões touch (só durante o jogo) */}
        {estado === 'jogando' && (
          <>
            <button
              onTouchStart={(e) => { e.preventDefault(); teclas.current.up = true; }}
              onTouchEnd={(e) => { e.preventDefault(); teclas.current.up = false; }}
              onMouseDown={() => { teclas.current.up = true; }}
              onMouseUp={() => { teclas.current.up = false; }}
              onMouseLeave={() => { teclas.current.up = false; }}
              className="absolute left-0 right-0 top-0 h-1/2 opacity-0" aria-label="Subir" />
            <button
              onTouchStart={(e) => { e.preventDefault(); teclas.current.down = true; }}
              onTouchEnd={(e) => { e.preventDefault(); teclas.current.down = false; }}
              onMouseDown={() => { teclas.current.down = true; }}
              onMouseUp={() => { teclas.current.down = false; }}
              onMouseLeave={() => { teclas.current.down = false; }}
              className="absolute left-0 right-0 bottom-0 h-1/2 opacity-0" aria-label="Descer" />
          </>
        )}
      </div>

      <p className="text-gray-500 text-xs mt-2">Segure ↑ / ↓ (ou toque em cima/embaixo) para voar. Pegue ⭐ e desvie dos asteroides.</p>
    </div>
  );
}
