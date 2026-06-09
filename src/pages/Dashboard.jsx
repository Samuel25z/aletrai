import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, calcularMembro, calcularNivelMateria, temBossDisponivel, MEMBROS } from '../context/AuthContext';
import { MATERIAS } from '../context/ChatContext';

export default function Dashboard() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const xpTotal = usuario.xpTotal || usuario.xp || 0;
  const { membro, proximo, progresso } = calcularMembro(xpTotal);
  const xpPorMateria = usuario.xpPorMateria || {};
  const bossesVencidos = usuario.bossesVencidos || {};

  const materiasAtivas = MATERIAS.filter(m => (xpPorMateria[m.id] || 0) > 0)
    .sort((a, b) => (xpPorMateria[b.id] || 0) - (xpPorMateria[a.id] || 0));

  const bossesDisponiveis = MATERIAS.filter(m => {
    const xp = xpPorMateria[m.id] || 0;
    return temBossDisponivel(xp, bossesVencidos[m.id] || []);
  });

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div className="max-w-2xl mx-auto px-5 pt-6 pb-8 space-y-5">

      {/* Saudação */}
      <div>
        <p className="text-gray-400 text-sm">{saudacao} 👋</p>
        <h1 className="text-2xl font-black text-gray-900 mt-0.5">{usuario.nome?.split(' ')[0]}</h1>
      </div>

      {/* Card de nível — roxo sólido */}
      <div className="bg-violet-600 rounded-3xl p-6 text-white">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-violet-200 text-xs font-semibold uppercase tracking-wider">Seu nível</p>
            <p className="text-3xl font-black mt-1">{membro.emoji} {membro.nome}</p>
            <p className="text-violet-200 text-sm mt-0.5">{xpTotal.toLocaleString('pt-BR')} XP</p>
          </div>
          {proximo && (
            <div className="text-right bg-violet-700/50 rounded-2xl px-4 py-3">
              <p className="text-violet-200 text-xs">Próximo</p>
              <p className="font-black">{proximo.emoji} {proximo.nome}</p>
              <p className="text-violet-200 text-xs">{(proximo.xpMin - xpTotal).toLocaleString('pt-BR')} XP</p>
            </div>
          )}
        </div>
        <div className="h-2.5 bg-violet-800 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${progresso}%` }} />
        </div>
      </div>

      {/* Boss disponível */}
      {bossesDisponiveis.length > 0 && (
        <button onClick={() => navigate('/boss', { state: { materiaId: bossesDisponiveis[0].id } })}
          className="w-full bg-red-500 rounded-3xl p-5 text-left active:scale-[0.98] transition-transform text-white">
          <div className="flex items-center gap-4">
            <span className="text-4xl">👾</span>
            <div className="flex-1">
              <p className="text-red-100 text-xs font-bold uppercase tracking-wider">Boss disponível</p>
              <p className="text-xl font-black">{bossesDisponiveis[0].nome}</p>
              <p className="text-red-100 text-sm">Derrote o chefe para subir de nível</p>
            </div>
            <span className="text-2xl opacity-60">→</span>
          </div>
        </button>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { v: usuario.sequencia || 0,          l: 'Sequência', ic: '🔥' },
          { v: usuario.desafiosConcluidos || 0, l: 'Desafios',  ic: '⚡' },
          { v: materiasAtivas.length,           l: 'Matérias',  ic: '📚' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
            <p className="text-2xl mb-1">{s.ic}</p>
            <p className="text-2xl font-black text-gray-900 leading-none">{s.v}</p>
            <p className="text-gray-400 text-xs mt-1">{s.l}</p>
          </div>
        ))}
      </div>

      {/* Matérias */}
      {materiasAtivas.length > 0 ? (
        <div>
          <h2 className="font-black text-gray-900 mb-3">Suas matérias</h2>
          <div className="space-y-2">
            {materiasAtivas.map(materia => {
              const xp = xpPorMateria[materia.id] || 0;
              const { nivel, progresso: prog, xpNoNivel, xpParaProximo } = calcularNivelMateria(xp);
              const temBoss = temBossDisponivel(xp, bossesVencidos[materia.id] || []);
              return (
                <div key={materia.id} onClick={() => navigate('/chat')}
                  className="bg-white rounded-2xl p-4 cursor-pointer border border-gray-100 shadow-sm hover:border-violet-200 active:scale-[0.98] transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{materia.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-gray-900 font-semibold text-sm">{materia.nome}</p>
                        <div className="flex items-center gap-2">
                          {temBoss && (
                            <button onClick={e => { e.stopPropagation(); navigate('/boss', { state: { materiaId: materia.id } }); }}
                              className="text-xs font-black px-2 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-100">
                              👾 Boss
                            </button>
                          )}
                          <span className="text-xs font-black text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                            Nv. {nivel}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-violet-500 rounded-full" style={{ width: `${prog}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">{xpNoNivel}/{xpParaProximo}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <button onClick={() => navigate('/chat')}
          className="w-full bg-white rounded-3xl p-8 text-center border-2 border-dashed border-gray-200 hover:border-violet-300 active:scale-[0.98] transition-all">
          <p className="text-4xl mb-3">✨</p>
          <p className="text-gray-900 font-black">Comece pelo Chat IA</p>
          <p className="text-gray-400 text-sm mt-1">Suas matérias aparecerão aqui</p>
          <p className="text-violet-600 font-black mt-4 text-sm">Abrir chat →</p>
        </button>
      )}

      {/* CTA */}
      <button onClick={() => navigate('/chat')}
        className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white font-black rounded-2xl text-base transition-colors shadow-lg shadow-violet-200">
        Continuar estudando →
      </button>
    </div>
  );
}
