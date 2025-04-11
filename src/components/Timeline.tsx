import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { TimelineNode, timelineData, timelineBranches } from '../data/timelineData';

const Timeline: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<TimelineNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 1600 });
  
  useEffect(() => {
    const updateDimensions = () => {
      if (typeof window !== 'undefined') {
        setDimensions({
          width: Math.max(1200, window.innerWidth - 100),
          height: Math.max(1600, window.innerHeight * 2)
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Calculate approximate text width based on title
  const estimateTextWidth = (title: string) => {
    // Average character width multiplied by length plus some padding
    return Math.min(title.length * 8, 200) + 20;
  };

  const nodePositions = React.useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const YEAR_HEIGHT = 200;
    const YEAR_START = 2017;
    const YEAR_END = 2025;
    const BRANCH_WIDTH = dimensions.width / timelineBranches.length;
    const MIN_X_SPACING = 150;

    // STEP 1: Initial time-based positioning
    timelineData.forEach(node => {
      const branchIndex = timelineBranches.findIndex(b => b.id === node.branch);
      const baseX = BRANCH_WIDTH * (branchIndex + 0.5);
      
      // Calculate year offset (add month if available for more precise positioning)
      const yearOffset = node.year - YEAR_START;
      const monthOffset = node.month ? (node.month - 1) / 12 : 0.5;
      const y = yearOffset * YEAR_HEIGHT + monthOffset * YEAR_HEIGHT;
      
      // Store position
      positions[node.id] = { x: baseX, y: y };
    });
    
    // STEP 2: Apply density-based adjustments
    const applyDensityAdjustments = () => {
      // Group nodes by year and month
      const nodesByYear: Record<number, TimelineNode[]> = {};
      
      timelineData.forEach(node => {
        if (!nodesByYear[node.year]) {
          nodesByYear[node.year] = [];
        }
        nodesByYear[node.year].push(node);
      });
      
      // For each year, adjust layout based on density
      Object.entries(nodesByYear).forEach(([year, nodes]) => {
        const numericYear = parseInt(year);
        
        // If we have many nodes in this year, spread them out
        if (nodes.length > 5) {
          // Group by month
          const nodesByMonth: Record<number, TimelineNode[]> = {};
          nodes.forEach(node => {
            const month = node.month || 6; // Default to mid-year if no month
            if (!nodesByMonth[month]) {
              nodesByMonth[month] = [];
            }
            nodesByMonth[month].push(node);
          });
          
          // Apply vertical staggering based on month density
          Object.entries(nodesByMonth).forEach(([month, monthNodes]) => {
            if (monthNodes.length > 2) {
              // Stagger nodes within the same month
              monthNodes.forEach((node, idx) => {
                const offset = ((idx % 2) * 2 - 1) * 15 * (idx / 2);
                positions[node.id].y += offset;
              });
            }
          });
        }
      });
    };
    
    // Apply density adjustments
    applyDensityAdjustments();
    
    // STEP 3: Resolve overlaps with improved algorithm
    const resolveOverlaps = () => {
      const REPULSION_STRENGTH = 0.6; // Stronger than before
      const MAX_ITERATIONS = 60; // More iterations
      const CONVERGENCE_THRESHOLD = 0.5; // Stricter convergence
      const VERTICAL_DETECTION_RANGE = 120; // Increased from 80px
      
      for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
        let maxMovement = 0;
        
        timelineData.forEach(node => {
          const nodePos = positions[node.id];
          let dx = 0;
          let dy = 0; // Also allow limited vertical adjustment
          
          // Calculate text width based on title length
          const textWidth = estimateTextWidth(node.title);
          
          // Check overlaps with all other nodes
          timelineData.forEach(other => {
            if (other.id === node.id) return;
            
            const otherPos = positions[other.id];
            const verticalDist = Math.abs(otherPos.y - nodePos.y);
            const horizontalDist = Math.abs(otherPos.x - nodePos.x);
            const otherTextWidth = estimateTextWidth(other.title);
            
            // Enhanced vertical detection range - consider more distant nodes
            if (verticalDist < VERTICAL_DETECTION_RANGE) {
              // Calculate minimum desired distance based on text widths
              const minDesiredDist = Math.max(
                MIN_X_SPACING,
                (textWidth + otherTextWidth) / 2
              ) * (other.branch === node.branch ? 1.2 : 0.8);
              
              // Graduated repulsion strength based on proximity
              if (horizontalDist < minDesiredDist) {
                // Stronger repulsion when closer
                const proximityFactor = Math.pow(1 - (horizontalDist / minDesiredDist), 2);
                const force = (minDesiredDist - horizontalDist) * REPULSION_STRENGTH * proximityFactor;
                dx += otherPos.x < nodePos.x ? force : -force;
                
                // Apply slight vertical repulsion when very close horizontally
                if (horizontalDist < minDesiredDist * 0.6 && verticalDist < 40) {
                  const verticalForce = (40 - verticalDist) * 0.15;
                  dy += otherPos.y < nodePos.y ? verticalForce : -verticalForce;
                }
              }
            }
          });
          
          const branchIndex = timelineBranches.findIndex(b => b.id === node.branch);
          const branchCenter = BRANCH_WIDTH * (branchIndex + 0.5);
          const maxOffset = BRANCH_WIDTH * 0.4; // Limit movement within branch
          
          const oldX = nodePos.x;
          const oldY = nodePos.y;
          
          // Apply horizontal movement with branch constraints
          nodePos.x = Math.max(
            branchCenter - maxOffset,
            Math.min(branchCenter + maxOffset, nodePos.x + dx)
          );
          
          // Apply small vertical adjustments (limited to preserve timeline structure)
          nodePos.y = nodePos.y + Math.max(-12, Math.min(12, dy));
          
          // Calculate total movement for convergence check
          maxMovement = Math.max(
            maxMovement, 
            Math.sqrt(Math.pow(nodePos.x - oldX, 2) + Math.pow(nodePos.y - oldY, 2))
          );
        });
        
        if (maxMovement < CONVERGENCE_THRESHOLD) {
          break;
        }
      }
    };
    
    resolveOverlaps();
    return positions;
  }, [dimensions.width]);

  // Draw connections between nodes with improved path routing
  const connections = React.useMemo(() => {
    // Helper function to create smart paths between nodes
    const createSmartPath = (parent: { x: number, y: number }, child: { x: number, y: number }, 
                            parentId: string, childId: string): string => {
      const midY = (parent.y + child.y) / 2;
      const dx = child.x - parent.x;
      const dy = child.y - parent.y;
      let curve = Math.min(Math.abs(dx) * 0.5, Math.abs(dy) * 0.5) * Math.sign(dx);
      
      // Check for nodes that might be in the path
      const potentialObstacles = timelineData.filter(node => {
        // Skip if this is one of our connected nodes
        if (node.id === parentId || node.id === childId) return false;
        
        // Skip if directly related to our connected nodes (should have its own connection)
        if (node.parentIds?.includes(parentId) || node.parentIds?.includes(childId)) return false;
        
        const nodePos = nodePositions[node.id];
        if (!nodePos) return false;
        
        // Check if node is between parent and child nodes (horizontally and vertically)
        const inXRange = (nodePos.x > Math.min(parent.x, child.x) - 30) && 
                         (nodePos.x < Math.max(parent.x, child.x) + 30);
        const inYRange = (nodePos.y > Math.min(parent.y, child.y) - 20) && 
                         (nodePos.y < Math.max(parent.y, child.y) + 20);
        
        if (!inXRange || !inYRange) return false;
        
        // Approximate check for proximity to the path
        // Calculate closest point on line segment
        const lenSquared = dx*dx + dy*dy;
        if (lenSquared === 0) return false; // Parent and child at same position
        
        const t = Math.max(0, Math.min(1, 
          ((nodePos.x - parent.x) * dx + (nodePos.y - parent.y) * dy) / lenSquared
        ));
        
        const projX = parent.x + t * dx;
        const projY = parent.y + t * dy;
        const distance = Math.sqrt(
          Math.pow(nodePos.x - projX, 2) + Math.pow(nodePos.y - projY, 2)
        );
        
        // Consider nodes within 25px of the path
        return distance < 25;
      });
      
      // If we have obstacles, adjust the path
      if (potentialObstacles.length > 0) {
        // Calculate average position of obstacles
        const avgObstacleX = potentialObstacles.reduce((sum, node) => 
          sum + nodePositions[node.id].x, 0) / potentialObstacles.length;
        
        // Determine if we should route left or right of obstacles
        const routeLeft = avgObstacleX > (parent.x + child.x) / 2;
        
        // Adjust curve strength
        curve = Math.min(Math.abs(dx) * 0.7, Math.abs(dy) * 0.7) * (routeLeft ? -1 : 1);
        
        // For significant obstacles or complex paths
        if (potentialObstacles.length > 1 || Math.abs(dy) > 150) {
          // Create a path with intermediate control points
          const ctrlX1 = parent.x + curve * 0.7;
          const ctrlY1 = parent.y + dy * 0.3;
          const ctrlX2 = child.x - curve * 0.7;
          const ctrlY2 = child.y - dy * 0.3;
          
          return `M ${parent.x} ${parent.y} C ${ctrlX1} ${ctrlY1}, ${ctrlX2} ${ctrlY2}, ${child.x} ${child.y}`;
        }
      }
      
      // Standard curved path
      return `M ${parent.x} ${parent.y} C ${parent.x + curve} ${midY}, ${child.x - curve} ${midY}, ${child.x} ${child.y}`;
    };

    return timelineData
      .filter(node => node.parentIds && node.parentIds.length > 0)
      .flatMap(node => 
        (node.parentIds || []).map(parentId => {
          const parent = nodePositions[parentId];
          const child = nodePositions[node.id];
          
          if (!parent || !child) return null;
          
          return {
            id: `${parentId}-${node.id}`,
            path: createSmartPath(parent, child, parentId, node.id),
            parentId,
            childId: node.id,
            color: timelineBranches.find(b => b.id === node.branch)?.color || '#999'
          };
        })
      )
      .filter(Boolean) as { id: string; path: string; parentId: string; childId: string; color: string }[];
  }, [nodePositions]);

  // Generate timeline axis
  const timelineAxis = React.useMemo(() => {
    const years = [];
    for (let year = 2017; year <= 2025; year++) {
      years.push(year);
    }
    
    return years.map(year => ({
      year,
      y: (year - 2017) * 200,
    }));
  }, []);

  const branchLegend = React.useMemo(() => {
    return timelineBranches.map((branch, index) => ({
      ...branch,
      x: (index + 0.5) * (dimensions.width / timelineBranches.length),
      y: 50,
    }));
  }, [dimensions.width]);

  const handleNodeClick = (node: TimelineNode) => {
    setSelectedNode(node);
  };

  const handleNodeMouseEnter = (nodeId: string) => {
    setHoveredNode(nodeId);
  };

  const handleNodeMouseLeave = () => {
    setHoveredNode(null);
  };

  const isConnectionHighlighted = (connection: { parentId: string; childId: string }) => {
    return (
      hoveredNode === connection.parentId || 
      hoveredNode === connection.childId ||
      (selectedNode && 
        (selectedNode.id === connection.parentId || 
         selectedNode.id === connection.childId ||
         (selectedNode.parentIds && selectedNode.parentIds.includes(connection.parentId))))
    );
  };

  const isNodeHighlighted = (nodeId: string) => {
    if (hoveredNode === nodeId) return true;
    if (!selectedNode) return false;
    
    return (
      selectedNode.id === nodeId ||
      (selectedNode.parentIds && selectedNode.parentIds.includes(nodeId)) ||
      timelineData.some(node => 
        node.id === selectedNode.id && 
        node.parentIds?.includes(nodeId)
      )
    );
  };

  return (
    <div className="flex flex-col w-full">
      <div className="bg-white shadow-md p-4 mb-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <div className='flex flex-col items-left mb-1'>
            <h2 className="text-2xl font-bold">Timeline Color Key</h2>
            <p className='text-gray-400'>Version: 0.42.0 (Work in Progress)</p>
          </div>
          <Link href="/about" className="text-blue-600 hover:text-blue-800 transition">
            About this Timeline &rarr;
          </Link>
        </div>
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
      
      <div className="pt-8 pb-8 overflow-x-auto overflow-y-auto">
        <svg 
          ref={svgRef}
          width={dimensions.width} 
          height={dimensions.height}
          className="timeline-svg"
        >
          {/* Year lines */}
          {timelineAxis.map(({ year, y }) => (
            <g key={`year-${year}`}>
              <line 
                x1={0} 
                y1={y} 
                x2={dimensions.width} 
                y2={y} 
                stroke="#e5e7eb" 
                strokeWidth={1} 
                strokeDasharray="5,5"
              />
              <text 
                x={20} 
                y={y + 20} 
                fontSize={14} 
                fill="#6b7280"
                fontWeight="bold"
              >
                {year}
              </text>
            </g>
          ))}
          
          {/* Draw connections */}
          {connections.map(connection => (
            <path
              key={connection.id}
              d={connection.path}
              stroke={connection.color}
              strokeWidth={isConnectionHighlighted(connection) ? 3 : 1.5}
              fill="none"
              opacity={hoveredNode && !isConnectionHighlighted(connection) ? 0.2 : 0.8}
              className="transition-all duration-300"
            />
          ))}
          
          {/* Draw nodes */}
          {timelineData.map(node => {
            const position = nodePositions[node.id];
            const branch = timelineBranches.find(b => b.id === node.branch);
            const isHighlighted = isNodeHighlighted(node.id);
            
            return (
              <g 
                key={node.id}
                transform={`translate(${position.x}, ${position.y})`}
                onClick={() => handleNodeClick(node)}
                onMouseEnter={() => handleNodeMouseEnter(node.id)}
                onMouseLeave={handleNodeMouseLeave}
                className="cursor-pointer transition-all duration-300"
                style={{ opacity: hoveredNode && !isHighlighted ? 0.3 : 1 }}
              >
                {/* Add background for text to prevent lines going through text (was a huge issue in the past)*/}
                <rect
                  x={-estimateTextWidth(node.title) / 2}
                  y={-28}
                  width={estimateTextWidth(node.title)}
                  height={18}
                  fill="white"
                  opacity={0.8}
                  rx={4}
                  ry={4}
                  className="transition-all duration-300"
                  style={{ display: node.title.length > 0 ? 'block' : 'none' }}
                />
                
                <circle
                  r={isHighlighted ? 12 : 8}
                  fill={branch?.color || '#999'}
                  stroke={isHighlighted ? '#000' : '#fff'}
                  strokeWidth={2}
                  className="transition-all duration-300"
                />
                <text
                  y={-15}
                  textAnchor="middle"
                  fontSize={isHighlighted ? 14 : 12}
                  fontWeight={isHighlighted ? 'bold' : 'normal'}
                  fill={isHighlighted ? '#000' : '#6b7280'}
                  className="transition-all duration-300"
                >
                  {node.title.length > 25 ? `${node.title.substring(0, 25)}...` : node.title}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      
      {/* Details panel for a selected node */}
      {selectedNode && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t-2 p-6 max-h-[50vh] overflow-y-auto">
          <button 
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            onClick={() => setSelectedNode(null)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <h2 className="text-2xl font-bold mb-2 text-gray-900">
            {selectedNode.title} ({selectedNode.year})
          </h2>
          
          <div className="mb-4">
            <span 
              className="inline-block px-3 py-1 rounded-full text-sm font-semibold mr-2"
              style={{ 
                backgroundColor: timelineBranches.find(b => b.id === selectedNode.branch)?.color || '#999',
                color: '#fff'
              }}
            >
              {timelineBranches.find(b => b.id === selectedNode.branch)?.name}
            </span>
            {selectedNode.modelSize && (
              <span className="inline-block px-3 py-1 bg-gray-200 rounded-full text-sm font-semibold">
                {selectedNode.modelSize}
              </span>
            )}
          </div>
          
          <p className="text-gray-700 mb-4">{selectedNode.description}</p>
          
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Key Innovations:</h3>
            <ul className="list-disc pl-5">
              {selectedNode.innovations.map((innovation, index) => (
                <li key={index} className="text-gray-700">{innovation}</li>
              ))}
            </ul>
          </div>
          
          {selectedNode.impact && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Impact:</h3>
              <p className="text-gray-700">{selectedNode.impact}</p>
            </div>
          )}
          
          {selectedNode.link && (
            <div className="mt-4">
              <a 
                href={selectedNode.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View Paper / Source
              </a>
            </div>
          )}
          
          {selectedNode.parentIds && selectedNode.parentIds.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Building On:</h3>
              <div className="flex flex-wrap gap-2">
                {selectedNode.parentIds.map(parentId => {
                  const parent = timelineData.find(node => node.id === parentId);
                  if (!parent) return null;
                  
                  return (
                    <button
                      key={parentId}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNode(parent);
                      }}
                      className="px-3 py-1 bg-gray-200 rounded-full text-sm hover:bg-gray-300"
                    >
                      {parent.title}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Influenced:</h3>
            <div className="flex flex-wrap gap-2">
              {timelineData
                .filter(node => node.parentIds?.includes(selectedNode.id))
                .map(child => (
                  <button
                    key={child.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNode(child);
                    }}
                    className="px-3 py-1 bg-gray-200 rounded-full text-sm hover:bg-gray-300"
                  >
                    {child.title}
                  </button>
                ))
              }
              {timelineData.filter(node => node.parentIds?.includes(selectedNode.id)).length === 0 && (
                <span className="text-gray-500">No direct descendants in timeline</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timeline;