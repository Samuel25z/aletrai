import React from 'react';
import { useAuth } from '../context/AuthContext';

const todasMedalhas = [
  { id: 1, ic: '⭐', titulo: 'Primeira missão', desc: 'Conclua seu 1º desafio', req: 1, campo: 'desafiosConcluidos' },
  { id: 2, ic: '🔥', titulo: '7 dias seguidos', desc: 'Sequência de 7 dias', req: 7, campo: 'sequencia' },
  { id: 3, ic: '🏆', titulo: 'Top acertos', desc: '80%+ numa rodada', req: 1, campo: 'medalhas' },
  { id: 4, ic: '⚡', titulo: 'Missão rápida', desc: 'Complete em menos de 1 min', req: 1, campo: 'medalhas' },
  { id: 5, ic: '👑', titulo: 'Nível 10', desc: 'Alcance o nível 10', req: 10, campo: 'nivel' },
  { id: 6, ic: '📚', titulo: '10 tópicos', desc: 'Estude 10 temas diferentes', req: 10, campo: 'medalhas' },
  { id: 7, ic: '📅', titulo: '30 dias', desc: 'Sequência de 30 dias', req: 30, campo: 'sequencia' },
  { id: 8, ic: '🎖️', titulo: '100 desafios', desc: 'Conclua 100 desafios', req: 100, campo: 'desafiosConcluidos' },
];

const topicos = [
  { nome: 'Matemática', cor: '#7F77DD', pct: 80 },
  { nome: 'Português', cor: '#1D9E75', pct: 90 },
  { nome: 'Biologia', cor: '#378ADD', pct: 65 },
  { nome: 'História', cor: '#D85A30', pct: 45 },
  { nome: 'Química', cor: '#BA7517', pct: 30 },
];

export default function Evolucao() {
  const { usuario } = useAuth();

  function desbloqueada(m) {
    if (m.campo === 'desafiosConcluidos') return usuario.desafiosConcluidos >= m.req;
    if (m.campo === 'nivel') return usuario.nivel >= m.req;
    if (m.campo === 'sequencia') return usuario.sequencia >= m.req;
    return false;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-5">
      <h2 className="text-xl font-bold text-gray-900">📈 Minha Evolução</h2>

      <div className="bg-gradient-to-br from-violet-700 to-purple-500 rounded-3xl p-5 grid grid-cols-3 gap-3">
        {[
          { v: '3h 20m', l: 'Tempo estudado' },
          { v: `${usuario.desafiosConcluidos}`, l: 'Desafios' },
          { v: '84%', l: 'Taxa de acerto' },
        ].map((s, i) => (
          <div key={i} className="text-center">
            <p className="text-white font-bold text-xl">{s.v}</p>
            <p className="text-violet-200 text-xs mt-0.5">{s.l}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-bold text-gray-900 mb-3">Progresso por tópico</h3>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-4">
          {topicos.map((t, i) => (
            <div key={i}>
              <div className="flex justify-between mb-1.5">
                <span className="text-sm font-medium text-gray-800">{t.nome}</span>
                <span className="text-sm text-gray-500">{t.pct}%</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${t.pct}%`, backgroundColor: t.cor }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-gray-900 mb-3">Medalhas</h3>
        <div className="grid grid-cols-2 gap-3">
          {todasMedalhas.map(m => {
            const on = desbloqueada(m);
            return (
              <div key={m.id} className={`rounded-2xl p-4 border flex items-center gap-3 transition-all ${on ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
                <span className="text-3xl">{m.ic}</span>
                <div>
                  <p className={`text-sm font-semibold ${on ? 'text-amber-900' : 'text-gray-600'}`}>{m.titulo}</p>
                  <p className="text-xs text-gray-500">{m.desc}</p>
                  {!on && <p className="text-xs text-violet-500 mt-0.5">🔒 Bloqueada</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}