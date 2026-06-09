import React from 'react';
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
import Layout from './components/Layout';

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
          <Route path="/jogos/chao-e-lava"   element={<RotaPrivada><ChaoELava /></RotaPrivada>} />
          <Route path="/jogos/dungeon-quiz" element={<RotaPrivada><DungeonQuiz /></RotaPrivada>} />

          {/* Redireciona rotas antigas */}
          <Route path="/dashboard" element={<Navigate to="/jogos" />} />
          <Route path="/chat"      element={<Navigate to="/jogos" />} />
          <Route path="/desafios"  element={<Navigate to="/jogos" />} />
          <Route path="/evolucao"  element={<Navigate to="/conquistas" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
