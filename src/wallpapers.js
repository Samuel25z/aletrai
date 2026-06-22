// Wallpapers do AletrAI — fundos do app.
// Alguns são livres; outros desbloqueiam ao atingir um rank (XP total).
// Os fundos são 100% CSS (sem imagens externas) para carregar instantâneo.

export const WALLPAPERS = [
  // ── Livres ──
  {
    id: 'padrao',
    nome: 'Clássico',
    rankXp: 0,
    escuro: false,
    css: '#f6f7fb',
  },
  {
    id: 'lavanda',
    nome: 'Lavanda',
    rankXp: 0,
    escuro: false,
    css: 'linear-gradient(160deg, #f5f3ff 0%, #ede9fe 55%, #faf5ff 100%)',
  },
  {
    id: 'menta',
    nome: 'Menta',
    rankXp: 0,
    escuro: false,
    css: 'linear-gradient(160deg, #f0fdf4 0%, #dcfce7 55%, #ecfdf5 100%)',
  },
  // ── Desbloqueáveis por rank ──
  {
    id: 'por-do-sol',
    nome: 'Pôr do Sol',
    rankXp: 500, // Explorador
    rankNome: 'Explorador',
    escuro: false,
    css: 'linear-gradient(165deg, #fff7ed 0%, #fed7aa 45%, #fecaca 100%)',
  },
  {
    id: 'oceano',
    nome: 'Oceano',
    rankXp: 2000, // Estudioso
    rankNome: 'Estudioso',
    escuro: false,
    css: 'radial-gradient(circle at 80% 0%, #bae6fd 0%, transparent 45%), linear-gradient(170deg, #eff6ff 0%, #bfdbfe 60%, #dbeafe 100%)',
  },
  {
    id: 'aurora',
    nome: 'Aurora',
    rankXp: 5000, // Elite
    rankNome: 'Elite',
    escuro: true,
    css: 'radial-gradient(circle at 20% 20%, rgba(56,189,248,0.45) 0%, transparent 40%), radial-gradient(circle at 80% 30%, rgba(168,85,247,0.45) 0%, transparent 45%), radial-gradient(circle at 50% 90%, rgba(34,197,94,0.35) 0%, transparent 50%), linear-gradient(160deg, #0f172a 0%, #1e1b4b 100%)',
  },
  {
    id: 'dourado',
    nome: 'Lendário',
    rankXp: 15000, // Lendário
    rankNome: 'Lendário',
    escuro: true,
    css: 'radial-gradient(circle at 25% 15%, rgba(251,191,36,0.35) 0%, transparent 40%), radial-gradient(circle at 85% 80%, rgba(245,158,11,0.3) 0%, transparent 45%), linear-gradient(155deg, #1c1917 0%, #292524 55%, #1c1410 100%)',
  },
];

const STORAGE_KEY = 'aletrai_wallpaper';
export const WALLPAPER_EVENT = 'aletrai-wallpaper-change';

export function getWallpaperId() {
  return localStorage.getItem(STORAGE_KEY) || 'padrao';
}

export function getWallpaper() {
  const id = getWallpaperId();
  return WALLPAPERS.find(w => w.id === id) || WALLPAPERS[0];
}

export function setWallpaper(id) {
  localStorage.setItem(STORAGE_KEY, id);
  window.dispatchEvent(new CustomEvent(WALLPAPER_EVENT, { detail: id }));
}

export function wallpaperDesbloqueado(wp, xpTotal = 0) {
  return xpTotal >= (wp.rankXp || 0);
}
