
import React, { useState } from 'react';
import { Character } from '../types';

interface ModelViewProps {
  characters: Character[];
  onClose: () => void;
}

type FilterType = 'species' | 'element' | 'alignment' | 'size' | 'all';

const elementColors: Record<string, string> = {
  'Feu': '#f97316',
  'Eau': '#3b82f6',
  'Air': '#22d3ee',
  'Terre': '#b45309',
  'Cosmique': '#a855f7',
  'Sonore': '#ec4899',
  'Café': '#78350f'
};

const speciesColors: Record<string, string> = {
  'Humanoïde': '#10b981',
  'Animal': '#f59e0b',
  'Hybride': '#8b5cf6',
  'Objet': '#6b7280',
  'Créature': '#ef4444'
};

const alignmentColors: Record<string, string> = {
  'Gentil': '#22c55e',
  'Neutre': '#a3a3a3',
  'Chaotique': '#f59e0b',
  'Maléfique': '#dc2626'
};

const sizeScale: Record<string, number> = {
  'Petit': 60,
  'Moyen': 80,
  'Grand': 100,
  'Géant': 120
};

const ModelView: React.FC<ModelViewProps> = ({ characters, onClose }) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [hoveredChar, setHoveredChar] = useState<Character | null>(null);

  // Group characters by attribute
  const groupBy = (attr: keyof Character) => {
    const groups: Record<string, Character[]> = {};
    characters.forEach(char => {
      const key = String(char[attr]);
      if (!groups[key]) groups[key] = [];
      groups[key].push(char);
    });
    return groups;
  };

  // Find related characters
  const findRelated = (char: Character): Character[] => {
    return characters.filter(c =>
      c.id !== char.id && (
        c.species === char.species ||
        c.element === char.element ||
        c.alignment === char.alignment ||
        c.origin.includes(char.origin.split('/')[0]) ||
        char.tags.some(t => c.tags.includes(t))
      )
    );
  };

  // Get color based on filter
  const getNodeColor = (char: Character): string => {
    switch (filter) {
      case 'element': return elementColors[char.element] || '#fff';
      case 'species': return speciesColors[char.species] || '#fff';
      case 'alignment': return alignmentColors[char.alignment] || '#fff';
      default: return elementColors[char.element] || '#fff';
    }
  };

  const renderGraph = () => {
    const centerX = 400;
    const centerY = 350;
    const radius = 280;

    return (
      <svg viewBox="0 0 800 700" className="w-full h-full">
        {/* Background */}
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1a1a2e" />
            <stop offset="100%" stopColor="#0a0a0f" />
          </radialGradient>
        </defs>
        <rect width="800" height="700" fill="url(#bgGrad)" />

        {/* Connection lines */}
        {selectedChar && findRelated(selectedChar).map((related, i) => {
          const selectedIndex = characters.findIndex(c => c.id === selectedChar.id);
          const relatedIndex = characters.findIndex(c => c.id === related.id);
          const angle1 = (selectedIndex / characters.length) * 2 * Math.PI - Math.PI / 2;
          const angle2 = (relatedIndex / characters.length) * 2 * Math.PI - Math.PI / 2;
          const x1 = centerX + radius * Math.cos(angle1);
          const y1 = centerY + radius * Math.sin(angle1);
          const x2 = centerX + radius * Math.cos(angle2);
          const y2 = centerY + radius * Math.sin(angle2);

          return (
            <line
              key={`line-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={getNodeColor(selectedChar)}
              strokeWidth="2"
              strokeOpacity="0.5"
              strokeDasharray="5,5"
            />
          );
        })}

        {/* Character nodes */}
        {characters.map((char, i) => {
          const angle = (i / characters.length) * 2 * Math.PI - Math.PI / 2;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          const size = sizeScale[char.size] / 2;
          const isSelected = selectedChar?.id === char.id;
          const isHovered = hoveredChar?.id === char.id;
          const isRelated = selectedChar ? findRelated(selectedChar).some(r => r.id === char.id) : false;

          return (
            <g
              key={char.id}
              transform={`translate(${x}, ${y})`}
              onClick={() => setSelectedChar(isSelected ? null : char)}
              onMouseEnter={() => setHoveredChar(char)}
              onMouseLeave={() => setHoveredChar(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Glow effect */}
              {(isSelected || isHovered) && (
                <circle
                  r={size + 8}
                  fill="none"
                  stroke={getNodeColor(char)}
                  strokeWidth="3"
                  opacity="0.6"
                />
              )}

              {/* Node circle */}
              <circle
                r={size}
                fill={getNodeColor(char)}
                opacity={selectedChar && !isSelected && !isRelated ? 0.3 : 1}
                stroke={isSelected ? '#fff' : 'transparent'}
                strokeWidth="3"
              />

              {/* Character image (clipped circle) */}
              <clipPath id={`clip-${char.id}`}>
                <circle r={size - 4} />
              </clipPath>
              <image
                href={char.imageUrl}
                x={-(size - 4)}
                y={-(size - 4)}
                width={(size - 4) * 2}
                height={(size - 4) * 2}
                clipPath={`url(#clip-${char.id})`}
                opacity={selectedChar && !isSelected && !isRelated ? 0.3 : 1}
                preserveAspectRatio="xMidYMid slice"
              />

              {/* Name label */}
              {(isHovered || isSelected) && (
                <text
                  y={size + 20}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {char.name}
                </text>
              )}
            </g>
          );
        })}

        {/* Center info */}
        <text x={centerX} y={centerY - 20} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
          {selectedChar ? selectedChar.name : 'BRAINROT UNIVERSE'}
        </text>
        <text x={centerX} y={centerY + 5} textAnchor="middle" fill="white" fontSize="10" opacity="0.6">
          {selectedChar ? `${findRelated(selectedChar).length} connexions` : 'Clique sur un personnage'}
        </text>
      </svg>
    );
  };

  const renderStats = () => {
    const speciesGroups = groupBy('species');
    const elementGroups = groupBy('element');
    const alignmentGroups = groupBy('alignment');

    return (
      <div className="grid grid-cols-3 gap-4 p-4">
        {/* Species */}
        <div className="bg-white/5 rounded-xl p-4">
          <h3 className="font-impact text-sm mb-3 text-white/60">PAR ESPÈCE</h3>
          {Object.entries(speciesGroups).map(([species, chars]) => (
            <div key={species} className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: speciesColors[species] }}
              />
              <span className="text-xs text-white/80">{species}</span>
              <span className="text-xs text-white/40 ml-auto">{chars.length}</span>
            </div>
          ))}
        </div>

        {/* Elements */}
        <div className="bg-white/5 rounded-xl p-4">
          <h3 className="font-impact text-sm mb-3 text-white/60">PAR ÉLÉMENT</h3>
          {Object.entries(elementGroups).map(([element, chars]) => (
            <div key={element} className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: elementColors[element] }}
              />
              <span className="text-xs text-white/80">{element}</span>
              <span className="text-xs text-white/40 ml-auto">{chars.length}</span>
            </div>
          ))}
        </div>

        {/* Alignment */}
        <div className="bg-white/5 rounded-xl p-4">
          <h3 className="font-impact text-sm mb-3 text-white/60">PAR ALIGNEMENT</h3>
          {Object.entries(alignmentGroups).map(([alignment, chars]) => (
            <div key={alignment} className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: alignmentColors[alignment] }}
              />
              <span className="text-xs text-white/80">{alignment}</span>
              <span className="text-xs text-white/40 ml-auto">{chars.length}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCharacterDetail = () => {
    if (!selectedChar) return null;

    const related = findRelated(selectedChar);

    return (
      <div className="absolute bottom-4 left-4 right-4 bg-black/90 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
        <div className="flex gap-4">
          <img
            src={selectedChar.imageUrl}
            alt={selectedChar.name}
            className="w-24 h-24 rounded-xl object-cover"
          />
          <div className="flex-1">
            <h3 className="font-impact text-xl italic">{selectedChar.name}</h3>
            <p className="text-xs text-white/60 mb-2">{selectedChar.description}</p>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="text-[10px] px-2 py-1 rounded-full" style={{ backgroundColor: speciesColors[selectedChar.species] }}>
                {selectedChar.species}
              </span>
              <span className="text-[10px] px-2 py-1 rounded-full" style={{ backgroundColor: elementColors[selectedChar.element] }}>
                {selectedChar.element}
              </span>
              <span className="text-[10px] px-2 py-1 rounded-full" style={{ backgroundColor: alignmentColors[selectedChar.alignment] }}>
                {selectedChar.alignment}
              </span>
              <span className="text-[10px] px-2 py-1 rounded-full bg-white/20">
                {selectedChar.size}
              </span>
            </div>
            <div className="text-[10px] text-white/50">
              <span className="text-white/30">Origine:</span> {selectedChar.origin}
            </div>
          </div>
          <div className="w-48">
            <div className="text-[10px] text-white/40 mb-1">POUVOIR</div>
            <div className="text-[10px] text-green-400 mb-2">{selectedChar.power}</div>
            <div className="text-[10px] text-white/40 mb-1">FAIBLESSE</div>
            <div className="text-[10px] text-red-400">{selectedChar.weakness}</div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="text-[10px] text-white/40 mb-2">CONNEXIONS ({related.length})</div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {related.map(r => (
                <div
                  key={r.id}
                  className="flex-shrink-0 flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1 cursor-pointer hover:bg-white/10"
                  onClick={() => setSelectedChar(r)}
                >
                  <img src={r.imageUrl} alt={r.name} className="w-6 h-6 rounded-full object-cover" />
                  <span className="text-[10px] whitespace-nowrap">{r.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div>
          <h1 className="font-impact text-2xl italic">
            <span className="text-[#ff6b6b]">BRAINROT</span>
            <span className="text-white">_MODEL_</span>
            <span className="text-[#4ecdc4]">VIEW</span>
          </h1>
          <p className="text-xs text-white/40">Visualisation des connexions entre personnages</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {(['all', 'element', 'species', 'alignment'] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                filter === f
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {f === 'all' ? 'Tous' : f}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-black hover:bg-red-500 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Stats bar */}
      {renderStats()}

      {/* Graph */}
      <div className="flex-1 relative">
        {renderGraph()}
        {renderCharacterDetail()}
      </div>
    </div>
  );
};

export default ModelView;
