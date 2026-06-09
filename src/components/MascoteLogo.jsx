import React from 'react';

// Pixel art: estudante-aventureiro com capelo e livro
// Cada caractere = 1 pixel no grid 12x18
const GRID = [
  "____PP______",  // ponto do capelo
  "___CCCCC____",  // topo do chapéu
  "_CCCCCCCCC__",  // aba do chapéu
  "____SSSS____",  // cabeça topo
  "___SSSSSS___",  // cabeça
  "___ESSSSES__",  // olhos
  "___SSSSSS___",  // nariz
  "___SMMMMS___",  // sorriso
  "___VVVVVV___",  // gola
  "__VVVBBBVVV_",  // corpo + livro
  "__VVVBWWVVV_",  // livro (página)
  "__VVVBBBVVV_",  // livro (borda)
  "__VVVVVVVV__",  // corpo baixo
  "___PVPVPP___",  // detalhe cinturão
  "____LL_LL___",  // pernas
  "____LL_LL___",  // pernas
  "____FFFFF___",  // pés/sapatos
];

const CORES = {
  P: '#a855f7',  // roxo — ponto do capelo e detalhes
  C: '#1e1b4b',  // azul-escuro — chapéu
  S: '#fde68a',  // pele
  E: '#1e1b4b',  // olhos
  M: '#b45309',  // boca
  V: '#7c3aed',  // roupa/manto violeta
  B: '#1d4ed8',  // capa do livro
  W: '#bfdbfe',  // página do livro
  L: '#312e81',  // calças
  F: '#1f2937',  // sapatos
};

export default function MascoteLogo({ size = 48, className = '' }) {
  const rows = GRID.length;
  const cols = GRID[0].length;
  const px = size / cols;
  const height = px * rows;

  return (
    <svg
      width={size}
      height={height}
      viewBox={`0 0 ${size} ${height}`}
      className={className}
      style={{ imageRendering: 'pixelated' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {GRID.map((row, y) =>
        [...row].map((char, x) => {
          const cor = CORES[char];
          if (!cor) return null;
          return (
            <rect
              key={`${y}-${x}`}
              x={x * px}
              y={y * px}
              width={px}
              height={px}
              fill={cor}
            />
          );
        })
      )}
    </svg>
  );
}
