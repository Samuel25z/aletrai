import React, { useEffect, useRef, useCallback } from 'react';

// ─── Config ───────────────────────────────────────────────────────────────────
const W  = 120; // canvas largura
const H  = 150; // canvas altura
const S  = 3;   // 1 pixel lógico = 3px real

// Atalho de desenho
function p(ctx, x, y, w, h, col) {
  if (!col || col === '.') return;
  ctx.fillStyle = col;
  ctx.fillRect(x * S, y * S, w * S, h * S);
}

// ─── BOSS 0: Goblin Rei ───────────────────────────────────────────────────────
function drawGoblinRei(ctx, bob, blink) {
  const y = bob;
  // Coroa
  p(ctx, 13, 0+y, 1, 3, '#ffcc00');
  p(ctx, 16, 0+y, 2, 2, '#ffcc00');
  p(ctx, 20, 0+y, 1, 3, '#ffcc00');
  p(ctx, 12, 2+y, 11, 2, '#ffcc00');
  p(ctx, 13, 2+y, 1, 1, '#ff4444');
  p(ctx, 17, 1+y, 1, 1, '#44aaff');
  p(ctx, 21, 2+y, 1, 1, '#ff4444');
  // Orelhas
  p(ctx,  5, 7+y, 4, 4, '#1a8a22');
  p(ctx,  4, 5+y, 3, 3, '#1a8a22');
  p(ctx,  3, 5+y, 2, 1, '#0f5510');
  p(ctx, 26, 7+y, 4, 4, '#1a8a22');
  p(ctx, 27, 5+y, 3, 3, '#1a8a22');
  p(ctx, 29, 5+y, 2, 1, '#0f5510');
  // Cabeça
  p(ctx,  8, 4+y, 19, 14, '#22bb33');
  p(ctx,  7, 6+y,  1, 10, '#22bb33');
  p(ctx, 27, 6+y,  1, 10, '#22bb33');
  p(ctx,  9, 3+y, 17,  2, '#22bb33');
  // Sombras da cabeça
  p(ctx,  8, 4+y,  2, 14, '#148820');
  p(ctx, 25, 4+y,  2, 14, '#148820');
  // Olhos
  if (blink) {
    p(ctx,  9,  8+y, 5, 4, '#ffee00');
    p(ctx, 21,  8+y, 5, 4, '#ffee00');
    p(ctx, 10,  9+y, 3, 2, '#222200');
    p(ctx, 22,  9+y, 3, 2, '#222200');
    p(ctx, 11,  9+y, 1, 1, '#ffffff'); // brilho
    p(ctx, 23,  9+y, 1, 1, '#ffffff');
  } else {
    p(ctx,  9, 10+y, 5, 1, '#0f5510');
    p(ctx, 21, 10+y, 5, 1, '#0f5510');
  }
  // Nariz
  p(ctx, 16, 13+y, 3, 2, '#0f5510');
  p(ctx, 17, 14+y, 1, 1, '#22bb33');
  // Boca / dentes
  p(ctx,  9, 15+y, 17, 2, '#cc1100');
  p(ctx,  9, 16+y,  3, 1, '#ffffff');
  p(ctx, 13, 16+y,  3, 1, '#ffffff');
  p(ctx, 17, 16+y,  3, 1, '#ffffff');
  p(ctx, 21, 16+y,  2, 1, '#ffffff');
  p(ctx, 10, 15+y,  1, 1, '#ff3300'); // gengiva detalhe
  // Sobrancelhas raivosas
  p(ctx,  9,  6+y, 5, 1, '#0f5510');
  p(ctx, 21,  6+y, 5, 1, '#0f5510');
  p(ctx,  9,  7+y, 2, 1, '#0f5510');
  p(ctx, 24,  7+y, 2, 1, '#0f5510');
  // Pescoço
  p(ctx, 14, 18+y, 7, 3, '#22bb33');
  // Armadura / corpo
  p(ctx,  6, 21+y, 23, 14, '#885522');
  p(ctx,  9, 21+y, 17, 14, '#aa6633');
  p(ctx, 14, 21+y,  7, 14, '#cc7744');
  p(ctx,  7, 22+y,  1, 12, '#553311');
  p(ctx, 27, 22+y,  1, 12, '#553311');
  p(ctx, 14, 22+y,  1, 12, '#553311'); // linha central
  // Emblema dourado
  p(ctx, 16, 24+y, 3, 3, '#ffcc00');
  p(ctx, 17, 23+y, 1, 5, '#ffcc00');
  p(ctx, 16, 25+y, 3, 1, '#ffdd44');
  // Rebites da armadura
  p(ctx,  9, 22+y, 2, 2, '#cc8844');
  p(ctx, 24, 22+y, 2, 2, '#cc8844');
  p(ctx,  9, 32+y, 2, 2, '#cc8844');
  p(ctx, 24, 32+y, 2, 2, '#cc8844');
  // Braços
  p(ctx,  2, 21+y, 5, 9, '#885522');
  p(ctx, 28, 21+y, 5, 9, '#885522');
  p(ctx,  3, 22+y, 3, 7, '#aa6633');
  p(ctx, 29, 22+y, 3, 7, '#aa6633');
  // Mãos com garras
  p(ctx,  1, 29+y, 6, 4, '#22bb33');
  p(ctx, 28, 29+y, 6, 4, '#22bb33');
  p(ctx,  1, 28+y, 2, 2, '#0f5510'); // garra esq
  p(ctx,  3, 28+y, 2, 2, '#0f5510');
  p(ctx,  5, 28+y, 2, 2, '#0f5510');
  p(ctx, 27, 28+y, 2, 2, '#0f5510'); // garra dir
  p(ctx, 29, 28+y, 2, 2, '#0f5510');
  p(ctx, 31, 28+y, 2, 2, '#0f5510');
  // Pernas
  p(ctx,  8, 35+y, 6, 8, '#553311');
  p(ctx, 21, 35+y, 6, 8, '#553311');
  p(ctx,  9, 36+y, 4, 6, '#664422');
  p(ctx, 22, 36+y, 4, 6, '#664422');
  // Botas
  p(ctx,  7, 42+y, 8, 3, '#221100');
  p(ctx, 20, 42+y, 8, 3, '#221100');
  p(ctx,  7, 44+y, 9, 1, '#331500'); // sola
  p(ctx, 20, 44+y, 9, 1, '#331500');
}

// ─── BOSS 1: Esqueleto Guerreiro ─────────────────────────────────────────────
function drawEsqueletoGuerreiro(ctx, bob, blink) {
  const y = bob;
  const OS = '#d8d4a8', OL = '#eeeac8', OD = '#b0ac80', BK = '#111122';
  // Elmo
  p(ctx,  9,  0+y, 17,  6, '#886644');
  p(ctx,  8,  1+y,  1,  5, '#553322');
  p(ctx, 26,  1+y,  1,  5, '#553322');
  p(ctx, 11,  0+y, 13,  1, '#aa8855');
  p(ctx, 10,  4+y, 15,  2, '#664433');
  // Viseira
  p(ctx, 12,  4+y, 11,  3, BK);
  // Crânio dentro do elmo
  p(ctx, 10,  3+y, 15, 10, OL);
  p(ctx,  9,  5+y,  1,  7, OL);
  p(ctx, 25,  5+y,  1,  7, OL);
  // Órbitas
  if (blink) {
    p(ctx, 11,  6+y,  4,  4, BK);
    p(ctx, 20,  6+y,  4,  4, BK);
    p(ctx, 12,  7+y,  2,  2, '#4444ff'); // olho azul brilhando
    p(ctx, 21,  7+y,  2,  2, '#4444ff');
    p(ctx, 13,  7+y,  1,  1, '#aaaaff');
    p(ctx, 22,  7+y,  1,  1, '#aaaaff');
  } else {
    p(ctx, 11,  9+y,  4,  1, BK);
    p(ctx, 20,  9+y,  4,  1, BK);
  }
  // Nariz (triângulo vazio)
  p(ctx, 16, 11+y,  3,  1, OD);
  p(ctx, 15, 12+y,  1,  1, OD);
  p(ctx, 19, 12+y,  1,  1, OD);
  // Mandíbula / dentes
  p(ctx, 10, 13+y, 15,  2, OS);
  p(ctx, 11, 14+y,  2,  1, OL);
  p(ctx, 14, 14+y,  2,  1, OL);
  p(ctx, 17, 14+y,  2,  1, OL);
  p(ctx, 20, 14+y,  2,  1, OL);
  p(ctx, 23, 14+y,  2,  1, OL);
  // Pescoço (vértebras)
  p(ctx, 14, 16+y,  7,  1, OS);
  p(ctx, 15, 17+y,  5,  1, OD);
  p(ctx, 14, 18+y,  7,  1, OS);
  // Clavícula / ombros
  p(ctx,  5, 19+y, 25,  2, OS);
  p(ctx,  4, 20+y,  2,  4, OS); // ombro esq
  p(ctx, 29, 20+y,  2,  4, OS); // ombro dir
  // Costelas
  p(ctx, 11, 21+y, 13, 10, OL);
  for (let i = 0; i < 4; i++) {
    p(ctx,  8, 22+i*2+y,  3,  1, OS); // costela esq
    p(ctx, 24, 22+i*2+y,  3,  1, OS); // costela dir
    p(ctx, 11, 22+i*2+y,  1,  1, OD);
    p(ctx, 23, 22+i*2+y,  1,  1, OD);
  }
  p(ctx, 14, 21+y,  1, 10, OD); // esterno esq
  p(ctx, 20, 21+y,  1, 10, OD); // esterno dir
  // Pélvis
  p(ctx, 10, 31+y, 15,  3, OS);
  p(ctx,  8, 32+y,  4,  3, OD);
  p(ctx, 23, 32+y,  4,  3, OD);
  // Braço esq (segurando escudo)
  p(ctx,  5, 20+y,  4, 12, OS);
  p(ctx,  4, 22+y,  2, 10, OD);
  p(ctx,  2, 22+y,  4, 14, '#885533'); // escudo
  p(ctx,  2, 22+y,  1, 14, '#664422');
  p(ctx,  5, 22+y,  1, 14, '#664422');
  p(ctx,  3, 26+y,  2,  5, '#ffcc00'); // emblema escudo
  // Braço dir (segurando espada)
  p(ctx, 26, 20+y,  4, 12, OS);
  p(ctx, 29, 22+y,  2, 10, OD);
  // Espada
  p(ctx, 30, 10+y,  2, 22, '#ccccdd');
  p(ctx, 30,  9+y,  2,  2, '#eeeeff'); // ponta
  p(ctx, 29, 19+y,  4,  2, '#aa8844'); // guarda
  p(ctx, 30, 20+y,  2,  5, '#cc9944'); // cabo
  p(ctx, 30, 18+y,  1, 20, '#ffffff22'); // reflexo
  // Pernas
  p(ctx, 11, 34+y,  5, 10, OS);
  p(ctx, 19, 34+y,  5, 10, OS);
  p(ctx, 12, 35+y,  3,  8, OD);
  p(ctx, 20, 35+y,  3,  8, OD);
  // Pés
  p(ctx, 10, 43+y,  7,  2, OD);
  p(ctx, 18, 43+y,  7,  2, OD);
  p(ctx, 10, 44+y,  8,  1, OS);
  p(ctx, 18, 44+y,  8,  1, OS);
}

// ─── BOSS 2: Mago das Sombras ─────────────────────────────────────────────────
function drawMagoDasSombras(ctx, bob, blink, frame) {
  const y = bob;
  const glowPct = (Math.sin(frame * 0.1) + 1) / 2; // 0-1 pulsante
  const glowCol = `rgba(180,0,255,${0.5 + glowPct * 0.5})`;
  // Chapéu pontudo
  p(ctx, 17,  0+y,  1,  3, '#220044');
  p(ctx, 15,  3+y,  5,  3, '#220044');
  p(ctx, 13,  6+y,  9,  3, '#220044');
  p(ctx, 11,  9+y, 13,  3, '#330055');
  p(ctx,  8, 12+y, 19,  2, '#440066');
  // Aba do chapéu
  p(ctx,  6, 14+y, 23,  2, '#550077');
  p(ctx,  6, 14+y, 23,  1, '#7700aa');
  // Estrelas no chapéu
  p(ctx, 15,  4+y,  1,  1, '#ffaaff');
  p(ctx, 12,  8+y,  1,  1, '#ffaaff');
  p(ctx, 20,  7+y,  1,  1, '#ffaaff');
  // Rosto
  p(ctx,  9, 16+y, 17, 11, '#1a0028');
  p(ctx,  8, 18+y,  1,  7, '#1a0028');
  p(ctx, 26, 18+y,  1,  7, '#1a0028');
  // Pele do rosto
  p(ctx, 10, 17+y, 15,  9, '#c89070');
  p(ctx, 10, 16+y, 15,  2, '#b07858');
  // Olhos brilhantes
  if (blink) {
    ctx.fillStyle = glowCol;
    ctx.fillRect(11*S, (20+y)*S, 4*S, 3*S);
    ctx.fillRect(20*S, (20+y)*S, 4*S, 3*S);
    p(ctx, 12, 21+y,  2,  1, '#ffffff'); // brilho
    p(ctx, 21, 21+y,  2,  1, '#ffffff');
    // Aura dos olhos
    ctx.fillStyle = `rgba(180,0,255,${0.3 + glowPct * 0.3})`;
    ctx.beginPath(); ctx.arc(13*S, (21+y)*S, 8, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(22*S, (21+y)*S, 8, 0, Math.PI*2); ctx.fill();
  } else {
    p(ctx, 11, 22+y,  4,  1, '#550077');
    p(ctx, 20, 22+y,  4,  1, '#550077');
  }
  // Nariz
  p(ctx, 16, 24+y,  3,  2, '#b07858');
  p(ctx, 15, 25+y,  1,  1, '#8a5838');
  p(ctx, 19, 25+y,  1,  1, '#8a5838');
  // Boca / sorriso sinistro
  p(ctx, 12, 26+y, 11,  1, '#441133');
  p(ctx, 12, 26+y,  2,  1, '#cc8888'); // dente
  p(ctx, 21, 26+y,  2,  1, '#cc8888');
  // Barba
  p(ctx, 11, 27+y, 13,  4, '#221133');
  p(ctx, 12, 28+y, 11,  3, '#331144');
  p(ctx, 13, 30+y,  9,  2, '#441155');
  // Manto
  p(ctx,  5, 28+y, 25, 18, '#220044');
  p(ctx,  6, 29+y, 23, 16, '#330055');
  p(ctx,  9, 29+y, 17, 16, '#440066');
  // Detalhes do manto (runas)
  p(ctx, 13, 32+y,  2,  1, '#aa44ff');
  p(ctx, 13, 34+y,  2,  1, '#aa44ff');
  p(ctx, 13, 33+y,  1,  1, '#aa44ff');
  p(ctx, 20, 32+y,  2,  1, '#aa44ff');
  p(ctx, 21, 33+y,  1,  1, '#aa44ff');
  p(ctx, 20, 34+y,  2,  1, '#aa44ff');
  // Borda do manto brilhante
  p(ctx,  5, 28+y,  1, 18, '#7700cc');
  p(ctx, 29, 28+y,  1, 18, '#7700cc');
  p(ctx,  6, 45+y, 23,  1, '#7700cc');
  // Cajado
  p(ctx, 30, 14+y,  2, 28, '#553377');
  p(ctx, 30, 13+y,  2,  2, '#7733aa');
  // Orbe do cajado (pulsante)
  ctx.fillStyle = glowCol;
  ctx.beginPath();
  ctx.arc(31*S, (10+y)*S, 5*S, 0, Math.PI*2);
  ctx.fill();
  p(ctx, 29,  8+y,  4,  4, '#dd88ff');
  p(ctx, 30,  7+y,  2,  6, '#ffffff');
  p(ctx, 29,  9+y,  4,  2, '#ffffff');
  p(ctx, 30,  8+y,  1,  1, '#ffffff');
  // Aura do orbe
  ctx.fillStyle = `rgba(180,0,255,${0.15 + glowPct * 0.2})`;
  ctx.beginPath(); ctx.arc(31*S, (10+y)*S, 12*S, 0, Math.PI*2); ctx.fill();
}

// ─── BOSS 3: Dragão de Gelo ────────────────────────────────────────────────
function drawDragaoDeGelo(ctx, bob, blink, frame) {
  const y = bob;
  const icePulse = (Math.sin(frame * 0.08) + 1) / 2;
  const iceCol   = `rgba(150,220,255,${0.4 + icePulse * 0.4})`;
  // Chifres
  p(ctx,  8,  0+y, 2,  8, '#ddeeff');
  p(ctx,  7,  1+y, 1,  7, '#bbccdd');
  p(ctx,  9,  0+y, 1,  6, '#eef8ff');
  p(ctx, 25,  0+y, 2,  8, '#ddeeff');
  p(ctx, 26,  1+y, 1,  7, '#bbccdd');
  p(ctx, 25,  0+y, 1,  6, '#eef8ff');
  // Crista de gelo no topo
  p(ctx, 11,  3+y, 13,  3, '#aaddff');
  p(ctx, 12,  2+y, 11,  1, '#cceeff');
  p(ctx, 14,  1+y,  3,  1, '#eef8ff');
  p(ctx, 17,  0+y,  1,  1, '#ffffff');
  // Cabeça principal
  p(ctx,  6,  8+y, 23, 16, '#2266aa');
  p(ctx,  5, 10+y,  1, 12, '#2266aa');
  p(ctx, 29, 10+y,  1, 12, '#2266aa');
  p(ctx,  8,  7+y, 19,  2, '#3377bb');
  p(ctx,  9,  6+y, 17,  1, '#3377bb');
  // Escamas
  for (let sx = 0; sx < 5; sx++) {
    for (let sy = 0; sy < 3; sy++) {
      p(ctx, 7 + sx*4, 9 + sy*4+y, 3, 2, '#1a5599');
      p(ctx, 7 + sx*4, 8 + sy*4+y, 3, 1, '#4488cc');
    }
  }
  // Olhos (azul gelo brilhante)
  if (blink) {
    ctx.fillStyle = iceCol;
    ctx.fillRect(9*S, (10+y)*S, 5*S, 4*S);
    ctx.fillRect(21*S, (10+y)*S, 5*S, 4*S);
    p(ctx, 10, 11+y,  3,  2, '#aaeeff');
    p(ctx, 22, 11+y,  3,  2, '#aaeeff');
    p(ctx, 11, 11+y,  1,  1, '#ffffff');
    p(ctx, 23, 11+y,  1,  1, '#ffffff');
    // Pupil em fenda (como lagarto)
    p(ctx, 11, 10+y,  1,  4, '#000033');
    p(ctx, 23, 10+y,  1,  4, '#000033');
    // Aura de gelo nos olhos
    ctx.fillStyle = `rgba(100,200,255,${0.25 + icePulse * 0.2})`;
    ctx.beginPath(); ctx.arc(11*S, (12+y)*S, 10, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(23*S, (12+y)*S, 10, 0, Math.PI*2); ctx.fill();
  } else {
    p(ctx,  9, 12+y,  5,  1, '#1a5599');
    p(ctx, 21, 12+y,  5,  1, '#1a5599');
  }
  // Narinas
  p(ctx, 13, 21+y,  2,  1, '#1a4477');
  p(ctx, 20, 21+y,  2,  1, '#1a4477');
  // Boca / presas
  p(ctx,  7, 22+y, 21,  3, '#1a4477');
  p(ctx,  7, 22+y, 21,  1, '#4499cc');
  // Presas de gelo
  for (let t = 0; t < 4; t++) {
    p(ctx,  8 + t*4, 24+y,  2,  3, '#ddeeff'); // inferior
    p(ctx,  9 + t*4, 26+y,  1,  2, '#ffffff');
    p(ctx,  9 + t*4, 22+y,  2,  2, '#ddeeff'); // superior
  }
  // Pescoço / escamas
  p(ctx, 11, 27+y, 13, 10, '#2266aa');
  p(ctx, 10, 28+y,  1,  8, '#1a5599');
  p(ctx, 24, 28+y,  1,  8, '#1a5599');
  // Escamas pescoço
  for (let i = 0; i < 3; i++) {
    p(ctx, 12 + i*3, 28 + i + y, 3, 2, '#1a5599');
    p(ctx, 12 + i*3, 27 + i + y, 3, 1, '#4488cc');
  }
  // Corpo
  p(ctx,  7, 37+y, 21,  8, '#2266aa');
  p(ctx,  6, 38+y,  1,  6, '#1a5599');
  p(ctx, 28, 38+y,  1,  6, '#1a5599');
  // Asas (parcialmente visíveis)
  p(ctx,  1, 28+y,  6, 15, '#1a4477');
  p(ctx,  2, 29+y,  4, 13, '#2255aa');
  p(ctx, 28, 28+y,  6, 15, '#1a4477');
  p(ctx, 29, 29+y,  4, 13, '#2255aa');
  // Membrana das asas
  ctx.fillStyle = `rgba(50,150,220,0.3)`;
  ctx.fillRect(1*S, (28+y)*S, 6*S, 15*S);
  ctx.fillRect(28*S, (28+y)*S, 6*S, 15*S);
  // Sopro de gelo (quando pulsando)
  ctx.fillStyle = `rgba(150,230,255,${icePulse * 0.4})`;
  ctx.beginPath();
  ctx.moveTo(9*S, (25+y)*S);
  ctx.quadraticCurveTo(0, (30+y)*S, 0, (38+y)*S);
  ctx.lineTo(4*S, (38+y)*S);
  ctx.quadraticCurveTo(4*S, (30+y)*S, 9*S, (26+y)*S);
  ctx.fill();
  // Patas
  p(ctx,  8, 44+y,  7,  4, '#1a5599');
  p(ctx, 20, 44+y,  7,  4, '#1a5599');
  for (let c = 0; c < 3; c++) {
    p(ctx,  8 + c*2, 47+y, 2, 2, '#ddeeff'); // garras
    p(ctx, 20 + c*2, 47+y, 2, 2, '#ddeeff');
  }
}

// ─── BOSS 4: Senhor das Trevas ─────────────────────────────────────────────
function drawSenhorDasTrevas(ctx, bob, blink, frame) {
  const y = bob;
  const redGlow = (Math.sin(frame * 0.12) + 1) / 2;
  const auraCol = `rgba(180,0,0,${0.15 + redGlow * 0.25})`;
  // Aura sombria ao redor
  ctx.fillStyle = `rgba(60,0,80,${0.2 + redGlow * 0.15})`;
  ctx.beginPath(); ctx.arc(17*S, 22*S+y*S, 18*S, 0, Math.PI*2); ctx.fill();
  // Coroa negra com espinhos
  p(ctx, 10,  0+y,  1,  4, '#222233');
  p(ctx, 14,  0+y,  2,  5, '#222233');
  p(ctx, 17,  0+y,  1,  6, '#330044'); // espinho central (maior)
  p(ctx, 20,  0+y,  2,  5, '#222233');
  p(ctx, 24,  0+y,  1,  4, '#222233');
  p(ctx,  9,  3+y, 17,  3, '#333344');
  p(ctx,  9,  4+y, 17,  2, '#444455');
  // Pedras na coroa
  p(ctx, 11,  3+y,  2,  2, '#ff0000');
  p(ctx, 15,  2+y,  2,  2, '#ff0000');
  p(ctx, 18,  1+y,  1,  2, '#cc0000');
  p(ctx, 22,  3+y,  2,  2, '#ff0000');
  // Elmo / cabeça
  p(ctx,  8,  6+y, 19, 14, '#222233');
  p(ctx,  7,  8+y,  1, 10, '#222233');
  p(ctx, 27,  8+y,  1, 10, '#222233');
  p(ctx,  9,  5+y, 17,  2, '#333344');
  // Faceplate (metal negro)
  p(ctx, 10,  8+y, 15,  8, '#2a2a3a');
  p(ctx, 10,  7+y, 15,  2, '#3a3a4a');
  // Olhos vermelhos brilhantes
  if (blink) {
    ctx.fillStyle = `rgba(255,0,0,${0.8 + redGlow * 0.2})`;
    ctx.fillRect(12*S, (9+y)*S, 4*S, 3*S);
    ctx.fillRect(19*S, (9+y)*S, 4*S, 3*S);
    p(ctx, 13, 10+y,  2,  1, '#ff8888');
    p(ctx, 20, 10+y,  2,  1, '#ff8888');
    p(ctx, 13,  9+y,  1,  1, '#ffffff');
    p(ctx, 20,  9+y,  1,  1, '#ffffff');
    // Raios dos olhos
    ctx.fillStyle = `rgba(255,0,0,${0.3 + redGlow * 0.3})`;
    ctx.beginPath(); ctx.arc(14*S, (10+y)*S, 7, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(21*S, (10+y)*S, 7, 0, Math.PI*2); ctx.fill();
  } else {
    p(ctx, 12, 11+y,  4,  1, '#110000');
    p(ctx, 19, 11+y,  4,  1, '#110000');
  }
  // Grade da viseira
  p(ctx, 12, 13+y, 11,  1, '#1a1a2a');
  p(ctx, 12, 15+y, 11,  1, '#1a1a2a');
  p(ctx, 14, 13+y,  1,  4, '#1a1a2a');
  p(ctx, 17, 13+y,  1,  4, '#1a1a2a');
  p(ctx, 20, 13+y,  1,  4, '#1a1a2a');
  // Pescoço / gola da armadura
  p(ctx, 12, 20+y, 11,  3, '#333344');
  p(ctx, 11, 21+y, 13,  2, '#444455');
  // Ombros grandes
  p(ctx,  3, 20+y,  9,  7, '#333344');
  p(ctx, 23, 20+y,  9,  7, '#333344');
  p(ctx,  3, 20+y,  9,  2, '#444455');
  p(ctx, 23, 20+y,  9,  2, '#444455');
  // Espinhos nos ombros
  p(ctx,  5, 17+y,  2,  4, '#222233');
  p(ctx,  8, 16+y,  2,  4, '#222233');
  p(ctx, 26, 17+y,  2,  4, '#222233');
  p(ctx, 23, 16+y,  2,  4, '#222233');
  // Corpo / peitoral
  p(ctx,  7, 27+y, 21, 14, '#222233');
  p(ctx,  8, 28+y, 19, 12, '#2a2a3a');
  p(ctx, 11, 27+y, 13, 14, '#333344');
  // Símbolo no peito
  p(ctx, 15, 29+y,  5,  5, '#440000');
  p(ctx, 16, 28+y,  3,  7, '#660000');
  p(ctx, 14, 30+y,  7,  3, '#660000');
  p(ctx, 17, 29+y,  1,  5, '#ff0000');
  p(ctx, 15, 31+y,  5,  1, '#ff0000');
  // Braços blindados
  p(ctx,  3, 27+y,  5, 14, '#222233');
  p(ctx,  4, 28+y,  3, 12, '#333344');
  p(ctx, 27, 27+y,  5, 14, '#222233');
  p(ctx, 28, 28+y,  3, 12, '#333344');
  // Mãos / luvas
  p(ctx,  2, 40+y,  6,  5, '#333344');
  p(ctx, 27, 40+y,  6,  5, '#333344');
  // Espada negra na mão dir
  p(ctx, 32,  8+y,  2, 32, '#111122');
  p(ctx, 32,  7+y,  2,  2, '#222233');
  p(ctx, 29, 20+y,  7,  2, '#333344'); // guarda
  p(ctx, 32, 21+y,  2,  8, '#222233'); // cabo
  p(ctx, 32,  7+y,  1, 30, '#3333aa'); // brilho sombrio
  // Capa
  p(ctx,  5, 27+y,  3, 20, '#110022');
  p(ctx, 27, 27+y,  3, 20, '#110022');
  p(ctx,  4, 35+y,  3, 12, '#110022');
  p(ctx, 28, 35+y,  3, 12, '#110022');
  ctx.fillStyle = `rgba(40,0,60,0.5)`;
  ctx.fillRect(5*S, (27+y)*S, 3*S, 20*S);
  ctx.fillRect(27*S, (27+y)*S, 3*S, 20*S);
  // Pernas
  p(ctx,  9, 41+y,  7, 10, '#222233');
  p(ctx, 19, 41+y,  7, 10, '#222233');
  p(ctx, 10, 42+y,  5,  8, '#2a2a3a');
  p(ctx, 20, 42+y,  5,  8, '#2a2a3a');
  // Botas
  p(ctx,  8, 50+y,  9,  3, '#111122');
  p(ctx, 18, 50+y,  9,  3, '#111122');
  p(ctx,  8, 52+y, 10,  1, '#000011');
  p(ctx, 18, 52+y, 10,  1, '#000011');
  // Aura de volta
  ctx.fillStyle = auraCol;
  ctx.fillRect(0, 0, W, H);
}

// ─── Partículas de morte ──────────────────────────────────────────────────────
function criarParticulas(bossIdx) {
  const cores = [
    ['#22bb33','#ffcc00','#885522'],  // goblin
    ['#d8d4a8','#886644','#4444ff'],  // esqueleto
    ['#7700aa','#cc44ff','#c89070'],  // mago
    ['#2266aa','#aaddff','#ddeeff'],  // dragão
    ['#ff0000','#222233','#660000'],  // senhor
  ][bossIdx] || ['#ffffff','#aaaaaa','#555555'];
  const parts = [];
  for (let i = 0; i < 40; i++) {
    parts.push({
      x: (5 + Math.random() * 25) * S,
      y: (10 + Math.random() * 30) * S,
      vx: (Math.random() - 0.5) * 6,
      vy: -Math.random() * 5 - 1,
      size: S + Math.random() * S * 2,
      cor: cores[Math.floor(Math.random() * cores.length)],
      alpha: 1,
    });
  }
  return parts;
}

// ─── Componente BossCanvas ────────────────────────────────────────────────────
export default function BossCanvas({ bossIdx = 0, animState = 'idle', onDeathEnd }) {
  const canvasRef    = useRef(null);
  const frameRef     = useRef(0);
  const dmgFrameRef  = useRef(0);  // contador de frames do dano
  const partRef      = useRef(null);
  const rafRef       = useRef(null);

  // Inicia animação de dano quando animState muda para 'damage'
  useEffect(() => {
    if (animState === 'damage') {
      dmgFrameRef.current = 12;
    }
    if (animState === 'death') {
      partRef.current = criarParticulas(bossIdx);
    }
  }, [animState, bossIdx]);

  const render = useCallback(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    ctx.clearRect(0, 0, W, H);

    frameRef.current++;
    const f    = frameRef.current;
    const bob  = Math.round(Math.sin(f * 0.05) * 2);
    const blink = f % 120 < 115;  // fecha por 5 frames a cada 120

    if (animState === 'death') {
      // Anima partículas
      const parts = partRef.current || [];
      let alive = false;
      for (const pt of parts) {
        pt.x  += pt.vx;
        pt.y  += pt.vy;
        pt.vy += 0.18; // gravidade
        pt.alpha = Math.max(0, pt.alpha - 0.018);
        if (pt.alpha > 0) alive = true;
        ctx.globalAlpha = pt.alpha;
        ctx.fillStyle = pt.cor;
        ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
      }
      ctx.globalAlpha = 1;
      if (!alive) onDeathEnd?.();
      rafRef.current = requestAnimationFrame(render);
      return;
    }

    // Shake durante dano
    let shakeX = 0;
    if (dmgFrameRef.current > 0) {
      shakeX = (dmgFrameRef.current % 2 === 0 ? 1 : -1) * 3;
      dmgFrameRef.current--;
    }
    ctx.save();
    ctx.translate(shakeX, 0);

    // Desenha o boss
    switch (bossIdx) {
      case 0: drawGoblinRei(ctx, bob, blink); break;
      case 1: drawEsqueletoGuerreiro(ctx, bob, blink); break;
      case 2: drawMagoDasSombras(ctx, bob, blink, f); break;
      case 3: drawDragaoDeGelo(ctx, bob, blink, f); break;
      case 4: drawSenhorDasTrevas(ctx, bob, blink, f); break;
      default: drawGoblinRei(ctx, bob, blink);
    }

    // Flash vermelho de dano
    if (dmgFrameRef.current > 0 || animState === 'damage') {
      const alpha = Math.min(0.6, dmgFrameRef.current / 6);
      ctx.fillStyle = `rgba(255,0,0,${alpha})`;
      ctx.fillRect(0, 0, W, H);
    }

    ctx.restore();
    rafRef.current = requestAnimationFrame(render);
  }, [bossIdx, animState, onDeathEnd]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [render]);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      style={{ imageRendering: 'pixelated', display: 'block' }}
    />
  );
}
