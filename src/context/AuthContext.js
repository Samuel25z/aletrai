import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// ─── Membros ────────────────────────────────────────────────────────────────
export const MEMBROS = [
  { id: 'iniciante',  nome: 'Iniciante',  emoji: '🌱', xpMin: 0,     cor: 'text-gray-500',    bg: 'bg-gray-100'   },
  { id: 'explorador', nome: 'Explorador', emoji: '🔭', xpMin: 500,   cor: 'text-blue-600',    bg: 'bg-blue-50'    },
  { id: 'estudioso',  nome: 'Estudioso',  emoji: '📚', xpMin: 2000,  cor: 'text-violet-600',  bg: 'bg-violet-50'  },
  { id: 'elite',      nome: 'Elite',      emoji: '⚡', xpMin: 5000,  cor: 'text-amber-600',   bg: 'bg-amber-50'   },
  { id: 'lendario',   nome: 'Lendário',   emoji: '👑', xpMin: 15000, cor: 'text-rose-600',    bg: 'bg-rose-50'    },
];

export function calcularMembro(xpTotal) {
  let membro = MEMBROS[0];
  for (const m of MEMBROS) {
    if (xpTotal >= m.xpMin) membro = m;
  }
  const idx = MEMBROS.indexOf(membro);
  const proximo = MEMBROS[idx + 1] || null;
  const progresso = proximo
    ? Math.round(((xpTotal - membro.xpMin) / (proximo.xpMin - membro.xpMin)) * 100)
    : 100;
  return { membro, proximo, progresso };
}

// ─── Níveis por matéria ──────────────────────────────────────────────────────
const XP_POR_NIVEL = 200; // XP para subir 1 nível numa matéria

export function calcularNivelMateria(xp = 0) {
  const nivel = Math.floor(xp / XP_POR_NIVEL) + 1;
  const xpNoNivel = xp % XP_POR_NIVEL;
  const progresso = Math.round((xpNoNivel / XP_POR_NIVEL) * 100);
  return { nivel, xpNoNivel, xpParaProximo: XP_POR_NIVEL, progresso };
}

// Boss aparece a cada 3 níveis (3, 6, 9, 12...)
export function temBossDisponivel(xp = 0, bossesVencidos = []) {
  const { nivel } = calcularNivelMateria(xp);
  const bossLevel = Math.floor(nivel / 3) * 3;
  if (bossLevel < 3) return false;
  return !bossesVencidos.includes(bossLevel);
}

// ─── Hash de senha (SHA-256 via Web Crypto) ──────────────────────────────────
async function hashSenha(senha) {
  const encoder = new TextEncoder();
  const data = encoder.encode(senha);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const salvo = localStorage.getItem('aletrai_usuario');
    return salvo ? JSON.parse(salvo) : null;
  });

  useEffect(() => {
    if (usuario) {
      const { senhaHash: _, senha: __, ...seguro } = usuario;
      localStorage.setItem('aletrai_usuario', JSON.stringify(seguro));
    } else localStorage.removeItem('aletrai_usuario');
  }, [usuario]);

  async function cadastrar(nome, email, senha) {
    const usuarios = JSON.parse(localStorage.getItem('aletrai_usuarios') || '[]');
    if (usuarios.find(u => u.email === email)) return { erro: 'E-mail já cadastrado.' };
    const senhaHash = await hashSenha(senha);
    const novo = {
      id: Date.now(), nome, email, senhaHash, avatar: '🎓',
      nivel: 1, xp: 0, xpTotal: 0, xpProximo: 300,
      sequencia: 0, desafiosConcluidos: 0, medalhas: [],
      xpPorMateria: {},
      bossesVencidos: {},
      primeiroAcesso: true,
      criadoEm: new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
    };
    usuarios.push(novo);
    localStorage.setItem('aletrai_usuarios', JSON.stringify(usuarios));
    const { senhaHash: _, ...sessao } = novo;
    setUsuario(sessao);
    return { sucesso: true };
  }

  async function login(email, senha) {
    const chave = `aletrai_tentativas_${email}`;
    const tentativas = JSON.parse(localStorage.getItem(chave) || '{"count":0,"ts":0}');
    if (tentativas.count >= 5 && Date.now() - tentativas.ts < 15 * 60 * 1000) {
      return { erro: 'Muitas tentativas. Aguarde 15 minutos.' };
    }
    const usuarios = JSON.parse(localStorage.getItem('aletrai_usuarios') || '[]');
    const senhaHash = await hashSenha(senha);
    const found = usuarios.find(u => u.email === email && (u.senhaHash === senhaHash || u.senha === senha));
    if (!found) {
      localStorage.setItem(chave, JSON.stringify({ count: (tentativas.count || 0) + 1, ts: Date.now() }));
      return { erro: 'E-mail ou senha incorretos.' };
    }
    localStorage.removeItem(chave);
    // Migra usuários antigos (senha em texto puro → hash)
    if (found.senha && !found.senhaHash) {
      found.senhaHash = senhaHash;
      delete found.senha;
      const idx = usuarios.findIndex(u => u.id === found.id);
      if (idx !== -1) { usuarios[idx] = found; localStorage.setItem('aletrai_usuarios', JSON.stringify(usuarios)); }
    }
    if (!found.xpPorMateria) found.xpPorMateria = {};
    if (!found.bossesVencidos) found.bossesVencidos = {};
    if (!found.xpTotal) found.xpTotal = found.xp || 0;
    const { senha: _removida, ...usuarioSeguro } = found;
    setUsuario(usuarioSeguro);
    return { sucesso: true };
  }

  function logout() { setUsuario(null); }

  function atualizarUsuario(dados) {
    const atualizado = { ...usuario, ...dados };
    setUsuario(atualizado);
    const usuarios = JSON.parse(localStorage.getItem('aletrai_usuarios') || '[]');
    const idx = usuarios.findIndex(u => u.id === usuario.id);
    if (idx !== -1) {
      usuarios[idx] = atualizado;
      localStorage.setItem('aletrai_usuarios', JSON.stringify(usuarios));
    }
  }

  // XP global (para nível de conta)
  function ganharXP(qtd) {
    let xpAtual = (usuario.xp || 0) + qtd;
    let xpTotal = (usuario.xpTotal || 0) + qtd;
    let nivel = usuario.nivel;
    let xpProximo = usuario.xpProximo;
    while (xpAtual >= xpProximo) {
      xpAtual -= xpProximo;
      nivel++;
      xpProximo = Math.floor(xpProximo * 1.4);
    }
    atualizarUsuario({
      xp: xpAtual, xpTotal, nivel, xpProximo,
      desafiosConcluidos: (usuario.desafiosConcluidos || 0) + 1,
    });
  }

  // XP por matéria específica
  function ganharXPMateria(qtd, materiaId) {
    if (!materiaId) return ganharXP(qtd);
    const xpPorMateria = { ...(usuario.xpPorMateria || {}) };
    xpPorMateria[materiaId] = (xpPorMateria[materiaId] || 0) + qtd;

    let xpAtual = (usuario.xp || 0) + qtd;
    let xpTotal = (usuario.xpTotal || 0) + qtd;
    let nivel = usuario.nivel;
    let xpProximo = usuario.xpProximo;
    while (xpAtual >= xpProximo) {
      xpAtual -= xpProximo;
      nivel++;
      xpProximo = Math.floor(xpProximo * 1.4);
    }
    atualizarUsuario({
      xp: xpAtual, xpTotal, nivel, xpProximo,
      xpPorMateria,
      desafiosConcluidos: (usuario.desafiosConcluidos || 0) + 1,
    });
  }

  // Registrar boss vencido
  function vencerBoss(materiaId, bossLevel) {
    const bossesVencidos = { ...(usuario.bossesVencidos || {}) };
    if (!bossesVencidos[materiaId]) bossesVencidos[materiaId] = [];
    bossesVencidos[materiaId] = [...bossesVencidos[materiaId], bossLevel];
    atualizarUsuario({ bossesVencidos });
  }

  return (
    <AuthContext.Provider value={{
      usuario,
      cadastrar, login, logout,
      atualizarUsuario,
      ganharXP, ganharXPMateria, vencerBoss,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
