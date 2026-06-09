import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import { useAuth, calcularNivelMateria, temBossDisponivel } from '../context/AuthContext';
import { enviarMensagem } from '../services/anthropic';

// ─── Configuração de chave API ────────────────────────────────────────────────
function ConfigurarChave({ onSalvar }) {
  const [chave, setChave] = useState('');
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center text-3xl mb-4">🔑</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Configure sua chave Claude</h2>
      <p className="text-sm text-gray-500 mb-6 max-w-xs">
        Cole sua chave da API Anthropic. Fica salva só no seu navegador.
      </p>
      <input type="password" value={chave} onChange={e => setChave(e.target.value)}
        placeholder="sk-ant-..."
        className="w-full max-w-sm border border-gray-200 rounded-xl px-4 py-3 text-sm mb-3 focus:outline-none focus:border-violet-400"
      />
      <button
        onClick={() => { if (chave.startsWith('sk-ant')) { localStorage.setItem('aletrai_claude_key', chave); onSalvar(); }}}
        disabled={!chave.startsWith('sk-ant')}
        className="w-full max-w-sm py-3 bg-violet-600 text-white rounded-xl font-semibold disabled:opacity-40 hover:bg-violet-700 transition-colors"
      >Salvar e continuar</button>
      <a href="https://console.anthropic.com" target="_blank" rel="noreferrer"
        className="mt-3 text-xs text-violet-500 hover:underline">Obter chave em console.anthropic.com →</a>
    </div>
  );
}

// ─── Renderização de markdown simples ────────────────────────────────────────
function TextoMensagem({ content, streaming }) {
  const linhas = content.split('\n');
  return (
    <div className="text-sm leading-relaxed space-y-1">
      {linhas.map((linha, i) => {
        if (linha.startsWith('### ')) return <p key={i} className="font-bold text-base mt-2">{linha.slice(4)}</p>;
        if (linha.startsWith('## '))  return <p key={i} className="font-bold text-lg mt-2">{linha.slice(3)}</p>;
        if (linha.startsWith('# '))   return <p key={i} className="font-bold text-xl mt-2">{linha.slice(2)}</p>;
        if (linha.startsWith('- ') || linha.startsWith('* '))
          return <p key={i} className="flex gap-2 ml-1"><span className="text-violet-400 flex-shrink-0">•</span><span dangerouslySetInnerHTML={{ __html: fmt(linha.slice(2)) }} /></p>;
        if (/^\d+\. /.test(linha)) {
          const num = linha.match(/^(\d+)\. /)[1];
          return <p key={i} className="flex gap-2 ml-1"><span className="font-bold text-violet-500 flex-shrink-0 w-4">{num}.</span><span dangerouslySetInnerHTML={{ __html: fmt(linha.replace(/^\d+\. /, '')) }} /></p>;
        }
        if (linha.trim() === '') return <div key={i} className="h-1" />;
        return <p key={i} dangerouslySetInnerHTML={{ __html: fmt(linha) }} />;
      })}
      {streaming && <span className="inline-block w-1.5 h-4 bg-violet-400 animate-pulse ml-0.5 rounded-sm align-middle" />}
    </div>
  );
}

function fmt(t) {
  return t
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 rounded text-xs font-mono">$1</code>');
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ aberta, onFechar }) {
  const { conversas, conversaAtualId, materias, iniciarConversa, selecionarConversa, excluirConversa } = useChat();
  const [confirmExcluir, setConfirmExcluir] = useState(null);

  const conversasPorMateria = materias.map(m => ({
    ...m, convs: conversas.filter(c => c.materiaId === m.id),
  })).filter(m => m.convs.length > 0);

  return (
    <>
      {aberta && <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={onFechar} />}
      <aside className={`fixed md:relative top-0 left-0 h-full w-72 bg-white border-r border-gray-100 z-30 flex flex-col transition-transform duration-300 ${aberta ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Conversas</h2>
          <button onClick={onFechar} className="md:hidden text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div className="p-3 border-b border-gray-100">
          <p className="text-xs text-gray-400 font-semibold mb-2 px-1">NOVA CONVERSA</p>
          <div className="grid grid-cols-3 gap-1.5">
            {materias.map(m => (
              <button key={m.id} onClick={() => { iniciarConversa(m.id); onFechar(); }}
                className="flex flex-col items-center gap-0.5 p-2 rounded-xl hover:bg-violet-50 text-gray-600 hover:text-violet-700 transition-colors">
                <span className="text-lg">{m.emoji}</span>
                <span className="text-xs leading-tight text-center">{m.nome}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-3">
          {conversas.length === 0 && (
            <p className="text-center text-gray-400 text-xs mt-8">Nenhuma conversa ainda.<br />Escolha uma matéria acima!</p>
          )}
          {conversasPorMateria.map(({ id: mid, nome, emoji, convs }) => (
            <div key={mid}>
              <p className="text-xs font-semibold text-gray-400 px-2 mb-1">{emoji} {nome}</p>
              {convs.map(conv => (
                <div key={conv.id}
                  className={`flex items-center gap-1 rounded-xl px-3 py-2 cursor-pointer group transition-colors ${conv.id === conversaAtualId ? 'bg-violet-50 text-violet-700' : 'hover:bg-gray-50 text-gray-700'}`}
                  onClick={() => { selecionarConversa(conv.id); onFechar(); }}>
                  <span className="text-xs flex-1 truncate">{conv.titulo}</span>
                  {confirmExcluir === conv.id ? (
                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                      <button onClick={() => { excluirConversa(conv.id); setConfirmExcluir(null); }} className="text-xs text-red-500 font-bold">sim</button>
                      <button onClick={() => setConfirmExcluir(null)} className="text-xs text-gray-400">não</button>
                    </div>
                  ) : (
                    <button onClick={e => { e.stopPropagation(); setConfirmExcluir(conv.id); }}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 text-xs">✕</button>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function Chat() {
  const navigate = useNavigate();
  const { usuario, ganharXPMateria } = useAuth();
  const { conversaAtual, conversaAtualId, iniciarConversa, adicionarMensagem, atualizarUltimaMensagem } = useChat();

  const [input, setInput] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [temChave, setTemChave] = useState(!!localStorage.getItem('aletrai_claude_key'));
  const [erro, setErro] = useState('');

  const fimRef = useRef(null);
  const inputRef = useRef(null);

  const materiaId = conversaAtual?.materiaId;
  const xpMateria = usuario?.xpPorMateria?.[materiaId] || 0;
  const bossesVencidos = usuario?.bossesVencidos?.[materiaId] || [];
  const bossDisponivel = materiaId && materiaId !== 'geral' && temBossDisponivel(xpMateria, bossesVencidos);

  useEffect(() => {
    if (temChave && !conversaAtualId) iniciarConversa('geral');
  }, [temChave, conversaAtualId, iniciarConversa]);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversaAtual?.mensagens?.length]);

  const enviar = useCallback(async () => {
    const texto = input.trim();
    if (!texto || carregando || !conversaAtualId) return;
    setInput('');
    setErro('');
    adicionarMensagem(conversaAtualId, { role: 'user', content: texto });
    adicionarMensagem(conversaAtualId, { role: 'assistant', content: '', streaming: true });
    setCarregando(true);
    try {
      const historico = [...conversaAtual.mensagens, { role: 'user', content: texto }].filter(m => !m.streaming);
      let acumulado = '';
      await enviarMensagem(historico, (_, total) => {
        acumulado = total;
        atualizarUltimaMensagem(conversaAtualId, total);
      });
      atualizarUltimaMensagem(conversaAtualId, acumulado);
      if (materiaId && materiaId !== 'geral') ganharXPMateria(10, materiaId);
    } catch (e) {
      const msg = e.message === 'CHAVE_NAO_CONFIGURADA'
        ? 'Chave da API não configurada. Clique em 🔑 para configurar.'
        : `Erro: ${e.message}`;
      setErro(msg);
      atualizarUltimaMensagem(conversaAtualId, `⚠️ ${msg}`);
    } finally {
      setCarregando(false);
      inputRef.current?.focus();
    }
  }, [input, carregando, conversaAtualId, conversaAtual, adicionarMensagem, atualizarUltimaMensagem, materiaId, ganharXPMateria]);

  if (!temChave) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="m-auto w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
          <ConfigurarChave onSalvar={() => setTemChave(true)} />
        </div>
      </div>
    );
  }

  const mensagens = conversaAtual?.mensagens || [];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar aberta={sidebarAberta} onFechar={() => setSidebarAberta(false)} />
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setSidebarAberta(true)} className="md:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500">☰</button>
          <div className="w-8 h-8 bg-violet-600 rounded-xl flex items-center justify-center text-base flex-shrink-0">🧠</div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm truncate">{conversaAtual?.titulo || 'AletrAI'}</p>
            <p className="text-xs text-gray-400">{carregando ? 'digitando...' : 'online'}</p>
          </div>
          {/* Botão de jogos */}
          <button
            onClick={() => navigate('/jogos')}
            className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors"
          >
            🎮 Jogar
          </button>
          <button onClick={() => { localStorage.removeItem('aletrai_claude_key'); setTemChave(false); }}
            title="Trocar chave" className="text-gray-300 hover:text-gray-500 ml-1">🔑</button>
        </header>

        {/* Mensagens */}
        <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {mensagens.length === 0 && (
            <div className="px-4 mt-6 space-y-4 max-w-lg mx-auto w-full">
              {/* Saudação */}
              <div className="text-center mb-2">
                <p className="font-bold text-gray-800 text-xl">Olá, {usuario?.nome?.split(' ')[0]}! 🧠</p>
                <p className="text-sm text-gray-400 mt-1">Como quer estudar hoje?</p>
              </div>

              {/* Card: Jogar */}
              <div
                onClick={() => navigate('/jogos')}
                className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-orange-200"
              >
                <div className="flex items-center gap-4">
                  <div className="text-4xl">🌋</div>
                  <div className="text-white flex-1">
                    <p className="font-black text-lg leading-tight">Jogar enquanto aprende</p>
                    <p className="text-sm text-white/75 mt-0.5">Chão é Lava + outros jogos em breve</p>
                  </div>
                  <span className="text-white/60 text-xl">→</span>
                </div>
              </div>

              {/* Card: Conversar com IA */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <p className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span>💬</span> Conversar com a IA
                </p>
                <p className="text-xs text-gray-400 mb-3">Escolha uma matéria no menu lateral ou clique abaixo:</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id:'matematica', emoji:'📐', nome:'Mate' },
                    { id:'portugues',  emoji:'📝', nome:'Portug.' },
                    { id:'historia',   emoji:'🏛️', nome:'História' },
                    { id:'ciencias',   emoji:'🔬', nome:'Ciências' },
                    { id:'ingles',     emoji:'🇬🇧', nome:'Inglês' },
                    { id:'geral',      emoji:'💬', nome:'Geral' },
                  ].map(m => (
                    <button key={m.id}
                      onClick={() => iniciarConversa(m.id)}
                      className="flex flex-col items-center gap-1 p-2 rounded-xl bg-gray-50 hover:bg-violet-50 hover:text-violet-700 text-gray-600 transition-colors border border-transparent hover:border-violet-200"
                    >
                      <span className="text-xl">{m.emoji}</span>
                      <span className="text-xs">{m.nome}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {mensagens.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div key={msg.id || idx} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-sm flex-shrink-0 mt-1">🧠</div>}
                <div className={`max-w-[85%] ${isUser ? '' : 'flex-1'}`}>
                  <div className={`rounded-2xl px-4 py-3 ${isUser ? 'bg-violet-600 text-white rounded-tr-sm' : 'bg-white border border-gray-100 shadow-sm rounded-tl-sm text-gray-800'}`}>
                    {isUser
                      ? <p className="text-sm">{msg.content}</p>
                      : <TextoMensagem content={msg.content} streaming={!!msg.streaming} />
                    }
                  </div>
                  <p className={`text-xs mt-1 ${isUser ? 'text-right text-gray-400' : 'text-gray-300'}`}>
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                  </p>
                </div>
                {isUser && <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm flex-shrink-0 mt-1">{usuario?.avatar || '👤'}</div>}
              </div>
            );
          })}
          {carregando && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-sm">🧠</div>
              <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1 items-center h-5">
                  {[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
                </div>
              </div>
            </div>
          )}
          <div ref={fimRef} />
        </main>

        {/* Banner boss */}
        {bossDisponivel && (
          <div onClick={() => navigate('/boss', { state: { materiaId } })}
            className="mx-4 mb-2 bg-gradient-to-r from-rose-500 to-orange-500 rounded-2xl p-3 flex items-center gap-3 cursor-pointer hover:opacity-90">
            <span className="text-2xl animate-pulse">👾</span>
            <div className="flex-1 text-white"><p className="text-xs font-bold">BOSS DISPONÍVEL!</p><p className="text-xs opacity-80">Você está pronto? ⚔️</p></div>
            <span className="text-white font-bold">›</span>
          </div>
        )}

        {/* Input */}
        <div className="bg-white border-t border-gray-100 px-4 py-3">
          {erro && <p className="text-xs text-red-500 mb-2">{erro}</p>}
          <div className="flex gap-2 items-end">
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(); }}}
              placeholder="O que você quer aprender hoje?" rows={1} disabled={carregando}
              className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-violet-400 max-h-32"
            />
            <button onClick={enviar} disabled={!input.trim() || carregando}
              className="w-11 h-11 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white rounded-2xl flex items-center justify-center transition-colors flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
