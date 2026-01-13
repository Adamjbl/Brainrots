
export interface Character {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  tags: string[];
  rarity: 'Common' | 'Rare' | 'Legendary';
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
