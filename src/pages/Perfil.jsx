import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { WALLPAPERS, getWallpaperId, setWallpaper, wallpaperDesbloqueado } from '../wallpapers';

const avatares = [
  { id: 'mago',       label: 'Mago',       src: '/avatares/mago.svg'       },
  { id: 'ninja',      label: 'Ninja',      src: '/avatares/ninja.svg'      },
  { id: 'astronauta', label: 'Astronauta', src: '/avatares/astronauta.svg' },
  { id: 'robo',       label: 'Robô',       src: '/avatares/robo.svg'       },
  { id: 'guerreiro',  label: 'Guerreiro',  src: '/avatares/guerreiro.svg'  },
  { id: 'cientista',  label: 'Cientista',  src: '/avatares/cientista.svg'  },
  { id: 'hacker',     label: 'Hacker',     src: '/avatares/hacker.svg'     },
  { id: 'pirata',     label: 'Pirata',     src: '/avatares/pirata.svg'     },
  { id: 'elfa',       label: 'Elfa',       src: '/avatares/elfa.svg'       },
  { id: 'vampiro',    label: 'Vampiro',    src: '/avatares/vampiro.svg'    },
  { id: 'druida',     label: 'Druida',     src: '/avatares/druida.svg'     },
  { id: 'explorador', label: 'Explorador', src: '/avatares/explorador.svg' },
];

function Toggle({ ativo, onChange }) {
  return (
    <button onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${ativo ? 'bg-violet-600' : 'bg-gray-200'}`}>
      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${ativo ? 'left-5' : 'left-0.5'}`} />
    </button>
  );
}

function usePreferencia(chave) {
  const [ativo, setAtivo] = useState(() => localStorage.getItem(chave) === 'true');
  function toggle() {
    const novo = !ativo;
    setAtivo(novo);
    localStorage.setItem(chave, String(novo));
    return novo;
  }
  return [ativo, toggle];
}

function Acessibilidade() {
  const [fonteGrande,    toggleFonte]    = usePreferencia('aletrai_fonte_grande');
  const [altoContraste,  toggleContraste] = usePreferencia('aletrai_alto_contraste');
  const [lembretes,      toggleLembretes] = usePreferencia('aletrai_lembretes');

  function handleFonte() {
    const novo = toggleFonte();
    document.documentElement.classList.toggle('fonte-grande', novo);
  }

  function handleContraste() {
    const novo = toggleContraste();
    document.documentElement.classList.toggle('alto-contraste', novo);
  }

  async function handleLembretes() {
    if (!('Notification' in window)) {
      alert('Seu navegador não suporta notificações.');
      return;
    }
    if (!lembretes) {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        alert('Permissão negada. Ative nas configurações do navegador.');
        return;
      }
      toggleLembretes();
      new Notification('AletrAI 🎮', {
        body: 'Lembretes ativados! Você receberá um aviso diário para estudar.',
        icon: '/favicon.ico',
      });
      localStorage.setItem('aletrai_ultimo_lembrete', String(Date.now()));
    } else {
      toggleLembretes();
    }
  }

  return (
    <div>
      <h3 className="font-bold text-gray-900 mb-3">Acessibilidade</h3>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
        {[
          {
            ic: '🔠', label: 'Fonte grande',
            desc: 'Aumenta o tamanho do texto no app todo',
            ativo: fonteGrande, fn: handleFonte,
          },
          {
            ic: '🔆', label: 'Alto contraste',
            desc: 'Intensifica as cores para melhor visibilidade',
            ativo: altoContraste, fn: handleContraste,
          },
          {
            ic: '🔔', label: 'Lembretes diários',
            desc: 'Notificação do navegador para estudar todo dia',
            ativo: lembretes, fn: handleLembretes,
          },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <span>{item.ic}</span>
              <div>
                <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
            </div>
            <Toggle ativo={item.ativo} onChange={item.fn} />
          </div>
        ))}
      </div>
    </div>
  );
}

async function hashSenha(senha) {
  const data = new TextEncoder().encode(senha);
  const buf  = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

function ConfigAPI() {
  const [aberta, setAberta] = useState(false);
  const [chave, setChave] = useState(() => localStorage.getItem('aletrai_claude_key') || '');
  const [salvo, setSalvo] = useState(false);
  const temChavePropria = !!localStorage.getItem('aletrai_claude_key');

  function salvar() {
    if (chave.trim()) {
      localStorage.setItem('aletrai_claude_key', chave.trim());
    } else {
      localStorage.removeItem('aletrai_claude_key');
    }
    setSalvo(true);
    setTimeout(() => setSalvo(false), 1500);
  }

  function remover() {
    localStorage.removeItem('aletrai_claude_key');
    setChave('');
  }

  return (
    <div>
      <h3 className="font-bold text-gray-900 mb-3">Inteligência Artificial</h3>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <button onClick={() => setAberta(a => !a)}
          className="w-full flex items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-3">
            <span className="text-lg">🤖</span>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800">IA do AletrAI</p>
              <p className="text-xs text-gray-400">
                {temChavePropria ? 'Usando sua chave de API própria' : 'Perguntas e mini-aulas geradas automaticamente'}
              </p>
            </div>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
            temChavePropria
              ? 'bg-violet-50 text-violet-600 border-violet-100'
              : 'bg-green-50 text-green-600 border-green-100'
          }`}>
            {temChavePropria ? '🔑 Própria' : '✓ Ativa'}
          </span>
        </button>

        {aberta && (
          <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-400">
              Por padrão a IA já funciona automaticamente. Se quiser usar sua própria chave da Anthropic
              (para testes), cole abaixo — ela fica salva só neste navegador.
            </p>
            <input type="password" value={chave} onChange={e => setChave(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"/>
            {salvo && <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-xl">✓ Salvo neste navegador!</p>}
            <div className="flex gap-2">
              <button onClick={salvar}
                className="flex-1 py-2.5 bg-violet-600 text-white text-sm font-black rounded-xl transition-colors">
                Salvar chave
              </button>
              {temChavePropria && (
                <button onClick={remover}
                  className="px-4 py-2.5 border-2 border-gray-200 text-gray-600 text-sm font-bold rounded-xl">
                  Remover
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Wallpapers({ xpTotal }) {
  const [selecionado, setSelecionado] = useState(getWallpaperId());

  function escolher(wp) {
    if (!wallpaperDesbloqueado(wp, xpTotal)) return;
    setWallpaper(wp.id);
    setSelecionado(wp.id);
  }

  return (
    <div>
      <h3 className="font-bold text-gray-900 mb-3">Papéis de parede</h3>
      <div className="grid grid-cols-3 gap-3">
        {WALLPAPERS.map(wp => {
          const desbloqueado = wallpaperDesbloqueado(wp, xpTotal);
          const ativo = selecionado === wp.id;
          return (
            <button key={wp.id} onClick={() => escolher(wp)}
              disabled={!desbloqueado}
              className="relative rounded-2xl overflow-hidden transition-all"
              style={{
                aspectRatio: '1 / 1',
                outline: ativo ? '3px solid #7c3aed' : '3px solid transparent',
                outlineOffset: 2,
                cursor: desbloqueado ? 'pointer' : 'not-allowed',
              }}>
              <div className="absolute inset-0" style={{ background: wp.css }} />
              {/* mini card branco para simular o app */}
              <div className="absolute left-2 right-2 top-2 bottom-5 rounded-lg bg-white/85 shadow-sm" />

              {!desbloqueado && (
                <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center gap-0.5 backdrop-blur-[1px]">
                  <span className="text-lg">🔒</span>
                  <span className="text-white text-[9px] font-bold leading-tight text-center px-1">
                    Rank {wp.rankNome}
                  </span>
                </div>
              )}

              {ativo && (
                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center shadow">
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}

              <span className="absolute bottom-1 left-0 right-0 text-center text-[10px] font-bold"
                style={{ color: wp.escuro && desbloqueado ? '#fff' : '#374151' }}>
                {wp.nome}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-400 mt-3">
        Continue ganhando XP nos jogos para desbloquear novos fundos. 🎨
      </p>
    </div>
  );
}

function TrocarSenha({ usuario, atualizarUsuario }) {
  const [aberta, setAberta]         = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha]   = useState('');
  const [confirmar, setConfirmar]   = useState('');
  const [erro, setErro]             = useState('');
  const [ok, setOk]                 = useState(false);
  const [loading, setLoading]       = useState(false);

  const forca = novaSenha.length === 0 ? 0 : novaSenha.length < 6 ? 1 : novaSenha.length < 10 ? 2 : 3;
  const forcaCor = ['','#ef4444','#f59e0b','#22c55e'][forca];
  const forcaTxt = ['','Fraca','Média','Forte'][forca];

  async function salvar() {
    setErro(''); setOk(false);
    if (!senhaAtual) return setErro('Informe sua senha atual.');
    if (novaSenha.length < 6) return setErro('A nova senha precisa ter pelo menos 6 caracteres.');
    if (novaSenha !== confirmar) return setErro('As senhas não coincidem.');
    setLoading(true);
    const hashAtual = await hashSenha(senhaAtual);
    if (hashAtual !== usuario.senhaHash) {
      setLoading(false);
      return setErro('Senha atual incorreta.');
    }
    const novoHash = await hashSenha(novaSenha);
    await atualizarUsuario({ senhaHash: novoHash });
    setLoading(false);
    setOk(true);
    setSenhaAtual(''); setNovaSenha(''); setConfirmar('');
    setTimeout(() => { setAberta(false); setOk(false); }, 1500);
  }

  return (
    <div className="border-t border-gray-100">
      <button onClick={() => { setAberta(a => !a); setErro(''); setOk(false); }}
        className="w-full flex items-center justify-between px-4 py-3.5">
        <span className="text-sm font-semibold text-gray-800">Alterar senha</span>
        <span className="text-xs text-gray-400">{aberta ? '▲' : '▼'}</span>
      </button>

      {aberta && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
          {[
            { label: 'Senha atual',     val: senhaAtual, set: setSenhaAtual, ph: '••••••••' },
            { label: 'Nova senha',      val: novaSenha,  set: setNovaSenha,  ph: 'Mínimo 6 caracteres' },
            { label: 'Confirmar senha', val: confirmar,  set: setConfirmar,  ph: 'Repita a nova senha' },
          ].map(({ label, val, set, ph }) => (
            <div key={label}>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
              <input type="password" value={val} onChange={e => set(e.target.value)} placeholder={ph}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"/>
              {label === 'Nova senha' && novaSenha.length > 0 && (
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${(forca/3)*100}%`, background: forcaCor }}/>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: forcaCor }}>{forcaTxt}</span>
                </div>
              )}
            </div>
          ))}

          {erro && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl">{erro}</p>}
          {ok   && <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-xl">✓ Senha alterada com sucesso!</p>}

          <button onClick={salvar} disabled={loading}
            className="w-full py-2.5 bg-violet-600 disabled:opacity-50 text-white text-sm font-black rounded-xl transition-colors">
            {loading ? 'Verificando...' : 'Salvar nova senha'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function Perfil() {
  const { usuario, atualizarUsuario, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmandoLogout, setConfirmandoLogout] = useState(false);

  function sair() { logout(); navigate('/login'); }

  return (
    <div className="max-w-2xl mx-auto px-5 pt-6 pb-8 space-y-5">

      {/* Header */}
      <div className="bg-violet-600 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-10 translate-x-10"/>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 border-2 border-white/30 rounded-full overflow-hidden flex items-center justify-center">
            {(() => {
              const av = avatares.find(a => a.id === usuario.avatar);
              return av
                ? <img src={av.src} alt={av.label} className="w-full h-full object-cover" />
                : <span className="text-4xl">{usuario.avatar}</span>;
            })()}
          </div>
          <div>
            <h2 className="text-xl font-black text-white">{usuario.nome}</h2>
            <p className="text-violet-200 text-sm">{usuario.desafiosConcluidos || 0} desafios concluídos</p>
            <p className="text-violet-300 text-xs mt-0.5">{usuario.email}</p>
          </div>
        </div>
      </div>

      {/* Avatar */}
      <div>
        <h3 className="font-bold text-gray-900 mb-3">Escolha seu avatar</h3>
        <div className="flex flex-wrap gap-2">
          {avatares.map(av => (
            <button key={av.id} onClick={() => atualizarUsuario({ avatar: av.id })}
              title={av.label}
              className={`w-14 h-14 rounded-2xl overflow-hidden transition-all border-2 ${
                usuario.avatar === av.id
                  ? 'border-violet-500 scale-110 shadow-md shadow-violet-200'
                  : 'border-gray-200 bg-white hover:border-violet-300 hover:scale-105'
              }`}>
              <img src={av.src} alt={av.label} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Papéis de parede */}
      <Wallpapers xpTotal={usuario.xpTotal || usuario.xp || 0} />

      {/* Acessibilidade */}
      <Acessibilidade />

      {/* IA */}
      <ConfigAPI />

      {/* Conta */}
      <div>
        <h3 className="font-bold text-gray-900 mb-3">Conta</h3>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
          <div className="px-4 py-3.5 flex items-center justify-between">
            <span className="text-sm text-gray-500">Nome</span>
            <span className="text-sm font-semibold text-gray-900">{usuario.nome}</span>
          </div>
          <div className="px-4 py-3.5 flex items-center justify-between">
            <span className="text-sm text-gray-500">E-mail</span>
            <span className="text-sm font-semibold text-gray-900">{usuario.email}</span>
          </div>
          <TrocarSenha usuario={usuario} atualizarUsuario={atualizarUsuario} />
        </div>
      </div>

      {/* Logout */}
      {!confirmandoLogout ? (
        <button onClick={() => setConfirmandoLogout(true)}
          className="w-full py-3 border-2 border-red-200 text-red-500 font-bold rounded-2xl hover:bg-red-50 transition-colors text-sm">
          Sair da conta
        </button>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3">
          <p className="text-center text-sm font-bold text-red-800">Tem certeza que quer sair?</p>
          <div className="flex gap-2">
            <button onClick={() => setConfirmandoLogout(false)}
              className="flex-1 py-2.5 border-2 border-gray-200 text-gray-600 font-bold rounded-xl text-sm">
              Cancelar
            </button>
            <button onClick={sair}
              className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-xl text-sm">
              Confirmar saída
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
