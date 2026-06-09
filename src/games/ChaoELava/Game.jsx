import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gerarPerguntasJogo } from '../../services/anthropic';
import { gerarConteudoJogo }  from '../../services/mock';

// ─── Constantes ───────────────────────────────────────────────────────────────
const GW = 400;
const GH = 600;
const GRAV       = 0.50;
const JUMP_VEL   = -9.5;
const MOVE_SPD   = 2.6;
const FLOOR_H    = 200;
const BOSS_EVERY = 5;
const MAX_FLOORS = 30;
const LAVA_INIT_SPD  = 0.08;
const LAVA_ACCEL     = 0.000035;
const LAVA_START_OFF = 400; // px abaixo do mundo

// ─── Paleta ───────────────────────────────────────────────────────────────────
const C = {
  bg: '#0e0020', bg2: '#180035',
  platBase: '#3a1f6a', platTop: '#6a44bb', platShad: '#200040',
  bossLine: '#ff2244',
  lavaTip: '#ff5500', lavaMid: '#ff2200', lavaBtm: '#770000',
  lavaBub: '#ffaa00',
  hud: '#ffffff', hudDim: '#aaaaaa',
};

// ─── Desenho dos personagens (canvas direto, sem sprites por string) ──────────
function drawSword(ctx, x, y, flip, attackFrame) {
  // Desenha espada + slash do ataque
  const S = 2;
  ctx.save();
  if (flip) { ctx.translate(x + 9 * S, 0); ctx.scale(-1, 1); x = 0; }

  const progress = attackFrame / 12; // 0→1 durante o ataque

  // Posição base da espada (mão direita do player)
  const hx = x + 9*S;
  const hy = y + 10*S;

  // Ângulo do swing: -60° → +40° durante o ataque
  const angle = (-1.0 + progress * 1.7);

  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(angle);

  // Cabo
  ctx.fillStyle = '#8b4513';
  ctx.fillRect(-S/2, 0, S, 5*S);
  // Guarda
  ctx.fillStyle = '#aaa830';
  ctx.fillRect(-2*S, 4*S, 4*S, S);
  // Lâmina
  ctx.fillStyle = '#e8e8f0';
  ctx.fillRect(-S/2, -9*S, S, 10*S);
  // Brilho da lâmina
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, -9*S, S/2, 10*S);

  ctx.restore();

  // Slash arc (rastro luminoso)
  if (attackFrame < 10) {
    ctx.globalAlpha = 0.5 * (1 - attackFrame / 10);
    ctx.strokeStyle = '#ffffaa';
    ctx.lineWidth = 3;
    ctx.beginPath();
    const r = 28;
    const startA = -1.0;
    const endA   = startA + progress * 1.7;
    ctx.arc(hx, hy, r, startA, endA);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

function drawPlayer(ctx, x, y, flip, frame, invincible, attackFrame) {
  if (invincible > 0 && Math.floor(invincible / 5) % 2 === 1) return; // pisca
  const S = 2;
  const origX = x; // guarda posição real antes do flip modificar x
  ctx.save();
  if (flip) { ctx.translate(x + 9 * S, 0); ctx.scale(-1, 1); x = 0; }

  // Cabelo
  ctx.fillStyle = '#3b1f0a';
  ctx.fillRect(x + 2*S, y,       5*S, S);
  ctx.fillRect(x + S,   y + S,   7*S, S);
  // Rosto (pele)
  ctx.fillStyle = '#f5c89a';
  ctx.fillRect(x + S,   y + 2*S, 7*S, 5*S);
  // Olhos
  ctx.fillStyle = '#111';
  ctx.fillRect(x + 2*S, y + 3*S, S, S);
  ctx.fillRect(x + 5*S, y + 3*S, S, S);
  // Boca
  ctx.fillStyle = '#c05030';
  ctx.fillRect(x + 3*S, y + 6*S, 3*S, S);
  // Camisa laranja
  ctx.fillStyle = '#ff6a30';
  ctx.fillRect(x + S,   y + 7*S, 7*S, 5*S);
  // Braços (pele)
  ctx.fillStyle = '#f5c89a';
  ctx.fillRect(x,       y + 7*S, S,   4*S);
  ctx.fillRect(x + 8*S, y + 7*S, S,   4*S);
  // Cinto
  ctx.fillStyle = '#aa7700';
  ctx.fillRect(x + S,   y + 12*S, 7*S, S);
  // Calça
  ctx.fillStyle = '#1e2e50';
  const lA = frame === 1 ? 2*S : 0;
  const lB = frame === 1 ? 0   : 2*S;
  ctx.fillRect(x + S,   y + 13*S, 3*S, 4*S + lA); // perna esq
  ctx.fillRect(x + 5*S, y + 13*S, 3*S, 4*S + lB); // perna dir
  // Botas
  ctx.fillStyle = '#3a1a04';
  ctx.fillRect(x + S,   y + 13*S + 4*S + lA, 3*S, S + S);
  ctx.fillRect(x + 5*S, y + 13*S + 4*S + lB, 3*S, S + S);

  // Espada pequena no cinto (sempre visível, pisca durante ataque)
  if (!attackFrame || attackFrame === 0) {
    ctx.fillStyle = '#e8e8f0';
    ctx.fillRect(x + 9*S, y + 10*S, S/2, 6*S);
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(x + 9*S - S/2, y + 15*S, 2*S, S);
  }

  ctx.restore();

  // Slash (desenhado fora do save/restore de flip para coordenadas corretas)
  if (attackFrame > 0) {
    drawSword(ctx, origX, y, flip, attackFrame); // usa origX, não o x modificado pelo flip
  }
}

function drawGoblin(ctx, x, y, flip, frame) {
  const S = 2;
  ctx.save();
  if (flip) { ctx.translate(x + 10*S, 0); ctx.scale(-1, 1); x = 0; }

  // Orelhas pontudas
  ctx.fillStyle = '#0f8820';
  ctx.fillRect(x,        y + S,  2*S, 4*S);
  ctx.fillRect(x + 8*S,  y + S,  2*S, 4*S);
  // Cabeça
  ctx.fillStyle = '#1ecc3a';
  ctx.fillRect(x + S,    y,      8*S, 7*S);
  // Olhos (amarelos grandes)
  ctx.fillStyle = '#eecc00';
  ctx.fillRect(x + 2*S,  y + S,  2*S, 2*S);
  ctx.fillRect(x + 6*S,  y + S,  2*S, 2*S);
  // Pupilas
  ctx.fillStyle = '#111';
  ctx.fillRect(x + 2*S + S/2, y + S + S/2, S, S);
  ctx.fillRect(x + 6*S + S/2, y + S + S/2, S, S);
  // Boca / dentes
  ctx.fillStyle = '#cc1100';
  ctx.fillRect(x + 2*S,  y + 5*S, 6*S, 2*S);
  ctx.fillStyle = '#eee';
  ctx.fillRect(x + 2*S,  y + 5*S, S,   S);
  ctx.fillRect(x + 4*S,  y + 5*S, S,   S);
  ctx.fillRect(x + 7*S,  y + 5*S, S,   S);
  // Corpo (couro)
  ctx.fillStyle = '#5a3010';
  ctx.fillRect(x + S,    y + 7*S, 8*S, 5*S);
  ctx.fillStyle = '#8a5020';
  ctx.fillRect(x + 3*S,  y + 8*S, 4*S, 3*S); // peito claro
  // Pernas
  ctx.fillStyle = '#2a2a3a';
  const lA = frame === 1 ? 2*S : 0;
  const lB = frame === 1 ? 0   : 2*S;
  ctx.fillRect(x + S,    y + 12*S, 3*S, 3*S + lA);
  ctx.fillRect(x + 6*S,  y + 12*S, 3*S, 3*S + lB);
  // Botas
  ctx.fillStyle = '#1a1005';
  ctx.fillRect(x + S,    y + 12*S + 3*S + lA, 3*S, S);
  ctx.fillRect(x + 6*S,  y + 12*S + 3*S + lB, 3*S, S);

  ctx.restore();
}

function drawSkeleton(ctx, x, y, flip, frame) {
  const S = 2;
  ctx.save();
  if (flip) { ctx.translate(x + 8*S, 0); ctx.scale(-1, 1); x = 0; }

  const bone = '#d0cca0', boneLt = '#eeeac0', dark = '#1a1a2a';
  // Crânio
  ctx.fillStyle = boneLt;
  ctx.fillRect(x + S,   y,      6*S, 5*S);
  // Órbitas oculares
  ctx.fillStyle = dark;
  ctx.fillRect(x + S,   y + S,  2*S, 2*S);
  ctx.fillRect(x + 5*S, y + S,  2*S, 2*S);
  // Mandíbula / dentes
  ctx.fillStyle = bone;
  ctx.fillRect(x + S,   y + 5*S, 6*S, 2*S);
  ctx.fillStyle = boneLt;
  ctx.fillRect(x + 2*S, y + 5*S, S,   S);
  ctx.fillRect(x + 4*S, y + 5*S, S,   S);
  ctx.fillRect(x + 6*S, y + 5*S, S,   S);
  // Pescoço
  ctx.fillStyle = bone;
  ctx.fillRect(x + 3*S, y + 7*S, 2*S, S);
  // Caixa torácica
  ctx.fillStyle = bone;
  ctx.fillRect(x + S,   y + 8*S, 6*S, 4*S);
  ctx.fillStyle = dark;
  ctx.fillRect(x + 2*S, y + 9*S, S,   S);
  ctx.fillRect(x + 5*S, y + 9*S, S,   S);
  ctx.fillRect(x + 2*S, y + 11*S, S,  S);
  ctx.fillRect(x + 5*S, y + 11*S, S,  S);
  // Pernas
  ctx.fillStyle = bone;
  const lA = frame === 1 ? S : 0;
  const lB = frame === 1 ? 0 : S;
  ctx.fillRect(x + S,   y + 12*S, 2*S, 4*S + lA);
  ctx.fillRect(x + 5*S, y + 12*S, 2*S, 4*S + lB);

  ctx.restore();
}

function drawMage(ctx, x, y, flip, frame) {
  const S = 2;
  ctx.save();
  if (flip) { ctx.translate(x + 9*S, 0); ctx.scale(-1, 1); x = 0; }

  // Chapéu (ponta + aba)
  ctx.fillStyle = '#110022';
  ctx.fillRect(x + 4*S, y,      S,   3*S);
  ctx.fillRect(x + 3*S, y + 3*S, 3*S, 2*S);
  ctx.fillRect(x + S,   y + 5*S, 7*S, S);
  // Rosto
  ctx.fillStyle = '#f0c090';
  ctx.fillRect(x + 2*S, y + 6*S, 5*S, 4*S);
  // Olhos mágicos
  ctx.fillStyle = '#ff44ff';
  ctx.fillRect(x + 3*S, y + 7*S, S,   S);
  ctx.fillRect(x + 5*S, y + 7*S, S,   S);
  // Manto roxo
  ctx.fillStyle = '#8800cc';
  ctx.fillRect(x + S,   y + 10*S, 7*S, 5*S);
  // Capa clara
  ctx.fillStyle = '#cc99ff';
  ctx.fillRect(x,       y + 10*S, S,   4*S);
  ctx.fillRect(x + 8*S, y + 10*S, S,   4*S);
  // Orbe mágico na mão
  ctx.fillStyle = '#ffbb00';
  const orbY = frame === 1 ? y + 13*S : y + 14*S; // orbe sobe/desce
  ctx.beginPath();
  ctx.arc(x + 9*S, orbY, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff088';
  ctx.fillRect(x + 9*S - S/2, orbY - S/2, S, S);
  // Pernas
  ctx.fillStyle = '#550099';
  const lA = frame === 1 ? S : 0;
  const lB = frame === 1 ? 0 : S;
  ctx.fillRect(x + 2*S, y + 15*S, 2*S, 3*S + lA);
  ctx.fillRect(x + 5*S, y + 15*S, 2*S, 3*S + lB);

  ctx.restore();
}

// ─── Geração procedural dos andares ──────────────────────────────────────────
function seededRnd(seed, idx) {
  return Math.abs(Math.sin(seed * 9301 + idx * 49297 + 233)) % 1;
}

function gerarAndares() {
  const worldH = MAX_FLOORS * FLOOR_H;
  const andares = [];

  for (let f = 1; f <= MAX_FLOORS; f++) {
    const groundY = worldH - f * FLOOR_H + FLOOR_H - 18;
    const isBoss  = f % BOSS_EVERY === 0;
    const seed    = f * 137;

    const plats = [{ x: 0, y: groundY, w: GW, h: 18, tipo: 'chao' }];

    // Escada de 3 degraus: 60 / 120 / 175px acima do chão
    // Cada salto ≤65px (max pulo ≈ 87px) → sempre alcançável
    const DEGRAUS = [60, 120, 175];
    if (!isBoss) {
      for (let i = 0; i < 3; i++) {
        const pw = 100 + Math.floor(seededRnd(seed, i) * 50); // 100-150px
        const px = Math.floor(seededRnd(seed, i + 10) * (GW - pw - 20)) + 10;
        const py = groundY - DEGRAUS[i] - Math.floor(seededRnd(seed, i + 20) * 6);
        plats.push({ x: px, y: py, w: pw, h: 12, tipo: 'mid' });
      }
    } else {
      // Boss: escada fixa e visível
      plats.push({ x: 15,  y: groundY - 60,  w: 115, h: 12, tipo: 'mid' });
      plats.push({ x: 145, y: groundY - 120, w: 115, h: 12, tipo: 'mid' });
      plats.push({ x: 270, y: groundY - 175, w: 115, h: 12, tipo: 'mid' });
    }

    // Inimigos (só andares não-boss, a partir do andar 2)
    const inimigos = [];
    if (!isBoss && f > 1) {
      const numEn = Math.min(Math.floor(f / 3) + 1, 3);
      const tipos = ['goblin', 'esqueleto', 'mago'];
      for (let e = 0; e < numEn; e++) {
        const tipo = tipos[Math.floor(seededRnd(seed * 3, e) * tipos.length)];
        // Usa degrau 1 (plats[1]) ou 2 (plats[2]) para posicionar inimigos
        const pIdx = 1 + (e % (plats.length - 1));
        const pl   = plats[Math.min(pIdx, plats.length - 1)];
        const charH = tipo === 'goblin' ? 26 : 28;
        inimigos.push({
          id: f * 10 + e,
          x:  pl.x + 10 + Math.floor(seededRnd(seed, e + 50) * Math.max(0, pl.w - 30)),
          y:  pl.y - charH,
          w:  tipo === 'goblin' ? 20 : 18,
          h:  charH,
          vx: (seededRnd(seed, e + 60) > 0.5 ? 1 : -1) * (0.22 + (f - 1) * 0.005 + seededRnd(seed, e + 61) * 0.06),
          baseSpeed: 0.22 + (f - 1) * 0.005 + seededRnd(seed, e + 61) * 0.06, // velocidade original (nunca muda)
          knockbackTimer: 0,  // frames de knockback ativo
          knockbackVx: 0,
          hitCooldown: 0,     // invencibilidade após levar dano (evita multi-hit)
          tipo, platX: pl.x, platW: pl.w,
          hp: 1,              // todos morrem em 1 hit — sempre
          maxHp: 1 + Math.floor(f / 5),
          vivo: true, cooldown: Math.floor(seededRnd(seed, e + 70) * 120),
          frame: 0, frameTick: 0,
        });
      }
    }

    andares.push({ num: f, plats, inimigos, isBoss, groundY });
  }

  return { andares, worldH };
}

// ─── Renderer: fundo + plataformas ───────────────────────────────────────────
function drawWorld(ctx, gs) {
  const { camY, andares, worldH, runTime } = gs;

  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, GW, GH);

  // Estrelas fixas
  for (let i = 0; i < 70; i++) {
    const sx = (i * 173 + 7)  % GW;
    const wy = (i * 293 + 11) % worldH;
    const sy = wy - camY;
    if (sy < -2 || sy > GH + 2) continue;
    ctx.fillStyle = i % 5 === 0 ? '#ffffff33' : '#ffffff15';
    ctx.fillRect(sx, sy, i % 3 === 0 ? 2 : 1, i % 3 === 0 ? 2 : 1);
  }

  // Plataformas
  for (const andar of andares) {
    for (const plat of andar.plats) {
      const sy = plat.y - camY;
      if (sy > GH + 20 || sy + plat.h < -20) continue;

      if (plat.tipo === 'chao') {
        ctx.fillStyle = C.platShad;
        ctx.fillRect(0, sy + 5, GW, plat.h);
        ctx.fillStyle = C.platBase;
        ctx.fillRect(0, sy, GW, plat.h);
        ctx.fillStyle = andar.isBoss ? C.bossLine : C.platTop;
        ctx.fillRect(0, sy, GW, 4);
        // Label
        ctx.font = andar.isBoss ? 'bold 11px monospace' : '9px monospace';
        ctx.fillStyle = andar.isBoss ? '#ff6688' : '#9966ff';
        ctx.textAlign = 'right';
        ctx.fillText(andar.isBoss ? `⚔ BOSS ${andar.num}` : `${andar.num}`, GW - 6, sy - 3);
        ctx.textAlign = 'left';
      } else {
        ctx.fillStyle = C.platShad;
        ctx.fillRect(plat.x + 3, sy + 4, plat.w, plat.h);
        ctx.fillStyle = C.platBase;
        ctx.fillRect(plat.x, sy, plat.w, plat.h);
        ctx.fillStyle = C.platTop;
        ctx.fillRect(plat.x, sy, plat.w, 4);
      }
    }
  }
}

// ─── Renderer: lava ──────────────────────────────────────────────────────────
function drawLava(ctx, lavaY, camY, runTime) {
  const sy = lavaY - camY;
  if (sy >= GH + 10) return;

  // Glow
  if (sy < GH) {
    const g = ctx.createLinearGradient(0, Math.max(0, sy - 70), 0, sy);
    g.addColorStop(0, 'transparent');
    g.addColorStop(1, '#ff330040');
    ctx.fillStyle = g;
    ctx.fillRect(0, Math.max(0, sy - 70), GW, Math.min(70, sy));
  }

  // Onda
  ctx.beginPath();
  ctx.moveTo(0, sy);
  for (let wx = 0; wx <= GW; wx += 3) {
    ctx.lineTo(wx, sy + Math.sin(wx / 25 + runTime * 0.07) * 7);
  }
  ctx.lineTo(GW, GH + 10);
  ctx.lineTo(0, GH + 10);
  ctx.closePath();

  const lg = ctx.createLinearGradient(0, sy, 0, sy + 200);
  lg.addColorStop(0, C.lavaTip);
  lg.addColorStop(0.3, C.lavaMid);
  lg.addColorStop(1, C.lavaBtm);
  ctx.fillStyle = lg;
  ctx.fill();

  // Bolhas
  for (let b = 0; b < 10; b++) {
    const bx = ((b * 43 + runTime * 0.4) % (GW + 20)) - 10;
    const by = sy + Math.sin(runTime * 0.05 + b * 1.1) * 8;
    ctx.fillStyle = C.lavaBub;
    ctx.beginPath();
    ctx.arc(bx, by, 2 + b % 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── Renderer: HUD ───────────────────────────────────────────────────────────
function drawHUD(ctx, vidas, andar, lavaSpeed) {
  ctx.fillStyle = '#00000099';
  ctx.fillRect(0, 0, GW, 34);

  // Corações
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < vidas ? '#ff4455' : '#442233';
    ctx.fillRect(8 + i * 22, 9, 16, 14);
  }

  // Andar
  const isBoss = andar % BOSS_EVERY === 0;
  ctx.fillStyle = isBoss ? '#ff4466' : '#ffffff';
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(isBoss ? `⚔ BOSS ${andar}` : `Andar ${andar}`, GW / 2, 21);
  ctx.textAlign = 'left';

  // Barra lava
  const pct = Math.min(1, (lavaSpeed - LAVA_INIT_SPD) / (LAVA_INIT_SPD * 15));
  ctx.fillStyle = '#333';
  ctx.fillRect(GW - 52, 11, 42, 7);
  ctx.fillStyle = pct < 0.5 ? '#ff6633' : '#ff2200';
  ctx.fillRect(GW - 52, 11, Math.floor(42 * pct), 7);
  ctx.fillStyle = '#aaa';
  ctx.font = '8px monospace';
  ctx.textAlign = 'right';
  ctx.fillText('LAVA', GW - 4, 22);
  ctx.textAlign = 'left';
}

// ─── Colisão one-way ─────────────────────────────────────────────────────────
function resolveCollisions(p, andares) {
  p.onGround = false;
  const prevFeet = (p.y - p.vy) + p.h; // pés no frame anterior
  const currFeet = p.y + p.h;

  const nearby = andares.filter(a => Math.abs(a.groundY - p.y) < FLOOR_H * 2);

  for (const andar of nearby) {
    for (const plat of andar.plats) {
      if (p.x + p.w <= plat.x + 2 || p.x >= plat.x + plat.w - 2) continue;
      // Só aterra se pés vieram ESTRITAMENTE de cima
      if (p.vy >= 0 && prevFeet <= plat.y && currFeet >= plat.y) {
        p.y = plat.y - p.h;
        p.vy = 0;
        p.onGround = true;
        return;
      }
    }
  }
}

// ─── Componente principal ────────────────────────────────────────────────────
// Gera 3 perguntas frescas para o boss
async function gerarPergsBoss(tema, materia, modoIA) {
  // Modo sem IA: vai direto para o mock
  if (modoIA) {
    const ia = await gerarPerguntasJogo(tema, materia?.nome || tema, 3);
    if (ia && ia.length >= 3) return ia.slice(0, 3);
  }
  // Mock (fallback ou modo teste)
  const cont = await gerarConteudoJogo(tema, 'quiz');
  const base = cont?.perguntas || [];
  if (base.length === 0) return [];
  return [...base].sort(() => Math.random() - 0.5).slice(0, 3);
}

export default function Game({ tema, materia, modoIA = true, onSair }) {
  const canvasRef = useRef(null);
  const gsRef     = useRef(null);
  const keysRef    = useRef({});
  const touchRef   = useRef({ left: false, right: false, jump: false, attack: false });
  const rafRef     = useRef(null);
  const jumpedRef  = useRef(false);
  const attackedRef = useRef(false); // evita spam de ataque
  const attackFrameRef = useRef(0); // 0=sem ataque, 1-12=animando
  const attackCoolRef  = useRef(0); // cooldown entre ataques

  const [overlay, setOverlay]            = useState(null); // null | 'boss' | 'bossLoading' | 'dead'
  const [bossPerguntas, setBossPerguntas]= useState([]);   // 3 perguntas do boss atual
  const [bossIdx, setBossIdx]            = useState(0);    // qual das 3 estamos
  const [erradas, setErradas]            = useState([]);
  const [vidas, setVidas]   = useState(3);
  const [andar, setAndar]   = useState(1);
  const [score, setScore]   = useState(0);

  // ─── Init ────────────────────────────────────────────────────────────────
  const initGS = useCallback(() => {
    const { andares, worldH } = gerarAndares();

    // Spawn EXATAMENTE sobre o chão do andar 1
    const floor1 = andares.find(a => a.num === 1);
    const spawnY  = floor1 ? floor1.groundY - 32 : worldH - 50;

    gsRef.current = {
      player: {
        x: 40, y: spawnY,
        w: 18, h: 32,
        vx: 0, vy: 0,
        onGround: true,
        facing: 1,
        invincible: 0,
      },
      andares, worldH,
      bullets: [],
      lavaY:     worldH + LAVA_START_OFF,
      lavaSpeed: LAVA_INIT_SPD,
      camY:      worldH - GH,         // mostra exatamente o fundo do mundo
      currentFloor: 1,
      bossVisitados: new Set(),
      bossCount: 0,  // bosses derrotados — controla aceleração geral
      runTime: 0,
    };
  }, []);

  // ─── Loop ────────────────────────────────────────────────────────────────
  const gameLoop = useCallback(() => {
    const gs  = gsRef.current;
    const cvs = canvasRef.current;
    if (!gs || !cvs) {
      rafRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    // Durante boss: continua subindo a lava mas pausa o player
    if (overlay === 'boss' || overlay === 'bossLoading') {
      gs.lavaY    -= gs.lavaSpeed;
      gs.lavaSpeed = Math.min(gs.lavaSpeed + LAVA_ACCEL, LAVA_INIT_SPD * 8);
      gs.runTime++;
      // Redesenha só o canvas para mostrar a lava subindo atrás do overlay
      const ctx2 = cvs.getContext('2d');
      drawWorld(ctx2, gs);
      drawLava(ctx2, gs.lavaY, gs.camY, gs.runTime);
      drawPlayer(ctx2, gs.player.x, gs.player.y - gs.camY, gs.player.facing < 0, 0, 0);
      drawHUD(ctx2, vidas, gs.currentFloor, gs.lavaSpeed);
      rafRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    if (overlay === 'dead') {
      rafRef.current = requestAnimationFrame(gameLoop);
      return;
    }
    const ctx  = cvs.getContext('2d');
    const keys = keysRef.current;
    const t    = touchRef.current;
    const p    = gs.player;
    gs.runTime++;

    const goL = keys['ArrowLeft']  || keys['a'] || keys['A'] || t.left;
    const goR = keys['ArrowRight'] || keys['d'] || keys['D'] || t.right;
    const doJ = keys['ArrowUp']    || keys['w'] || keys['W'] || keys[' '] || t.jump;

    // Movimento horizontal
    if (goL)      { p.vx = Math.max(p.vx - 1.5, -MOVE_SPD); p.facing = -1; }
    else if (goR) { p.vx = Math.min(p.vx + 1.5,  MOVE_SPD); p.facing =  1; }
    else          { p.vx *= 0.7; }

    // Pulo (1 clique por pressão)
    if (doJ && p.onGround && !jumpedRef.current) {
      p.vy = JUMP_VEL;
      p.onGround = false;
      jumpedRef.current = true;
    }
    if (!doJ) jumpedRef.current = false;

    // Gravidade
    p.vy = Math.min(p.vy + GRAV, 16);

    // Movimento
    p.x += p.vx;
    p.y += p.vy;

    // Wrap horizontal
    if (p.x + p.w < 0)  p.x = GW;
    if (p.x > GW)       p.x = -p.w;

    // ─── Ataque com espada ───────────────────────────────────────────────
    const doAtk = keys['z'] || keys['Z'] || keys['x'] || keys['X'] || keys['k'] || keys['K'] || touchRef.current.attack;
    if (attackCoolRef.current > 0) attackCoolRef.current--;

    if (doAtk && !attackedRef.current && attackCoolRef.current === 0) {
      attackFrameRef.current = 12; // inicia animação (12 frames)
      attackCoolRef.current  = 22; // cooldown
      attackedRef.current    = true;
    }
    if (!doAtk) attackedRef.current = false;

    if (attackFrameRef.current > 0) {
      attackFrameRef.current--;
      // Hitbox do ataque: à frente do player
      const aDir  = p.facing;
      const aX    = aDir > 0 ? p.x + p.w : p.x - 40;
      const aY    = p.y + 4;
      const aW    = 40;
      const aH    = p.h - 4;

      // Verifica colisão com inimigos
      const nearby2 = gs.andares.filter(a => Math.abs(a.groundY - p.y) < FLOOR_H * 2);
      for (const andar of nearby2) {
        for (const en of andar.inimigos) {
          if (!en.vivo) continue;
          if (en.hitCooldown === 0 &&
              en.x < aX + aW && en.x + en.w > aX &&
              en.y < aY + aH && en.y + en.h > aY) {
            en.hp--;
            en.hitCooldown = 20;          // invencível por 20 frames (evita multi-hit)
            en.knockbackVx = aDir * 3;    // knockback temporário
            en.knockbackTimer = 10;       // dura 10 frames
            if (en.hp <= 0) en.vivo = false;
          }
        }
      }
    }

    // Colisão
    resolveCollisions(p, gs.andares);

    // Segurança: caiu fora do mundo → morte
    if (p.y > gs.worldH + 150) {
      dano(3); // mata instantaneamente
    }

    // Câmera: segue suavemente, player a ~45% da tela
    const camTarget = p.y - GH * 0.45;
    gs.camY += (camTarget - gs.camY) * 0.1;
    gs.camY  = Math.max(0, Math.min(gs.camY, gs.worldH - GH));

    // Andar atual
    const novoAndar = Math.max(1, Math.floor((gs.worldH - p.y - p.h) / FLOOR_H) + 1);
    if (novoAndar !== gs.currentFloor) {
      gs.currentFloor = novoAndar;
      setAndar(novoAndar);
      if (novoAndar % BOSS_EVERY === 0 && !gs.bossVisitados.has(novoAndar)) {
        gs.bossVisitados.add(novoAndar);
        setOverlay('bossLoading');
        // Gera 3 perguntas frescas no momento que o boss aparece
        gerarPergsBoss(tema, materia, modoIA).then(pergs => {
          setBossPerguntas(pergs);
          setBossIdx(0);
          setOverlay('boss');
        });
        return;
      }
    }

    // Inimigos
    const visibles = gs.andares.filter(a => Math.abs(a.groundY - (gs.camY + GH/2)) < FLOOR_H * 3);
    for (const andar of visibles) {
      for (const en of andar.inimigos) {
        if (!en.vivo) continue;
        // Cooldown de invencibilidade
        if (en.hitCooldown > 0) en.hitCooldown--;

        const mult = 1 + gs.bossCount * 0.04;

        if (en.knockbackTimer > 0) {
          // Knockback temporário — não altera a velocidade de patrulha
          en.x += en.knockbackVx;
          en.knockbackTimer--;
        } else {
          // Patrulha normal usando baseSpeed original
          const dir = en.vx >= 0 ? 1 : -1;
          en.x += dir * en.baseSpeed * mult;
          if (en.x < en.platX || en.x + en.w > en.platX + en.platW) en.vx *= -1;
        }
        en.frameTick++;
        if (en.frameTick >= 10) { en.frame = en.frame ^ 1; en.frameTick = 0; }
        en.cooldown = Math.max(0, en.cooldown - 1);

        // Mago atira
        if (en.tipo === 'mago' && Math.abs(en.x - p.x) < 220 && Math.abs(en.y - p.y) < 80 && en.cooldown === 0) {
          const bulletSpd = 1.0 + gs.bossCount * 0.04; // começa lento, +8% por boss
          const dir = en.vx >= 0 ? 1 : -1; // atira na direção que está se movendo
          gs.bullets.push({ x: en.x + en.w/2, y: en.y + en.h/2, vx: dir * bulletSpd, vy: 0 });
          en.cooldown = 140;
        }

        // Dano corpo a corpo
        if (p.invincible <= 0) {
          if (p.x < en.x + en.w && p.x + p.w > en.x && p.y < en.y + en.h && p.y + p.h > en.y) dano(1);
        }
      }
    }

    // Balas
    gs.bullets = gs.bullets.filter(b => b.x > -30 && b.x < GW + 30);
    for (const b of gs.bullets) {
      b.x += b.vx;
      if (p.invincible <= 0 && Math.abs(b.x - (p.x + p.w/2)) < 14 && Math.abs(b.y - (p.y + p.h/2)) < 16) {
        dano(1); b.x = -999;
      }
    }

    // Lava
    gs.lavaY    -= gs.lavaSpeed;
    gs.lavaSpeed = Math.min(gs.lavaSpeed + LAVA_ACCEL, LAVA_INIT_SPD * 8);
    if (p.invincible <= 0 && p.y + p.h > gs.lavaY) {
      p.vy = JUMP_VEL * 0.75;
      dano(1);
    }

    if (p.invincible > 0) p.invincible--;

    // ─── Render ──────────────────────────────────────────────────────────
    drawWorld(ctx, gs);
    drawLava(ctx, gs.lavaY, gs.camY, gs.runTime);

    // Inimigos
    for (const andar of visibles) {
      for (const en of andar.inimigos) {
        if (!en.vivo) continue;
        const sy = en.y - gs.camY;
        if (sy < -40 || sy > GH + 40) continue;
        const fn = { goblin: drawGoblin, esqueleto: drawSkeleton, mago: drawMage }[en.tipo] || drawGoblin;
        fn(ctx, en.x, sy, en.vx < 0, en.frame);
        if (en.hp < en.maxHp) {
          ctx.fillStyle = '#ff000066';
          ctx.fillRect(en.x, sy - 6, en.w, 3);
          ctx.fillStyle = '#ff4444';
          ctx.fillRect(en.x, sy - 6, Math.floor(en.w * en.hp / en.maxHp), 3);
        }
      }
    }

    // Balas
    for (const b of gs.bullets) {
      const by = b.y - gs.camY;
      ctx.fillStyle = '#ff88ff';
      ctx.fillRect(b.x - 4, by - 4, 8, 8);
      ctx.fillStyle = '#fff';
      ctx.fillRect(b.x - 2, by - 2, 4, 4);
    }

    // Player
    const moving = Math.abs(p.vx) > 0.5 && p.onGround;
    const frame  = moving ? Math.floor(gs.runTime / 7) % 2 : 0;
    drawPlayer(ctx, p.x, p.y - gs.camY, p.facing < 0, frame, p.invincible, attackFrameRef.current);

    drawHUD(ctx, vidas, gs.currentFloor, gs.lavaSpeed);

    rafRef.current = requestAnimationFrame(gameLoop);
  }, [overlay, vidas, tema, materia]);

  function dano(qtd) {
    const gs = gsRef.current;
    if (!gs || gs.player.invincible > 0) return;
    gs.player.invincible = 90;
    setVidas(v => {
      const nova = Math.max(0, v - qtd);
      if (nova <= 0) setTimeout(() => setOverlay('dead'), 400);
      return nova;
    });
  }

  function responderBoss(opcaoIdx) {
    const perg    = bossPerguntas[bossIdx];
    const correto = opcaoIdx === perg.correta;

    if (!correto) {
      setErradas(prev => [...prev, { ...perg, respostaDada: opcaoIdx }]);
      setVidas(v => {
        const nova = Math.max(0, v - 1);
        if (nova <= 0) setTimeout(() => setOverlay('dead'), 300);
        return nova;
      });
    }

    const proxIdx = bossIdx + 1;
    if (proxIdx < bossPerguntas.length && (correto || vidas > 1)) {
      setBossIdx(proxIdx);
    } else {
      // Boss vencido (ou sem mais vidas)
      setScore(s => s + (gsRef.current?.currentFloor || 1) * 100);
      if (gsRef.current) {
        gsRef.current.lavaSpeed *= 0.82;  // lava desacelera como recompensa
        gsRef.current.bossCount++;        // inimigos ficam um pouquinho mais rápidos
      }
      setOverlay(null);
    }
  }

  function reiniciar() {
    cancelAnimationFrame(rafRef.current);
    initGS();
    setVidas(3); setAndar(1); setScore(0);
    setOverlay(null); setBossPerguntas([]); setBossIdx(0); setErradas([]);
  }

  useEffect(() => { initGS(); }, [initGS]);

  useEffect(() => {
    const dn = e => { keysRef.current[e.key] = true; if ([' ','ArrowUp','ArrowDown','z','Z','x','X','k','K'].includes(e.key)) e.preventDefault(); };
    const up = e => { keysRef.current[e.key] = false; };
    window.addEventListener('keydown', dn);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', dn); window.removeEventListener('keyup', up); };
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [gameLoop]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center overflow-hidden select-none">
      {/* Botão de sair */}
      <div className="absolute top-3 left-3 z-50">
        <button
          onClick={() => onSair({ xpGanho: Math.max(10, Math.floor(score / 10)) })}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20">
          ← Sair
        </button>
      </div>

      <div className="relative w-full flex-1 flex items-center justify-center">
        <canvas ref={canvasRef} width={GW} height={GH}
          style={{ display:'block', imageRendering:'pixelated', maxWidth:'100%', maxHeight:'calc(100vh - 80px)', objectFit:'contain' }}
        />

        {/* Boss carregando */}
        {overlay === 'bossLoading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background:'rgba(0,0,0,0.88)' }}>
            <div className="text-5xl mb-4 animate-bounce">👾</div>
            <p className="text-red-400 text-xs font-black uppercase tracking-widest mb-2 animate-pulse">⚔ BOSS — Andar {andar}</p>
            <p className="text-gray-400 text-sm">🧠 Gerando perguntas com IA...</p>
          </div>
        )}

        {/* Boss perguntas */}
        {overlay === 'boss' && bossPerguntas[bossIdx] && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4" style={{ background:'rgba(0,0,0,0.88)' }}>
            <div className="w-full max-w-sm">
              <div className="flex justify-between items-center mb-3">
                <p className="text-xs font-black text-red-400 uppercase tracking-widest animate-pulse">⚔ BOSS — Andar {andar}</p>
                <div className="flex gap-1">{[0,1,2].map(i => <span key={i} className={`text-lg ${i < vidas ? '' : 'opacity-20'}`}>❤️</span>)}</div>
              </div>
              <div className="flex gap-1 mb-4">
                {bossPerguntas.map((_, i) => (
                  <div key={i} className={`flex-1 h-1 rounded-full ${i < bossIdx ? 'bg-green-500' : i === bossIdx ? 'bg-red-500' : 'bg-white/20'}`}/>
                ))}
              </div>
              <div className="bg-gray-900 border border-red-500/40 rounded-2xl p-4 mb-4">
                <p className="text-white text-sm font-semibold leading-snug">{bossPerguntas[bossIdx].pergunta}</p>
              </div>
              <div className="space-y-2">
                {bossPerguntas[bossIdx].opcoes.map((op, i) => (
                  <button key={i} onClick={() => responderBoss(i)}
                    className="w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-red-400 text-white text-sm transition-all flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold flex-shrink-0">{['A','B','C','D'][i]}</span>
                    {op}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Game Over */}
        {overlay === 'dead' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-5" style={{ background:'rgba(0,0,0,0.92)' }}>
            <div className="text-6xl mb-3">💀</div>
            <p className="text-red-400 text-xs font-black uppercase tracking-widest mb-1">GAME OVER</p>
            <p className="text-white font-bold text-2xl mb-1">Andar {andar}</p>
            <p className="text-gray-500 text-sm mb-5">Score: {score}</p>
            {erradas.length > 0 && (
              <div className="w-full max-w-sm bg-gray-900/80 border border-amber-500/30 rounded-2xl p-4 mb-5 max-h-52 overflow-y-auto">
                <p className="text-amber-400 text-xs font-black mb-3 uppercase">📚 O que você errou:</p>
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
            <button onClick={reiniciar} className="w-full max-w-xs py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-black text-lg rounded-2xl mb-3">
              🔄 Tentar novamente
            </button>
            <button onClick={() => onSair({ xpGanho: Math.max(10, Math.floor(score / 10)) })} className="text-gray-600 hover:text-gray-400 text-sm">
              Voltar ao menu
            </button>
          </div>
        )}
      </div>

      {/* Controles touch */}
      <div className="flex items-center gap-2 py-3 px-4 w-full max-w-sm justify-between">
        {/* Esquerda */}
        <button
          onPointerDown={() => touchRef.current.left = true}
          onPointerUp={() => touchRef.current.left = false}
          onPointerLeave={() => touchRef.current.left = false}
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl text-white font-black"
          style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)' }}>
          ◀
        </button>

        {/* Pular */}
        <button
          onPointerDown={() => { touchRef.current.jump = true; jumpedRef.current = false; }}
          onPointerUp={() => touchRef.current.jump = false}
          onPointerLeave={() => touchRef.current.jump = false}
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl text-white font-black"
          style={{ background:'linear-gradient(135deg,#ff6a30,#cc3300)', boxShadow:'0 4px 20px #ff330066' }}>
          ↑
        </button>

        {/* Atacar */}
        <button
          onPointerDown={() => { touchRef.current.attack = true; attackedRef.current = false; }}
          onPointerUp={() => touchRef.current.attack = false}
          onPointerLeave={() => touchRef.current.attack = false}
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl text-white font-black"
          style={{ background:'linear-gradient(135deg,#aaaa00,#666600)', boxShadow:'0 4px 20px #aaaa0066' }}>
          ⚔️
        </button>

        {/* Direita */}
        <button
          onPointerDown={() => touchRef.current.right = true}
          onPointerUp={() => touchRef.current.right = false}
          onPointerLeave={() => touchRef.current.right = false}
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl text-white font-black"
          style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)' }}>
          ▶
        </button>
      </div>
    </div>
  );
}
