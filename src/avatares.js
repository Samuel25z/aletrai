// Avatares do AletrAI — imagens em /public/avatares.
export const AVATARES = [
  { id: 'maga',      label: 'Maga',      src: '/avatares/maga.png'      },
  { id: 'cientista', label: 'Cientista', src: '/avatares/cientista.png' },
  { id: 'cowboy',    label: 'Cowboy',    src: '/avatares/cowboy.png'    },
  { id: 'ladra',     label: 'Ladra',     src: '/avatares/ladra.png'     },
];

export const AVATAR_PADRAO = 'maga';

// Retorna o caminho da imagem do avatar, ou null se o id não for conhecido
// (ex.: avatares antigos ou emoji salvos em contas já existentes).
export function getAvatarSrc(id) {
  const a = AVATARES.find(av => av.id === id);
  return a ? a.src : null;
}
