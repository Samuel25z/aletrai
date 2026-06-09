import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { perguntasIniciais } from '../services/anthropic';

const ChatContext = createContext();

const MATERIAS = [
  { id: 'matematica', nome: 'Matemática', emoji: '📐' },
  { id: 'portugues', nome: 'Português', emoji: '📝' },
  { id: 'historia', nome: 'História', emoji: '🏛️' },
  { id: 'geografia', nome: 'Geografia', emoji: '🌍' },
  { id: 'ciencias', nome: 'Ciências', emoji: '🔬' },
  { id: 'ingles', nome: 'Inglês', emoji: '🇬🇧' },
  { id: 'fisica', nome: 'Física', emoji: '⚛️' },
  { id: 'quimica', nome: 'Química', emoji: '🧪' },
  { id: 'biologia', nome: 'Biologia', emoji: '🧬' },
  { id: 'filosofia', nome: 'Filosofia', emoji: '💭' },
  { id: 'geral', nome: 'Geral', emoji: '💬' },
];

function chaveStorage(userId) {
  return `aletrai_chat_${userId}`;
}

function novaConversa(materiaId) {
  const materia = MATERIAS.find(m => m.id === materiaId) || MATERIAS[MATERIAS.length - 1];
  const msgInicial = {
    id: Date.now(),
    role: 'assistant',
    content: perguntasIniciais(materia.nome),
    timestamp: new Date().toISOString(),
  };
  return {
    id: `conv_${Date.now()}`,
    titulo: `${materia.emoji} ${materia.nome}`,
    materiaId,
    criadaEm: new Date().toISOString(),
    mensagens: [msgInicial],
  };
}

export function ChatProvider({ children }) {
  const { usuario } = useAuth();

  const [conversas, setConversas] = useState([]);
  const [conversaAtualId, setConversaAtualId] = useState(null);
  const [materiaAtual, setMateriaAtual] = useState('geral');

  // Carrega do localStorage quando usuário muda
  useEffect(() => {
    if (!usuario) { setConversas([]); setConversaAtualId(null); return; }
    const salvo = localStorage.getItem(chaveStorage(usuario.id));
    if (salvo) {
      try {
        const dados = JSON.parse(salvo);
        setConversas(dados.conversas || []);
        setConversaAtualId(dados.conversaAtualId || null);
      } catch {
        setConversas([]);
        setConversaAtualId(null);
      }
    }
  }, [usuario?.id]);

  // Persiste no localStorage
  useEffect(() => {
    if (!usuario) return;
    localStorage.setItem(
      chaveStorage(usuario.id),
      JSON.stringify({ conversas, conversaAtualId })
    );
  }, [conversas, conversaAtualId, usuario]);

  const conversaAtual = conversas.find(c => c.id === conversaAtualId) || null;

  const iniciarConversa = useCallback((materiaId = 'geral') => {
    const nova = novaConversa(materiaId);
    setConversas(prev => [nova, ...prev]);
    setConversaAtualId(nova.id);
    setMateriaAtual(materiaId);
    return nova;
  }, []);

  const selecionarConversa = useCallback((id) => {
    setConversaAtualId(id);
    const conv = conversas.find(c => c.id === id);
    if (conv) setMateriaAtual(conv.materiaId);
  }, [conversas]);

  const excluirConversa = useCallback((id) => {
    setConversas(prev => prev.filter(c => c.id !== id));
    setConversaAtualId(prev => prev === id ? null : prev);
  }, []);

  const adicionarMensagem = useCallback((convId, mensagem) => {
    setConversas(prev => prev.map(c =>
      c.id !== convId ? c : {
        ...c,
        mensagens: [...c.mensagens, { ...mensagem, id: Date.now(), timestamp: new Date().toISOString() }],
        titulo: c.mensagens.length === 1 && mensagem.role === 'user'
          ? gerarTitulo(mensagem.content, c)
          : c.titulo,
      }
    ));
  }, []);

  const atualizarUltimaMensagem = useCallback((convId, conteudo) => {
    setConversas(prev => prev.map(c => {
      if (c.id !== convId) return c;
      const msgs = [...c.mensagens];
      msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content: conteudo };
      return { ...c, mensagens: msgs };
    }));
  }, []);

  return (
    <ChatContext.Provider value={{
      conversas,
      conversaAtual,
      conversaAtualId,
      materiaAtual,
      materias: MATERIAS,
      iniciarConversa,
      selecionarConversa,
      excluirConversa,
      adicionarMensagem,
      atualizarUltimaMensagem,
      setMateriaAtual,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

function gerarTitulo(texto, conversa) {
  const materia = MATERIAS.find(m => m.id === conversa.materiaId);
  const emoji = materia?.emoji || '💬';
  const resumo = texto.length > 30 ? texto.slice(0, 30) + '…' : texto;
  return `${emoji} ${resumo}`;
}

export function useChat() { return useContext(ChatContext); }
export { MATERIAS };
