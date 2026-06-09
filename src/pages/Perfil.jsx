import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const avatares = ['🎓','🚀','🦊','🐉','🧠','⚡','🌟','🎮','🐺','🦁'];

export default function Perfil() {
  const { usuario, atualizarUsuario, logout } = useAuth();
  const navigate = useNavigate();
  const [fonteGrande, setFonteGrande] = useState(false);
  const [altoContraste, setAltoContraste] = useState(false);
  const [lembretes, setLembretes] = useState(true);
  const [voz, setVoz] = useState(true);
  const [confirmandoLogout, setConfirmandoLogout] = useState(false);

  function sair() {
    logout();
    navigate('/login');
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-5">
      <div className="bg-gradient-to-br from-violet-700 to-purple-500 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 border-2 border-white/30 rounded-full flex items-center justify-center text-4xl">
            {usuario.avatar}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{usuario.nome}</h2>
            <p className="text-violet-200 text-sm">Nível {usuario.nivel} • {usuario.desafiosConcluidos} desafios</p>
            <p className="text-violet-300 text-xs mt-0.5">Membro desde {usuario.criadoEm}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-gray-900 mb-3">Escolha seu avatar</h3>
        <div className="flex flex-wrap gap-2">
          {avatares.map(av => (
            <button
              key={av}
              onClick={() => atualizarUsuario({ avatar: av })}
              className={`w-12 h-12 rounded-2xl text-2xl flex items-center justify-center transition-all border-2 ${
                usuario.avatar === av ? 'border-violet-500 bg-violet-50 scale-110' : 'border-gray-200 bg-white hover:border-violet-300 hover:scale-105'
              }`}
            >
              {av}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-2xl p-4 flex gap-3">
        <span className="text-2xl flex-shrink-0">🎨</span>
        <div>
          <p className="font-semibold text-violet-900 text-sm">Personalização em breve!</p>
          <p className="text-violet-600 text-xs mt-0.5">Cores de fundo, temas, fontes e muito mais. Sua plataforma, do seu jeito.</p>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-gray-900 mb-3">Acessibilidade</h3>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
          {[
            { ic: '🔠', label: 'Fonte grande', val: fonteGrande, set: setFonteGrande },
            { ic: '🔆', label: 'Alto contraste', val: altoContraste, set: setAltoContraste },
            { ic: '🎤', label: 'Comandos por voz', val: voz, set: setVoz },
            { ic: '🔔', label: 'Lembretes diários', val: lembretes, set: setLembretes },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-medium text-gray-800 flex items-center gap-2">
                <span>{item.ic}</span> {item.label}
              </span>
              <button
                onClick={() => item.set(v => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${item.val ? 'bg-violet-500' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${item.val ? 'left-5' : 'left-0.5'}`}></div>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-gray-900 mb-3">Conta</h3>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
          <div className="px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-gray-600">E-mail</span>
            <span className="text-sm font-medium text-gray-900">{usuario.email}</span>
          </div>
          <div className="px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-gray-600">Nome</span>
            <span className="text-sm font-medium text-gray-900">{usuario.nome}</span>
          </div>
        </div>
      </div>

      {!confirmandoLogout ? (
        <button
          onClick={() => setConfirmandoLogout(true)}
          className="w-full py-3 border-2 border-red-200 text-red-500 font-semibold rounded-xl hover:bg-red-50 transition-colors"
        >
          Sair da conta
        </button>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3">
          <p className="text-center text-sm font-medium text-red-800">Tem certeza que quer sair?</p>
          <div className="flex gap-2">
            <button onClick={() => setConfirmandoLogout(false)} className="flex-1 py-2 border-2 border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm">
              Cancelar
            </button>
            <button onClick={sair} className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors text-sm">
              Confirmar saída
            </button>
          </div>
        </div>
      )}
    </div>
  );
}