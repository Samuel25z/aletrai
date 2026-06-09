/**
 * Sprites pixel art — Chão é Lava
 * REGRA: todos os rows de um mesmo sprite TÊM que ter exatamente o mesmo número de chars.
 * '.' = transparente
 */

// ─── Paletas ──────────────────────────────────────────────────────────────────
export const PLAYER_PAL = {
  H: '#3b1f0a', // cabelo escuro
  h: '#6b3f1a', // cabelo médio
  S: '#f5c89a', // pele
  s: '#d9a070', // pele sombra
  e: '#111100', // pupila
  w: '#ffffff', // branco olho
  O: '#ff6a30', // camiseta laranja
  o: '#bb3a00', // camiseta sombra
  B: '#1e2e50', // calça azul
  b: '#2a4070', // calça claro
  K: '#3a1a04', // bota escura
  k: '#5c2e10', // bota médio
  G: '#ddaa00', // cinto dourado
};

export const GOBLIN_PAL = {
  G: '#1ecc3a', // verde goblin
  g: '#0f8820', // verde escuro
  d: '#0a5510', // verde muito escuro (orelha)
  Y: '#eecc00', // olho amarelo
  p: '#111100', // pupila
  M: '#cc1100', // gengiva vermelha
  T: '#eeeecc', // dente
  L: '#5a3010', // couro marrom
  l: '#8a5020', // couro claro
  P: '#2a2a3a', // calça cinza
  W: '#1a1005', // bota
  C: '#55ee66', // rosto claro
};

export const SKELETON_PAL = {
  W: '#d0cca0', // osso principal
  w: '#eeeac0', // osso claro
  D: '#1a1a2a', // órbita escura
  d: '#444438', // órbita interna
  T: '#e8e4b0', // dente
  r: '#b0ac80', // osso sombra
};

export const MAGE_PAL = {
  R: '#8800cc', // manto roxo
  r: '#550099', // manto sombra
  S: '#f0c090', // pele
  s: '#cc9060', // pele sombra
  H: '#110022', // chapéu escuro
  E: '#ff44ff', // olho mágico
  G: '#ffbb00', // orbe dourado
  g: '#fff088', // orbe brilho
  C: '#cc99ff', // capa clara
  c: '#aa66ee', // capa sombra
};

// ─── Sprites ──────────────────────────────────────────────────────────────────
// Largura FIXA por sprite. Todos os rows TÊM que ter o mesmo nº de chars.

// Player — 9 wide × 16 tall (scale 2 → 18×32 px)
export const PLAYER_FRAMES = [
  // Frame 0: parado
  [
    '..HHhHH..',  // 0  cabelo
    '.HHHhHHH.',  // 1  cabelo
    '.HSSSSSH.',  // 2  topo cabeça
    '.SSwSSw S',  // 3  olhos  (w=branco e=pupila)
    '.SSSSSSS.',  // 4  rosto
    '.SsSmSSS.',  // 5  nariz / boca
    '..SSSSSS.',  // 6  queixo
    'OOOOOOOOO',  // 7  camisa
    'SOoOOoOOS',  // 8  camisa c/ braços
    '.oOOOOoo.',  // 9  camisa sombra
    '.GGGGGGG.',  // 10 cinto
    '.BB...BB.',  // 11 calça
    '.BB...BB.',  // 12 calça
    '.bB...Bb.',  // 13 calça baixo
    '.KK...KK.',  // 14 bota
    'kKK...KKk',  // 15 bota base
  ],
  // Frame 1: correndo
  [
    '..HHhHH..',
    '.HHHhHHH.',
    '.HSSSSSH.',
    '.SSwSSw S',
    '.SSSSSSS.',
    '.SsSmSSS.',
    '..SSSSSS.',
    'OOOOOOOOO',
    'SOoOOoOOS',
    '.oOOOOoo.',
    '.GGGGGGG.',
    '.BBB..bb.',  // perna esq na frente
    '.BBB..bb.',
    '.bBb.....',
    '.kKk.....',
    'kKKk.....',
  ],
];

// Goblin — 10 wide × 13 tall (scale 2 → 20×26 px)
export const GOBLIN_FRAMES = [
  // Frame 0
  [
    '...GGGG...',  // 0  cabeça topo
    '..GGGGGG..',  // 1  cabeça
    '.dGGGGGGd.',  // 2  orelhas
    'ddGGGGGGdd',  // 3  orelhas externas
    '.GGYpGYpG.',  // 4  olhos (Y=amarelo p=pupila)
    '.GCGGGGCg.',  // 5  bochechas
    '.GGGggGGG.',  // 6  maxilar
    '..GMTTMG..',  // 7  boca/dentes
    '..LLLLLL..',  // 8  pescoço couro
    '.LlLLLlL.',  // 9  peito
    'LlLLLLlLL',  // 10 couro baixo
    '.PP....PP',  // 11 calça
    '.WW....WW',  // 12 bota
  ],
  // Frame 1: correndo
  [
    '...GGGG...',
    '..GGGGGG..',
    '.dGGGGGGd.',
    'ddGGGGGGdd',
    '.GGYpGYpG.',
    '.GCGGGGCg.',
    '.GGGggGGG.',
    '..GMTTMG..',
    '..LLLLLL..',
    '.LlLLLlL.',
    'LlLLLLlLL',
    '.PPP......',  // perna alternada
    '.WWW......',
  ],
];

// Esqueleto — 8 wide × 14 tall (scale 2 → 16×28 px)
export const SKELETON_FRAMES = [
  // Frame 0
  [
    '.WWWWWW.',  // 0  crânio
    'WWWWWWWW',  // 1
    'WDddddDW',  // 2  órbitas oculares
    'WdwwwwdW',  // 3  interior olhos
    'WWWWWWWW',  // 4
    '.WTTTTWW',  // 5  mandíbula/dentes
    '..WWWWW.',  // 6  pescoço
    '.rWWWWr.',  // 7  caixa torácica
    'rWWWWWWr',  // 8  costelas
    '.rWWWWr.',  // 9
    'rWWWWWWr',  // 10 costelas baixo
    '..WW.WW.',  // 11 pélvis/pernas
    '..WW.WW.',  // 12 pernas
    '..wW.Ww.',  // 13 tornozelos
  ],
  // Frame 1: correndo
  [
    '.WWWWWW.',
    'WWWWWWWW',
    'WDddddDW',
    'WdwwwwdW',
    'WWWWWWWW',
    '.WTTTTWW',
    '..WWWWW.',
    '.rWWWWr.',
    'rWWWWWWr',
    '.rWWWWr.',
    'rWWWWWWr',
    '..WWW...',  // perna alternada
    '..WWW...',
    '..wWW...',
  ],
];

// Mago — 9 wide × 14 tall (scale 2 → 18×28 px)
export const MAGE_FRAMES = [
  // Frame 0
  [
    '....H....',  // 0  ponta chapéu
    '...HHH...',  // 1
    '..HHHHH..',  // 2  chapéu
    '.HHHHHHH.',  // 3  aba do chapéu
    '.RSSSSSr.',  // 4  rosto
    '.RSEESr.',   // 5  ERRO — precisa ser 9
    '.RSSSSSr.',  // 6  rosto
    '.CRRRRRC',   // 7  manto pescoço
    'CCRRRRRCC',  // 8  ERRO — precisa ser 9
    '.CRrRrRC.',  // 9  manto corpo
    '.cRGGRc.',   // 10 ERRO — precisa ser 9
    '..CRRRc..',  // 11 manto baixo
    '..RrRrR..',  // 12 pernas
    '..RrRrR..',  // 13
  ],
  // Frame 1
  [
    '....H....',
    '...HHH...',
    '..HHHHH..',
    '.HHHHHHH.',
    '.RSSSSSr.',
    '.RSEESr.',
    '.RSSSSSr.',
    '.CRRRRRC',
    'CCRRRRRCC',
    '.CRrRrRC.',
    '.cRGGRc.',
    '..CRRRc..',
    '..RRRr...',  // perna alternada
    '..RRRr...',
  ],
];

// ─── Corrige inconsistências automáticas ─────────────────────────────────────
function normalizeSprite(frames) {
  return frames.map(frame => {
    const maxW = Math.max(...frame.map(r => r.length));
    return frame.map(row => row.padEnd(maxW, '.').slice(0, maxW));
  });
}

const PLAYER_NORM  = normalizeSprite(PLAYER_FRAMES);
const GOBLIN_NORM  = normalizeSprite(GOBLIN_FRAMES);
const SKEL_NORM    = normalizeSprite(SKELETON_FRAMES);
const MAGE_NORM    = normalizeSprite(MAGE_FRAMES);

export { PLAYER_NORM as PLAYER_FRAMES_N, GOBLIN_NORM as GOBLIN_FRAMES_N, SKEL_NORM as SKEL_FRAMES_N, MAGE_NORM as MAGE_FRAMES_N };

// ─── drawSprite ───────────────────────────────────────────────────────────────
export function drawSprite(ctx, frame, palette, x, y, scale = 2, flipX = false) {
  const h = frame.length;
  const w = frame[0].length;
  ctx.save();
  if (flipX) {
    ctx.translate(x + w * scale, 0);
    ctx.scale(-1, 1);
    ctx.translate(-x, 0);
  }
  for (let row = 0; row < h; row++) {
    const line = frame[row];
    for (let col = 0; col < line.length; col++) {
      const ch = line[col];
      if (ch === '.' || ch === ' ' || !palette[ch]) continue;
      ctx.fillStyle = palette[ch];
      ctx.fillRect(
        Math.round(x + col * scale),
        Math.round(y + row * scale),
        scale, scale
      );
    }
  }
  ctx.restore();
}
