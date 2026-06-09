/**
 * Jogos Inline — AletrAI
 * Cada jogo fica em seu próprio arquivo para edição independente.
 * Para adicionar um novo jogo: crie o componente e adicione o parser aqui.
 */

import QuizInline from './QuizInline';
import VFInline from './VFInline';
import LacunaInline from './LacunaInline';
import OrdemInline from './OrdemInline';
import AssociarInline from './AssociarInline';

export { QuizInline, VFInline, LacunaInline, OrdemInline, AssociarInline };

// ─── Parser de marcadores ────────────────────────────────────────────────────
// Extrai todos os blocos de jogo de um texto de IA

const REGEX_JOGO = /\[(QUIZ|VF|LACUNA|ORDEM|ASSOCIAR)\|([^\]]+)\]/g;

/**
 * Divide o texto em blocos: texto puro e blocos de jogo
 * Retorna: Array de { type: 'text' | 'game', content, gameData }
 */
export function parsearBlocos(texto) {
  const blocos = [];
  let ultimo = 0;
  let match;

  REGEX_JOGO.lastIndex = 0;

  while ((match = REGEX_JOGO.exec(texto)) !== null) {
    // Texto antes do jogo
    if (match.index > ultimo) {
      const t = texto.slice(ultimo, match.index).trim();
      if (t) blocos.push({ type: 'text', content: t });
    }

    // Bloco do jogo
    const tipo = match[1];
    const campos = match[2].split('|');
    const gameData = parsearJogo(tipo, campos);
    if (gameData) blocos.push({ type: 'game', gameType: tipo, gameData, raw: match[0] });

    ultimo = match.index + match[0].length;
  }

  // Texto restante
  const resto = texto.slice(ultimo).trim();
  if (resto) blocos.push({ type: 'text', content: resto });

  return blocos;
}

function parsearJogo(tipo, campos) {
  try {
    switch (tipo) {
      case 'QUIZ':
        // [QUIZ|Pergunta|OpA|OpB|OpC|OpD|indiceCorreto]
        return {
          pergunta: campos[0],
          opcoes: campos.slice(1, 5),
          correta: parseInt(campos[5], 10),
        };
      case 'VF':
        // [VF|Afirmação|true/false]
        return {
          afirmacao: campos[0],
          resposta: campos[1]?.trim().toLowerCase() === 'true',
        };
      case 'LACUNA':
        // [LACUNA|texto com ___ para preencher|resposta]
        return {
          texto: campos[0],
          resposta: campos[1],
        };
      case 'ORDEM':
        // [ORDEM|item1|item2|item3|item4]
        return {
          itens: campos,
        };
      case 'ASSOCIAR':
        // [ASSOCIAR|Termo1|Def1|Termo2|Def2|...]
        const pares = [];
        for (let i = 0; i < campos.length - 1; i += 2) {
          pares.push({ termo: campos[i], definicao: campos[i + 1] });
        }
        return { pares };
      default:
        return null;
    }
  } catch {
    return null;
  }
}

/** Verifica se um texto contém algum marcador de jogo */
export function temJogos(texto) {
  REGEX_JOGO.lastIndex = 0;
  return REGEX_JOGO.test(texto);
}
