import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Character } from '../types';
import { D3TreeNode } from '../types.d3';
import { TreeMode, rarityColors } from '../utils/colorMaps';
import { buildTreeData } from '../utils/treeBuilder';

interface UseD3TreeProps {
  characters: Character[];
  treeMode: TreeMode;
  selectedNode: Character | null;
  onNodeClick: (character: Character) => void;
  onNodeHover: (id: string | null) => void;
  hoveredNode: string | null;
}

export const useD3Tree = ({
  characters,
  treeMode,
  selectedNode,
  onNodeClick,
  onNodeHover,
  hoveredNode
}: UseD3TreeProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Clear previous content
    svg.selectAll('*').remove();

    // Build tree data
    const treeData = buildTreeData(characters, treeMode);
    const root = d3.hierarchy<D3TreeNode>(treeData);

    // Configure tree layout with reduced spacing (vertical layout)
    const treeLayout = d3.tree<D3TreeNode>()
      .nodeSize([140, 140]) // [horizontal spacing between siblings, vertical spacing between levels]
      .separation((a, b) => {
        // Reduced spacing between nodes
        return a.parent === b.parent ? 1 : 1.5;
      });

    treeLayout(root);

    // Create main group for zoom
    const mainGroup = svg.append('g').attr('class', 'main-group');

    // Create defs for gradients and patterns
    const defs = svg.append('defs');

    // Root gradient
    const rootGradient = defs.append('radialGradient')
      .attr('id', 'rootGradient')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%');
    rootGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#ff6b6b');
    rootGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#4ecdc4');

    // Glow filter
    const glowFilter = defs.append('filter').attr('id', 'glow');
    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur');
    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Background grid pattern
    const gridPattern = defs.append('pattern')
      .attr('id', 'grid')
      .attr('width', 50)
      .attr('height', 50)
      .attr('patternUnits', 'userSpaceOnUse');
    gridPattern.append('path')
      .attr('d', 'M 50 0 L 0 0 0 50')
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255,255,255,0.03)')
      .attr('stroke-width', 1);

    // Image patterns for characters
    characters.forEach(char => {
      const pattern = defs.append('pattern')
        .attr('id', `pattern-${char.id}`)
        .attr('width', 1)
        .attr('height', 1)
        .attr('patternContentUnits', 'objectBoundingBox');

      pattern.append('image')
        .attr('href', char.imageUrl)
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 1)
        .attr('height', 1)
        .attr('preserveAspectRatio', 'xMidYMid slice');
    });

    // Clip paths for character images
    characters.forEach(char => {
      defs.append('clipPath')
        .attr('id', `clip-${char.id}`)
        .append('circle')
        .attr('r', 36);
    });

    // Calculate bounds for background grid
    const bounds = {
      minX: d3.min(root.descendants(), d => d.y) || 0,
      maxX: d3.max(root.descendants(), d => d.y) || width,
      minY: d3.min(root.descendants(), d => d.x) || 0,
      maxY: d3.max(root.descendants(), d => d.x) || height
    };

    // Add background grid
    mainGroup.append('rect')
      .attr('x', bounds.minX - 500)
      .attr('y', bounds.minY - 500)
      .attr('width', bounds.maxX - bounds.minX + 1000)
      .attr('height', bounds.maxY - bounds.minY + 1000)
      .attr('fill', 'url(#grid)');

    // Create groups for links and nodes
    const linkGroup = mainGroup.append('g').attr('class', 'links').attr('filter', 'url(#glow)');
    const nodeGroup = mainGroup.append('g').attr('class', 'nodes');

    // Helper function to get node size (increased sizes)
    const getNodeSize = (d: d3.HierarchyPointNode<D3TreeNode>): number => {
      if (d.data.category === 'root') return 90;
      if (d.data.category === 'group') return 65;
      return 55;
    };

    // Draw links (vertical layout: top to bottom)
    const linkGenerator = d3.linkVertical<any, d3.HierarchyPointNode<D3TreeNode>>()
      .x((d: any) => d.x)
      .y((d: any) => d.y);

    linkGroup.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', linkGenerator as any)
      .attr('fill', 'none')
      .attr('stroke', (d: any) => {
        const isHighlighted = hoveredNode === `node-${d.target.data.name}` ||
          (selectedNode && d.target.data.character?.id === selectedNode.id);
        return isHighlighted ? d.target.data.color : 'rgba(255,255,255,0.15)';
      })
      .attr('stroke-width', (d: any) => {
        const isHighlighted = hoveredNode === `node-${d.target.data.name}` ||
          (selectedNode && d.target.data.character?.id === selectedNode.id);
        return isHighlighted ? 3 : 1.5;
      })
      .attr('stroke-dasharray', (d: any) => d.target.data.character ? 'none' : '5,5');

    // Draw nodes (vertical layout: x for horizontal position, y for vertical position)
    const nodes = nodeGroup.selectAll<SVGGElement, d3.HierarchyPointNode<D3TreeNode>>('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .style('cursor', d => d.data.character ? 'pointer' : 'default')
      .on('click', function(event, d) {
        if (d.data.character) {
          onNodeClick(d.data.character);
        }
      })
      .on('mouseenter', function(event, d) {
        onNodeHover(`node-${d.data.name}`);
      })
      .on('mouseleave', function() {
        onNodeHover(null);
      });

    // Glow circle for hover/selection
    nodes.each(function(d) {
      const isSelected = selectedNode?.id === d.data.character?.id;
      const isHovered = hoveredNode === `node-${d.data.name}`;

      if (isSelected || isHovered) {
        d3.select(this)
          .append('circle')
          .attr('class', 'glow-circle')
          .attr('r', getNodeSize(d) + 8)
          .attr('fill', 'none')
          .attr('stroke', d.data.color)
          .attr('stroke-width', 3)
          .attr('opacity', 0.6);
      }
    });

    // Node background circle
    nodes.append('circle')
      .attr('r', d => getNodeSize(d))
      .attr('fill', d => {
        if (d.data.category === 'root') return 'url(#rootGradient)';
        if (d.data.character) return `url(#pattern-${d.data.character.id})`;
        return d.data.color;
      })
      .attr('stroke', d => selectedNode?.id === d.data.character?.id ? '#fff' : 'rgba(255,255,255,0.3)')
      .attr('stroke-width', d => selectedNode?.id === d.data.character?.id ? 4 : 2)
      .attr('opacity', d => d.data.category === 'leaf' ? 1 : 0.9);

    // Root icon (larger)
    nodes.filter(d => d.data.category === 'root')
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '50')
      .text('🧠');

    // Group count (larger)
    nodes.filter(d => d.data.category === 'group')
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '24')
      .attr('font-weight', 'bold')
      .text(d => d.children?.length || 0);

    // Node labels (larger font sizes)
    nodes.append('text')
      .attr('y', d => getNodeSize(d) + 22)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', d => d.data.category === 'root' ? 18 : d.data.category === 'group' ? 15 : 12)
      .attr('font-weight', 'bold')
      .style('text-shadow', '0 2px 4px rgba(0,0,0,0.8)')
      .text(d => {
        if (d.data.category === 'leaf') {
          const words = d.data.name.split(' ');
          return words.slice(0, 2).join(' ');
        }
        return d.data.name;
      });

    // Rarity badges for leaf nodes
    nodes.filter(d => d.data.character)
      .append('g')
      .attr('transform', d => `translate(${getNodeSize(d) - 10}, ${-getNodeSize(d) + 10})`)
      .each(function(d) {
        const badge = d3.select(this);
        const char = d.data.character!;

        badge.append('circle')
          .attr('r', 12)
          .attr('fill', rarityColors[char.rarity])
          .attr('stroke', 'rgba(0,0,0,0.3)')
          .attr('stroke-width', 2);

        badge.append('text')
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '8')
          .attr('font-weight', 'bold')
          .text(char.rarity[0]);
      });

    // Setup zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        mainGroup.attr('transform', event.transform.toString());
      });

    svg.call(zoom);

    // Center the tree initially with better positioning for vertical layout
    const initialTransform = d3.zoomIdentity
      .translate(width / 2, 120)
      .scale(0.7);

    svg.call(zoom.transform as any, initialTransform);

    // Cleanup
    return () => {
      svg.selectAll('*').remove();
      svg.on('.zoom', null);
    };
  }, [characters, treeMode, selectedNode, hoveredNode, onNodeClick, onNodeHover]);

  return { svgRef };
};
