import { Character } from '../types';
import { D3TreeNode } from '../types.d3';
import { TreeMode, getColorMapForMode } from './colorMaps';

const getFamilyGroup = (char: Character): string => {
  if (char.element === 'Café' || char.tags.includes('Café')) return 'Famille Café';
  if (char.tags.includes('Crocodile') || char.name.includes('CROCODIL')) return 'Famille Crocodile';
  if (char.element === 'Sonore' || char.tags.includes('Musique') || char.tags.includes('Chant')) return 'Famille Sonore';
  if (char.element === 'Cosmique' || char.tags.includes('Espace') || char.tags.includes('Ciel')) return 'Famille Cosmique';
  if (char.alignment === 'Chaotique' || char.tags.includes('Chaos') || char.tags.includes('Explosion')) return 'Famille Chaos';
  return 'Autres';
};

const getGroupKey = (char: Character, mode: TreeMode): string => {
  switch (mode) {
    case 'species': return char.species;
    case 'element': return char.element;
    case 'alignment': return char.alignment;
    case 'rarity': return char.rarity;
    case 'size': return char.size;
    case 'family': return getFamilyGroup(char);
  }
};

export const buildTreeData = (characters: Character[], mode: TreeMode): D3TreeNode => {
  const colorMap = getColorMapForMode(mode);
  const groups: Record<string, Character[]> = {};

  // Group characters by mode
  characters.forEach(c => {
    const key = getGroupKey(c, mode);
    if (!groups[key]) groups[key] = [];
    groups[key].push(c);
  });

  // Build tree structure
  const root: D3TreeNode = {
    name: 'BRAINROT',
    color: '#ffffff',
    category: 'root',
    children: Object.entries(groups).map(([groupName, chars]) => ({
      name: groupName,
      color: colorMap[groupName] || '#6b7280',
      category: 'group',
      children: chars.map(c => ({
        name: c.name,
        color: colorMap[groupName] || '#6b7280',
        character: c,
        category: 'leaf',
        children: []
      }))
    }))
  };

  return root;
};
