import React, { useState } from 'react';

export default function JogoVerdadeiroFalso({ conteudo, tema, onFim }) {
  const [idx, setIdx] = useState(0);
  const [escolhida, setEscolhida] = useState(null);
  const [acertos, setAcertos] = useState(0);
  const [animando, setAnimando] = useState(false);

  const afirmacoes = conteudo?.afirmacoes || [];

  function responder(resp) {
    if (escolhida !== null) return;
    setEscolhida(resp);
    if (resp === afirmacoes[idx].verdadeiro) setAcertos(a => a + 1);
  }

  function proxima() {
    setAnimando(true);
    setTimeout(() => {
      if (idx + 1 >= afirmacoes.length) onFim(acertos, afirmacoes.length);
      else { setIdx(i => i + 1); setEscolhida(null); setAnimando(false); }
    }, 300);
  }

  if (!afirmacoes.length) return <div className="text-center text-gray-500 py-8">Carregando...</div>;

  const a = afirmacoes[idx];
  const acertou = escolhida === a.verdadeiro;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{idx + 1}/{afirmacoes.length}</span>
        <span className="bg-violet-50 text-violet-700 text-xs font-bold px-3 py-1 rounded-full border border-violet-200">✅ V ou F • {tema}</span>
        <span className="text-sm font-bold text-violet-600">{acertos} ✓</span>
      </div>

      <div className={`bg-white rounded-3xl p-6 border-2 border-gray-100 shadow-sm text-center transition-all duration-300 ${animando ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <p className="text-4xl mb-4">🤔</p>
        <p className="text-lg font-semibold text-gray-900 leading-relaxed">{a.texto}</p>
      </div>

      {escolhida === null ? (
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => responder(true)}
            className="py-5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl text-lg transition-all shadow-lg hover:scale-105 active:scale-95">
            ✅ Verdadeiro
          </button>
          <button onClick={() => responder(false)}
            className="py-5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl text-lg transition-all shadow-lg hover:scale-105 active:scale-95">
            ❌ Falso
          </button>
        </div>
      ) : (
        <>
          <div className={`rounded-2xl p-4 text-center ${acertou ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className={`font-bold text-lg ${acertou ? 'text-green-700' : 'text-red-700'}`}>
              {acertou ? '🎉 Correto!' : `❌ Era ${a.verdadeiro ? 'Verdadeiro' : 'Falso'}!`}
            </p>
            {a.explicacao && <p className="text-sm text-gray-600 mt-1">{a.explicacao}</p>}
          </div>
          <button onClick={proxima} className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-200">
            {idx + 1 >= afirmacoes.length ? 'Ver resultado 🏆' : 'Próxima →'}
          </button>
        </>
      )}
    </div>
  );
}