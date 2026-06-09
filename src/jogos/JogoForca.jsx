import React, { useState, useEffect } from 'react';

export default function JogoForca({ conteudo, tema, onFim }) {
  const [idx, setIdx] = useState(0);
  const [letrasErradas, setLetrasErradas] = useState([]);
  const [letrasCorretas, setLetrasCorretas] = useState([]);
  const [acertos, setAcertos] = useState(0);

  const palavras = conteudo?.palavras || [];
  const maxErros = 6;

  useEffect(() => {
    setLetrasErradas([]);
    setLetrasCorretas([]);
  }, [idx]);

  if (!palavras.length) return <div className="text-center text-gray-500 py-8">Carregando...</div>;

  const atual = palavras[idx];
  const palavra = atual.palavra.toUpperCase();
  const erros = letrasErradas.length;
  const ganhou = palavra.split('').every(l => l === ' ' || letrasCorretas.includes(l));
  const perdeu = erros >= maxErros;

  function chutar(letra) {
    if (letrasErradas.includes(letra) || letrasCorretas.includes(letra)) return;
    if (palavra.includes(letra)) setLetrasCorretas(l => [...l, letra]);
    else setLetrasErradas(l => [...l, letra]);
  }

  function proxima(ganhouRodada) {
    if (ganhouRodada) setAcertos(a => a + 1);
    if (idx + 1 >= palavras.length) onFim(acertos + (ganhouRodada ? 1 : 0), palavras.length);
    else setIdx(i => i + 1);
  }

  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const partesForca = ['cabeça','pescoço','tronco','braço E','braço D','perna E','perna D'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{idx + 1}/{palavras.length}</span>
        <span className="bg-violet-50 text-violet-700 text-xs font-bold px-3 py-1 rounded-full border border-violet-200">🔤 Forca • {tema}</span>
        <span className="text-sm text-red-500 font-bold">{erros}/{maxErros} erros</span>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
        <p className="text-xs text-gray-500 mb-1">Dica: {atual.dica}</p>
        <div className="flex justify-center gap-2 flex-wrap mt-3">
          {palavra.split('').map((l, i) => (
            <div key={i} className={`w-8 h-10 border-b-2 flex items-end justify-center pb-1 font-bold text-lg ${
              l === ' ' ? 'border-transparent' : letrasCorretas.includes(l) ? 'border-violet-500 text-violet-700' : 'border-gray-400 text-transparent'
            }`}>
              {letrasCorretas.includes(l) || (perdeu) ? l : '_'}
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-center gap-1 flex-wrap">
          {Array.from({length: maxErros}).map((_, i) => (
            <span key={i} className={`text-xl ${i < erros ? 'opacity-100' : 'opacity-20'}`}>
              {['😵','💀','☠️','👻','😨','😰'][i]}
            </span>
          ))}
        </div>
      </div>

      {(ganhou || perdeu) ? (
        <div className={`rounded-2xl p-4 text-center ${ganhou ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <p className={`font-bold text-lg ${ganhou ? 'text-green-700' : 'text-red-700'}`}>
            {ganhou ? '🎉 Acertou!' : `💀 A palavra era: ${palavra}`}
          </p>
          <button onClick={() => proxima(ganhou)} className="mt-3 px-6 py-2 bg-violet-600 text-white font-semibold rounded-xl text-sm">
            {idx + 1 >= palavras.length ? 'Ver resultado 🏆' : 'Próxima →'}
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-1 justify-center">
          {letras.map(l => {
            const errada = letrasErradas.includes(l);
            const certa = letrasCorretas.includes(l);
            return (
              <button key={l} onClick={() => chutar(l)} disabled={errada || certa}
                className={`w-9 h-9 rounded-lg font-bold text-sm transition-all ${
                  errada ? 'bg-red-100 text-red-400 border border-red-200' :
                  certa ? 'bg-green-100 text-green-400 border border-green-200' :
                  'bg-white border border-gray-300 text-gray-700 hover:bg-violet-50 hover:border-violet-400'
                } disabled:cursor-default`}>
                {l}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}