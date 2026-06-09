import React, { useState, useEffect, useRef } from 'react';

export default function JogoQuiz({ conteudo, tema, onFim }) {
  const [idx, setIdx] = useState(0);
  const [escolhida, setEscolhida] = useState(null);
  const [acertos, setAcertos] = useState(0);
  const [timer, setTimer] = useState(30);
  const timerRef = useRef(null);

  const perguntas = conteudo?.perguntas || [];

  useEffect(() => {
    if (escolhida === null) {
      timerRef.current = setInterval(() => {
        setTimer(t => {
          if (t <= 1) { responder(-1); return 30; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [idx, escolhida]);

  function responder(i) {
    clearInterval(timerRef.current);
    setEscolhida(i);
    if (i === perguntas[idx].correta) setAcertos(a => a + 1);
  }

  function proxima() {
    if (idx + 1 >= perguntas.length) {
      onFim(acertos, perguntas.length);
    } else {
      setIdx(i => i + 1);
      setEscolhida(null);
      setTimer(30);
    }
  }

  if (!perguntas.length) return <div className="text-center text-gray-500 py-8">Carregando perguntas...</div>;

  const p = perguntas[idx];
  const timerCor = timer > 15 ? 'bg-green-500' : timer > 7 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{idx + 1}/{perguntas.length}</span>
        <span className="bg-violet-50 text-violet-700 text-xs font-bold px-3 py-1 rounded-full border border-violet-200">🎯 Quiz • {tema}</span>
        <span className={`text-sm font-bold ${timer <= 7 ? 'text-red-500' : 'text-gray-700'}`}>⏱ {timer}s</span>
      </div>

      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-1000 ${timerCor}`} style={{ width: `${(timer/30)*100}%` }}></div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <p className="text-base font-semibold text-gray-900 leading-relaxed">{p.pergunta}</p>
      </div>

      <div className="space-y-2">
        {p.opcoes.map((op, i) => {
          let cls = 'bg-white border-2 border-gray-200 text-gray-800 hover:border-violet-400 hover:bg-violet-50';
          if (escolhida !== null) {
            if (i === p.correta) cls = 'bg-green-50 border-2 border-green-500 text-green-800';
            else if (i === escolhida) cls = 'bg-red-50 border-2 border-red-400 text-red-700';
            else cls = 'bg-gray-50 border-2 border-gray-200 text-gray-400';
          }
          return (
            <button key={i} onClick={() => escolhida === null && responder(i)} disabled={escolhida !== null}
              className={`w-full p-4 rounded-2xl text-left font-medium transition-all ${cls} disabled:cursor-default`}>
              <span className="text-gray-400 mr-2">{['A','B','C','D'][i]}.</span> {op}
            </button>
          );
        })}
      </div>

      {escolhida !== null && (
        <>
          <div className={`rounded-2xl p-4 ${escolhida === p.correta ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className={`font-semibold text-sm ${escolhida === p.correta ? 'text-green-800' : 'text-red-800'}`}>
              {escolhida === p.correta ? '🎉 Correto!' : `❌ Errado! Certo: ${p.opcoes[p.correta]}`}
            </p>
            {p.explicacao && <p className="text-xs text-gray-600 mt-1">{p.explicacao}</p>}
          </div>
          <button onClick={proxima} className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-200">
            {idx + 1 >= perguntas.length ? 'Ver resultado 🏆' : 'Próxima →'}
          </button>
        </>
      )}
    </div>
  );
}