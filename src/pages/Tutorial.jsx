import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const passos = [
  {
    emoji: '👋',
    titulo: (nome) => `Olá, ${nome}! Bem-vindo ao AletrAI`,
    descricao: 'Você acaba de entrar na plataforma que transforma qualquer conteúdo em mini-jogos educativos usando Inteligência Artificial. Vamos te mostrar como funciona!',
    cor: 'from-violet-600 to-purple-500',
    destaque: null,
  },
  {
    emoji: '⚡',
    titulo: () => 'Central de Desafios',
    descricao: 'Digite qualquer tema, fale pelo microfone ou cole um texto do seu professor. Em segundos, a IA transforma tudo em quizzes, jogos da memória e desafios interativos.',
    cor: 'from-violet-700 to-indigo-500',
    destaque: { icone: '🎮', texto: 'Quiz sobre "Fotossíntese" gerado em 3 segundos!' },
  },
  {
    emoji: '📈',
    titulo: () => 'Progresso Adaptativo',
    descricao: 'A IA monitora seus erros e acertos e ajusta a dificuldade automaticamente. Se você errar muito em Frações, ela vai focar nisso até você dominar!',
    cor: 'from-purple-600 to-violet-500',
    destaque: { icone: '🎯', texto: 'Dificuldade ajustada automaticamente para você' },
  },
  {
    emoji: '🏆',
    titulo: () => 'XP, Níveis e Conquistas',
    descricao: 'Cada desafio concluído dá XP e sobe seu nível. Complete missões diárias, desbloqueie medalhas e mantenha sua sequência de dias estudando!',
    cor: 'from-violet-600 to-pink-500',
    destaque: { icone: '🔥', texto: '+50 XP ganhos! Subiu para o Nível 2!' },
  },
  {
    emoji: '🎨',
    titulo: () => 'Personalize sua experiência',
    descricao: 'Escolha seu avatar, ajuste o tamanho da fonte e ative o modo de alto contraste. O AletrAI foi feito para todos — crianças, jovens e adultos.',
    cor: 'from-indigo-600 to-violet-500',
    destaque: { icone: '✨', texto: 'Temas e cores personalizáveis em breve!' },
  },
];

export default function Tutorial() {
  const [passo, setPasso] = useState(0);
  const [saindo, setSaindo] = useState(false);
  const { usuario, atualizarUsuario } = useAuth();
  const navigate = useNavigate();

  function avancar() {
    if (passo < passos.length - 1) setPasso(p => p + 1);
    else finalizar();
  }

  function finalizar() {
    setSaindo(true);
    atualizarUsuario({ primeiroAcesso: false });
    setTimeout(() => navigate('/dashboard'), 500);
  }

  const p = passos[passo];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex gap-2 mb-8 justify-center">
          {passos.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-500 ${
                i === passo ? 'w-8 bg-violet-600' : i < passo ? 'w-2 bg-violet-400' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>

        <div className={`transition-all duration-300 ${saindo ? 'opacity-0 translate-y-4' : 'opacity-100'}`}>
          <div className={`bg-gradient-to-br ${p.cor} rounded-3xl p-8 text-center mb-6 shadow-2xl shadow-violet-200`}>
            <div className="text-7xl mb-4 animate-bounce">{p.emoji}</div>
            <h2 className="text-2xl font-bold text-white mb-3">
              {p.titulo(usuario?.nome?.split(' ')[0] || 'Estudante')}
            </h2>
            <p className="text-white/80 text-base leading-relaxed">{p.descricao}</p>

            {p.destaque && (
              <div className="mt-6 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-5 py-3 flex items-center gap-3 text-left">
                <span className="text-2xl">{p.destaque.icone}</span>
                <span className="text-white text-sm font-medium">{p.destaque.texto}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {passo > 0 && (
              <button
                onClick={() => setPasso(p => p - 1)}
                className="flex-1 py-3 border-2 border-violet-200 text-violet-600 font-semibold rounded-xl hover:bg-violet-50 transition-colors"
              >
                ← Voltar
              </button>
            )}
            <button
              onClick={avancar}
              className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-200"
            >
              {passo < passos.length - 1 ? 'Próximo →' : '🚀 Começar a aprender!'}
            </button>
          </div>

          {passo < passos.length - 1 && (
            <button onClick={finalizar} className="w-full text-center text-gray-400 text-sm mt-4 hover:text-gray-600 transition-colors">
              Pular tutorial
            </button>
          )}
        </div>
      </div>
    </div>
  );
}