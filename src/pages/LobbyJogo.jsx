import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getApiKey } from '../services/anthropic';

const JOGOS = {
  'chao-e-lava': {
    nome: 'Chão é Lava',
    rota: '/jogos/chao-e-lava',
    cor: '#f97316',
    corClaro: '#fff7ed',
    banner: '/banners/chao-e-lava.jpg',
    emoji: '🌋',
    descricao: 'jogo de sobrevivência onde cada resposta errada te aproxima da lava',
    boasVindas: 'Bem-vindo ao **Chão é Lava**! 🌋\n\nNeste jogo cada pergunta errada te faz cair um nível — e a lava sobe!\n\nAntes de começar, me diz: **sobre qual matéria ou assunto você quer ser testado hoje?**',
  },
  'dungeon-quiz': {
    nome: 'Dungeon Quiz',
    rota: '/jogos/dungeon-quiz',
    cor: '#7c3aed',
    corClaro: '#f5f3ff',
    banner: '/banners/Dungeon.jpg',
    emoji: '⚔️',
    descricao: 'RPG onde você derrota bosses respondendo perguntas',
    boasVindas: 'Bem-vindo ao **Dungeon Quiz**! ⚔️\n\nNeste dungeon você vai enfrentar bosses poderosos — e só o conhecimento te derrota eles!\n\nAntes de entrar no dungeon, me diz: **sobre qual matéria ou assunto você quer batalhar hoje?**',
  },
  'space-run': {
    nome: 'Space Run',
    rota: '/jogos/space-run',
    cor: '#0ea5e9',
    corClaro: '#f0f9ff',
    banner: null,
    emoji: '🚀',
    descricao: 'endless runner espacial onde você responde perguntas para sobreviver',
    boasVindas: 'Bem-vindo ao **Space Run**! 🚀\n\nPilote sua nave pelo espaço, colete estrelas e desvie dos asteroides — e a cada campo de asteroides você responde uma pergunta para seguir vivo!\n\nAntes de decolar, me diz: **sobre qual matéria ou assunto você quer ser testado hoje?**',
  },
  'cobra-saber': {
    nome: 'Cobra do Saber',
    rota: '/jogos/cobra-saber',
    cor: '#22c55e',
    corClaro: '#f0fdf4',
    banner: null,
    emoji: '🐍',
    descricao: 'arcade onde você guia a cobra até a resposta certa',
    boasVindas: 'Bem-vindo à **Cobra do Saber**! 🐍\n\nGuie a cobra pelo tabuleiro e leve-a até o orbe com a resposta certa. Acertou, ela cresce; errou ou bateu, perde uma vida!\n\nAntes de começar, me diz: **sobre qual matéria ou assunto você quer praticar hoje?**',
  },
};

function parseMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
}

function BolhaIA({ texto, cor }) {
  return (
    <div className="flex items-start gap-3 max-w-[85%]">
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 shadow-sm"
        style={{ background: cor, color: 'white', fontWeight: 'bold', fontSize: 16 }}>
        ✦
      </div>
      <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100 text-sm text-gray-800 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: parseMarkdown(texto) }} />
    </div>
  );
}

function BolhaUsuario({ texto }) {
  return (
    <div className="flex justify-end">
      <div className="bg-violet-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm max-w-[75%] leading-relaxed">
        {texto}
      </div>
    </div>
  );
}

function Digitando({ cor }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
        style={{ background: cor, color: 'white', fontWeight: 'bold', fontSize: 16 }}>
        ✦
      </div>
      <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100 flex gap-1.5 items-center">
        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

export default function LobbyJogo() {
  const { jogoId } = useParams();
  const navigate = useNavigate();
  const jogo = JOGOS[jogoId];

  const [mensagens, setMensagens] = useState([]);
  const [input, setInput] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [pronto, setPronto] = useState(false);
  const [topico, setTopico] = useState('');
  const [turno, setTurno] = useState(0); // 0=aguardando materia, 1+=livre
  const fundoRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!jogo) { navigate('/jogos'); return; }
    // Mensagem inicial da IA
    setTimeout(() => {
      setMensagens([{ de: 'ia', texto: jogo.boasVindas }]);
    }, 400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (fundoRef.current) {
      fundoRef.current.scrollTop = fundoRef.current.scrollHeight;
    }
  }, [mensagens, carregando]);

  async function enviar() {
    const texto = input.trim();
    if (!texto || carregando) return;
    setInput('');
    const novasMensagens = [...mensagens, { de: 'usuario', texto }];
    setMensagens(novasMensagens);
    setCarregando(true);

    // Na primeira resposta do usuário, salva o tópico e pede mini-aula
    const ehPrimeiraMensagem = turno === 0;
    if (ehPrimeiraMensagem) setTopico(texto);
    setTurno(t => t + 1);

    const systemPrompt = ehPrimeiraMensagem
      ? `Você é o assistente do jogo "${jogo.nome}" — ${jogo.descricao}. O jogador escolheu estudar: "${texto}".
         Dê uma mini-aula objetiva e envolvente sobre esse assunto (máximo 3-4 parágrafos curtos).
         Use linguagem animada e use **negrito** para destacar conceitos-chave.
         No final, diga que o jogador está pronto para jogar e deseje boa sorte.
         Seja direto e entusiasmado — este é um jogo, não uma aula formal.`
      : `Você é o assistente do jogo "${jogo.nome}". O jogador estudou "${topico || texto}" antes de jogar.
         Responda dúvidas de forma curta e animada. Se não houver mais dúvidas, incentive o jogador a iniciar o jogo.`;

    try {
      const apiKey = getApiKey();
      const res = apiKey
        ? await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
              'anthropic-dangerous-direct-browser-access': 'true',
            },
            body: JSON.stringify({
              model: 'claude-haiku-4-5-20251001',
              max_tokens: 600,
              system: systemPrompt,
              messages: [{ role: 'user', content: texto }],
            }),
          })
        : await fetch('/api/claude', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              model: 'claude-haiku-4-5-20251001',
              max_tokens: 600,
              system: systemPrompt,
              messages: [{ role: 'user', content: texto }],
            }),
          });
      const data = await res.json();
      const resposta = data.content?.[0]?.text || 'Não consegui responder. Tente novamente.';
      setMensagens(m => [...m, { de: 'ia', texto: resposta }]);
      if (ehPrimeiraMensagem) setPronto(true);
    } catch {
      setMensagens(m => [...m, { de: 'ia', texto: 'Erro ao conectar com a IA. Tente novamente em instantes.' }]);
    }
    setCarregando(false);
  }

  function iniciarJogo() {
    localStorage.setItem('aletrai_topico_atual', topico);
    localStorage.setItem('aletrai_jogo_atual', jogoId);
    navigate(jogo.rota);
  }

  if (!jogo) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8f8fa' }}>
      {/* Header com banner */}
      <div className="relative h-44 shrink-0 overflow-hidden">
        {jogo.banner ? (
          <img src={jogo.banner} alt={jogo.nome} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-7xl"
            style={{ background: `linear-gradient(135deg, ${jogo.cor}, ${jogo.cor}99)` }}>
            {jogo.emoji}
          </div>
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.65))' }} />
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          <button onClick={() => navigate('/jogos')}
            className="self-start w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/30 transition">
            ←
          </button>
          <div>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-0.5">Preparação</p>
            <h1 className="text-white text-2xl font-black">{jogo.nome}</h1>
          </div>
        </div>
      </div>

      {/* Chat */}
      <div ref={fundoRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ maxHeight: 'calc(100vh - 44px - 72px)' }}>
        {mensagens.map((m, i) =>
          m.de === 'ia'
            ? <BolhaIA key={i} texto={m.texto} cor={jogo.cor} />
            : <BolhaUsuario key={i} texto={m.texto} />
        )}
        {carregando && <Digitando cor={jogo.cor} />}

        {/* Botão iniciar aparece após a mini-aula */}
        {pronto && !carregando && (
          <div className="flex justify-center pt-2">
            <button onClick={iniciarJogo}
              className="px-8 py-3.5 rounded-2xl font-black text-white text-base shadow-lg transition-all hover:scale-105 active:scale-95"
              style={{ background: jogo.cor, boxShadow: `0 8px 24px ${jogo.cor}55` }}>
              Iniciar {jogo.nome} {jogo.emoji}
            </button>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 py-3 bg-white border-t border-gray-100 flex gap-2">
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && enviar()}
          placeholder={turno === 0 ? 'Digite a matéria que quer estudar...' : 'Alguma dúvida antes de jogar?'}
          className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 transition"
          style={{ '--tw-ring-color': jogo.cor + '66' }}
          disabled={carregando}
        />
        <button onClick={enviar} disabled={!input.trim() || carregando}
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold transition-all hover:scale-105 disabled:opacity-40"
          style={{ background: jogo.cor }}>
          ↑
        </button>
      </div>
    </div>
  );
}
