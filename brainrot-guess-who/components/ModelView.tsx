
import React, { useState } from 'react';
import { Character } from '../types';
import { useD3Tree } from '../hooks/useD3Tree';
import { TreeMode, getColorMapForMode, speciesColors, elementColors, alignmentColors } from '../utils/colorMaps';

interface ModelViewProps {
  characters: Character[];
  onClose: () => void;
}

const ModelView: React.FC<ModelViewProps> = ({ characters, onClose }) => {
  const [treeMode, setTreeMode] = useState<TreeMode>('family');
  const [selectedNode, setSelectedNode] = useState<Character | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const { svgRef } = useD3Tree({
    characters,
    treeMode,
    selectedNode,
    onNodeClick: setSelectedNode,
    onNodeHover: setHoveredNode,
    hoveredNode
  });

  // Render detail panel
  const renderDetail = () => {
    if (!selectedNode) return null;

    return (
      <div className="absolute bottom-4 left-4 right-4 bg-black/90 backdrop-blur-xl rounded-2xl p-4 border border-white/20 max-h-[40vh] overflow-y-auto">
        <div className="flex gap-4">
          <img
            src={selectedNode.imageUrl}
            alt={selectedNode.name}
            className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-impact text-xl italic text-white truncate">{selectedNode.name}</h2>
              <button
                onClick={() => setSelectedNode(null)}
                className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-white/60 hover:bg-white/20 flex-shrink-0"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-white/60 mb-2">{selectedNode.description}</p>
            <div className="flex flex-wrap gap-1 mb-2">
              <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: speciesColors[selectedNode.species] }}>
                {selectedNode.species}
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: elementColors[selectedNode.element] }}>
                {selectedNode.element}
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: alignmentColors[selectedNode.alignment] }}>
                {selectedNode.alignment}
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-white/20">
                {selectedNode.size}
              </span>
            </div>
          </div>
          <div className="w-64 flex-shrink-0 space-y-2">
            <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/30">
              <div className="text-[9px] text-green-400 uppercase font-bold">Pouvoir</div>
              <div className="text-[10px] text-green-300">{selectedNode.power}</div>
            </div>
            <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/30">
              <div className="text-[9px] text-red-400 uppercase font-bold">Faiblesse</div>
              <div className="text-[10px] text-red-300">{selectedNode.weakness}</div>
            </div>
          </div>
        </div>
        <div className="mt-3 p-2 bg-white/5 rounded-lg">
          <div className="text-[9px] text-white/40 uppercase font-bold mb-1">Histoire</div>
          <p className="text-[10px] text-white/70 leading-relaxed">{selectedNode.story}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[200] bg-gradient-to-b from-gray-900 to-black flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0 bg-black/50 backdrop-blur-sm">
        <div>
          <h1 className="font-impact text-2xl italic">
            <span className="text-[#ff6b6b]">BRAINROT</span>
            <span className="text-white">_TREE_</span>
            <span className="text-[#4ecdc4]">VIEW</span>
          </h1>
          <p className="text-xs text-white/40">Visualisation de l'arbre des personnages</p>
        </div>

        {/* Mode selector */}
        <div className="flex gap-2">
          {([
            { key: 'family', label: 'Familles', icon: '👨‍👩‍👧‍👦' },
            { key: 'species', label: 'Espèces', icon: '🦎' },
            { key: 'element', label: 'Éléments', icon: '🔥' },
            { key: 'alignment', label: 'Alignement', icon: '⚖️' },
            { key: 'rarity', label: 'Rareté', icon: '💎' },
            { key: 'size', label: 'Taille', icon: '📏' }
          ] as { key: TreeMode; label: string; icon: string }[]).map(mode => (
            <button
              key={mode.key}
              onClick={() => {
                setTreeMode(mode.key);
                setSelectedNode(null);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 ${
                treeMode === mode.key
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              <span>{mode.icon}</span>
              <span className="hidden sm:inline">{mode.label}</span>
            </button>
          ))}
        </div>

        {/* Close button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-black hover:bg-red-500 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Tree SVG */}
      <div className="flex-1 relative overflow-hidden">
        <svg
          ref={svgRef}
          className="w-full h-full"
          style={{ cursor: 'grab' }}
        />

        {/* Detail panel */}
        {renderDetail()}

        {/* Legend */}
        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-xl p-3 border border-white/10">
          <div className="text-[10px] text-white/40 uppercase font-bold mb-2">Légende</div>
          <div className="space-y-1">
            {Object.entries(getColorMapForMode(treeMode)).map(([name, color]) => (
              <div key={name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[10px] text-white/70">{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm rounded-xl p-3 border border-white/10 text-[10px] text-white/50">
          <div>🖱️ Glisser pour déplacer</div>
          <div>🔍 Molette pour zoomer</div>
          <div>👆 Clic sur un personnage pour détails</div>
        </div>
      </div>
    </div>
  );
};

export default ModelView;
