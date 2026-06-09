import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    await new Promise(r => setTimeout(r, 600));
    const resultado = await login(email, senha);
    setCarregando(false);
    if (resultado.erro) setErro(resultado.erro);
    else navigate('/dashboard');
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0f0f13' }}>
      {/* Lado esquerdo */}
      <div className="hidden lg:flex w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a0533 0%, #2d1060 50%, #1a0533 100%)' }}>

        {/* Grade decorativa */}
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Brilho central */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />

        <div className="relative z-10 text-center max-w-sm">
          {/* Logo */}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 0 40px rgba(124,58,237,0.5)' }}>
            <span className="text-3xl">🧠</span>
          </div>

          <h1 className="text-5xl font-black text-white mb-2 tracking-tight">
            Aletr<span style={{ color: '#a855f7' }}>AI</span>
          </h1>
          <p className="text-purple-300 mb-10 text-base">Aprenda jogando. Evolua de verdade.</p>

          {/* Cards de features */}
          <div className="space-y-3 text-left">
            {[
              { icon: '⚡', title: 'IA em tempo real', desc: 'Perguntas geradas pelo Claude' },
              { icon: '🎮', title: 'Aprenda jogando', desc: 'Roguelike, Quiz, Boss battles' },
              { icon: '🏆', title: 'Conquistas & XP', desc: 'Suba de nível enquanto estuda' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl px-4 py-3"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(139,92,246,0.2)' }}>
                <span className="text-xl w-8 text-center">{f.icon}</span>
                <div>
                  <p className="text-white text-sm font-semibold">{f.title}</p>
                  <p className="text-purple-300/70 text-xs">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lado direito — formulário */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">

          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
              <span className="text-xl">🧠</span>
            </div>
            <span className="text-2xl font-black text-white">Aletr<span style={{ color: '#a855f7' }}>AI</span></span>
          </div>

          <h2 className="text-3xl font-black text-white mb-1">Bem-vindo de volta!</h2>
          <p className="mb-8" style={{ color: '#6b7280' }}>Entre na sua conta para continuar estudando</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#9ca3af' }}>E-mail</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="seu@email.com"
                className="w-full px-4 py-3 rounded-xl outline-none transition-all text-white placeholder-gray-600"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.08)' }}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#9ca3af' }}>Senha</label>
              <input
                type="password" value={senha} onChange={e => setSenha(e.target.value)} required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl outline-none transition-all text-white placeholder-gray-600"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.08)' }}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>

            {erro && (
              <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                {erro}
              </div>
            )}

            <button
              type="submit" disabled={carregando}
              className="w-full py-3.5 font-bold rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-white"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 4px 24px rgba(124,58,237,0.4)' }}
            >
              {carregando ? <><span className="animate-spin">⏳</span> Entrando...</> : 'Entrar →'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm" style={{ color: '#6b7280' }}>
            Não tem conta?{' '}
            <Link to="/cadastro" className="font-semibold hover:underline" style={{ color: '#a855f7' }}>
              Cadastre-se grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
