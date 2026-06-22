import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Tutorial from './pages/Tutorial';
import Conquistas from './pages/Conquistas';
import Perfil from './pages/Perfil';
import Jogos from './pages/Jogos';
import BossBattle from './pages/BossBattle';
import ChaoELava   from './games/ChaoELava/index';
import DungeonQuiz from './games/DungeonQuiz/index';
import SpaceRun    from './games/SpaceRun/index';
import CobraSaber  from './games/CobraSaber/index';
import LobbyJogo from './pages/LobbyJogo';
import Layout from './components/Layout';

function AcessibilidadeBootstrap() {
  useEffect(() => {
    if (localStorage.getItem('aletrai_fonte_grande') === 'true')
      document.documentElement.classList.add('fonte-grande');

    if (localStorage.getItem('aletrai_alto_contraste') === 'true')
      document.documentElement.classList.add('alto-contraste');

    if (
      'Notification' in window &&
      localStorage.getItem('aletrai_lembretes') === 'true' &&
      Notification.permission === 'granted'
    ) {
      const ultimo = parseInt(localStorage.getItem('aletrai_ultimo_lembrete') || '0');
      if (Date.now() - ultimo > 24 * 60 * 60 * 1000) {
        new Notification('AletrAI 🎮', {
          body: 'Hora de estudar! Seus jogos estão esperando.',
          icon: '/favicon.ico',
        });
        localStorage.setItem('aletrai_ultimo_lembrete', String(Date.now()));
      }
    }
  }, []);
  return null;
}

function RotaPrivada({ children }) {
  const { usuario } = useAuth();
  return usuario ? children : <Navigate to="/login" />;
}

function RotaPublica({ children }) {
  const { usuario } = useAuth();
  return !usuario ? children : <Navigate to="/jogos" />;
}

export default function App() {
  return (
    <AuthProvider>
      <AcessibilidadeBootstrap />
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/jogos" />} />
          <Route path="/login"    element={<RotaPublica><Login /></RotaPublica>} />
          <Route path="/cadastro" element={<RotaPublica><Cadastro /></RotaPublica>} />
          <Route path="/tutorial" element={<RotaPrivada><Tutorial /></RotaPrivada>} />

          <Route path="/jogos"           element={<RotaPrivada><Layout><Jogos /></Layout></RotaPrivada>} />
          <Route path="/conquistas"      element={<RotaPrivada><Layout><Conquistas /></Layout></RotaPrivada>} />
          <Route path="/perfil"          element={<RotaPrivada><Layout><Perfil /></Layout></RotaPrivada>} />
          <Route path="/boss"            element={<RotaPrivada><BossBattle /></RotaPrivada>} />
          <Route path="/lobby/:jogoId"        element={<RotaPrivada><LobbyJogo /></RotaPrivada>} />
          <Route path="/jogos/chao-e-lava"  element={<RotaPrivada><ChaoELava /></RotaPrivada>} />
          <Route path="/jogos/dungeon-quiz" element={<RotaPrivada><DungeonQuiz /></RotaPrivada>} />
          <Route path="/jogos/space-run"    element={<RotaPrivada><SpaceRun /></RotaPrivada>} />
          <Route path="/jogos/cobra-saber"  element={<RotaPrivada><CobraSaber /></RotaPrivada>} />

          <Route path="/dashboard" element={<Navigate to="/jogos" />} />
          <Route path="/chat"      element={<Navigate to="/jogos" />} />
          <Route path="/desafios"  element={<Navigate to="/jogos" />} />
          <Route path="/evolucao"  element={<Navigate to="/conquistas" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
