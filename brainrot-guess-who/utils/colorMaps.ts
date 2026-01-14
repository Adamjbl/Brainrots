export type TreeMode = 'family' | 'species' | 'element' | 'alignment' | 'rarity' | 'size';

export const elementColors: Record<string, string> = {
  'Feu': '#f97316',
  'Eau': '#3b82f6',
  'Air': '#22d3ee',
  'Terre': '#b45309',
  'Cosmique': '#a855f7',
  'Sonore': '#ec4899',
  'Café': '#78350f'
};

export const speciesColors: Record<string, string> = {
  'Humanoïde': '#10b981',
  'Animal': '#f59e0b',
  'Hybride': '#8b5cf6',
  'Objet': '#6b7280',
  'Créature': '#ef4444'
};

export const alignmentColors: Record<string, string> = {
  'Gentil': '#22c55e',
  'Neutre': '#a3a3a3',
  'Chaotique': '#f59e0b',
  'Maléfique': '#dc2626'
};

export const familyColors: Record<string, string> = {
  'Famille Café': '#78350f',
  'Famille Crocodile': '#22c55e',
  'Famille Sonore': '#ec4899',
  'Famille Cosmique': '#a855f7',
  'Famille Chaos': '#f97316',
  'Autres': '#6b7280'
};

export const rarityColors: Record<string, string> = {
  'Legendary': '#eab308',
  'Rare': '#a855f7',
  'Common': '#6b7280'
};

export const sizeColors: Record<string, string> = {
  'Petit': '#22d3ee',
  'Moyen': '#10b981',
  'Grand': '#f59e0b',
  'Géant': '#dc2626'
};

export const getColorMapForMode = (mode: TreeMode): Record<string, string> => {
  switch (mode) {
    case 'species': return speciesColors;
    case 'element': return elementColors;
    case 'alignment': return alignmentColors;
    case 'family': return familyColors;
    case 'rarity': return rarityColors;
    case 'size': return sizeColors;
  }
};
