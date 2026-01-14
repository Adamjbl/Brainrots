
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Character } from '../types';

interface ModelViewProps {
  characters: Character[];
  onClose: () => void;
}

type TreeMode = 'species' | 'element' | 'alignment' | 'family';

interface TreeNode {
  id: string;
  name: string;
  children: TreeNode[];
  character?: Character;
  color: string;
  x?: number;
  y?: number;
}

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

const familyColors: Record<string, string> = {
  'Famille Café': '#78350f',
  'Famille Crocodile': '#22c55e',
  'Famille Sonore': '#ec4899',
  'Famille Cosmique': '#a855f7',
  'Famille Chaos': '#f97316',
  'Autres': '#6b7280'
};

const ModelView: React.FC<ModelViewProps> = ({ characters, onClose }) => {
  const [treeMode, setTreeMode] = useState<TreeMode>('family');
  const [selectedNode, setSelectedNode] = useState<Character | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const getFamilyGroup = (char: Character): string => {
    if (char.element === 'Café' || char.tags.includes('Café')) return 'Famille Café';
    if (char.tags.includes('Crocodile') || char.name.includes('CROCODIL')) return 'Famille Crocodile';
    if (char.element === 'Sonore' || char.tags.includes('Musique') || char.tags.includes('Chant')) return 'Famille Sonore';
    if (char.element === 'Cosmique' || char.tags.includes('Espace') || char.tags.includes('Ciel')) return 'Famille Cosmique';
    if (char.alignment === 'Chaotique' || char.tags.includes('Chaos') || char.tags.includes('Explosion')) return 'Famille Chaos';
    return 'Autres';
  };

  const getColorMap = (): Record<string, string> => {
    switch (treeMode) {
      case 'species': return speciesColors;
      case 'element': return elementColors;
      case 'alignment': return alignmentColors;
      case 'family': return familyColors;
    }
  };

  const getGroupKey = (char: Character): string => {
    switch (treeMode) {
      case 'species': return char.species;
      case 'element': return char.element;
      case 'alignment': return char.alignment;
      case 'family': return getFamilyGroup(char);
    }
  };

  // Build tree data
  const treeData = useMemo((): TreeNode => {
    const colorMap = getColorMap();
    const groups: Record<string, Character[]> = {};

    characters.forEach(c => {
      const key = getGroupKey(c);
      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    });

    const root: TreeNode = {
      id: 'root',
      name: 'BRAINROT',
      color: '#ffffff',
      children: Object.entries(groups).map(([groupName, chars]) => ({
        id: `group-${groupName}`,
        name: groupName,
        color: colorMap[groupName] || '#666',
        children: chars.map(c => ({
          id: c.id,
          name: c.name,
          color: colorMap[groupName] || '#666',
          character: c,
          children: []
        }))
      }))
    };

    return root;
  }, [characters, treeMode]);

  // Calculate tree layout
  const layoutTree = useMemo(() => {
    const nodeWidth = 120;
    const nodeHeight = 80;
    const levelHeight = 150;

    // Calculate positions for each node
    const calculatePositions = (node: TreeNode, depth: number, index: number, siblingCount: number, startX: number, width: number): TreeNode => {
      const x = startX + (width / siblingCount) * (index + 0.5);
      const y = depth * levelHeight + 60;

      let childStartX = x;
      let totalChildWidth = 0;

      if (node.children.length > 0) {
        // Calculate total width needed for children
        const childWidths = node.children.map(child => {
          const leafCount = countLeaves(child);
          return Math.max(nodeWidth, leafCount * nodeWidth);
        });
        totalChildWidth = childWidths.reduce((a, b) => a + b, 0);
        childStartX = x - totalChildWidth / 2;
      }

      let currentX = childStartX;
      const positionedChildren = node.children.map((child, i) => {
        const childWidth = node.children.length > 0
          ? Math.max(nodeWidth, countLeaves(child) * nodeWidth)
          : width / node.children.length;
        const positioned = calculatePositions(child, depth + 1, i, node.children.length, currentX, childWidth);
        currentX += childWidth;
        return positioned;
      });

      return {
        ...node,
        x,
        y,
        children: positionedChildren
      };
    };

    const countLeaves = (node: TreeNode): number => {
      if (node.children.length === 0) return 1;
      return node.children.reduce((sum, child) => sum + countLeaves(child), 0);
    };

    const totalWidth = Math.max(1400, countLeaves(treeData) * 100);
    return calculatePositions(treeData, 0, 0, 1, 0, totalWidth);
  }, [treeData]);

  // Get tree bounds
  const treeBounds = useMemo(() => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    const traverse = (node: TreeNode) => {
      if (node.x !== undefined && node.y !== undefined) {
        minX = Math.min(minX, node.x);
        maxX = Math.max(maxX, node.x);
        minY = Math.min(minY, node.y);
        maxY = Math.max(maxY, node.y);
      }
      node.children.forEach(traverse);
    };

    traverse(layoutTree);
    return { minX: minX - 100, maxX: maxX + 100, minY: minY - 50, maxY: maxY + 100 };
  }, [layoutTree]);

  const viewBox = `${treeBounds.minX + pan.x} ${treeBounds.minY + pan.y} ${(treeBounds.maxX - treeBounds.minX) / zoom} ${(treeBounds.maxY - treeBounds.minY) / zoom}`;

  // Mouse handlers for pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = (e.clientX - dragStart.x) / zoom;
      const dy = (e.clientY - dragStart.y) / zoom;
      setPan(prev => ({ x: prev.x - dx, y: prev.y - dy }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.3, Math.min(3, prev * delta)));
  };

  // Render tree connections
  const renderConnections = (node: TreeNode): React.ReactNode => {
    if (!node.x || !node.y) return null;

    return node.children.map(child => {
      if (!child.x || !child.y) return null;

      const isHighlighted = hoveredNode === node.id || hoveredNode === child.id ||
        (selectedNode && (child.character?.id === selectedNode.id || node.id === `group-${getGroupKey(selectedNode)}`));

      // Curved path
      const midY = (node.y + child.y) / 2;
      const path = `M ${node.x} ${node.y + 25}
                    C ${node.x} ${midY}, ${child.x} ${midY}, ${child.x} ${child.y - 25}`;

      return (
        <g key={`conn-${node.id}-${child.id}`}>
          <path
            d={path}
            fill="none"
            stroke={isHighlighted ? child.color : 'rgba(255,255,255,0.15)'}
            strokeWidth={isHighlighted ? 3 : 1.5}
            strokeDasharray={child.character ? "none" : "5,5"}
          />
          {renderConnections(child)}
        </g>
      );
    });
  };

  // Render tree nodes
  const renderNodes = (node: TreeNode): React.ReactNode => {
    if (!node.x || !node.y) return null;

    const isRoot = node.id === 'root';
    const isGroup = node.id.startsWith('group-');
    const isLeaf = node.character !== undefined;
    const isSelected = selectedNode?.id === node.character?.id;
    const isHovered = hoveredNode === node.id;

    const nodeSize = isRoot ? 70 : isGroup ? 50 : 40;

    return (
      <g key={node.id}>
        {/* Node */}
        <g
          transform={`translate(${node.x}, ${node.y})`}
          onClick={() => {
            if (node.character) setSelectedNode(node.character);
          }}
          onMouseEnter={() => setHoveredNode(node.id)}
          onMouseLeave={() => setHoveredNode(null)}
          style={{ cursor: isLeaf ? 'pointer' : 'default' }}
        >
          {/* Glow effect */}
          {(isSelected || isHovered) && (
            <circle
              r={nodeSize + 8}
              fill="none"
              stroke={node.color}
              strokeWidth="3"
              opacity="0.6"
            >
              <animate
                attributeName="r"
                values={`${nodeSize + 5};${nodeSize + 12};${nodeSize + 5}`}
                dur="1.5s"
                repeatCount="indefinite"
              />
            </circle>
          )}

          {/* Node background */}
          <circle
            r={nodeSize}
            fill={isRoot ? 'url(#rootGradient)' : node.color}
            stroke={isSelected ? '#fff' : 'rgba(255,255,255,0.3)'}
            strokeWidth={isSelected ? 4 : 2}
            opacity={isLeaf ? 1 : 0.9}
          />

          {/* Character image */}
          {isLeaf && node.character && (
            <>
              <clipPath id={`clip-${node.id}`}>
                <circle r={nodeSize - 4} />
              </clipPath>
              <image
                href={node.character.imageUrl}
                x={-(nodeSize - 4)}
                y={-(nodeSize - 4)}
                width={(nodeSize - 4) * 2}
                height={(nodeSize - 4) * 2}
                clipPath={`url(#clip-${node.id})`}
                preserveAspectRatio="xMidYMid slice"
              />
            </>
          )}

          {/* Root icon */}
          {isRoot && (
            <text
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="35"
            >
              🧠
            </text>
          )}

          {/* Group count */}
          {isGroup && (
            <text
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize="18"
              fontWeight="bold"
            >
              {node.children.length}
            </text>
          )}

          {/* Label */}
          <text
            y={nodeSize + 18}
            textAnchor="middle"
            fill="white"
            fontSize={isRoot ? 14 : isGroup ? 12 : 10}
            fontWeight="bold"
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
          >
            {isLeaf ? node.name.split(' ').slice(0, 2).join(' ') : node.name}
          </text>

          {/* Rarity badge for leaves */}
          {isLeaf && node.character && (
            <g transform={`translate(${nodeSize - 10}, ${-nodeSize + 10})`}>
              <circle
                r="12"
                fill={
                  node.character.rarity === 'Legendary' ? '#eab308' :
                  node.character.rarity === 'Rare' ? '#a855f7' : '#6b7280'
                }
                stroke="rgba(0,0,0,0.3)"
                strokeWidth="2"
              />
              <text
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="8"
                fontWeight="bold"
              >
                {node.character.rarity[0]}
              </text>
            </g>
          )}
        </g>

        {/* Render children */}
        {node.children.map(child => renderNodes(child))}
      </g>
    );
  };

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
            { key: 'alignment', label: 'Alignement', icon: '⚖️' }
          ] as { key: TreeMode; label: string; icon: string }[]).map(mode => (
            <button
              key={mode.key}
              onClick={() => {
                setTreeMode(mode.key);
                setSelectedNode(null);
                setZoom(1);
                setPan({ x: 0, y: 0 });
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

        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(z => Math.max(0.3, z - 0.2))}
            className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white/20"
          >
            −
          </button>
          <span className="text-xs text-white/60 w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(z => Math.min(3, z + 0.2))}
            className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white/20"
          >
            +
          </button>
          <button
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            className="px-3 py-1 bg-white/10 rounded-lg text-xs text-white/60 hover:bg-white/20"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-black hover:bg-red-500 transition-colors ml-2"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Tree SVG */}
      <div className="flex-1 relative overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={viewBox}
          className="w-full h-full"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <defs>
            <radialGradient id="rootGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ff6b6b" />
              <stop offset="100%" stopColor="#4ecdc4" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background grid */}
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
          </pattern>
          <rect x={treeBounds.minX - 500} y={treeBounds.minY - 500} width={treeBounds.maxX - treeBounds.minX + 1000} height={treeBounds.maxY - treeBounds.minY + 1000} fill="url(#grid)" />

          {/* Connections */}
          <g filter="url(#glow)">
            {renderConnections(layoutTree)}
          </g>

          {/* Nodes */}
          {renderNodes(layoutTree)}
        </svg>

        {/* Detail panel */}
        {renderDetail()}

        {/* Legend */}
        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-xl p-3 border border-white/10">
          <div className="text-[10px] text-white/40 uppercase font-bold mb-2">Légende</div>
          <div className="space-y-1">
            {Object.entries(getColorMap()).map(([name, color]) => (
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
