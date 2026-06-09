import React, { useState, useEffect } from 'react';

export default function JogoMemoria({ conteudo, tema, onFim }) {
  const [cartas, setCartas] = useState([]);
  const [viradas, setViradas] = useState([]);
  const [acertadas, setAcertadas] = useState([]);
  const [tentativas, setTentativas] = useState(0);
  const [bloqueado, setBloqueado] = useState(false);

  useEffect(() => {
    if (conteudo?.pares) {
      const deck = [];
      conteudo.pares.forEach((par, i) => {
        deck.push({ id: `t${i}`, texto: par.termo, par: i, tipo: 'termo' });
        deck.push({ id: `d${i}`, texto: par.definicao, par: i, tipo: 'def' });
      });
      setCartas(deck.sort(() => Math.random() - 0.5));
    }
  }, [conteudo]);

  useEffect(() => {
    if (acertadas.length > 0 && acertadas.length === cartas.length / 2) {
      setTimeout(() => onFim(acertadas.length, acertadas.length), 800);
    }
  }, [acertadas]);

  function virar(carta) {
    if (bloqueado || viradas.find(v => v.id === carta.id) || acertadas.includes(carta.par)) return;
    const novas = [...viradas, carta];
    setViradas(novas);
    if (novas.length === 2) {
      setTentativas(t => t + 1);
      setBloqueado(true);
      if (novas[0].par === novas[1].par) {
        setAcertadas(a => [...a, carta.par]);
        setViradas([]);
        setBloqueado(false);
      } else {
        setTimeout(() => { setViradas([]); setBloqueado(false); }, 1000);
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">🧩 Jogo da Memória • {tema}</span>
        <div className="flex gap-3 text-sm">
          <span className="text-violet-600 font-bold">{acertadas.length}/{cartas.length/2} pares</span>
          <span className="text-gray-500">{tentativas} tent.</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {cartas.map(carta => {
          const virada = viradas.find(v => v.id === carta.id);
          const acertada = acertadas.includes(carta.par);
          return (
            <button
              key={carta.id} onClick={() => virar(carta)}
              className={`h-16 rounded-xl text-xs font-medium transition-all duration-300 p-1 ${
                acertada ? 'bg-green-100 border-2 border-green-400 text-green-800' :
                virada ? 'bg-violet-100 border-2 border-violet-400 text-violet-800' :
                'bg-violet-600 border-2 border-violet-700 text-transparent hover:bg-violet-500'
              }`}
            >
              {(virada || acertada) ? carta.texto : '?'}
            </button>
          );
        })}
      </div>

      {acertadas.length === cartas.length / 2 && cartas.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
          <p className="text-2xl mb-1">🎉</p>
          <p className="font-bold text-green-800">Parabéns! Todos os pares encontrados!</p>
          <p className="text-sm text-green-600">{tentativas} tentativas</p>
        </div>
      )}
    </div>
  );
}