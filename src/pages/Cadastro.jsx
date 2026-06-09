import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const { cadastrar } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    if (senha !== confirmar) return setErro('As senhas não coincidem.');
    if (senha.length < 6) return setErro('A senha precisa ter pelo menos 6 caracteres.');
    setCarregando(true);
    await new Promise(r => setTimeout(r, 700));
    const resultado = await cadastrar(nome, email, senha);
    setCarregando(false);
    if (resultado.erro) setErro(resultado.erro);
    else navigate('/tutorial');
  }

  const forca = senha.length === 0 ? 0 : senha.length < 6 ? 1 : senha.length < 10 ? 2 : 3;
  const forcaCor = ['bg-gray-200','bg-red-400','bg-yellow-400','bg-green-400'][forca];
  const forcaTxt = ['','Fraca','Média','Forte'][forca];

  return (
    <div className="min-h-screen bg-white flex">
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-violet-700 to-purple-500 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white"></div>
          <div className="absolute bottom-20 right-5 w-40 h-40 rounded-full bg-white"></div>
        </div>
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-6 mx-auto border-2 border-white/30">
            <span className="text-4xl">🚀</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Comece sua jornada</h2>
          <p className="text-violet-200 mb-8">Junte-se a milhares de estudantes</p>
          <div className="grid grid-cols-2 gap-4">
            {[['🎮','Mini-jogos','gerados por IA'],['📈','Progresso','adaptativo'],['🏅','Conquistas','e medalhas'],['🔥','Sequências','diárias']].map(([ic,t,s],i) => (
              <div key={i} className="bg-white/10 rounded-2xl p-4 border border-white/20">
                <span className="text-2xl block mb-1">{ic}</span>
                <p className="text-white font-medium text-sm">{t}</p>
                <p className="text-violet-300 text-xs">{s}</p>
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

          <h2 className="text-3xl font-bold text-gray-900 mb-1">Criar conta grátis</h2>
          <p className="text-gray-500 mb-8">Preencha os dados e comece em minutos</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Como posso te chamar?</label>
              <input
                type="text" value={nome} onChange={e => setNome(e.target.value)} required
                placeholder="Seu nome ou apelido"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 outline-none text-gray-900 transition-colors"
              />
            </div>
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
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 outline-none text-gray-900 transition-colors"
              />
              {senha.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${forcaCor}`} style={{ width: `${(forca/3)*100}%` }}></div>
                  </div>
                  <span className="text-xs text-gray-500">{forcaTxt}</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar senha</label>
              <input
                type="password" value={confirmar} onChange={e => setConfirmar(e.target.value)} required
                placeholder="Repita a senha"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 outline-none text-gray-900 transition-colors"
              />
            </div>

            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{erro}</div>
            )}

            <button
              type="submit" disabled={carregando}
              className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-violet-200"
            >
              {carregando ? <><span className="animate-spin">⏳</span> Criando conta...</> : 'Criar conta e começar →'}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-6 text-sm">
            Já tem conta?{' '}
            <Link to="/login" className="text-violet-600 font-semibold hover:underline">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}