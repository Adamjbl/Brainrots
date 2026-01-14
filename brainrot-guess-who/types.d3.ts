import { Character } from './types';

export interface D3TreeNode {
  name: string;
  character?: Character;
  color: string;
  category: 'root' | 'group' | 'leaf';
  children?: D3TreeNode[];
}
