import React, { useState } from 'react';

/**
 * QuizInline — Mini-quiz de múltipla escolha embutido no chat
 * Props: pergunta, opcoes (array), correta (índice 0-3), onAcerto, onErro
 */
export default function QuizInline({ pergunta, opcoes, correta, onAcerto, onErro }) {
  const [selecionada, setSelecionada] = useState(null);
  const [respondido, setRespondido] = useState(false);

  function responder(idx) {
    if (respondido) return;
    setSelecionada(idx);
    setRespondido(true);
    if (idx === correta) onAcerto?.();
    else onErro?.();
  }

  const letras = ['A', 'B', 'C', 'D'];

  return (
    <div className="mt-3 bg-violet-50 border border-violet-200 rounded-2xl p-4 space-y-2">
      <p className="text-xs font-bold text-violet-500 uppercase tracking-wide">❓ Quiz</p>
      <p className="text-sm font-semibold text-gray-800 leading-snug">{pergunta}</p>
      <div className="space-y-2 mt-1">
        {opcoes.map((op, i) => {
          let cls = 'border-gray-200 bg-white text-gray-700 hover:border-violet-300 hover:bg-violet-50';
          if (respondido) {
            if (i === correta) cls = 'border-green-400 bg-green-50 text-green-800 font-semibold';
            else if (i === selecionada) cls = 'border-red-400 bg-red-50 text-red-700';
            else cls = 'border-gray-100 bg-gray-50 text-gray-400';
          }
          return (
            <button
              key={i}
              onClick={() => responder(i)}
              disabled={respondido}
              className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-all flex items-center gap-2 ${cls}`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                respondido && i === correta ? 'bg-green-400 text-white' :
                respondido && i === selecionada ? 'bg-red-400 text-white' :
                'bg-gray-200 text-gray-600'
              }`}>{letras[i]}</span>
              {op}
            </button>
          );
        })}
      </div>
      {respondido && (
        <p className={`text-xs font-semibold mt-1 ${selecionada === correta ? 'text-green-600' : 'text-red-500'}`}>
          {selecionada === correta ? '🎉 Acertou! +10 XP' : `❌ Errou! A resposta certa era ${letras[correta]}`}
        </p>
      )}
    </div>
  );
}
