import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Game from './Game';

const PRECOS = { pistola: 35, raio: 60, puloDuplo: 10 };

// ─── Loja antes da partida ──────────────────────────────────────────────────
function Loja({ onJogar, onVoltar }) {
  const [moedas, setMoedas]   = useState(0);
  const [pistola, setPistola] = useState(false);
  const [temRaio, setTemRaio] = useState(false);
  const [puloDuplo, setPuloDuplo] = useState(false); // comprado só para esta partida
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setMoedas(parseInt(localStorage.getItem('aletrai_chaolava_moedas') || '0', 10));
    setPistola(localStorage.getItem('aletrai_chaolava_pistola') === '1');
    setTemRaio(localStorage.getItem('aletrai_chaolava_raio') === '1');
  }, []);

  function gastar(qtd) {
    const novo = moedas - qtd;
    setMoedas(novo);
    localStorage.setItem('aletrai_chaolava_moedas', String(novo));
  }
  function devolver(qtd) {
    const novo = moedas + qtd;
    setMoedas(novo);
    localStorage.setItem('aletrai_chaolava_moedas', String(novo));
  }

  function comprarPermanente(item) {
    if ((item === 'pistola' && pistola) || (item === 'raio' && temRaio)) return;
    const preco = PRECOS[item];
    if (moedas < preco) { setMsg('Moedas insuficientes!'); return; }
    gastar(preco);
    if (item === 'pistola') { localStorage.setItem('aletrai_chaolava_pistola', '1'); setPistola(true); }
    if (item === 'raio')    { localStorage.setItem('aletrai_chaolava_raio', '1');    setTemRaio(true); }
    setMsg('');
  }

  function toggleDuplo() {
    if (puloDuplo) { setPuloDuplo(false); devolver(PRECOS.puloDuplo); return; }
    if (moedas < PRECOS.puloDuplo) { setMsg('Moedas insuficientes!'); return; }
    gastar(PRECOS.puloDuplo);
    setPuloDuplo(true);
    setMsg('');
  }

  const ITENS = [
    {
      id: 'pistola', emoji: '🔫', nome: 'Pistola',
      tag: 'Permanente', cor: '#4a90d9',
      desc: 'Dispara tiros que eliminam inimigos à distância.',
      preco: PRECOS.pistola, possui: pistola,
      action: () => comprarPermanente('pistola'),
    },
    {
      id: 'raio', emoji: '⚡', nome: 'Espada-Raio',
      tag: 'Permanente', cor: '#22c0e8',
      desc: 'Solta um raio que elimina TODOS os inimigos do andar. Recarga de 8s.',
      preco: PRECOS.raio, possui: temRaio,
      action: () => comprarPermanente('raio'),
    },
    {
      id: 'puloDuplo', emoji: '🪽', nome: 'Pulo Duplo',
      tag: 'Temporário · 1 partida', cor: '#f59e0b',
      desc: 'Salte uma segunda vez no ar. Vale só para esta partida.',
      preco: PRECOS.puloDuplo, possui: false, temporario: true, equipado: puloDuplo,
      action: toggleDuplo,
    },
  ];

  return (
    <div className="fixed inset-0 overflow-y-auto flex flex-col items-center"
      style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, #2a1010 0%, #0e0612 70%)' }}>
      <div className="w-full max-w-md px-5 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <button onClick={onVoltar} className="text-gray-500 hover:text-white text-sm font-bold">← Sair</button>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full"
            style={{ background: 'rgba(255,216,58,0.12)', border: '1px solid rgba(255,216,58,0.3)' }}>
            <span className="w-4 h-4 rounded-full inline-block" style={{ background: '#ffd83a', boxShadow: '0 0 8px #ffd83a' }} />
            <span className="text-yellow-300 font-black">{moedas}</span>
          </div>
        </div>

        <h1 className="text-3xl font-black text-white mt-3" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.04em' }}>
          🏪 Loja do Chão é Lava
        </h1>
        <p className="text-gray-400 text-sm mb-5">Colete moedas durante a partida e compre melhorias.</p>

        {/* Itens */}
        <div className="space-y-3">
          {ITENS.map(item => {
            const adquirido = item.possui;
            const equipado  = item.equipado;
            const semGrana  = moedas < item.preco;
            return (
              <div key={item.id} className="rounded-2xl p-4 flex items-center gap-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${item.cor}33` }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                  style={{ background: `${item.cor}22`, border: `1px solid ${item.cor}55` }}>
                  {item.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-black">{item.nome}</p>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: `${item.cor}22`, color: item.cor }}>{item.tag}</span>
                  </div>
                  <p className="text-gray-400 text-xs mt-0.5 leading-snug">{item.desc}</p>
                </div>
                <div className="shrink-0">
                  {adquirido ? (
                    <span className="text-green-400 text-xs font-black px-3 py-2 rounded-xl"
                      style={{ background: 'rgba(34,197,94,0.1)' }}>✓ Adquirido</span>
                  ) : (
                    <button onClick={item.action}
                      className="px-3 py-2 rounded-xl text-sm font-black transition-all"
                      style={{
                        background: equipado ? 'rgba(34,197,94,0.15)'
                                  : semGrana ? 'rgba(255,255,255,0.06)' : item.cor,
                        color: equipado ? '#4ade80' : semGrana ? '#666' : '#fff',
                        border: equipado ? '1px solid #4ade8055' : 'none',
                      }}>
                      {equipado ? '✓ Equipado'
                        : <span className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full inline-block" style={{ background: '#ffd83a' }} />
                            {item.preco}
                          </span>}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {msg && <p className="text-red-400 text-sm text-center mt-3 font-bold">{msg}</p>}

        {/* Controles */}
        <div className="mt-5 rounded-2xl p-3 text-xs text-gray-400" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <p className="font-bold text-gray-300 mb-1">🎮 Controles</p>
          <p>Mover: ← → · Pular: ↑ / espaço · Espada: Z · Pistola: X · Raio: C</p>
          <p className="text-gray-500 mt-0.5">No celular use os botões na tela.</p>
        </div>

        {/* Jogar */}
        <button onClick={() => onJogar({ pistola, raio: temRaio, puloDuplo })}
          className="w-full mt-5 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-black text-lg rounded-2xl shadow-lg"
          style={{ boxShadow: '0 8px 28px rgba(255,80,0,0.4)' }}>
          🌋 Iniciar partida
        </button>
      </div>
    </div>
  );
}

// ─── Orquestrador ───────────────────────────────────────────────────────────
export default function ChaoELava() {
  const navigate = useNavigate();
  const { ganharXPMateria } = useAuth(); // eslint-disable-line no-unused-vars
  const [tema, setTema]   = useState(null);
  const [fase, setFase]   = useState('loja'); // loja | jogando
  const [itens, setItens] = useState({ pistola: false, raio: false, puloDuplo: false });

  useEffect(() => {
    setTema(localStorage.getItem('aletrai_topico_atual') || 'Conhecimentos Gerais');
  }, []);

  function iniciar(cfg) { setItens(cfg); setFase('jogando'); }
  function sairDoJogo() { navigate('/jogos'); }

  if (tema === null) return null;

  if (fase === 'loja') {
    return <Loja onJogar={iniciar} onVoltar={() => navigate('/jogos')} />;
  }

  return (
    <Game
      tema={tema}
      materia={null}
      modoIA={true}
      onSair={sairDoJogo}
      onLoja={() => setFase('loja')}
      pistola={itens.pistola}
      raio={itens.raio}
      puloDuplo={itens.puloDuplo}
    />
  );
}
