import React from 'react';

// variant: "light" = texto branco (para fundos escuros/roxos)
//          "dark"  = texto escuro (para fundos brancos)
export default function LogoMarca({ size = 40, variant = 'light', className = '' }) {
  const textColor = variant === 'dark' ? '#111' : '#fff';
  const aiColor   = '#7c3aed';

  return (
    <svg
      viewBox="0 0 260 60"
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block', width: 'auto' }}
    >
      <defs>
        <linearGradient id="aiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <text x="0" y="48" fontFamily="Inter, ui-sans-serif, sans-serif"
        fontWeight="900" fontSize="52" letterSpacing="-2" fill={textColor}>
        Aletr
      </text>
      <text x="162" y="48" fontFamily="Inter, ui-sans-serif, sans-serif"
        fontWeight="900" fontSize="52" letterSpacing="-2" fill="url(#aiGrad)">
        AI
      </text>
    </svg>
  );
}
