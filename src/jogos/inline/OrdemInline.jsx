import React, { useState, useCallback } from 'react';

/**
 * OrdemInline — Ordene os itens na sequência correta
 * Props: itens (array na ordem correta), onAcerto, onErro
 */
export default function OrdemInline({ itens, onAcerto, onErro }) {
  const [embaralhado] = useState(() => [...itens].sort(() => Math.random() - 0.5));
  const [ordem, setOrdem] = useState(embaralhado);
  const [verificado, setVerificado] = useState(false);
  const [acertou, setAcertou] = useState(false);
  const [arrastando, setArrastando] = useState(null);

  function mover(de, para) {
    const nova = [...ordem];
    const [item] = nova.splice(de, 1);
    nova.splice(para, 0, item);
    setOrdem(nova);
  }

  function subir(idx) {
    if (idx === 0) return;
    mover(idx, idx - 1);
  }

  function descer(idx) {
    if (idx === ordem.length - 1) return;
    mover(idx, idx + 1);
  }

  function verificar() {
    const correto = ordem.every((item, i) => item === itens[i]);
    setVerificado(true);
    setAcertou(correto);
    if (correto) onAcerto?.();
    else onErro?.();
  }

  return (
    <div className="mt-3 bg-green-50 border border-green-200 rounded-2xl p-4">
      <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2">🔢 Coloque na ordem correta</p>
      <div className="space-y-2 mb-3">
        {ordem.map((item, i) => {
          let cor = 'bg-white border-gray-200';
          if (verificado) {
            cor = item === itens[i] ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400';
          }
          return (
            <div key={item} className={`flex items-center gap-2 border rounded-xl px-3 py-2 ${cor} transition-colors`}>
              <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              <span className="flex-1 text-sm text-gray-800">{item}</span>
              {!verificado && (
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => subir(i)} disabled={i === 0}
                    className="text-gray-400 hover:text-gray-700 disabled:opacity-20 leading-none text-xs px-1">▲</button>
                  <button onClick={() => descer(i)} disabled={i === ordem.length - 1}
                    className="text-gray-400 hover:text-gray-700 disabled:opacity-20 leading-none text-xs px-1">▼</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {!verificado ? (
        <button
          onClick={verificar}
          className="w-full py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          Verificar ordem
        </button>
      ) : (
        <>
          <p className={`text-xs font-semibold ${acertou ? 'text-green-600' : 'text-red-500'}`}>
            {acertou ? '🎉 Ordem perfeita! +12 XP' : '❌ Não era bem essa ordem...'}
          </p>
          {!acertou && (
            <div className="mt-2 space-y-1">
              <p className="text-xs text-gray-500 font-medium">Ordem correta:</p>
              {itens.map((item, i) => (
                <p key={i} className="text-xs text-gray-700">{i + 1}. {item}</p>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
