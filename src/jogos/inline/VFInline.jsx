import React, { useState } from 'react';

/**
 * VFInline — Verdadeiro ou Falso inline no chat
 * Props: afirmacao, resposta (true/false), onAcerto, onErro
 */
export default function VFInline({ afirmacao, resposta, onAcerto, onErro }) {
  const [escolha, setEscolha] = useState(null);
  const [respondido, setRespondido] = useState(false);

  function responder(val) {
    if (respondido) return;
    setEscolha(val);
    setRespondido(true);
    if (val === resposta) onAcerto?.();
    else onErro?.();
  }

  const acertou = respondido && escolha === resposta;

  return (
    <div className="mt-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
      <p className="text-xs font-bold text-amber-500 uppercase tracking-wide mb-2">⚡ Verdadeiro ou Falso</p>
      <p className="text-sm font-semibold text-gray-800 leading-snug mb-3">"{afirmacao}"</p>
      <div className="flex gap-2">
        {[
          { val: true,  label: '✅ Verdadeiro', cor: 'border-green-400 bg-green-50 text-green-700', hover: 'hover:bg-green-50 hover:border-green-400' },
          { val: false, label: '❌ Falso',       cor: 'border-red-400 bg-red-50 text-red-700',     hover: 'hover:bg-red-50 hover:border-red-400'   },
        ].map(({ val, label, cor, hover }) => {
          let cls = `border-gray-200 bg-white text-gray-700 ${hover}`;
          if (respondido) {
            if (val === resposta) cls = cor;
            else if (val === escolha) cls = 'border-gray-200 bg-gray-100 text-gray-400 opacity-60';
            else cls = 'border-gray-100 bg-gray-50 text-gray-400 opacity-40';
          }
          return (
            <button
              key={String(val)}
              onClick={() => responder(val)}
              disabled={respondido}
              className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${cls}`}
            >
              {label}
            </button>
          );
        })}
      </div>
      {respondido && (
        <p className={`text-xs font-semibold mt-2 ${acertou ? 'text-green-600' : 'text-red-500'}`}>
          {acertou ? '🎉 Correto! +5 XP' : `❌ Era ${resposta ? 'Verdadeiro' : 'Falso'}!`}
        </p>
      )}
    </div>
  );
}
