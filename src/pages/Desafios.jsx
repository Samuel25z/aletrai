import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { gerarConteudoJogo } from '../services/mock';
import JogoQuiz from '../jogos/JogoQuiz';
import JogoMemoria from '../jogos/JogoMemoria';
import JogoVerdadeiroFalso from '../jogos/JogoVerdadeiroFalso';
import JogoForca from '../jogos/JogoForca';

export default function Desafios() {
  const [modo, setModo] = useState('texto');
  const [tema, setTema] = useState('');
  const [tipoJogo, setTipoJogo] = useState('quiz');
  const [gerando, setGerando] = useState(false);
  const [conteudo, setConteudo] = useState(null);
  const [erro, setErro] = useState('');
  const [jogando, setJogando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const { ganharXP } = useAuth();

  async function gerarJogo() {
    if (!tema.trim()) return;
    setErro('');
    setGerando(true);
    const cont = await gerarConteudoJogo(tema, tipoJogo);
    setGerando(false);
    if (!cont) {
      setErro('Erro ao gerar jogo. Tente novamente!');
      return;
    }
    setConteudo(cont);
    setJogando(true);
    setResultado(null);
  }

  function handleFimJogo(acertos, total) {
    const xp = acertos * 20 + 30;
    ganharXP(xp);
    setResultado({ acertos, total, xp });
    setJogando(false);
  }

  function reiniciar() {
    setConteudo(null);
    setJogando(false);
    setResultado(null);
    setTema('');
  }

  // Tela de resultado
  if (resultado) {
    const nota = Math.round((resultado.acertos / resultado.total) * 100);
    return (
      <div className="max-w-2xl mx-auto p-4 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-xl w-full">
          <div className="text-7xl mb-4">{nota >= 80 ? '🏆' : nota >= 50 ? '👍' : '💪'}</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Desafio concluído!</h2>
          <p className="text-gray-500 mb-6">Tema: <span className="font-semibold text-violet-600">{tema}</span></p>
          <p className="text-sm text-gray-500 mb-4">Jogo: <span className="font-semibold">{['Quiz','Memória','Verdadeiro/Falso','Forca'][['quiz','memoria','verdadeirofalso','forca'].indexOf(tipoJogo)]}</span></p>
          <div className="flex justify-center gap-4 mb-6">
            <div className="bg-violet-50 rounded-2xl p-4 border border-violet-200">
              <p className="text-3xl font-bold text-violet-700">{resultado.acertos}/{resultado.total}</p>
              <p className="text-xs text-gray-500 mt-1">Acertos</p>
            </div>
            <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
              <p className="text-3xl font-bold text-green-700">+{resultado.xp}</p>
              <p className="text-xs text-gray-500 mt-1">XP</p>
            </div>
            <div className={`rounded-2xl p-4 border ${nota >= 80 ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
              <p className={`text-3xl font-bold ${nota >= 80 ? 'text-amber-600' : 'text-gray-600'}`}>{nota}%</p>
              <p className="text-xs text-gray-500 mt-1">Nota</p>
            </div>
          </div>
          <button onClick={reiniciar} className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-200">
            Novo desafio ⚡
          </button>
        </div>
      </div>
    );
  }

  // Tela do jogo rodando
  if (jogando && conteudo) {
    const JogoComponent = {
      quiz: JogoQuiz,
      memoria: JogoMemoria,
      verdadeirofalso: JogoVerdadeiroFalso,
      forca: JogoForca,
    }[tipoJogo];

    return (
      <div className="max-w-2xl mx-auto p-4">
        {JogoComponent && (
          <JogoComponent conteudo={conteudo} tema={tema} onFim={handleFimJogo} />
        )}
      </div>
    );
  }

  // Tela de seleção
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-900">⚡ Central de Desafios</h2>

      <div className="flex gap-2">
        {[['texto','✏️','Digitar'],['voz','🎤','Voz'],['colar','📋','Colar']].map(([m,ic,label]) => (
          <button key={m} onClick={() => setModo(m)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
              modo === m ? 'bg-violet-600 border-violet-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-violet-300'
            }`}>
            {ic} {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
        <textarea value={tema} onChange={e => setTema(e.target.value)}
          placeholder="Digite o tema que quer estudar... (Ex: Fotossíntese, Frações, Segunda Guerra)"
          rows={2} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 outline-none text-gray-900 resize-none text-sm" />

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Escolha o tipo de jogo:</label>
          <div className="grid grid-cols-2 gap-2">
            {[['quiz','🎯','Quiz'],['memoria','🧩','Memória'],['verdadeirofalso','✅','V ou F'],['forca','🔤','Forca']].map(([tipo,emoji,nome]) => (
              <button key={tipo} onClick={() => setTipoJogo(tipo)}
                className={`py-3 rounded-xl font-medium transition-all ${
                  tipoJogo === tipo ? 'bg-violet-600 text-white border-2 border-violet-600' : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:border-violet-300'
                }`}>
                {emoji} {nome}
              </button>
            ))}
          </div>
        </div>

        {erro && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{erro}</div>}

        <button onClick={gerarJogo} disabled={!tema.trim() || gerando}
          className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-200 flex items-center justify-center gap-2">
          {gerando ? <><span className="animate-spin">⏳</span> Gerando com IA...</> : '✨ Gerar desafio'}
        </button>
      </div>
    </div>
  );
}