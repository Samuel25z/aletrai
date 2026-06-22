// Serviço Claude — AletrAI
// Por padrão as chamadas passam pelo proxy serverless /api/claude (chave no servidor).
// Se o usuário configurar a própria chave em Perfil, ela é usada direto (modo de teste).

const API_URL = '/api/claude';
const DIRECT_URL = 'https://api.anthropic.com/v1/messages';

export function getApiKey() {
  return localStorage.getItem('aletrai_claude_key') || '';
}

async function chamarClaude(body) {
  const apiKey = getApiKey();
  if (apiKey) {
    return fetch(DIRECT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify(body),
    });
  }
  return fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const SYSTEM_PROMPT = `Você é o AletrAI — tutor de estudos gamificado para estudantes brasileiros.

## SEU ESTILO
- Direto ao ponto, linguagem do dia a dia brasileiro
- Analogias criativas com exemplos que o aluno conhece
- Respostas curtas e densas, sem enrolação
- Explique, não interrogue — o aluno joga para praticar (fora do chat)

## COMO ENSINAR
1. Explique o conceito de forma clara e divertida
2. Dê um exemplo concreto do cotidiano
3. Destaque os pontos que mais caem em prova / mais confundem
4. Se o aluno errou algo, explique por que a resposta errada estava errada

## SOBRE OS JOGOS
O AletrAI tem jogos como "Chão é Lava" — um platformer roguelike onde o aluno responde perguntas em batalhas de boss.
Quando fizer sentido, mencione: "Pratique isso no Chão é Lava! 🎮"
Mas NÃO emita marcadores de jogo no chat — os jogos ficam na seção de jogos.

## REGRAS
- Máximo 1 pergunta por mensagem ao aluno
- Nunca diga "quer que eu explique mais?" sem já ter explicado
- Use **negrito** para termos importantes
- Listas com • para conceitos paralelos
- Seja encorajador sem ser falso`;


export async function enviarMensagem(mensagens, onChunk) {
  const response = await chamarClaude({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: mensagens.map(m => ({ role: m.role, content: m.content })),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Erro ${response.status}`);
  }

  const data = await response.json();
  const texto = data.content?.[0]?.text || '';
  onChunk?.(texto, texto);
  return texto;
}

export function perguntasIniciais(materia) {
  return `Fala! Eu sou o **AletrAI** — seu tutor de **${materia}** 🧠

Aqui você aprende conversando e praticando com jogos reais.

👇 Me conta **qual assunto de ${materia}** você quer dominar hoje?`;
}

// ─── Geração de perguntas para os jogos (via Claude API) ─────────────────────
// evitar: array de enunciados já usados, para a IA NÃO repetir.
export async function gerarPerguntasJogo(tema, materia, quantidade = 12, evitar = []) {
  const nonce = Math.random().toString(36).slice(2, 8); // semente p/ variar a cada chamada
  const blocoEvitar = evitar.length
    ? `\n\nJÁ FORAM USADAS estas perguntas — gere perguntas DIFERENTES (outros ângulos, subtemas e fatos), NÃO repita nenhuma delas:\n- ${evitar.slice(-40).join('\n- ')}`
    : '';

  const prompt = `Você é um professor especialista em "${materia}". Pense profundamente sobre o tema "${tema}" e crie ${quantidade} perguntas de múltipla escolha realmente boas.

Antes de escrever, explore mentalmente o tema em vários ângulos: definições, causas e consequências, exemplos do cotidiano, datas/dados, comparações, aplicações práticas, erros comuns e pegadinhas. Cubra SUBTÓPICOS DIFERENTES — nada de várias perguntas sobre o mesmo detalhe.

Responda SOMENTE com JSON válido — sem texto antes ou depois, sem markdown. Formato exato:
[
  {
    "pergunta": "texto da pergunta aqui?",
    "opcoes": ["opção A", "opção B", "opção C", "opção D"],
    "correta": 0,
    "explicacao": "frase curta explicando por que a correta está certa"
  }
]

Regras:
- Profundidade real sobre ${tema}: nada de perguntas genéricas tipo "o que é X?" repetidas
- Cada pergunta aborda um aspecto DIFERENTE do tema (sem redundância entre elas)
- 4 opções plausíveis por pergunta, apenas 1 correta; distratores que façam pensar
- "correta" é o índice 0-3 da opção certa (varie a posição da correta)
- Dificuldade progressiva: ~40% fáceis, ~40% médias, ~20% difíceis
- Linguagem acessível para estudantes brasileiros
- NÃO use markdown no JSON
- Semente de variação: ${nonce}${blocoEvitar}`;

  try {
    const response = await chamarClaude({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      temperature: 1,
      messages: [{ role: 'user', content: prompt }],
    });

    if (!response.ok) return null;

    const data = await response.json();
    const texto = data.content?.[0]?.text || '';

    // Extrai o JSON mesmo se vier com algo extra
    const jsonMatch = texto.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return null;

    const perguntas = JSON.parse(jsonMatch[0]);
    // Valida estrutura mínima
    if (!Array.isArray(perguntas) || perguntas.length === 0) return null;

    return perguntas.filter(p =>
      p.pergunta && Array.isArray(p.opcoes) && p.opcoes.length === 4 &&
      typeof p.correta === 'number'
    );
  } catch {
    return null;
  }
}
