
export interface Character {
  id: string;
  name: string;
  description: string;
  story: string;
  imageUrl: string;
  tags: string[];
  rarity: 'Common' | 'Rare' | 'Legendary';
  // Classification attributes
  species: 'Humanoïde' | 'Animal' | 'Hybride' | 'Objet' | 'Créature';
  element: 'Feu' | 'Eau' | 'Air' | 'Terre' | 'Cosmique' | 'Sonore' | 'Café';
  alignment: 'Gentil' | 'Neutre' | 'Chaotique' | 'Maléfique';
  size: 'Petit' | 'Moyen' | 'Grand' | 'Géant';
  origin: string;
  power: string;
  weakness: string;
}

export type GamePhase = 'PICKING' | 'TRANSITION' | 'GUESSING' | 'GAMEOVER';

export interface GameState {
  phase: GamePhase;
  targetCharacter: Character | null;
  eliminatedIds: string[];
  attempts: number;
  hints: string[];
  score: number;
}
