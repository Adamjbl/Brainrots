
import React from 'react';
import { Character } from '../types';

interface CharacterCardProps {
  character: Character;
  isEliminated: boolean;
  onToggleEliminate: (id: string) => void;
  onGuess: (character: Character) => void;
  disabled: boolean;
}

const elementColors: Record<string, string> = {
  'Feu': 'bg-orange-500',
  'Eau': 'bg-blue-500',
  'Air': 'bg-cyan-400',
  'Terre': 'bg-amber-700',
  'Cosmique': 'bg-purple-500',
  'Sonore': 'bg-pink-500',
  'Café': 'bg-amber-900'
};

const alignmentEmoji: Record<string, string> = {
  'Gentil': '😇',
  'Neutre': '😐',
  'Chaotique': '🤪',
  'Maléfique': '😈'
};

const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  isEliminated,
  onToggleEliminate,
  onGuess,
  disabled
}) => {
  return (
    <div
      className={`relative group transition-all duration-300 card-shake ${
        isEliminated ? 'opacity-20 grayscale-0 scale-90 translate-y-4 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      <div className={`bg-white/5 rounded-[1.5rem] overflow-hidden transition-all duration-300 border-4 ${
        isEliminated ? 'border-transparent' : 'border-white/10 hover:border-white group-hover:shadow-[0_20px_50px_rgba(255,255,255,0.1)]'
      }`}>
        <div className="relative aspect-square overflow-hidden bg-zinc-900">
          <img
            src={character.imageUrl}
            alt={character.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125 group-hover:rotate-3"
          />

          {/* Overlay info */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
             <button
               onClick={() => !disabled && onGuess(character)}
               className="bg-white text-black font-impact italic py-3 rounded-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
             >
               C'EST LUI !
             </button>
          </div>

          {/* Top badges row */}
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
            <div className="bg-black/80 backdrop-blur-md px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter">
              {character.rarity}
            </div>
            <div className="flex gap-1">
              <div className={`${elementColors[character.element] || 'bg-gray-500'} px-2 py-1 rounded text-[9px] font-black uppercase text-white`}>
                {character.element}
              </div>
            </div>
          </div>

          {/* Bottom left species badge */}
          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-2 py-1 rounded text-[9px] font-bold text-white/80">
            {character.species} {alignmentEmoji[character.alignment]}
          </div>
        </div>

        <div className="p-3 bg-zinc-900/50">
          <h3 className="font-impact text-xs italic uppercase truncate mb-1">{character.name}</h3>
          <div className="flex flex-wrap gap-1 mb-2">
            {character.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[8px] font-bold text-white/40 uppercase">
                #{tag}
              </span>
            ))}
          </div>
          <div className="text-[8px] text-white/30 flex justify-between">
            <span>{character.size}</span>
            <span className="truncate max-w-[60%]">{character.origin.split('/')[0]}</span>
          </div>
        </div>
      </div>

      {!isEliminated && (
        <button
          onClick={() => onToggleEliminate(character.id)}
          className="absolute -top-3 -right-3 w-10 h-10 bg-red-600 rounded-full border-4 border-black flex items-center justify-center text-white font-black hover:bg-white hover:text-black transition-colors z-20 shadow-lg"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default CharacterCard;
