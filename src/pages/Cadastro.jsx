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
  const forcaCor = ['','#ef4444','#f59e0b','#22c55e'][forca];
  const forcaTxt = ['','Fraca','Média','Forte'][forca];

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1.5px solid rgba(255,255,255,0.08)',
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0f0f13' }}>
      {/* Lado esquerdo */}
      <div className="hidden lg:flex w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f1a3d 0%, #1e3a8a 50%, #0f1a3d 100%)' }}>

        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #4f46e5, transparent)' }} />

        <div className="relative z-10 text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 0 40px rgba(79,70,229,0.5)' }}>
            <span className="text-3xl">🚀</span>
          </div>

          <h1 className="text-5xl font-black text-white mb-2 tracking-tight">
            Aletr<span style={{ color: '#a855f7' }}>AI</span>
          </h1>
          <p className="text-blue-300 mb-10 text-base">Comece sua jornada de aprendizado</p>

          <div className="grid grid-cols-2 gap-3 text-left">
            {[
              { icon: '🎮', title: 'Mini-jogos', desc: 'gerados por IA' },
              { icon: '📈', title: 'Progresso', desc: 'adaptativo' },
              { icon: '🏅', title: 'Conquistas', desc: 'e medalhas' },
              { icon: '🔥', title: 'Sequências', desc: 'diárias' },
            ].map((f, i) => (
              <div key={i} className="flex flex-col gap-1 rounded-2xl p-3"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <span className="text-xl">{f.icon}</span>
                <p className="text-white text-sm font-semibold">{f.title}</p>
                <p className="text-blue-300/70 text-xs">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lado direito — formulário */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">

          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
              <span className="text-xl">🧠</span>
            </div>
            <span className="text-2xl font-black text-white">Aletr<span style={{ color: '#a855f7' }}>AI</span></span>
          </div>

          <h2 className="text-3xl font-black text-white mb-1">Criar conta grátis</h2>
          <p className="mb-8" style={{ color: '#6b7280' }}>Preencha os dados e comece em minutos</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Como posso te chamar?', type: 'text', value: nome, set: setNome, placeholder: 'Seu nome ou apelido' },
              { label: 'E-mail', type: 'email', value: email, set: setEmail, placeholder: 'seu@email.com' },
            ].map(({ label, type, value, set, placeholder }) => (
              <div key={label}>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#9ca3af' }}>{label}</label>
                <input
                  type={type} value={value} onChange={e => set(e.target.value)} required
                  placeholder={placeholder}
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all text-white placeholder-gray-600"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#7c3aed'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#9ca3af' }}>Senha</label>
              <input
                type="password" value={senha} onChange={e => setSenha(e.target.value)} required
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-3 rounded-xl outline-none transition-all text-white placeholder-gray-600"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
              {senha.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${(forca/3)*100}%`, background: forcaCor }} />
                  </div>
                  <span className="text-xs" style={{ color: forcaCor }}>{forcaTxt}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#9ca3af' }}>Confirmar senha</label>
              <input
                type="password" value={confirmar} onChange={e => setConfirmar(e.target.value)} required
                placeholder="Repita a senha"
                className="w-full px-4 py-3 rounded-xl outline-none transition-all text-white placeholder-gray-600"
                style={inputStyle}
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
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 4px 24px rgba(79,70,229,0.4)' }}
            >
              {carregando ? <><span className="animate-spin">⏳</span> Criando conta...</> : 'Criar conta e começar →'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm" style={{ color: '#6b7280' }}>
            Já tem conta?{' '}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: '#a855f7' }}>
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
