export async function gerarConteudoJogo(tema, tipoJogo) {

  const prompts = {
    quiz: `Gere 5 perguntas de múltipla escolha sobre "${tema}". 
      Responda APENAS com JSON válido neste formato:
      {"perguntas":[{"pergunta":"texto","opcoes":["A","B","C","D"],"correta":0,"explicacao":"texto"}]}`,

    memoria: `Gere 8 pares de conceitos relacionados sobre "${tema}".
      Responda APENAS com JSON válido neste formato:
      {"pares":[{"termo":"palavra ou conceito curto","definicao":"definição curta"}]}`,

    verdadeirofalso: `Gere 6 afirmações sobre "${tema}", metade verdadeiras e metade falsas.
      Responda APENAS com JSON válido neste formato:
      {"afirmacoes":[{"texto":"afirmação","verdadeiro":true,"explicacao":"texto"}]}`,

    forca: `Gere 5 palavras-chave relacionadas a "${tema}" com dicas para o jogo da forca.
      Responda APENAS com JSON válido neste formato:
      {"palavras":[{"palavra":"PALAVRA","dica":"dica","categoria":"${tema}"}]}`,

    cacacalavras: `Gere 8 palavras-chave sobre "${tema}" para um caça-palavras.
      Responda APENAS com JSON válido neste formato:
      {"palavras":[{"palavra":"PALAVRA","descricao":"descrição"}]}`,

    gol: `Gere 8 questões V ou F sobre "${tema}" para um jogo de penalti.
      Responda APENAS com JSON válido neste formato:
      {"perguntas":[{"pergunta":"texto","verdadeiro":true}]}`,

    puzzle: `Gere 5 perguntas sobre "${tema}" com respostas curtas.
      Responda APENAS com JSON válido neste formato:
      {"pecas":[{"pergunta":"texto","resposta":"resposta","dica":"dica"}]}`,

    pinball: `Gere 10 perguntas V ou F curtas sobre "${tema}".
      Responda APENAS com JSON válido neste formato:
      {"perguntas":[{"texto":"afirmação","verdadeiro":true}]}`,
  };

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompts[tipoJogo] }],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const erro = await response.json();
      throw new Error(`OpenAI error: ${erro.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const text = data.choices[0].message.content;
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return null;
  }
}