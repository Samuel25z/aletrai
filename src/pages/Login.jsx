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
    <div className="min-h-screen bg-white flex">
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-violet-700 to-purple-500 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white"></div>
          <div className="absolute bottom-20 right-5 w-40 h-40 rounded-full bg-white"></div>
          <div className="absolute top-1/2 left-1/3 w-20 h-20 rounded-full bg-white"></div>
        </div>
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-6 mx-auto border-2 border-white/30">
            <span className="text-4xl">🧠</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">AletrAI</h1>
          <p className="text-violet-200 text-lg mb-8">Aprender nunca foi tão divertido</p>
          <div className="space-y-4 text-left">
            {['Mini-jogos gerados por IA em tempo real', 'Estudo personalizado ao seu ritmo', 'Missões, XP e conquistas diárias'].map((txt, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 rounded-2xl px-4 py-3 border border-white/20">
                <span className="text-white text-lg">{['⚡','🎯','🏆'][i]}</span>
                <span className="text-white text-sm">{txt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">🧠</span>
            </div>
            <span className="text-2xl font-bold text-violet-900">AletrAI</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-1">Bem-vindo de volta!</h2>
          <p className="text-gray-500 mb-8">Entre na sua conta para continuar estudando</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="seu@email.com"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 outline-none text-gray-900 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                type="password" value={senha} onChange={e => setSenha(e.target.value)} required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 outline-none text-gray-900 transition-colors"
              />
            </div>

            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {erro}
              </div>
            )}

            <button
              type="submit" disabled={carregando}
              className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-violet-200"
            >
              {carregando ? <><span className="animate-spin">⏳</span> Entrando...</> : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-6 text-sm">
            Não tem conta?{' '}
            <Link to="/cadastro" className="text-violet-600 font-semibold hover:underline">
              Cadastre-se grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}