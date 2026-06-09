import React, { useState } from 'react';

/**
 * LacunaInline — Complete a lacuna inline no chat
 * Props: texto (com ___ marcando a lacuna), resposta, onAcerto, onErro
 */
export default function LacunaInline({ texto, resposta, onAcerto, onErro }) {
  const [input, setInput] = useState('');
  const [respondido, setRespondido] = useState(false);
  const [acertou, setAcertou] = useState(false);

  function verificar() {
    if (!input.trim() || respondido) return;
    const correto = input.trim().toLowerCase() === resposta.toLowerCase();
    setRespondido(true);
    setAcertou(correto);
    if (correto) onAcerto?.();
    else onErro?.();
  }

  // Divide o texto em antes e depois da lacuna
  const partes = texto.split('___');

  return (
    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-2xl p-4">
      <p className="text-xs font-bold text-blue-500 uppercase tracking-wide mb-2">✏️ Complete a lacuna</p>
      <p className="text-sm text-gray-800 leading-relaxed mb-3">
        {partes[0]}
        {respondido ? (
          <span className={`font-bold px-1 rounded ${acertou ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100 line-through'}`}>
            {input}
          </span>
        ) : (
          <span className="inline-block border-b-2 border-blue-400 min-w-16 text-center font-bold text-blue-600 px-1">
            {input || '___'}
          </span>
        )}
        {!acertou && respondido && (
          <span className="font-bold text-green-700 bg-green-100 px-1 rounded ml-1">{resposta}</span>
        )}
        {partes[1]}
      </p>

      {!respondido ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && verificar()}
            placeholder="Digite sua resposta..."
            className="flex-1 border border-blue-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
          />
          <button
            onClick={verificar}
            disabled={!input.trim()}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            OK
          </button>
        </div>
      ) : (
        <p className={`text-xs font-semibold ${acertou ? 'text-green-600' : 'text-red-500'}`}>
          {acertou ? '🎉 Perfeito! +8 XP' : `❌ A resposta correta era: "${resposta}"`}
        </p>
      )}
    </div>
  );
}
