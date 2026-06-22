import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getApiKey } from '../services/anthropic';
import './LobbyJogo.css';

const JOGOS = {
  'chao-e-lava': {
    nome: 'Chão é Lava',
    rota: '/jogos/chao-e-lava',
    cor: '#f97316',
    tema: 'lava',
    banner: '/banners/chao-e-lava.jpg',
    emoji: '🌋',
    descricao: 'jogo de sobrevivência onde cada resposta errada te aproxima da lava',
    boasVindas: 'Bem-vindo ao **Chão é Lava**! 🌋\n\nNeste jogo cada pergunta errada te faz cair um nível — e a lava sobe!\n\nAntes de começar, me diz: **sobre qual matéria ou assunto você quer ser testado hoje?**',
  },
  'dungeon-quiz': {
    nome: 'Dungeon Quiz',
    rota: '/jogos/dungeon-quiz',
    cor: '#7c3aed',
    tema: 'dungeon',
    banner: '/banners/Dungeon.jpg',
    emoji: '⚔️',
    descricao: 'RPG onde você derrota bosses respondendo perguntas',
    boasVindas: 'Bem-vindo ao **Dungeon Quiz**! ⚔️\n\nNeste dungeon você vai enfrentar bosses poderosos — e só o conhecimento te derrota eles!\n\nAntes de entrar no dungeon, me diz: **sobre qual matéria ou assunto você quer batalhar hoje?**',
  },
  'space-run': {
    nome: 'Space Run',
    rota: '/jogos/space-run',
    cor: '#0ea5e9',
    tema: 'space',
    banner: '/banners/space-run.jpg',
    emoji: '🚀',
    descricao: 'endless runner espacial onde você responde perguntas para sobreviver',
    boasVindas: 'Bem-vindo ao **Space Run**! 🚀\n\nPilote sua nave pelo espaço, colete estrelas e desvie dos asteroides — e a cada campo de asteroides você responde uma pergunta para seguir vivo!\n\nAntes de decolar, me diz: **sobre qual matéria ou assunto você quer ser testado hoje?**',
  },
  'cobra-saber': {
    nome: 'Cobra do Saber',
    rota: '/jogos/cobra-saber',
    cor: '#22c55e',
    tema: 'cobra',
    banner: '/banners/cobra-saber.jpg',
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

// ── Pixel art avatars por tema ──────────────────────────────────────────────

function AvatarLava() {
  return (
    <svg width="32" height="32" viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
      {/* corpo fogo */}
      <rect x="6" y="12" width="4" height="3" fill="#f97316"/>
      <rect x="5" y="10" width="6" height="3" fill="#fb923c"/>
      <rect x="4" y="8" width="8" height="3" fill="#fbbf24"/>
      <rect x="5" y="6" width="6" height="3" fill="#fb923c"/>
      <rect x="6" y="4" width="4" height="3" fill="#f97316"/>
      <rect x="7" y="2" width="2" height="3" fill="#fbbf24"/>
      {/* olhos */}
      <rect x="6" y="8" width="1" height="1" fill="#7c1d06"/>
      <rect x="9" y="8" width="1" height="1" fill="#7c1d06"/>
    </svg>
  );
}

function AvatarDungeon() {
  return (
    <svg width="32" height="32" viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
      {/* capuz */}
      <rect x="4" y="1" width="8" height="7" fill="#4c1d95"/>
      <rect x="5" y="2" width="6" height="5" fill="#6d28d9"/>
      {/* rosto sombra */}
      <rect x="5" y="5" width="6" height="5" fill="#1e1b4b"/>
      {/* olhos brilhantes */}
      <rect x="6" y="6" width="1" height="2" fill="#a78bfa"/>
      <rect x="9" y="6" width="1" height="2" fill="#a78bfa"/>
      {/* corpo robe */}
      <rect x="3" y="10" width="10" height="5" fill="#4c1d95"/>
      <rect x="5" y="10" width="6" height="5" fill="#5b21b6"/>
      {/* varinha */}
      <rect x="13" y="4" width="1" height="8" fill="#d97706"/>
      <rect x="13" y="3" width="2" height="2" fill="#fbbf24"/>
    </svg>
  );
}

function AvatarSpace() {
  return (
    <svg width="32" height="32" viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
      {/* nave */}
      <rect x="7" y="1" width="2" height="3" fill="#94a3b8"/>
      <rect x="6" y="3" width="4" height="3" fill="#cbd5e1"/>
      <rect x="4" y="5" width="8" height="4" fill="#94a3b8"/>
      <rect x="2" y="7" width="12" height="3" fill="#64748b"/>
      {/* cockpit */}
      <rect x="6" y="4" width="4" height="3" fill="#7dd3fc"/>
      <rect x="7" y="5" width="2" height="2" fill="#bae6fd"/>
      {/* asas */}
      <rect x="0" y="8" width="4" height="2" fill="#475569"/>
      <rect x="12" y="8" width="4" height="2" fill="#475569"/>
      {/* chama */}
      <rect x="6" y="10" width="1" height="3" fill="#f97316"/>
      <rect x="7" y="10" width="2" height="4" fill="#fbbf24"/>
      <rect x="9" y="10" width="1" height="3" fill="#f97316"/>
    </svg>
  );
}

function AvatarCobra() {
  return (
    <svg width="32" height="32" viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
      {/* cabeça */}
      <rect x="5" y="2" width="6" height="5" fill="#16a34a"/>
      <rect x="4" y="3" width="8" height="3" fill="#22c55e"/>
      {/* olhos */}
      <rect x="5" y="3" width="2" height="2" fill="#fff"/>
      <rect x="9" y="3" width="2" height="2" fill="#fff"/>
      <rect x="6" y="4" width="1" height="1" fill="#dc2626"/>
      <rect x="10" y="4" width="1" height="1" fill="#dc2626"/>
      {/* língua */}
      <rect x="7" y="7" width="2" height="1" fill="#dc2626"/>
      <rect x="6" y="8" width="1" height="1" fill="#dc2626"/>
      <rect x="9" y="8" width="1" height="1" fill="#dc2626"/>
      {/* corpo */}
      <rect x="7" y="8" width="3" height="3" fill="#16a34a"/>
      <rect x="4" y="10" width="5" height="3" fill="#22c55e"/>
      <rect x="4" y="12" width="8" height="2" fill="#16a34a"/>
      <rect x="9" y="10" width="3" height="5" fill="#22c55e"/>
    </svg>
  );
}

const AVATARES_TEMA = {
  lava: AvatarLava,
  dungeon: AvatarDungeon,
  space: AvatarSpace,
  cobra: AvatarCobra,
};

// ── Decorações de fundo por tema ───────────────────────────────────────────

function DecorLava() {
  return (
    <div className="lobby-deco lava-deco" aria-hidden="true">
      {/* chamas laterais */}
      {[0,1,2,3,4].map(i => (
        <div key={i} className="lava-chama" style={{ left: `${i * 22}%`, animationDelay: `${i * 0.3}s` }}>
          <svg width="28" height="40" viewBox="0 0 14 20" style={{ imageRendering: 'pixelated' }}>
            <rect x="6" y="14" width="2" height="5" fill="#f97316"/>
            <rect x="5" y="10" width="4" height="5" fill="#fb923c"/>
            <rect x="4" y="6" width="6" height="5" fill="#fbbf24"/>
            <rect x="5" y="3" width="4" height="4" fill="#fb923c"/>
            <rect x="6" y="0" width="2" height="4" fill="#fbbf24"/>
          </svg>
        </div>
      ))}
      {/* lava fluindo */}
      <div className="lava-rio" />
    </div>
  );
}

function DecorDungeon() {
  return (
    <div className="lobby-deco dungeon-deco" aria-hidden="true">
      {/* tochas */}
      {[0, 1].map(i => (
        <div key={i} className={`dungeon-tocha tocha-${i}`}>
          <svg width="16" height="28" viewBox="0 0 8 14" style={{ imageRendering: 'pixelated' }}>
            <rect x="3" y="6" width="2" height="7" fill="#92400e"/>
            <rect x="2" y="3" width="4" height="4" fill="#d97706"/>
            <rect x="3" y="1" width="2" height="3" fill="#f97316" className="tocha-fogo"/>
            <rect x="2" y="0" width="4" height="2" fill="#fbbf24"/>
          </svg>
          <div className="tocha-brilho" />
        </div>
      ))}
      {/* pedras do fundo */}
      <div className="dungeon-pedras">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="pedra" style={{ left: `${i * 13}%`, bottom: `${(i % 3) * 12}px` }} />
        ))}
      </div>
    </div>
  );
}

function DecorSpace() {
  return (
    <div className="lobby-deco space-deco" aria-hidden="true">
      {/* estrelas */}
      {[...Array(20)].map((_, i) => (
        <div key={i} className="estrela"
          style={{
            left: `${(i * 37 + 11) % 100}%`,
            top: `${(i * 53 + 7) % 100}%`,
            width: i % 3 === 0 ? 3 : 2,
            height: i % 3 === 0 ? 3 : 2,
            animationDelay: `${(i * 0.23) % 2}s`,
            animationDuration: `${1.2 + (i * 0.17) % 1.5}s`,
          }} />
      ))}
      {/* planeta ao fundo */}
      <div className="planeta">
        <svg width="64" height="64" viewBox="0 0 32 32" style={{ imageRendering: 'pixelated' }}>
          <rect x="10" y="2" width="12" height="28" fill="#1e3a5f" opacity="0.6"/>
          <rect x="6" y="6" width="20" height="20" fill="#1e3a5f" opacity="0.6"/>
          <rect x="4" y="10" width="24" height="12" fill="#1e3a5f" opacity="0.6"/>
          {/* anel */}
          <rect x="0" y="14" width="32" height="4" fill="#334155" opacity="0.5"/>
          <rect x="2" y="15" width="28" height="2" fill="#475569" opacity="0.4"/>
        </svg>
      </div>
    </div>
  );
}

function DecorCobra() {
  return (
    <div className="lobby-deco cobra-deco" aria-hidden="true">
      {/* grid de pixels */}
      <div className="cobra-grid">
        {[...Array(6 * 4)].map((_, i) => (
          <div key={i} className="grid-cell" style={{ opacity: Math.random() > 0.7 ? 0.15 : 0.05 }} />
        ))}
      </div>
      {/* orbes coloridas decorativas */}
      {['#ef4444','#3b82f6','#eab308','#a855f7'].map((cor, i) => (
        <div key={i} className="orbe-deco"
          style={{ background: cor, left: `${15 + i * 20}%`, animationDelay: `${i * 0.5}s` }} />
      ))}
    </div>
  );
}

const DECORS = { lava: DecorLava, dungeon: DecorDungeon, space: DecorSpace, cobra: DecorCobra };

// ── Bolhas de chat ──────────────────────────────────────────────────────────

function BolhaIA({ texto, tema, cor }) {
  const AvatarComp = AVATARES_TEMA[tema];
  return (
    <div className="flex items-start gap-3 max-w-[88%]">
      <div className={`lobby-avatar-ia lobby-avatar-${tema} shrink-0`}>
        <AvatarComp />
      </div>
      <div className={`lobby-bolha-ia lobby-bolha-${tema} text-sm leading-relaxed`}
        dangerouslySetInnerHTML={{ __html: parseMarkdown(texto) }} />
    </div>
  );
}

function BolhaUsuario({ texto, tema }) {
  return (
    <div className="flex justify-end">
      <div className={`lobby-bolha-user lobby-bolha-user-${tema} text-sm max-w-[75%] leading-relaxed`}>
        {texto}
      </div>
    </div>
  );
}

function Digitando({ tema, cor }) {
  const AvatarComp = AVATARES_TEMA[tema];
  return (
    <div className="flex items-start gap-3">
      <div className={`lobby-avatar-ia lobby-avatar-${tema} shrink-0`}>
        <AvatarComp />
      </div>
      <div className={`lobby-bolha-ia lobby-bolha-${tema} flex gap-1.5 items-center`}>
        <span className="lobby-dot" style={{ animationDelay: '0ms' }} />
        <span className="lobby-dot" style={{ animationDelay: '150ms' }} />
        <span className="lobby-dot" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

// ── Página principal ────────────────────────────────────────────────────────

export default function LobbyJogo() {
  const { jogoId } = useParams();
  const navigate = useNavigate();
  const jogo = JOGOS[jogoId];

  const [mensagens, setMensagens] = useState([]);
  const [input, setInput] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [pronto, setPronto] = useState(false);
  const [topico, setTopico] = useState('');
  const [turno, setTurno] = useState(0);
  const fundoRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!jogo) { navigate('/jogos'); return; }
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

    const ehPrimeiraMensagem = turno === 0;
    if (ehPrimeiraMensagem) setTopico(texto);
    setTurno(t => t + 1);

    const systemPrompt = ehPrimeiraMensagem
      ? `Você é o tutor do jogo "${jogo.nome}" — ${jogo.descricao}. O jogador quer estudar: "${texto}".

Sua missão: preparar o jogador da forma MAIS EFICIENTE possível para acertar perguntas sobre esse assunto no jogo.

Siga esta lógica:
1. Se o assunto está claro e específico, dê uma MINI-AULA enxuta e estratégica em **bullets** (•), com 3 a 5 pontos. Foque no que MAIS cai em prova e no que MAIS confunde os alunos. Destaque os conceitos-chave em **negrito** e dê 1 exemplo concreto do cotidiano.
2. Se o assunto está MUITO amplo ou vago (ex.: só "matemática" ou "história"), escolha o recorte mais importante, avise em 1 linha qual foco vai cobrir, ensine esse núcleo, e convide o jogador a pedir um subtema específico se quiser focar em outra coisa.
3. Termine com UMA frase curta de incentivo dizendo que ele já pode iniciar o jogo.

Seja direto, animado e didático. Sem enrolação, sem aula formal longa, sem repetir a pergunta do jogador. Máximo ~180 palavras.`
      : `Você é o tutor do jogo "${jogo.nome}". O jogador está estudando "${topico || texto}".
         Responda a dúvida de forma curta, clara e animada, com um exemplo quando ajudar. Use **negrito** nos termos importantes.
         Se perceber que não há mais dúvidas, incentive o jogador a iniciar o jogo. Máximo ~120 palavras.`;

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

  const Decor = DECORS[jogo.tema];

  return (
    <div className={`lobby-root lobby-${jogo.tema}`}>
      <Decor />

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
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.75))' }} />
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          <button onClick={() => navigate('/jogos')}
            className="self-start w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/30 transition">
            ←
          </button>
          <div>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-0.5">Preparação</p>
            <h1 className="text-white text-2xl font-black drop-shadow-lg">{jogo.nome}</h1>
          </div>
        </div>
      </div>

      {/* Chat */}
      <div ref={fundoRef} className="lobby-chat-area flex-1 overflow-y-auto px-4 py-4 space-y-4"
        style={{ maxHeight: 'calc(100vh - 176px - 72px)' }}>
        {mensagens.map((m, i) =>
          m.de === 'ia'
            ? <BolhaIA key={i} texto={m.texto} tema={jogo.tema} cor={jogo.cor} />
            : <BolhaUsuario key={i} texto={m.texto} tema={jogo.tema} />
        )}
        {carregando && <Digitando tema={jogo.tema} cor={jogo.cor} />}

        {pronto && !carregando && (
          <div className="flex justify-center pt-2">
            <button onClick={iniciarJogo}
              className={`lobby-btn-iniciar lobby-btn-${jogo.tema} px-8 py-3.5 rounded-2xl font-black text-white text-base transition-all hover:scale-105 active:scale-95`}>
              Iniciar {jogo.nome} {jogo.emoji}
            </button>
          </div>
        )}
      </div>

      {/* Input */}
      <div className={`lobby-input-bar lobby-input-${jogo.tema} shrink-0 px-4 py-3 flex gap-2`}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && enviar()}
          placeholder={turno === 0 ? 'Ex: "equações do 2º grau", "Revolução Francesa"...' : 'Alguma dúvida antes de jogar?'}
          className={`lobby-input lobby-input-field-${jogo.tema} flex-1 rounded-2xl px-4 py-3 text-sm outline-none transition`}
          disabled={carregando}
        />
        <button onClick={enviar} disabled={!input.trim() || carregando}
          className={`lobby-send-btn lobby-send-${jogo.tema} w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold transition-all hover:scale-105 disabled:opacity-40`}>
          ↑
        </button>
      </div>
    </div>
  );
}
