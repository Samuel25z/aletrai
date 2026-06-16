import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Game from './Game';

export default function DungeonQuiz() {
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const topico = localStorage.getItem('aletrai_topico_atual') || 'Conhecimentos Gerais';
    setConfig({ materia: null, tema: topico, modoIA: true });
  }, []);

  function sairDoJogo(resultado) {
    navigate('/jogos');
  }

  if (!config) return null;

  return <Game tema={config.tema} materia={config.materia} modoIA={config.modoIA} onSair={sairDoJogo} />;
}
