import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth, calcularMembro } from '../context/AuthContext';

export default function Layout({ children }) {
  const { usuario } = useAuth();
  const xpTotal = usuario?.xpTotal || usuario?.xp || 0;
  const { membro } = calcularMembro(xpTotal);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-violet-600 rounded-xl flex items-center justify-center">
            <span className="text-base">🧠</span>
          </div>
          <span className="font-bold text-gray-900 text-lg tracking-tight">
            Aletr<span className="text-violet-600">AI</span>
          </span>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${membro.bg} border-current ${membro.cor}`}>
          <span>{membro.emoji}</span>
          <span>{membro.nome}</span>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 overflow-auto pb-20">
        {children}
      </main>

      {/* Bottom nav — 3 abas: Jogos | Conquistas | Perfil */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex z-10">
        <NavLink to="/jogos"
          className={({ isActive }) => `flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-all ${isActive ? 'text-violet-600' : 'text-gray-400'}`}>
          {({ isActive }) => (
            <>
              <span className={`text-2xl transition-transform ${isActive ? 'scale-110' : ''}`}>🎮</span>
              <span className={`text-xs font-medium ${isActive ? 'text-violet-600' : 'text-gray-400'}`}>Jogos</span>
              {isActive && <div className="w-1 h-1 rounded-full bg-violet-600" />}
            </>
          )}
        </NavLink>

        <NavLink to="/conquistas"
          className={({ isActive }) => `flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-all ${isActive ? 'text-violet-600' : 'text-gray-400'}`}>
          {({ isActive }) => (
            <>
              <span className={`text-2xl transition-transform ${isActive ? 'scale-110' : ''}`}>🏆</span>
              <span className={`text-xs font-medium ${isActive ? 'text-violet-600' : 'text-gray-400'}`}>Conquistas</span>
              {isActive && <div className="w-1 h-1 rounded-full bg-violet-600" />}
            </>
          )}
        </NavLink>

        <NavLink to="/perfil"
          className={({ isActive }) => `flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-all ${isActive ? 'text-violet-600' : 'text-gray-400'}`}>
          {({ isActive }) => (
            <>
              <span className={`text-2xl transition-transform ${isActive ? 'scale-110' : ''}`}>👤</span>
              <span className={`text-xs font-medium ${isActive ? 'text-violet-600' : 'text-gray-400'}`}>Perfil</span>
              {isActive && <div className="w-1 h-1 rounded-full bg-violet-600" />}
            </>
          )}
        </NavLink>
      </nav>
    </div>
  );
}
