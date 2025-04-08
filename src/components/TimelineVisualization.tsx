"use client";

import React, { useState, useEffect } from 'react';
import { TimelineNode, timelineData, timelineBranches } from '../data/timelineData';

const TimelineVisualization: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [width, setWidth] = useState(1000);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWidth(Math.min(1200, window.innerWidth - 40));
      
      const handleResize = () => {
        setWidth(Math.min(1200, window.innerWidth - 40));
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);
  
  const calculatePositions = () => {
    const positions: Record<string, { x: number; y: number }> = {};
    const YEAR_HEIGHT = 80;
    const YEAR_START = 2017;
    const BRANCH_WIDTH = width / timelineBranches.length;
    
    timelineData.forEach(node => {
      const branchIndex = timelineBranches.findIndex(b => b.id === node.branch);
      const baseX = BRANCH_WIDTH * (branchIndex + 0.5);
      const yearOffset = node.year - YEAR_START;
      const monthOffset = node.month ? (node.month - 1) / 12 : 0.5;
      const y = (yearOffset + monthOffset) * YEAR_HEIGHT + 50;
      
      positions[node.id] = { x: baseX, y };
    });
    
    return positions;
  };
  
  const nodePositions = calculatePositions();
  
  // Create connections between nodes
  const connections = timelineData
    .filter(node => node.parentIds && node.parentIds.length > 0)
    .flatMap(node => 
      (node.parentIds || []).map(parentId => {
        const parent = nodePositions[parentId];
        const child = nodePositions[node.id];
        
        if (!parent || !child) return null;
        
        const midY = (parent.y + child.y) / 2;
        const curve = Math.min(Math.abs(child.x - parent.x) * 0.5, Math.abs(child.y - parent.y) * 0.5);
        
        return {
          id: `${parentId}-${node.id}`,
          path: `M ${parent.x} ${parent.y} C ${parent.x} ${midY}, ${child.x} ${midY}, ${child.x} ${child.y}`,
          color: timelineBranches.find(b => b.id === node.branch)?.color || '#888',
          parentId,
          childId: node.id
        };
      })
    )
    .filter(Boolean) as { id: string; path: string; color: string; parentId: string; childId: string }[];
  
  const isHighlighted = (nodeId: string) => {
    if (!selectedNode && !hoveredNode) return true;
    if (hoveredNode === nodeId) return true;
    if (selectedNode === nodeId) return true;
    
    const node = timelineData.find(n => n.id === nodeId);
    if (!node) return false;
    
    if (selectedNode) {
      const selectedNodeData = timelineData.find(n => n.id === selectedNode);
      if (selectedNodeData?.parentIds?.includes(nodeId)) return true;
      if (node.parentIds?.includes(selectedNode)) return true;
    }
    
    return false;
  };
  
  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId === selectedNode ? null : nodeId);
  };
  
  const selectedNodeData = selectedNode 
    ? timelineData.find(node => node.id === selectedNode) 
    : null;
  
  const height = 700;
  
  return (
    <div className="flex flex-col w-full">
      <div className="bg-white shadow-md p-4 mb-4 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">LLM Evolution Timeline</h2>
        <div className="flex flex-wrap gap-3 items-center">
          {timelineBranches.map(branch => (
            <div key={branch.id} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-1" 
                style={{ backgroundColor: branch.color }}
              />
              <span className="text-sm">{branch.name}</span>
            </div>
          ))}
        </div>
      </div>
    
      <div className="relative bg-white shadow-md rounded-lg p-4 overflow-hidden" style={{ height }}>
        <svg width={width} height={height} className="absolute top-0 left-0">
          {/* Year grid lines */}
          {Array.from({ length: 9 }).map((_, i) => {
            const year = 2017 + i;
            const y = (i * 80) + 50;
            return (
              <g key={`year-${year}`}>
                <line 
                  x1={0} y1={y} 
                  x2={width} y2={y} 
                  stroke="#eee" 
                  strokeWidth={1}
                />
                <text 
                  x={10} 
                  y={y + 5} 
                  fontSize={12} 
                  fill="#666"
                >
                  {year}
                </text>
              </g>
            );
          })}
          
          {/* Connections */}
          {connections.map(conn => (
            <path
              key={conn.id}
              d={conn.path}
              stroke={conn.color}
              strokeWidth={isHighlighted(conn.parentId) && isHighlighted(conn.childId) ? 2 : 1}
              opacity={isHighlighted(conn.parentId) && isHighlighted(conn.childId) ? 0.8 : 0.3}
              fill="none"
            />
          ))}
          
          {/* Nodes */}
          {timelineData.map(node => {
            const pos = nodePositions[node.id];
            const highlighted = isHighlighted(node.id);
            const branch = timelineBranches.find(b => b.id === node.branch);
            
            return (
              <g 
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => handleNodeClick(node.id)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ cursor: 'pointer' }}
                opacity={highlighted ? 1 : 0.4}
              >
                <circle
                  r={highlighted ? 8 : 6}
                  fill={branch?.color || '#888'}
                  stroke="#fff"
                  strokeWidth={2}
                />
                <text
                  x={0}
                  y={-10}
                  textAnchor="middle"
                  fontSize={highlighted ? 12 : 10}
                  fontWeight={highlighted ? 'bold' : 'normal'}
                >
                  {node.title.length > 18 ? `${node.title.substring(0, 15)}...` : node.title}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      
      {selectedNodeData && (
        <div className="mt-4 bg-white shadow-md rounded-lg p-6">
          <h3 className="text-xl font-bold mb-2">
            {selectedNodeData.title} ({selectedNodeData.year})
          </h3>
          <div className="flex gap-2 mb-3">
            <span 
              className="px-2 py-1 rounded-full text-xs text-white"
              style={{ backgroundColor: timelineBranches.find(b => b.id === selectedNodeData.branch)?.color }}
            >
              {timelineBranches.find(b => b.id === selectedNodeData.branch)?.name}
            </span>
            {selectedNodeData.modelSize && (
              <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                {selectedNodeData.modelSize}
              </span>
            )}
          </div>
          <p className="text-sm mb-4">{selectedNodeData.description}</p>
          
          <div className="mb-4">
            <h4 className="font-semibold mb-1">Key Innovations:</h4>
            <ul className="list-disc pl-5 text-sm">
              {selectedNodeData.innovations.map((inn, i) => (
                <li key={i}>{inn}</li>
              ))}
            </ul>
          </div>
          
          {selectedNodeData.impact && (
            <div className="mb-4">
              <h4 className="font-semibold mb-1">Impact:</h4>
              <p className="text-sm">{selectedNodeData.impact}</p>
            </div>
          )}
          
          <div className="flex gap-4 mt-4">
            {selectedNodeData.parentIds?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-1">Building On:</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedNodeData.parentIds.map(pid => {
                    const parent = timelineData.find(n => n.id === pid);
                    return parent ? (
                      <button
                        key={pid}
                        onClick={() => setSelectedNode(pid)}
                        className="px-2 py-1 bg-gray-100 text-xs rounded hover:bg-gray-200"
                      >
                        {parent.title}
                      </button>
                    ) : null;
                  })}
                </div>
              </div>
            )}
            
            <div>
              <h4 className="font-semibold mb-1">Influenced:</h4>
              <div className="flex flex-wrap gap-1">
                {timelineData.filter(n => n.parentIds?.includes(selectedNodeData.id)).map(child => (
                  <button
                    key={child.id}
                    onClick={() => setSelectedNode(child.id)}
                    className="px-2 py-1 bg-gray-100 text-xs rounded hover:bg-gray-200"
                  >
                    {child.title}
                  </button>
                ))}
                {timelineData.filter(n => n.parentIds?.includes(selectedNodeData.id)).length === 0 && (
                  <span className="text-xs text-gray-500">None in timeline</span>
                )}
              </div>
            </div>
          </div>
          
          {selectedNodeData.link && (
            <a 
              href={selectedNodeData.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 text-blue-500 text-sm inline-block hover:underline"
            >
              View paper/source →
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default TimelineVisualization;