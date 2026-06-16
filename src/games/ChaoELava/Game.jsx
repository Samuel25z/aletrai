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
const LAVA_INIT_SPD  = 0.07;
const LAVA_ACCEL     = 0.000028;
const LAVA_START_OFF = 480; // px abaixo do mundo

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
  const px = (cx, cy, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(x + cx*S, y + cy*S, w*S, h*S); };

  // ── Cabelo ──
  px(2,0,5,1,'#2a1505');
  px(1,1,7,1,'#43250c');
  px(2,1,3,1,'#6b3f1a');          // brilho
  px(1,2,1,1,'#2a1505');
  px(7,2,1,1,'#2a1505');
  // ── Rosto ──
  px(1,2,7,5,'#f5c89a');
  px(1,2,1,5,'#d9a070');          // sombra lateral
  px(7,6,1,1,'#d9a070');
  // sobrancelhas
  px(2,3,2,1,'#43250c');
  px(5,3,2,1,'#43250c');
  // olhos
  px(2,4,1,1,'#ffffff'); px(2,4,1,1,'#27406e');
  px(5,4,1,1,'#ffffff');
  ctx.fillStyle = '#27406e';
  ctx.fillRect(x + 2*S, y + 4*S, S, S);
  ctx.fillRect(x + 5*S, y + 4*S, S, S);
  ctx.fillStyle = '#bcd4ff';      // brilho do olho
  ctx.fillRect(x + 2*S, y + 4*S, S/2, S/2);
  ctx.fillRect(x + 5*S, y + 4*S, S/2, S/2);
  // nariz + boca
  px(4,5,1,1,'#d9a070');
  px(3,6,3,1,'#a8401e');
  // ── Camisa ──
  px(1,7,7,4,'#ff6a30');
  px(1,7,7,1,'#ff9258');          // gola clara
  px(2,9,2,1,'#cc4410');          // dobra sombra
  px(5,9,2,1,'#cc4410');
  px(4,7,1,4,'#cc4410');          // zíper central
  // Braços
  px(0,7,1,4,'#f5c89a');
  px(8,7,1,4,'#f5c89a');
  px(0,10,1,1,'#d9a070');
  px(8,10,1,1,'#d9a070');
  // ── Cinto ──
  px(1,11,7,1,'#caa030');
  px(4,11,1,1,'#7a5808');         // fivela
  // ── Calça ──
  const lA = frame === 1 ? 2 : 0;
  const lB = frame === 1 ? 0 : 2;
  px(1,12,3,4+lA,'#2a3a60');
  px(5,12,3,4+lB,'#2a3a60');
  px(1,12,1,4+lA,'#1a2540');      // sombra perna
  px(5,12,1,4+lB,'#1a2540');
  // ── Botas ──
  px(1,16+lA,3,2,'#3a1a04');
  px(5,16+lB,3,2,'#3a1a04');
  px(1,17+lA,3,1,'#241000');      // sola
  px(5,17+lB,3,1,'#241000');

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
  const px = (cx, cy, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(x + cx*S, y + cy*S, w*S, h*S); };

  // ── Orelhas pontudas ──
  px(0,1,2,2,'#168a26'); px(0,2,1,2,'#0d5e18');
  px(8,1,2,2,'#168a26'); px(9,2,1,2,'#0d5e18');
  // ── Cabeça ──
  px(1,0,8,7,'#2bbf3f');
  px(1,0,8,1,'#52e066');          // topo claro
  px(1,1,1,6,'#0d5e18');          // sombra lateral
  px(8,1,1,6,'#168a26');
  // sobrancelhas (bravo)
  px(2,2,2,1,'#0d5e18');
  px(6,2,2,1,'#0d5e18');
  // olhos amarelos
  px(2,3,2,2,'#ffd500'); px(6,3,2,2,'#ffd500');
  px(3,4,1,1,'#111100'); px(6,4,1,1,'#111100');   // pupilas
  px(2,3,1,1,'#fff7aa'); px(6,3,1,1,'#fff7aa');    // brilho
  // nariz
  px(4,4,1,2,'#168a26');
  // boca + dentes
  px(2,5,6,2,'#7a0a0a');
  px(2,5,1,1,'#f0f0e0'); px(4,5,1,1,'#f0f0e0'); px(7,5,1,1,'#f0f0e0');  // sup
  px(3,6,1,1,'#f0f0e0'); px(6,6,1,1,'#f0f0e0');                          // inf
  // ── Corpo (couro) ──
  px(1,7,8,5,'#6a3a14');
  px(1,7,8,1,'#9a6028');          // borda clara
  px(3,8,4,3,'#9a6028');          // peito claro
  px(1,7,1,5,'#42230a');          // sombra
  px(4,9,1,2,'#42230a');          // cinto/correia
  // ── Pernas ──
  const lA = frame === 1 ? 2 : 0;
  const lB = frame === 1 ? 0 : 2;
  px(1,12,3,1+lA,'#2a2a3a');
  px(6,12,3,1+lB,'#2a2a3a');
  // botas
  px(1,13+lA,3,1,'#120a02');
  px(6,13+lB,3,1,'#120a02');

  ctx.restore();
}

function drawSkeleton(ctx, x, y, flip, frame) {
  const S = 2;
  ctx.save();
  if (flip) { ctx.translate(x + 8*S, 0); ctx.scale(-1, 1); x = 0; }
  const px = (cx, cy, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(x + cx*S, y + cy*S, w*S, h*S); };

  const bone = '#d8d4ac', boneLt = '#f2eecc', boneSh = '#a8a47c', dark = '#0a0a16';

  // ── Crânio ──
  px(1,0,6,5,bone);
  px(1,0,6,1,boneLt);
  px(1,0,1,5,boneSh);
  px(6,0,1,5,boneSh);
  // órbitas
  px(2,2,2,2,dark); px(4,2,2,2,dark);
  px(2,2,1,1,'#3a3a55'); px(4,2,1,1,'#3a3a55');   // brilho leve
  ctx.fillStyle = '#ff3030';                       // pontinho de vida nos olhos
  ctx.fillRect(x + 2*S + S/2, y + 2*S + S/2, S/2, S/2);
  ctx.fillRect(x + 4*S + S/2, y + 2*S + S/2, S/2, S/2);
  // nariz
  px(3,3,1,1,boneSh);
  // mandíbula + dentes
  px(1,5,6,1,bone);
  px(2,5,1,1,boneSh); px(3,5,1,1,boneLt); px(4,5,1,1,boneSh); px(5,5,1,1,boneLt);
  // pescoço
  px(3,6,2,1,boneSh);
  // ── Caixa torácica ──
  px(1,7,6,4,bone);
  px(1,7,6,1,boneLt);
  px(3,7,2,4,boneSh);             // coluna sombreada
  // costelas
  px(2,8,1,1,dark); px(5,8,1,1,dark);
  px(2,9,1,1,dark); px(5,9,1,1,dark);
  px(2,10,1,1,dark); px(5,10,1,1,dark);
  // ── Pernas ──
  const lA = frame === 1 ? 1 : 0;
  const lB = frame === 1 ? 0 : 1;
  px(1,11,2,3+lA,bone);
  px(5,11,2,3+lB,bone);
  px(1,11,1,3+lA,boneSh);
  px(5,11,1,3+lB,boneSh);

  ctx.restore();
}

function drawMage(ctx, x, y, flip, frame) {
  const S = 2;
  ctx.save();
  if (flip) { ctx.translate(x + 9*S, 0); ctx.scale(-1, 1); x = 0; }
  const px = (cx, cy, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(x + cx*S, y + cy*S, w*S, h*S); };

  // ── Chapéu pontudo ──
  px(4,0,1,1,'#1a0833');
  px(3,1,3,1,'#1a0833');
  px(3,1,1,1,'#3a1a5a');          // brilho
  px(2,2,5,1,'#1a0833');
  px(1,3,7,2,'#1a0833');          // aba
  px(1,3,7,1,'#3a1a5a');
  px(4,2,1,1,'#ffdd00');          // estrela
  // ── Rosto ──
  px(2,5,5,4,'#f0c090');
  px(2,5,1,4,'#c89060');          // sombra
  // olhos mágicos brilhantes
  px(3,6,1,1,'#ff66ff'); px(5,6,1,1,'#ff66ff');
  ctx.fillStyle = '#ffccff';
  ctx.fillRect(x + 3*S, y + 6*S, S/2, S/2);
  ctx.fillRect(x + 5*S, y + 6*S, S/2, S/2);
  // barba curta
  px(3,8,3,1,'#e0d4ea');
  // ── Manto roxo ──
  px(1,9,7,5,'#7a1ad0');
  px(1,9,7,1,'#9a4ae8');          // ombro claro
  px(1,9,1,5,'#4a0d8a');          // sombra
  px(3,10,3,3,'#4a0d8a');         // dobra central
  // mangas claras
  px(0,9,1,4,'#9a4ae8');
  px(8,9,1,4,'#9a4ae8');
  // ── Orbe mágico flutuante ──
  const orbY = frame === 1 ? y + 12*S : y + 13*S;
  ctx.globalAlpha = 0.4;          // glow
  ctx.fillStyle = '#ffdd44';
  ctx.beginPath(); ctx.arc(x + 9*S, orbY, 7, 0, Math.PI*2); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#ffcc22';
  ctx.beginPath(); ctx.arc(x + 9*S, orbY, 4, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#fff0a0';
  ctx.fillRect(x + 9*S - S/2, orbY - S/2, S, S);

  ctx.restore();
}

function drawBat(ctx, x, y, flip, frame) {
  const S = 2;
  ctx.save();
  const px = (cx, cy, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(x + cx*S, y + cy*S, w*S, h*S); };

  const body = '#3a1a4a', bodyHi = '#5a2a6a', wing = '#2a1038', wingEdge = '#542466';

  // ── Asas (flap) ──
  if (frame === 0) {
    // asas para cima/abertas
    px(0,0,2,1,wingEdge); px(1,1,2,1,wing); px(2,2,2,1,wing);
    px(6,0,2,1,wingEdge); px(5,1,2,1,wing); px(4,2,2,1,wing);
  } else {
    // asas para baixo
    px(0,2,2,1,wingEdge); px(1,2,2,1,wing);  px(2,2,2,1,wing);
    px(6,2,2,1,wingEdge); px(5,2,2,1,wing);  px(4,2,2,1,wing);
    px(0,3,1,1,wingEdge); px(7,3,1,1,wingEdge);
  }
  // ── Orelhas ──
  px(3,0,1,1,body);
  px(4,0,1,1,body);
  // ── Corpo ──
  px(3,1,2,4,body);
  px(3,1,2,1,bodyHi);             // topo claro
  px(3,5,2,1,'#22102e');          // pés/sombra
  // ── Olhos vermelhos brilhantes ──
  px(3,2,1,1,'#ff2828'); px(4,2,1,1,'#ff2828');
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(x + 3*S - 1, y + 2*S - 1, 2*S + 2, S + 2);
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#ffd0d0';      // brilho pupila
  ctx.fillRect(x + 3*S, y + 2*S, S/2, S/2);
  ctx.fillRect(x + 4*S, y + 2*S, S/2, S/2);
  // presas
  px(3,4,1,1,'#f0e8e8'); px(4,4,1,1,'#f0e8e8');

  ctx.restore();
}

// ─── Geração procedural dos andares ──────────────────────────────────────────
function seededRnd(seed, idx) {
  return Math.abs(Math.sin(seed * 9301 + idx * 49297 + 233)) % 1;
}

// Padrões de subida — cada item: [fração X, altura acima do chão, largura base]
// Todos os saltos verticais ≤ ~62px (pulo máx ≈ 90px) → sempre alcançáveis.
const LAYOUTS = [
  // 0 — Zigue-zague
  [[0.05, 56, 120], [0.55, 112, 120], [0.05, 168, 118]],
  // 1 — Escada para a direita
  [[0.04, 56, 110], [0.36, 112, 110], [0.62, 168, 118]],
  // 2 — Escada para a esquerda
  [[0.62, 56, 118], [0.34, 112, 110], [0.04, 168, 110]],
  // 3 — Torre central
  [[0.30, 56, 118], [0.44, 112, 104], [0.27, 168, 118]],
  // 4 — Subida longa (4 plataformas, saltos curtos)
  [[0.05, 48, 100], [0.56, 90, 100], [0.06, 132, 100], [0.52, 176, 108]],
  // 5 — Alternado largo
  [[0.60, 58, 110], [0.05, 114, 112], [0.60, 170, 110]],
];

function gerarAndares() {
  const worldH = MAX_FLOORS * FLOOR_H;
  const andares = [];

  for (let f = 1; f <= MAX_FLOORS; f++) {
    const groundY = worldH - f * FLOOR_H + FLOOR_H - 18;
    const isBoss  = f % BOSS_EVERY === 0;
    const seed    = f * 137;

    const plats  = [{ x: 0, y: groundY, w: GW, h: 18, tipo: 'chao' }];
    const moedas = [];

    if (!isBoss) {
      // Escolhe um padrão de subida diferente a cada andar (cicla entre todos)
      const layout = LAYOUTS[(f - 1) % LAYOUTS.length];
      for (let i = 0; i < layout.length; i++) {
        const [xf, alt, baseW] = layout[i];
        const w  = baseW + Math.floor((seededRnd(seed, i) - 0.5) * 16);          // ±8px
        const xJitter = Math.floor((seededRnd(seed, i + 10) - 0.5) * 14);        // ±7px
        const x  = Math.max(6, Math.min(GW - w - 6, Math.floor(xf * (GW - w)) + xJitter));
        const py = groundY - alt - Math.floor(seededRnd(seed, i + 20) * 5);
        plats.push({ x, y: py, w, h: 12, tipo: 'mid' });
        // Moeda no topo da maioria das plataformas
        if (seededRnd(seed, i + 30) > 0.25) {
          moedas.push({
            id: f * 100 + i, x: x + Math.floor(w / 2) - 4, y: py - 14,
            w: 8, h: 10, fase: seededRnd(seed, i + 40) * 6.28, coletada: false,
          });
        }
      }
      // Moeda extra "no ar" (recompensa de pulo)
      if (seededRnd(seed, 77) > 0.5) {
        moedas.push({
          id: f * 100 + 50, x: 20 + Math.floor(seededRnd(seed, 78) * (GW - 60)),
          y: groundY - 36, w: 8, h: 10, fase: seededRnd(seed, 79) * 6.28, coletada: false,
        });
      }
    } else {
      // Boss: escada fixa e visível
      plats.push({ x: 15,  y: groundY - 60,  w: 115, h: 12, tipo: 'mid' });
      plats.push({ x: 145, y: groundY - 120, w: 115, h: 12, tipo: 'mid' });
      plats.push({ x: 270, y: groundY - 175, w: 115, h: 12, tipo: 'mid' });
      // Moedas de recompensa no andar do boss
      moedas.push({ id: f * 100,     x: 65,  y: groundY - 74,  w: 8, h: 10, fase: 0, coletada: false });
      moedas.push({ id: f * 100 + 2, x: 320, y: groundY - 189, w: 8, h: 10, fase: 2, coletada: false });
    }

    // Inimigos (só andares não-boss, a partir do andar 2)
    const inimigos = [];
    if (!isBoss && f > 1) {
      // ── Progressão SUAVE: tipos liberados bem aos poucos ──
      //   2-4   : só goblins (lentos)
      //   5-11  : goblins + esqueletos
      //   12+   : goblins + esqueletos + magos
      const tiposBase = ['goblin'];
      if (f >= 5)  tiposBase.push('esqueleto');
      if (f >= 12) tiposBase.push('mago');

      // Quantidade de inimigos de chão cresce devagar (1 no começo, até 4 lá no alto)
      const numEn = Math.min(1 + Math.floor(f / 6), 4);
      for (let e = 0; e < numEn; e++) {
        const tipo = tiposBase[Math.floor(seededRnd(seed * 3, e) * tiposBase.length)];
        // Usa degrau 1 (plats[1]) ou 2 (plats[2]) para posicionar inimigos
        const pIdx = 1 + (e % (plats.length - 1));
        const pl   = plats[Math.min(pIdx, plats.length - 1)];
        const charH = tipo === 'goblin' ? 26 : 28;
        const spd   = 0.16 + (f - 1) * 0.004 + seededRnd(seed, e + 61) * 0.05;
        inimigos.push({
          id: f * 10 + e,
          x:  pl.x + 10 + Math.floor(seededRnd(seed, e + 50) * Math.max(0, pl.w - 30)),
          y:  pl.y - charH,
          w:  tipo === 'goblin' ? 20 : 18,
          h:  charH,
          vx: (seededRnd(seed, e + 60) > 0.5 ? 1 : -1) * spd,
          baseSpeed: spd,     // velocidade original (nunca muda)
          knockbackTimer: 0,  // frames de knockback ativo
          knockbackVx: 0,
          hitCooldown: 0,     // invencibilidade após levar dano (evita multi-hit)
          tipo, platX: pl.x, platW: pl.w,
          hp: 1,              // todos morrem em 1 hit — sempre
          maxHp: 1,
          vivo: true, cooldown: Math.floor(seededRnd(seed, e + 70) * 120),
          frame: 0, frameTick: 0,
        });
      }

      // ── Morcegos voadores (só a partir do andar 10) ──
      if (f >= 10) {
        const numBats = Math.min(Math.floor((f - 10) / 8) + 1, 2);
        for (let bI = 0; bI < numBats; bI++) {
          const baseY = groundY - 80 - Math.floor(seededRnd(seed * 7, bI) * 70); // 80-150px acima do chão
          const bspd  = 0.42 + (f - 10) * 0.008 + seededRnd(seed * 7, bI + 5) * 0.15;
          inimigos.push({
            id: f * 10 + 90 + bI,
            x:  20 + Math.floor(seededRnd(seed * 7, bI + 9) * (GW - 60)),
            y:  baseY,
            baseY,                  // centro da oscilação vertical
            w:  16, h: 10,
            vx: (seededRnd(seed * 7, bI + 12) > 0.5 ? 1 : -1) * bspd,
            baseSpeed: bspd,
            flyPhase: seededRnd(seed * 7, bI + 15) * Math.PI * 2,
            flyAmp:   16 + Math.floor(seededRnd(seed * 7, bI + 18) * 12),
            knockbackTimer: 0, knockbackVx: 0, hitCooldown: 0,
            tipo: 'morcego', platX: 0, platW: GW,
            hp: 1, maxHp: 1,
            vivo: true, cooldown: 0,
            frame: 0, frameTick: 0,
          });
        }
      }
    }

    andares.push({ num: f, plats, inimigos, isBoss, groundY, moedas });
  }

  return { andares, worldH };
}

// Moeda dourada giratória (pixel art)
function drawMoeda(ctx, x, y, runTime, fase) {
  const t    = runTime * 0.12 + fase;
  const by   = y + Math.sin(t) * 2;            // flutua
  const spin = Math.abs(Math.cos(t));          // 0..1 largura (giro)
  const cw   = Math.max(2, Math.round(8 * spin));
  const cx   = Math.round(x + 4 - cw / 2);
  // glow pulsante
  ctx.globalAlpha = 0.20 + 0.12 * Math.sin(t * 1.5);
  ctx.fillStyle = '#ffd23a';
  ctx.beginPath(); ctx.arc(x + 4, by + 5, 8, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
  // borda
  ctx.fillStyle = '#aa7400';
  ctx.fillRect(cx, by, cw, 10);
  // face dourada
  ctx.fillStyle = '#ffd83a';
  ctx.fillRect(cx + 1, by + 1, Math.max(1, cw - 2), 8);
  // reflexo + símbolo "$" só quando de frente
  if (spin > 0.45) {
    ctx.fillStyle = '#fff4a8';
    ctx.fillRect(x + 2, by + 1, 1, 8);
    ctx.fillStyle = '#aa7400';
    ctx.fillRect(x + 3, by + 2, 3, 1);
    ctx.fillRect(x + 4, by + 2, 1, 6);
    ctx.fillRect(x + 3, by + 7, 3, 1);
  }
}

// Tiro de energia da pistola
function drawTiro(ctx, x, y, dir) {
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = '#ffe680';
  ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#ffcc33';
  ctx.fillRect(x - 6 * dir, y - 1, 5, 2);     // rastro
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - 2, y - 1, 4, 2);           // núcleo
}

// Efeito visual do raio (espada-raio) — clarão + relâmpagos
function drawRaioFX(ctx, gs) {
  const a = gs.raioFlash / 16;
  ctx.globalAlpha = 0.30 * a;
  ctx.fillStyle = '#bfefff';
  ctx.fillRect(0, 0, GW, GH);
  ctx.globalAlpha = Math.min(1, 0.6 + a);
  ctx.strokeStyle = '#e8ffff';
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    let bx = (i * 70 + ((gs.runTime * 13 + i * 31) % 60));
    let yy = 36;
    ctx.beginPath(); ctx.moveTo(bx, yy);
    while (yy < GH) {
      yy += 26 + ((i * 17 + yy) % 18);
      bx += (((i * 53 + yy) % 40) - 20);
      ctx.lineTo(bx, yy);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

// ─── Renderer: fundo + plataformas ───────────────────────────────────────────
function drawWorld(ctx, gs) {
  const { camY, andares, worldH } = gs;

  // Fundo com leve gradiente vertical (caverna)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, GH);
  bgGrad.addColorStop(0, '#0e0020');
  bgGrad.addColorStop(1, '#160030');
  ctx.fillStyle = bgGrad;
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
        // sombra inferior (profundidade)
        ctx.fillStyle = '#0c001e';
        ctx.fillRect(0, sy + plat.h, GW, 8);
        // corpo com gradiente (rocha)
        const g = ctx.createLinearGradient(0, sy, 0, sy + plat.h);
        g.addColorStop(0, andar.isBoss ? '#5a1430' : '#3a2270');
        g.addColorStop(1, andar.isBoss ? '#2a0a1a' : '#1c1040');
        ctx.fillStyle = g;
        ctx.fillRect(0, sy, GW, plat.h);
        // tijolos (seams verticais alternados + linha central)
        ctx.fillStyle = 'rgba(0,0,0,0.22)';
        const off = (andar.num % 2) * 11;
        for (let bx = off; bx < GW; bx += 22) ctx.fillRect(bx, sy + 4, 1, plat.h - 4);
        ctx.fillRect(0, sy + Math.floor(plat.h / 2), GW, 1);
        // topo neon (borda brilhante)
        ctx.fillStyle = andar.isBoss ? '#ff3a5a' : '#7a52d8';
        ctx.fillRect(0, sy, GW, 3);
        ctx.fillStyle = andar.isBoss ? '#ff8aa0' : '#b89cff';
        ctx.fillRect(0, sy, GW, 1);
        // Label
        ctx.font = andar.isBoss ? 'bold 11px monospace' : '9px monospace';
        ctx.fillStyle = andar.isBoss ? '#ff6688' : '#9966ff';
        ctx.textAlign = 'right';
        ctx.fillText(andar.isBoss ? `⚔ BOSS ${andar.num}` : `${andar.num}`, GW - 6, sy - 3);
        ctx.textAlign = 'left';
      } else {
        // sombra projetada
        ctx.fillStyle = 'rgba(0,0,0,0.30)';
        ctx.fillRect(plat.x + 3, sy + 5, plat.w, plat.h);
        // corpo com gradiente (bloco de pedra)
        const g = ctx.createLinearGradient(0, sy, 0, sy + plat.h);
        g.addColorStop(0, '#553597');
        g.addColorStop(1, '#241247');
        ctx.fillStyle = g;
        ctx.fillRect(plat.x, sy, plat.w, plat.h);
        // bevel lateral (relevo)
        ctx.fillStyle = 'rgba(255,255,255,0.10)';
        ctx.fillRect(plat.x, sy, 2, plat.h);
        ctx.fillStyle = 'rgba(0,0,0,0.28)';
        ctx.fillRect(plat.x + plat.w - 2, sy, 2, plat.h);
        // seams de pedra
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        for (let sx2 = plat.x + 16; sx2 < plat.x + plat.w - 6; sx2 += 20) {
          ctx.fillRect(sx2, sy + 3, 1, plat.h - 3);
        }
        // topo neon
        ctx.fillStyle = '#8a6cff';
        ctx.fillRect(plat.x, sy, plat.w, 3);
        ctx.fillStyle = '#c8b6ff';
        ctx.fillRect(plat.x, sy, plat.w, 1);
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
function drawHUD(ctx, vidas, andar, lavaSpeed, moedas = 0, temRaio = false, raioCd = 0) {
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
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(isBoss ? `⚔ BOSS ${andar}` : `Andar ${andar}`, GW / 2, 14);

  // Contador de moedas (sob o nome do andar)
  ctx.fillStyle = '#ffd83a';
  ctx.beginPath(); ctx.arc(GW / 2 - 16, 25, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#aa7400';
  ctx.fillRect(GW / 2 - 17, 24, 2, 1);
  ctx.fillStyle = '#ffe87a';
  ctx.font = 'bold 11px monospace';
  ctx.fillText(`${moedas}`, GW / 2 + 4, 28);
  ctx.textAlign = 'left';

  // Indicador da espada-raio (recarga)
  if (temRaio) {
    const pronto = raioCd === 0;
    ctx.fillStyle = pronto ? '#66e0ff' : '#335566';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(pronto ? '⚡PRONTO' : `⚡${Math.ceil(raioCd / 60)}s`, 8, 30);
  }

  // Barra lava
  const pct = Math.min(1, (lavaSpeed - LAVA_INIT_SPD) / (LAVA_INIT_SPD * 15));
  ctx.fillStyle = '#333';
  ctx.fillRect(GW - 52, 9, 42, 6);
  ctx.fillStyle = pct < 0.5 ? '#ff6633' : '#ff2200';
  ctx.fillRect(GW - 52, 9, Math.floor(42 * pct), 6);
  ctx.fillStyle = '#aaa';
  ctx.font = '8px monospace';
  ctx.textAlign = 'right';
  ctx.fillText('LAVA', GW - 4, 24);
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

export default function Game({ tema, materia, modoIA = true, onSair, onLoja, pistola = false, raio = false, puloDuplo = false }) {
  const canvasRef = useRef(null);
  const gsRef     = useRef(null);
  const keysRef    = useRef({});
  const touchRef   = useRef({ left: false, right: false, jump: false, attack: false, pistol: false, raio: false });
  const rafRef     = useRef(null);
  const jumpedRef  = useRef(false);
  const attackedRef = useRef(false); // evita spam de ataque
  const attackFrameRef = useRef(0); // 0=sem ataque, 1-12=animando
  const attackCoolRef  = useRef(0); // cooldown entre ataques
  const pistolRef      = useRef(false); // rising-edge do tiro
  const raioRef        = useRef(false); // rising-edge do raio

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
        jumpsLeft: puloDuplo ? 2 : 1,
      },
      andares, worldH,
      bullets: [],          // balas dos magos (inimigas)
      playerBullets: [],    // tiros da pistola (do player)
      lavaY:     worldH + LAVA_START_OFF,
      lavaSpeed: LAVA_INIT_SPD,
      camY:      worldH - GH,         // mostra exatamente o fundo do mundo
      currentFloor: 1,
      bossVisitados: new Set(),
      bossCount: 0,  // bosses derrotados — controla aceleração geral
      runTime: 0,
      moedasRun: 0,        // moedas coletadas nesta partida
      pistolCooldown: 0,
      raioCooldown: 0,     // recarga da espada-raio (8s = 480 frames)
      raioFlash: 0,        // frames de efeito visual do raio
    };
  }, [puloDuplo]);

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
      drawHUD(ctx2, vidas, gs.currentFloor, gs.lavaSpeed, gs.moedasRun, raio, gs.raioCooldown);
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

    // Pulo (com suporte a pulo duplo) — 1 salto por pressão
    if (doJ && !jumpedRef.current && p.jumpsLeft > 0) {
      p.vy = JUMP_VEL;
      p.onGround = false;
      p.jumpsLeft--;
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
    const doAtk = keys['z'] || keys['Z'] || keys['k'] || keys['K'] || touchRef.current.attack;
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
    // Recarrega os pulos ao tocar o chão
    if (p.onGround) p.jumpsLeft = puloDuplo ? 2 : 1;

    // ─── Pistola (item permanente) ───────────────────────────────────────
    if (gs.pistolCooldown > 0) gs.pistolCooldown--;
    const doShoot = pistola && (keys['x'] || keys['X'] || touchRef.current.pistol);
    if (doShoot && !pistolRef.current && gs.pistolCooldown === 0) {
      gs.playerBullets.push({ x: p.x + p.w / 2, y: p.y + p.h / 2, vx: p.facing * 5 });
      gs.pistolCooldown = 16;
      pistolRef.current = true;
    }
    if (!doShoot) pistolRef.current = false;

    // ─── Espada-raio (item permanente, recarga 8s) ───────────────────────
    if (gs.raioCooldown > 0) gs.raioCooldown--;
    if (gs.raioFlash > 0) gs.raioFlash--;
    const doRaio = raio && (keys['c'] || keys['C'] || touchRef.current.raio);
    if (doRaio && !raioRef.current && gs.raioCooldown === 0) {
      // Elimina todos os inimigos vivos do andar atual
      const alvo = gs.andares.find(a => a.num === gs.currentFloor);
      if (alvo) for (const en of alvo.inimigos) en.vivo = false;
      gs.raioFlash    = 16;
      gs.raioCooldown = 480; // 8 segundos a 60fps
      raioRef.current = true;
    }
    if (!doRaio) raioRef.current = false;

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

        // ── Morcego: voa em padrão senoidal e mergulha no player ──
        if (en.tipo === 'morcego') {
          en.flyPhase += 0.06;
          if (en.knockbackTimer > 0) {
            en.x += en.knockbackVx;
            en.knockbackTimer--;
          } else {
            const dir = en.vx >= 0 ? 1 : -1;
            en.x += dir * en.baseSpeed * mult * 1.25;
            if (en.x < 4 || en.x + en.w > GW - 4) en.vx *= -1;
            // mergulho suave em direção ao player quando perto na horizontal
            if (Math.abs((en.x + en.w/2) - (p.x + p.w/2)) < 110) {
              const dy = (p.y + p.h/2) - en.baseY;
              en.baseY += Math.sign(dy) * Math.min(Math.abs(dy), 0.5);
            }
          }
          en.y = en.baseY + Math.sin(en.flyPhase) * en.flyAmp;
          // flap das asas (mais rápido que os outros)
          en.frameTick++;
          if (en.frameTick >= 6) { en.frame ^= 1; en.frameTick = 0; }
          // dano corpo a corpo
          if (p.invincible <= 0 &&
              p.x < en.x + en.w && p.x + p.w > en.x &&
              p.y < en.y + en.h && p.y + p.h > en.y) dano(1);
          continue;
        }

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

    // Tiros da pistola (player) — eliminam inimigos
    gs.playerBullets = gs.playerBullets.filter(b => b.x > -20 && b.x < GW + 20);
    for (const b of gs.playerBullets) {
      b.x += b.vx;
      for (const andar of visibles) {
        for (const en of andar.inimigos) {
          if (!en.vivo) continue;
          if (b.x > en.x && b.x < en.x + en.w && b.y > en.y && b.y < en.y + en.h) {
            en.vivo = false; b.x = -999;
          }
        }
      }
    }
    gs.playerBullets = gs.playerBullets.filter(b => b.x > -900);

    // Coleta de moedas
    for (const andar of visibles) {
      if (!andar.moedas) continue;
      for (const mo of andar.moedas) {
        if (mo.coletada) continue;
        if (p.x < mo.x + mo.w && p.x + p.w > mo.x && p.y < mo.y + mo.h && p.y + p.h > mo.y) {
          mo.coletada = true;
          gs.moedasRun++;
          const atual = parseInt(localStorage.getItem('aletrai_chaolava_moedas') || '0', 10);
          localStorage.setItem('aletrai_chaolava_moedas', String(atual + 1));
        }
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

    // Moedas
    for (const andar of visibles) {
      if (!andar.moedas) continue;
      for (const mo of andar.moedas) {
        if (mo.coletada) continue;
        const my = mo.y - gs.camY;
        if (my < -20 || my > GH + 20) continue;
        drawMoeda(ctx, mo.x, my, gs.runTime, mo.fase);
      }
    }

    // Inimigos
    for (const andar of visibles) {
      for (const en of andar.inimigos) {
        if (!en.vivo) continue;
        const sy = en.y - gs.camY;
        if (sy < -40 || sy > GH + 40) continue;
        const fn = { goblin: drawGoblin, esqueleto: drawSkeleton, mago: drawMage, morcego: drawBat }[en.tipo] || drawGoblin;
        fn(ctx, en.x, sy, en.vx < 0, en.frame);
        if (en.hp < en.maxHp) {
          ctx.fillStyle = '#ff000066';
          ctx.fillRect(en.x, sy - 6, en.w, 3);
          ctx.fillStyle = '#ff4444';
          ctx.fillRect(en.x, sy - 6, Math.floor(en.w * en.hp / en.maxHp), 3);
        }
      }
    }

    // Balas (magos)
    for (const b of gs.bullets) {
      const by = b.y - gs.camY;
      ctx.fillStyle = '#ff88ff';
      ctx.fillRect(b.x - 4, by - 4, 8, 8);
      ctx.fillStyle = '#fff';
      ctx.fillRect(b.x - 2, by - 2, 4, 4);
    }

    // Tiros da pistola (player)
    for (const b of gs.playerBullets) {
      drawTiro(ctx, b.x, b.y - gs.camY, b.vx >= 0 ? 1 : -1);
    }

    // Player
    const moving = Math.abs(p.vx) > 0.5 && p.onGround;
    const frame  = moving ? Math.floor(gs.runTime / 7) % 2 : 0;
    drawPlayer(ctx, p.x, p.y - gs.camY, p.facing < 0, frame, p.invincible, attackFrameRef.current);

    // Efeito visual da espada-raio
    if (gs.raioFlash > 0) drawRaioFX(ctx, gs);

    drawHUD(ctx, vidas, gs.currentFloor, gs.lavaSpeed, gs.moedasRun, raio, gs.raioCooldown);

    rafRef.current = requestAnimationFrame(gameLoop);
  }, [overlay, vidas, tema, materia, modoIA, pistola, raio, puloDuplo]);

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
    const dn = e => { keysRef.current[e.key] = true; if ([' ','ArrowUp','ArrowDown','z','Z','x','X','c','C','k','K'].includes(e.key)) e.preventDefault(); };
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
            <p className="text-gray-400 text-sm mb-1">Score: {score}</p>
            <p className="text-yellow-400 text-sm font-bold mb-5">🪙 {gsRef.current?.moedasRun || 0} moedas coletadas</p>
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
            {onLoja && (
              <button onClick={onLoja} className="w-full max-w-xs py-3 mb-3 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-base rounded-2xl">
                🏪 Abrir loja
              </button>
            )}
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
          className="w-14 h-14 rounded-full flex items-center justify-center text-xl text-white font-black"
          style={{ background:'linear-gradient(135deg,#aaaa00,#666600)', boxShadow:'0 4px 20px #aaaa0066' }}>
          ⚔️
        </button>

        {/* Pistola (se adquirida) */}
        {pistola && (
          <button
            onPointerDown={() => { touchRef.current.pistol = true; pistolRef.current = false; }}
            onPointerUp={() => touchRef.current.pistol = false}
            onPointerLeave={() => touchRef.current.pistol = false}
            className="w-12 h-12 rounded-full flex items-center justify-center text-lg text-white font-black"
            style={{ background:'linear-gradient(135deg,#4a90d9,#1f5fa8)', boxShadow:'0 4px 16px #2a72c066' }}>
            🔫
          </button>
        )}

        {/* Espada-raio (se adquirida) */}
        {raio && (
          <button
            onPointerDown={() => { touchRef.current.raio = true; raioRef.current = false; }}
            onPointerUp={() => touchRef.current.raio = false}
            onPointerLeave={() => touchRef.current.raio = false}
            className="w-12 h-12 rounded-full flex items-center justify-center text-lg text-white font-black"
            style={{ background:'linear-gradient(135deg,#22c0e8,#1577a8)', boxShadow:'0 4px 16px #22c0e866' }}>
            ⚡
          </button>
        )}

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
