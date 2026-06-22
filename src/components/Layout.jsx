import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth, calcularMembro } from '../context/AuthContext';
import { getWallpaper, WALLPAPER_EVENT } from '../wallpapers';
import { getAvatarSrc } from '../avatares';
import LogoMarca from './LogoMarca';

const NAV = [
  { to: '/jogos',      icon: '🎮', label: 'Jogos' },
  { to: '/conquistas', icon: '🏆', label: 'Conquistas' },
  { to: '/perfil',     icon: '👤', label: 'Perfil' },
];

export default function Layout({ children }) {
  const { usuario } = useAuth();
  const xpTotal = usuario?.xpTotal || usuario?.xp || 0;
  const { membro } = calcularMembro(xpTotal);

  const [wallpaper, setWp] = useState(getWallpaper);
  useEffect(() => {
    const onChange = () => setWp(getWallpaper());
    window.addEventListener(WALLPAPER_EVENT, onChange);
    return () => window.removeEventListener(WALLPAPER_EVENT, onChange);
  }, []);

  return (
    <div className={`min-h-screen flex ${wallpaper.escuro ? 'wallpaper-escuro' : ''}`}
      style={{ background: wallpaper.css, backgroundAttachment: 'fixed' }}>

      {/* ── Sidebar desktop (lg+) ── */}
      <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-white border-r border-gray-100 fixed top-0 left-0 z-20">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-gray-100">
          <LogoMarca size={26} variant="dark" />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                  isActive
                    ? 'bg-violet-600 text-white'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`
              }>
              <span className="text-lg">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Sobre o AletrAI */}
        <div className="px-3 pb-2">
          <a href="/landing.html"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-400 hover:bg-violet-50 hover:text-violet-600 transition-all group">
            <span className="text-lg">✦</span>
            <span>Sobre o AletrAI</span>
            <span className="ml-auto text-xs opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </a>
        </div>

        {/* Usuário */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
            <div className="w-9 h-9 rounded-full bg-violet-100 overflow-hidden flex items-center justify-center text-base">
              {getAvatarSrc(usuario?.avatar)
                ? <img src={getAvatarSrc(usuario.avatar)} alt="avatar" className="w-full h-full object-cover" />
                : <span>{usuario?.avatar || '🎓'}</span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{usuario?.nome?.split(' ')[0]}</p>
              <p className="text-xs text-gray-400">{membro.emoji} {membro.nome}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Conteúdo principal ── */}
      <div className="flex-1 flex flex-col lg:ml-60">

        {/* Header mobile (< lg) */}
        <header className="lg:hidden flex items-center justify-between px-5 py-3 bg-white border-b border-gray-100 sticky top-0 z-10">
          <LogoMarca size={22} variant="dark" />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 text-violet-700 text-xs font-bold">
            <span>{membro.emoji}</span>
            <span>{membro.nome}</span>
          </div>
        </header>

        {/* Página */}
        <main className="flex-1 pb-24 lg:pb-0">
          {children}
        </main>
      </div>

      {/* ── Bottom nav mobile (< lg) ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex z-20">
        {NAV.map(({ to, icon, label }) => (
          <NavLink key={to} to={to}
            className={() => 'flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5'}>
            {({ isActive }) => (
              <>
                <span className={`text-2xl transition-transform ${isActive ? 'scale-110' : 'opacity-40'}`}>{icon}</span>
                <span className={`text-xs font-bold ${isActive ? 'text-violet-600' : 'text-gray-400'}`}>{label}</span>
                {isActive && <div className="w-4 h-0.5 rounded-full bg-violet-600 mt-0.5" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
