export async function gerarConteudoJogo(tema, tipoJogo) {
  // Simula delay da API
  await new Promise(r => setTimeout(r, 800));

  const mockData = {
    quiz: {
      perguntas: [
        { pergunta: `O que é ${tema}?`, opcoes: ['Um conceito antigo', 'Um processo moderno', 'Uma teoria científica', 'Uma disciplina'], correta: 2, explicacao: 'Excelente! Você acertou!' },
        { pergunta: `${tema} é mais relacionado a:`, opcoes: ['Ficção', 'Ciência', 'Magia', 'Superstição'], correta: 1, explicacao: 'Correto! É um conceito científico.' },
        { pergunta: `Qual é a importância de ${tema}?`, opcoes: ['Nenhuma', 'Mínima', 'Muito grande', 'Desconhecida'], correta: 2, explicacao: 'Sim! É muito importante estudar isso.' },
        { pergunta: `${tema} foi descoberto em que contexto?`, opcoes: ['Religioso', 'Artístico', 'Acadêmico', 'Acidental'], correta: 2, explicacao: 'No contexto acadêmico, através de pesquisa.' },
        { pergunta: `Como ${tema} é aplicado hoje?`, opcoes: ['Raramente', 'Ocasionalmente', 'Frequentemente', 'Nunca'], correta: 2, explicacao: 'É aplicado frequentemente em diversos campos!' },
      ]
    },
    memoria: {
      pares: [
        { termo: 'Definição', definicao: `Explicação do conceito de ${tema}` },
        { termo: 'Origem', definicao: 'Vem da pesquisa acadêmica' },
        { termo: 'Aplicação', definicao: 'Usado em diversas áreas' },
        { termo: 'Importância', definicao: 'Fundamental para entender o tema' },
        { termo: 'Prática', definicao: 'Pode ser aplicado na vida real' },
        { termo: 'Teoria', definicao: 'Base científica do conceito' },
        { termo: 'Evolução', definicao: 'Mudou e evoluiu com o tempo' },
        { termo: 'Relevância', definicao: 'Ainda é muito relevante hoje' },
      ]
    },
    verdadeirofalso: {
      afirmacoes: [
        { texto: `${tema} é um conceito importante na ciência.`, verdadeiro: true, explicacao: 'Verdadeiro! É estudado em universidades.' },
        { texto: `${tema} foi inventado há apenas 1 ano.`, verdadeiro: false, explicacao: 'Falso! Tem história bem mais antiga.' },
        { texto: `${tema} é usado em aplicações práticas.`, verdadeiro: true, explicacao: 'Sim! Tem muitas aplicações no dia a dia.' },
        { texto: `Ninguém entende ${tema}.`, verdadeiro: false, explicacao: 'Falso! Milhões de pessoas estudam e entendem.' },
        { texto: `${tema} é relevante no século 21.`, verdadeiro: true, explicacao: 'Absolutamente! Ainda é muito importante.' },
        { texto: `Estudar ${tema} é perda de tempo.`, verdadeiro: false, explicacao: 'Falso! É investimento no conhecimento.' },
      ]
    },
    forca: {
      palavras: [
        { palavra: 'CIENCIA', dica: `Área de estudo de ${tema}`, categoria: tema },
        { palavra: 'CONHECIMENTO', dica: 'O que você ganha estudando', categoria: tema },
        { palavra: 'APRENDIZADO', dica: 'Processo contínuo', categoria: tema },
        { palavra: 'PESQUISA', dica: 'Como se descobre coisas novas', categoria: tema },
        { palavra: 'ESTUDO', dica: 'Atividade principal aqui', categoria: tema },
      ]
    },
    cacacalavras: {
      palavras: [
        { palavra: 'CONCEITO', descricao: 'Ideia central sobre o tema' },
        { palavra: 'TEORIA', descricao: 'Explicação científica' },
        { palavra: 'PRATICA', descricao: 'Aplicação real' },
        { palavra: 'METODO', descricao: 'Forma de estudo' },
        { palavra: 'RESULTADO', descricao: 'O que se obtém' },
        { palavra: 'PROCESSO', descricao: 'Sequência de passos' },
        { palavra: 'OBJETIVO', descricao: 'Meta a alcançar' },
        { palavra: 'SUCESSO', descricao: 'Resultado positivo' },
      ]
    },
    gol: {
      perguntas: [
        { pergunta: `${tema} é importante para a ciência.`, verdadeiro: true },
        { pergunta: `${tema} foi inventado no século passado.`, verdadeiro: false },
        { pergunta: `${tema} é estudado em escolas e universidades.`, verdadeiro: true },
        { pergunta: `${tema} não tem aplicações práticas.`, verdadeiro: false },
        { pergunta: `Compreender ${tema} é útil.`, verdadeiro: true },
        { pergunta: `${tema} é mais ficção que realidade.`, verdadeiro: false },
        { pergunta: `${tema} continua sendo relevante hoje.`, verdadeiro: true },
        { pergunta: `Ninguém mais se interessa em ${tema}.`, verdadeiro: false },
      ]
    },
    puzzle: {
      pecas: [
        { pergunta: `Qual é a definição básica de ${tema}?`, resposta: 'conceito importante', dica: 'É algo relevante' },
        { pergunta: `${tema} está relacionado a quantas áreas?`, resposta: 'várias', dica: 'Mais de uma' },
        { pergunta: `Como você estuda ${tema}?`, resposta: 'pesquisando', dica: 'Atividade acadêmica' },
        { pergunta: `${tema} é um termo recente ou antigo?`, resposta: 'antigo', dica: 'Tem história' },
        { pergunta: `Qual é a principal aplicação de ${tema}?`, resposta: 'educacao', dica: 'Sistema de ensino' },
      ]
    },
    pinball: {
      perguntas: [
        { texto: `${tema} é importante.`, verdadeiro: true },
        { texto: `${tema} é fácil de entender à primeira vista.`, verdadeiro: false },
        { texto: `Especialistas estudam ${tema}.`, verdadeiro: true },
        { texto: `${tema} não tem valor prático.`, verdadeiro: false },
        { texto: `${tema} é ensinado nas escolas.`, verdadeiro: true },
        { texto: `${tema} é um conceito moderno.`, verdadeiro: false },
        { texto: `Pode-se aprender ${tema} de forma divertida.`, verdadeiro: true },
        { texto: `${tema} é completamente inútil.`, verdadeiro: false },
        { texto: `Entender ${tema} abre novas perspectivas.`, verdadeiro: true },
        { texto: `${tema} é um assunto entediante.`, verdadeiro: false },
      ]
    }
  };

  return mockData[tipoJogo] || null;
}