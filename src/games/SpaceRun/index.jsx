import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Game from './Game';

export default function SpaceRun() {
  const navigate = useNavigate();
  const { ganharXP } = useAuth();
  const [tema, setTema] = useState(null);

  useEffect(() => {
    setTema(localStorage.getItem('aletrai_topico_atual') || 'Conhecimentos Gerais');
  }, []);

  function sairDoJogo(resultado) {
    if (resultado?.xpGanho) ganharXP(resultado.xpGanho);
    navigate('/jogos');
  }

  if (tema === null) return null;

  return <Game tema={tema} materia={null} onSair={sairDoJogo} />;
}
