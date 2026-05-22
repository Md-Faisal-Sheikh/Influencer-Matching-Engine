import { useState, useEffect, useRef } from 'react';
import { useI18n } from '../utils/i18n';
import { getTrustGraph } from '../utils/api';

export default function TrustGraphPage() {
  const { t, language, formatNumber, translateWithParams } = useI18n();
  const [graph, setGraph] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  const svgRef = useRef(null);
  const simulationRef = useRef(null);

  // Colors based on Node Type/Group
  const getNodeColor = (node) => {
    if (node.type === 'hub') return '#7C3AED'; // Purple
    if (node.type === 'brand') return '#F59E0B'; // Gold
    // Influencers get custom platform colors
    if (node.platform === 'Instagram') return '#F43F5E'; // Pink-red
    if (node.platform === 'YouTube') return '#EF4444'; // Solid Red
    return '#06B6D4'; // Cyan (TikTok)
  };

  const getLinkStrokeColor = (link) => {
    if (link.type === 'ENDORSES') return 'rgba(167, 139, 250, 0.4)'; // Violet
    if (link.type === 'COLLABORATED_WITH') return 'rgba(245, 158, 11, 0.35)'; // Amber
    if (link.type === 'SHARED_AUDIENCE') return 'rgba(16, 185, 129, 0.3)'; // Emerald
    return 'rgba(107, 114, 128, 0.2)'; // Gray
  };

  useEffect(() => {
    setLoading(true);
    getTrustGraph()
      .then(data => {
        if (data && data.success) {
          // Initialize coordinates randomly
          const width = 800;
          const height = 500;
          const nodes = data.nodes.map(n => ({
            ...n,
            x: width / 2 + (Math.random() - 0.5) * 200,
            y: height / 2 + (Math.random() - 0.5) * 200,
            vx: 0,
            vy: 0,
            r: n.type === 'hub' ? 24 : n.type === 'brand' ? 16 : 20
          }));

          setGraph({
            nodes,
            links: data.links,
            iterations: data.iterations
          });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching trust graph:', err);
        setLoading(false);
      });
  }, []);

  // FORCE-DIRECTED PHYSICS ENGINE SIMULATION (In-Browser Spring Physics)
  useEffect(() => {
    if (graph.nodes.length === 0) return;

    const width = 800;
    const height = 500;
    const repulsionStrength = 1500;
    const springStrength = 0.05;
    const springLength = 80;
    const damping = 0.85; // friction

    let animationFrameId;

    const tick = () => {
      // 1. Repulsion force between ALL node pairs (Electrostatic)
      for (let i = 0; i < graph.nodes.length; i++) {
        const nodeA = graph.nodes[i];
        for (let j = i + 1; j < graph.nodes.length; j++) {
          const nodeB = graph.nodes[j];
          const dx = nodeB.x - nodeA.x;
          const dy = nodeB.y - nodeA.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1.0;

          if (dist < 300) {
            const force = repulsionStrength / (dist * dist);
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            nodeA.vx -= fx;
            nodeA.vy -= fy;
            nodeB.vx += fx;
            nodeB.vy += fy;
          }
        }
      }

      // 2. Attraction force along Links (Hooke's Spring Law)
      graph.links.forEach(link => {
        const sourceNode = graph.nodes.find(n => n.id === link.source);
        const targetNode = graph.nodes.find(n => n.id === link.target);

        if (sourceNode && targetNode) {
          const dx = targetNode.x - sourceNode.x;
          const dy = targetNode.y - sourceNode.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1.0;
          
          // Spring force
          const force = (dist - springLength) * springStrength * (link.weight || 1.0);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          sourceNode.vx += fx;
          sourceNode.vy += fy;
          targetNode.vx -= fx;
          targetNode.vy -= fy;
        }
      });

      // 3. Gravity and Centering towards center of screen (800, 500)
      graph.nodes.forEach(node => {
        // Dragging overrides physics
        if (node.isDragging) return;

        const cx = width / 2;
        const cy = height / 2;
        node.vx += (cx - node.x) * 0.01;
        node.vy += (cy - node.y) * 0.01;

        // Apply friction and update position
        node.vx *= damping;
        node.vy *= damping;
        node.x += node.vx;
        node.y += node.vy;

        // Boundary constraint
        node.x = Math.max(node.r, Math.min(width - node.r, node.x));
        node.y = Math.max(node.r, Math.min(height - node.r, node.y));
      });

      // Force UI re-render
      setGraph(g => ({ ...g }));

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [graph.nodes.length]);

  // DRAG AND DROP HANDLERS FOR NODES
  const [draggedNode, setDraggedNode] = useState(null);

  const handleMouseDown = (e, node) => {
    node.isDragging = true;
    setDraggedNode(node);
  };

  const handleMouseMove = (e) => {
    if (!draggedNode || !svgRef.current) return;
    
    // Get mouse relative position inside SVG
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 800;
    const mouseY = ((e.clientY - rect.top) / rect.height) * 500;

    draggedNode.x = mouseX;
    draggedNode.y = mouseY;
    draggedNode.vx = 0;
    draggedNode.vy = 0;
    
    setGraph(g => ({ ...g }));
  };

  const handleMouseUp = () => {
    if (draggedNode) {
      draggedNode.isDragging = false;
      setDraggedNode(null);
    }
  };

  const getNodeEdges = (nodeId) => {
    if (!nodeId) return [];
    return graph.links.filter(l => l.source === nodeId || l.target === nodeId);
  };

  const getNeighborNodes = (nodeId) => {
    if (!nodeId) return [];
    const edges = getNodeEdges(nodeId);
    return edges.map(edge => {
      const isSource = edge.source === nodeId;
      const neighborId = isSource ? edge.target : edge.source;
      const neighbor = graph.nodes.find(n => n.id === neighborId);
      return {
        node: neighbor,
        relType: edge.type,
        isOutgoing: isSource
      };
    }).filter(n => n.node);
  };

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-6" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-4xl text-white mb-2">{t('graph.title')}</h1>
          <p className="text-muted text-sm">{t('graph.subtitle')}</p>
        </div>
        {!loading && graph.iterations && (
          <span className="text-xs px-3 py-1.5 rounded-xl bg-accent/10 border border-accent/20 text-accent-light font-mono">
            {translateWithParams('graph.iterations', { count: graph.iterations })}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-32">
          <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Legend and Network Visualization Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-5 relative overflow-hidden select-none">
              
              {/* Type Legend */}
              <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-x-4 gap-y-2 bg-ink/75 backdrop-blur px-3 py-2 rounded-xl border border-border text-[10px] text-muted">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full block bg-[#7C3AED]" />
                  <span>{t('graph.hubNodes')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full block bg-[#F59E0B]" />
                  <span>{t('graph.brandNodes')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full block bg-[#F43F5E]" />
                  <span>Instagram</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full block bg-[#EF4444]" />
                  <span>YouTube</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full block bg-[#06B6D4]" />
                  <span>TikTok</span>
                </div>
              </div>

              {/* Network Graph Vector Canvas */}
              <svg
                ref={svgRef}
                viewBox="0 0 800 500"
                className="w-full bg-ink/30 rounded-xl cursor-crosshair"
                style={{ maxHeight: '500px' }}
              >
                {/* Vector Link Connections */}
                <g>
                  {graph.links.map((link, idx) => {
                    const src = graph.nodes.find(n => n.id === link.source);
                    const tgt = graph.nodes.find(n => n.id === link.target);
                    if (!src || !tgt) return null;

                    const isHighlighted = selectedNode && (selectedNode.id === src.id || selectedNode.id === tgt.id);
                    const isHovered = hoveredNode && (hoveredNode.id === src.id || hoveredNode.id === tgt.id);

                    return (
                      <line
                        key={idx}
                        x1={src.x}
                        y1={src.y}
                        x2={tgt.x}
                        y2={tgt.y}
                        stroke={getLinkStrokeColor(link)}
                        strokeWidth={isHighlighted ? 2.5 : isHovered ? 2.0 : 1.0}
                        opacity={selectedNode ? (isHighlighted ? 1.0 : 0.15) : 0.8}
                        strokeDasharray={link.type === 'ENDORSES' ? '3,3' : 'none'}
                        className="transition-all duration-300"
                      />
                    );
                  })}
                </g>

                {/* Vector Node Representations */}
                <g>
                  {graph.nodes.map(node => {
                    const isSelected = selectedNode && selectedNode.id === node.id;
                    const isHovered = hoveredNode && hoveredNode.id === node.id;
                    const isDimmed = selectedNode && !isSelected && !getNodeEdges(selectedNode.id).some(e => e.source === node.id || e.target === node.id);

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${node.x}, ${node.y})`}
                        className="cursor-grab active:cursor-grabbing transition-transform duration-100"
                        onMouseDown={(e) => handleMouseDown(e, node)}
                        onClick={() => setSelectedNode(node)}
                        onMouseEnter={() => setHoveredNode(node)}
                        onMouseLeave={() => setHoveredNode(null)}
                        opacity={isDimmed ? 0.25 : 1.0}
                      >
                        {/* Glow effect on hover/selection */}
                        {(isSelected || isHovered) && (
                          <circle
                            r={node.r + 6}
                            fill="none"
                            stroke={getNodeColor(node)}
                            strokeWidth={2}
                            opacity={0.4}
                            className="animate-pulse"
                          />
                        )}

                        {/* Node circle */}
                        <circle
                          r={node.r}
                          fill="#13131A"
                          stroke={getNodeColor(node)}
                          strokeWidth={isSelected ? 3.5 : isHovered ? 2.5 : 1.5}
                          className="transition-all duration-200"
                        />

                        {/* Text Inside Node (Hubs/Brands icon or First letter) */}
                        <text
                          dy=".3em"
                          textAnchor="middle"
                          fill="white"
                          fontSize={node.type === 'hub' ? '10px' : '11px'}
                          fontWeight="bold"
                          className="select-none font-mono"
                        >
                          {node.type === 'hub' ? 'HUB' : node.name.charAt(0)}
                        </text>

                        {/* Text Label Below Node */}
                        <text
                          y={node.r + 14}
                          textAnchor="middle"
                          fill={isSelected ? 'white' : '#9CA3AF'}
                          fontSize="9px"
                          fontWeight={isSelected ? 'bold' : 'normal'}
                          className="select-none pointer-events-none"
                        >
                          {node.type === 'influencer' ? node.handle : node.name}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>
          </div>

          {/* Connected Node Details Panel */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-6 h-full flex flex-col justify-between">
              <div>
                <p className="font-display font-bold text-lg text-white border-b border-border pb-3 mb-4">
                  {t('graph.detailsHeader')}
                </p>

                {!selectedNode ? (
                  <div className="text-center py-20 text-muted">
                    <div className="text-5xl mb-4">🕸</div>
                    <p className="text-xs leading-relaxed max-w-[200px] mx-auto">
                      {t('graph.clickNodePrompt')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5 animate-fade-up">
                    <div>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-accent/20 text-accent-light font-bold">
                        {selectedNode.type}
                      </span>
                      <h3 className="font-display font-extrabold text-2xl text-white mt-2">
                        {selectedNode.name}
                      </h3>
                      {selectedNode.type === 'influencer' && (
                        <p className="text-xs text-muted font-mono mt-0.5">{selectedNode.handle} · {selectedNode.platform}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-surface border border-border rounded-xl p-3 text-center">
                        <p className="text-[10px] text-muted uppercase font-mono">{t('graph.rankLabel')}</p>
                        <p className="font-display font-extrabold text-xl text-accent-light mt-1">
                          {formatNumber(parseFloat((selectedNode.computed_centrality * 100).toFixed(2)))}%
                        </p>
                      </div>
                      <div className="bg-surface border border-border rounded-xl p-3 text-center">
                        <p className="text-[10px] text-muted uppercase font-mono">{t('graph.trustLabel')}</p>
                        <p className="font-display font-extrabold text-xl text-emerald mt-1">
                          {formatNumber(selectedNode.computed_trust)}
                        </p>
                      </div>
                    </div>

                    {/* Neighbor connections list */}
                    <div>
                      <p className="text-xs font-bold text-white mb-2.5">Structural Connections</p>
                      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                        {getNeighborNodes(selectedNode.id).map((neighbor, i) => (
                          <div
                            key={i}
                            onClick={() => setSelectedNode(neighbor.node)}
                            className="bg-surface hover:bg-border/30 border border-border rounded-xl px-3 py-2 flex items-center justify-between text-xs cursor-pointer transition-colors"
                          >
                            <div>
                              <p className="font-display font-bold text-white leading-none">
                                {neighbor.node.type === 'influencer' ? neighbor.node.handle : neighbor.node.name}
                              </p>
                              <span className="text-[9px] text-muted uppercase font-mono mt-0.5 block">{neighbor.node.type}</span>
                            </div>
                            <div className="text-right">
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                                neighbor.relType === 'ENDORSES' ? 'bg-accent/10 text-accent-light' :
                                neighbor.relType === 'COLLABORATED_WITH' ? 'bg-gold/10 text-gold' :
                                'bg-emerald/10 text-emerald'
                              }`}>
                                {neighbor.relType}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {selectedNode && selectedNode.type === 'influencer' && (
                <a
                  href={`/influencers/${selectedNode.id}`}
                  className="w-full text-center mt-6 py-2.5 bg-accent hover:bg-accent/90 text-white text-xs font-display font-bold rounded-xl block transition-all"
                >
                  View Full Analytics Profile →
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
