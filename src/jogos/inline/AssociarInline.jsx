import React, { useState } from 'react';

/**
 * AssociarInline — Associe termos com definições
 * Props: pares (array de {termo, definicao}), onAcerto, onErro
 */
export default function AssociarInline({ pares, onAcerto, onErro }) {
  const [defEmbaralhadas] = useState(() => [...pares].sort(() => Math.random() - 0.5).map(p => p.definicao));
  const [associacoes, setAssociacoes] = useState({}); // { termoIdx: defIdx }
  const [defSelecionada, setDefSelecionada] = useState(null);
  const [termoSelecionado, setTermoSelecionado] = useState(null);
  const [verificado, setVerificado] = useState(false);
  const [resultado, setResultado] = useState({});

  function selecionarTermo(idx) {
    if (verificado) return;
    if (termoSelecionado === idx) { setTermoSelecionado(null); return; }
    setTermoSelecionado(idx);
    if (defSelecionada !== null) {
      conectar(idx, defSelecionada);
    }
  }

  function selecionarDef(idx) {
    if (verificado) return;
    if (defSelecionada === idx) { setDefSelecionada(null); return; }
    setDefSelecionada(idx);
    if (termoSelecionado !== null) {
      conectar(termoSelecionado, idx);
    }
  }

  function conectar(termoIdx, defIdx) {
    setAssociacoes(prev => ({ ...prev, [termoIdx]: defIdx }));
    setTermoSelecionado(null);
    setDefSelecionada(null);
  }

  function verificar() {
    const res = {};
    let acertos = 0;
    pares.forEach((par, i) => {
      const defIdx = associacoes[i];
      const correto = defIdx !== undefined && defEmbaralhadas[defIdx] === par.definicao;
      res[i] = correto;
      if (correto) acertos++;
    });
    setResultado(res);
    setVerificado(true);
    if (acertos === pares.length) onAcerto?.();
    else onErro?.();
  }

  const todosAssociados = Object.keys(associacoes).length === pares.length;

  return (
    <div className="mt-3 bg-purple-50 border border-purple-200 rounded-2xl p-4">
      <p className="text-xs font-bold text-purple-500 uppercase tracking-wide mb-3">🔗 Associe os pares</p>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* Termos */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 text-center">Termos</p>
          {pares.map((par, i) => {
            const associado = associacoes[i] !== undefined;
            let cls = 'border-purple-200 bg-white text-gray-700 cursor-pointer hover:border-purple-400';
            if (termoSelecionado === i) cls = 'border-purple-500 bg-purple-100 text-purple-800 font-semibold';
            else if (associado) cls = 'border-purple-300 bg-purple-50 text-purple-700';
            if (verificado) {
              cls = resultado[i] ? 'border-green-400 bg-green-50 text-green-800' : 'border-red-400 bg-red-50 text-red-700';
            }
            return (
              <div key={i} onClick={() => selecionarTermo(i)}
                className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all text-center ${cls}`}>
                {par.termo}
                {associado && !verificado && <span className="block text-purple-400 text-xs">✓</span>}
              </div>
            );
          })}
        </div>
        {/* Definições */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 text-center">Definições</p>
          {defEmbaralhadas.map((def, i) => {
            const usada = Object.values(associacoes).includes(i);
            let cls = 'border-gray-200 bg-white text-gray-600 cursor-pointer hover:border-purple-300';
            if (defSelecionada === i) cls = 'border-purple-500 bg-purple-100 text-purple-800 font-semibold';
            else if (usada) cls = 'border-gray-300 bg-gray-50 text-gray-500';
            return (
              <div key={i} onClick={() => !usada && selecionarDef(i)}
                className={`px-3 py-2 rounded-xl border text-xs transition-all ${cls}`}>
                {def}
              </div>
            );
          })}
        </div>
      </div>
      {!verificado ? (
        <button onClick={verificar} disabled={!todosAssociados}
          className="w-full py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors">
          Verificar
        </button>
      ) : (
        <p className={`text-xs font-semibold text-center ${Object.values(resultado).every(Boolean) ? 'text-green-600' : 'text-red-500'}`}>
          {Object.values(resultado).every(Boolean)
            ? '🎉 Todos corretos! +15 XP'
            : `${Object.values(resultado).filter(Boolean).length}/${pares.length} corretos!`}
        </p>
      )}
    </div>
  );
}
