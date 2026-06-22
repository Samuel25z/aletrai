// Banco de perguntas dos jogos.
// - Nunca repete uma pergunta já respondida CORRETAMENTE.
// - Reapresenta apenas as que o jogador ERROU, para reforço.
// - Quando o estoque acaba, pede mais à IA (informando o que já foi usado).
import { gerarPerguntasJogo } from './anthropic';
import { gerarConteudoJogo } from './mock';

function norm(t) {
  return (t || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function valida(p) {
  return p && p.pergunta && Array.isArray(p.opcoes) && p.opcoes.length === 4 &&
    typeof p.correta === 'number';
}

export function criarBanco(tema, materia, { lote = 12 } = {}) {
  let pool = [];             // perguntas novas disponíveis
  const usadas = new Set();  // enunciados já mostrados (normalizados)
  const erradas = [];        // perguntas erradas, aguardando reforço
  let carregando = null;     // fetch em andamento (evita chamadas duplicadas)
  let semIA = false;         // caiu no fallback offline (não gera infinito)
  let acertosSeguidos = 0;

  async function buscarMais() {
    if (carregando) return carregando;
    carregando = (async () => {
      let lista = await gerarPerguntasJogo(tema, materia, lote, [...usadas]);
      if (!lista || !lista.length) {
        const cont = await gerarConteudoJogo(tema, 'quiz');
        lista = cont?.perguntas || [];
        semIA = true;
      }
      for (const p of lista) {
        const k = norm(p.pergunta);
        if (valida(p) && k && !usadas.has(k) && !pool.some(q => norm(q.pergunta) === k)) {
          pool.push(p);
        }
      }
      carregando = null;
    })();
    return carregando;
  }

  return {
    async prefetch() { await buscarMais(); },

    // Retorna a próxima pergunta (objeto) ou null se nada disponível ainda.
    async proxima() {
      // reforço: reapresenta uma errada a cada 2 acertos
      if (erradas.length && acertosSeguidos >= 2) {
        acertosSeguidos = 0;
        const p = erradas.shift();
        erradas.push(p); // rotaciona para variar qual errada volta
        return { ...p, _reforco: true };
      }
      if (pool.length === 0 && !semIA) await buscarMais();
      if (pool.length === 0) {
        // sem novas: usa reforço se houver
        if (erradas.length) { const p = erradas.shift(); erradas.push(p); return { ...p, _reforco: true }; }
        return null;
      }
      const p = pool.shift();
      usadas.add(norm(p.pergunta));
      // pré-carrega o próximo lote antes de esgotar
      if (pool.length <= 3 && !semIA) buscarMais();
      return p;
    },

    // Registra o resultado para decidir reforço futuro.
    registrar(perg, acertou) {
      if (!perg) return;
      const k = norm(perg.pergunta);
      const idx = erradas.findIndex(e => norm(e.pergunta) === k);
      if (acertou) {
        acertosSeguidos++;
        if (idx >= 0) erradas.splice(idx, 1); // acertou o reforço → sai da fila
      } else {
        acertosSeguidos = 0;
        if (idx >= 0) erradas.splice(idx, 1);
        erradas.push({ pergunta: perg.pergunta, opcoes: perg.opcoes, correta: perg.correta, explicacao: perg.explicacao });
      }
    },
  };
}
