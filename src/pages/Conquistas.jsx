import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, calcularMembro, calcularNivelMateria, MEMBROS } from '../context/AuthContext';
import { MATERIAS } from '../context/ChatContext';

export default function Conquistas() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const xpTotal = usuario.xpTotal || usuario.xp || 0;
  const { membro, proximo, progresso } = calcularMembro(xpTotal);
  const xpPorMateria  = usuario.xpPorMateria  || {};

  const materiasAtivas = MATERIAS
    .filter(m => (xpPorMateria[m.id] || 0) > 0)
    .sort((a, b) => (xpPorMateria[b.id] || 0) - (xpPorMateria[a.id] || 0));

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Conquistas</h1>

      {/* Card de membro */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Seu nível de membro</p>
            <div className="flex items-center gap-2">
              <span className="text-3xl">{membro.emoji}</span>
              <div>
                <p className={`text-xl font-bold ${membro.cor}`}>{membro.nome}</p>
                <p className="text-xs text-gray-400">{xpTotal.toLocaleString('pt-BR')} XP total</p>
              </div>
            </div>
          </div>
          {proximo && (
            <div className="text-right">
              <p className="text-xs text-gray-400">Próximo</p>
              <p className="text-sm font-semibold text-gray-600">{proximo.emoji} {proximo.nome}</p>
              <p className="text-xs text-gray-400">{(proximo.xpMin - xpTotal).toLocaleString('pt-BR')} XP</p>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-gray-400">
            <span>{membro.nome}</span>
            {proximo && <span>{proximo.nome}</span>}
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-violet-500 rounded-full transition-all duration-700"
              style={{ width: `${progresso}%` }} />
          </div>
          <div className="flex justify-between mt-1">
            {MEMBROS.map(m => (
              <div key={m.id} className="flex flex-col items-center gap-0.5">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${xpTotal >= m.xpMin ? 'bg-violet-500' : 'bg-gray-200'}`}>
                  {xpTotal >= m.xpMin && <span className="text-white text-xs">✓</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Atalho para os jogos */}
      <div onClick={() => navigate('/jogos')}
        className="bg-gradient-to-r from-purple-600 to-blue-700 rounded-2xl p-4 cursor-pointer hover:scale-[1.02] transition-transform active:scale-[0.98] flex items-center gap-4">
        <div className="text-3xl">🎮</div>
        <div className="text-white flex-1">
          <p className="font-black text-base">Jogar para ganhar XP</p>
          <p className="text-sm text-white/70">Chão é Lava • Dungeon Quiz</p>
        </div>
        <span className="text-white/60 text-xl">›</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { v: usuario.sequencia || 0,          l: 'Dias seguidos', ic: '🔥' },
          { v: usuario.desafiosConcluidos || 0,  l: 'Desafios',      ic: '⚡' },
          { v: materiasAtivas.length,            l: 'Matérias',      ic: '📚' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 text-center border border-gray-100">
            <span className="text-2xl block mb-1">{s.ic}</span>
            <p className="text-2xl font-bold text-gray-900">{s.v}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.l}</p>
          </div>
        ))}
      </div>

      {/* Matérias */}
      {materiasAtivas.length > 0 ? (
        <div>
          <h2 className="font-bold text-gray-900 mb-3">Suas matérias</h2>
          <div className="space-y-2">
            {materiasAtivas.map(materia => {
              const xp = xpPorMateria[materia.id] || 0;
              const { nivel, progresso: prog, xpNoNivel, xpParaProximo } = calcularNivelMateria(xp);
              return (
                <div key={materia.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4 cursor-pointer hover:border-violet-200 transition-colors"
                  onClick={() => navigate('/jogos')}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{materia.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900 text-sm">{materia.nome}</p>
                        <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                          Nv. {nivel}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-violet-400 rounded-full transition-all duration-700"
                            style={{ width: `${prog}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">{xpNoNivel}/{xpParaProximo} XP</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div onClick={() => navigate('/jogos')}
          className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center cursor-pointer hover:border-violet-300 transition-colors">
          <div className="text-4xl mb-3">🏆</div>
          <p className="font-semibold text-gray-700">Nenhuma conquista ainda</p>
          <p className="text-sm text-gray-400 mt-1">Jogue e acumule XP para ver seu progresso aqui</p>
          <div className="mt-4 inline-flex items-center gap-1.5 text-sm text-violet-600 font-semibold">
            Ir para os jogos →
          </div>
        </div>
      )}
    </div>
  );
}
