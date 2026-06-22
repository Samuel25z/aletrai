// api/claude.js — Proxy serverless (Vercel) para a Anthropic.
//
// A chave NUNCA vai para o navegador: fica na variável de ambiente
// ANTHROPIC_API_KEY, configurada no painel do Vercel (Settings → Environment Variables).
//
// O cliente chama POST /api/claude com { model, max_tokens, system?, messages }
// e recebe de volta a resposta da API de Mensagens da Anthropic.

const MODELOS_PERMITIDOS = new Set([
  'claude-haiku-4-5-20251001',
  'claude-haiku-4-5',
]);
const MAX_TOKENS_CAP = 2048;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: { message: 'Método não permitido' } });
    return;
  }

  // Mitigação básica de abuso: só aceita chamadas vindas do próprio site.
  const origin = req.headers.origin || '';
  const host   = req.headers.host || '';
  if (origin) {
    try {
      if (new URL(origin).host !== host) {
        res.status(403).json({ error: { message: 'Origem não autorizada' } });
        return;
      }
    } catch { /* origin malformado: ignora */ }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: { message: 'IA não configurada no servidor (defina ANTHROPIC_API_KEY no Vercel).' } });
    return;
  }

  // Body já vem parseado como objeto nas funções Node do Vercel.
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body && typeof body === 'object' ? body : {};

  const model      = MODELOS_PERMITIDOS.has(body.model) ? body.model : 'claude-haiku-4-5-20251001';
  const max_tokens = Math.min(Number(body.max_tokens) || 1024, MAX_TOKENS_CAP);
  const messages   = Array.isArray(body.messages) ? body.messages : [];
  const system     = typeof body.system === 'string' ? body.system : undefined;
  // temperature opcional (0–1) para dar variedade às perguntas geradas
  const temperature = body.temperature != null
    ? Math.max(0, Math.min(1, Number(body.temperature)))
    : undefined;

  if (messages.length === 0) {
    res.status(400).json({ error: { message: 'Nenhuma mensagem enviada.' } });
    return;
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model, max_tokens,
        ...(temperature != null ? { temperature } : {}),
        ...(system ? { system } : {}),
        messages,
      }),
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch {
    res.status(502).json({ error: { message: 'Falha ao contatar a IA.' } });
  }
};
