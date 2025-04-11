/**
 * Absolutely garbage experimental code
 */

import React, { useState, useEffect, useRef } from 'react';
import { TimelineNode, timelineData, timelineBranches } from '../data/timelineData';


interface CompanyData {
  id: string;
  name: string;
  color: string;
}

const companyMapping: Record<string, string> = {
  // Google/DeepMind
  "bert": "google",
  "t5": "google",
  "switch-transformer": "google",
  "palm": "google",
  "palm2": "google",
  "gemini": "google",
  "gemini-nano": "google",
  
  // OpenAI
  "gpt1": "openai",
  "gpt2": "openai",
  "gpt3": "openai",
  "instructgpt": "openai",
  "chatgpt": "openai",
  "gpt4": "openai",
  "gpt4o": "openai",
  "gpt4_turbo": "openai",
  "sora": "openai",
  "multimodal-foundation": "openai",
  "dalle3": "openai",
  
  // Meta
  "opt": "meta",
  "llama1": "meta",
  "llama2": "meta",
  "llama3": "meta",
  "llama4": "meta",
  
  // Anthropic
  "constitutional-ai": "anthropic",
  "claude1": "anthropic",
  "claude2": "anthropic",
  "claude3": "anthropic",
  "claude3_5": "anthropic",
  "claude3_7": "anthropic",
  
  // Microsoft
  "phi": "microsoft",
  "megatron": "microsoft",
  
  // Foundation/Base Models
  "transformer": "foundation",
  "rag": "foundation",
  "scaling-laws": "foundation",
  "mamba": "foundation",
  "chinchilla": "foundation",
  
  // Other companies
  "falcon": "tii",
  "mistral": "mistral",
  "flan": "other",
  "alpaca": "stanford",
  "midjourney": "midjourney"
};

const companies: CompanyData[] = [
  { id: "foundation", name: "Foundation Models", color: "#4285F4" },
  { id: "openai", name: "OpenAI", color: "#EA4335" },
  { id: "google", name: "Google/DeepMind", color: "#FBBC05" },
  { id: "meta", name: "Meta", color: "#3498DB" },
  { id: "anthropic", name: "Anthropic", color: "#9B59B6" },
  { id: "microsoft", name: "Microsoft", color: "#1ABC9C" },
  { id: "mistral", name: "Mistral AI", color: "#8E44AD" },
  { id: "tii", name: "TII", color: "#E67E22" },
  { id: "stanford", name: "Stanford", color: "#27AE60" },
  { id: "other", name: "Other Organizations", color: "#7F8C8D" }
];


const YEAR_START = 2017;
const YEAR_END = 2025;
const YEAR_WIDTH = 180; 
const COMPANY_HEIGHT = 120; 
const LABEL_WIDTH = 180; 
const HEADER_HEIGHT = 60; 

const CompanyTimeline: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<TimelineNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ 
    width: (YEAR_END - YEAR_START + 1) * YEAR_WIDTH + LABEL_WIDTH,
    height: companies.length * COMPANY_HEIGHT + HEADER_HEIGHT
  });
  
  useEffect(() => {
    const updateDimensions = () => {
      if (typeof window !== 'undefined') {
        setDimensions({
          width: Math.max((YEAR_END - YEAR_START + 1) * YEAR_WIDTH + LABEL_WIDTH, window.innerWidth - 100),
          height: companies.length * COMPANY_HEIGHT + HEADER_HEIGHT
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  const nodePositions = React.useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    
    type YearCompanyMap = Record<number, Record<string, TimelineNode[]>>;
    const yearCompanyNodes: YearCompanyMap = {};
    
    for (let year = YEAR_START; year <= YEAR_END; year++) {
      yearCompanyNodes[year] = {};
      companies.forEach(company => {
        yearCompanyNodes[year][company.id] = [];
      });
    }
    
    timelineData.forEach(node => {
      const company = companyMapping[node.id] || "other";
      if (!yearCompanyNodes[node.year][company]) {
        yearCompanyNodes[node.year][company] = [];
      }
      yearCompanyNodes[node.year][company].push(node);
    });
    
    for (let year = YEAR_START; year <= YEAR_END; year++) {
      const yearIndex = year - YEAR_START;
      const cellLeft = yearIndex * YEAR_WIDTH + LABEL_WIDTH;
      const cellRight = cellLeft + YEAR_WIDTH;
      const cellCenterX = (cellLeft + cellRight) / 2;
      
      companies.forEach((company, companyIndex) => {
        const nodes = yearCompanyNodes[year][company.id];
        if (nodes.length === 0) return;
        
        const cellTop = companyIndex * COMPANY_HEIGHT + HEADER_HEIGHT;
        const cellBottom = cellTop + COMPANY_HEIGHT;
        const cellCenterY = (cellTop + cellBottom) / 2;
        
        if (nodes.length === 1) {
          positions[nodes[0].id] = { x: cellCenterX, y: cellCenterY };
          return;
        }
        
        const nodeCount = nodes.length;
        let cols = Math.ceil(Math.sqrt(nodeCount));
        let rows = Math.ceil(nodeCount / cols);
        
        if (nodeCount <= cols * (rows - 1) + 1 && nodeCount > 2) {
          rows--;
          cols = Math.ceil(nodeCount / rows);
        }
        
        const cellWidth = YEAR_WIDTH * 0.9;
        const cellHeight = COMPANY_HEIGHT * 0.8;
        const colWidth = cellWidth / cols;
        const rowHeight = cellHeight / rows;
        
        nodes.forEach((node, index) => {
          const row = Math.floor(index / cols);
          const col = index % cols;
          
          const x = cellLeft + colWidth * (col + 0.5);
          const y = cellTop + rowHeight * (row + 0.5);
          
          positions[node.id] = { x, y };
        });
      });
    }
    
    return positions;
  }, [dimensions.width]);

  const connections = React.useMemo(() => {
    return timelineData
      .filter(node => node.parentIds && node.parentIds.length > 0)
      .flatMap(node => 
        (node.parentIds || []).map(parentId => {
          const parent = nodePositions[parentId];
          const child = nodePositions[node.id];
          
          if (!parent || !child) return null;
          
          const isSameCompany = companyMapping[node.id] === companyMapping[parentId];
          
          let path = '';
          if (isSameCompany) {
            const midX = (parent.x + child.x) / 2;
            const dx = child.x - parent.x;
            const curveY = Math.min(20, Math.abs(dx) * 0.2) * (parent.y < child.y ? 1 : -1);
            path = `M ${parent.x} ${parent.y} C ${midX} ${parent.y + curveY}, ${midX} ${child.y - curveY}, ${child.x} ${child.y}`;
          } else {
            const midX = (parent.x + child.x) / 2;
            const midY = (parent.y + child.y) / 2;
            
            const cp1x = parent.x + (midX - parent.x) * 0.5;
            const cp1y = parent.y;
            const cp2x = midX;
            const cp2y = midY;
            const cp3x = child.x - (child.x - midX) * 0.5;
            const cp3y = child.y;
            
            path = `M ${parent.x} ${parent.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${midX} ${midY} S ${cp3x} ${cp3y}, ${child.x} ${child.y}`;
          }
          
          return {
            id: `${parentId}-${node.id}`,
            path,
            parentId,
            childId: node.id,
            color: timelineBranches.find(b => b.id === node.branch)?.color || '#999'
          };
        })
      )
      .filter(Boolean) as { id: string; path: string; parentId: string; childId: string; color: string }[];
  }, [nodePositions]);

  const timelineYears = React.useMemo(() => {
    const years = [];
    for (let year = YEAR_START; year <= YEAR_END; year++) {
      years.push(year);
    }
    
    return years.map((year, index) => ({
      year,
      x: index * YEAR_WIDTH + YEAR_WIDTH / 2 + LABEL_WIDTH,
      left: index * YEAR_WIDTH + LABEL_WIDTH,
    }));
  }, []);

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
        <h2 className="text-2xl font-bold mb-2">Key</h2>
        <div className="flex flex-wrap gap-3 items-center mb-4">
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
        <div className="flex flex-wrap gap-3 items-center">
          {companies.map(company => (
            <div key={company.id} className="flex items-center">
              <div 
                className="w-4 h-4 mr-1" 
                style={{ backgroundColor: company.color, opacity: 0.3 }}
              />
              <span className="text-sm">{company.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="overflow-x-auto overflow-y-auto pt-2 pb-8">
        <svg 
          ref={svgRef}
          width={dimensions.width} 
          height={dimensions.height}
          className="timeline-svg"
        >
          {timelineYears.map(({ year, x, left }) => (
            <g key={`year-${year}`}>
              <text 
                x={x} 
                y={30} 
                fontSize={16} 
                fill="#374151"
                fontWeight="bold"
                textAnchor="middle"
              >
                {year}
              </text>
              <line 
                x1={left} 
                y1={0} 
                x2={left} 
                y2={dimensions.height} 
                stroke="#e5e7eb" 
                strokeWidth={1} 
              />
            </g>
          ))}
          
          {/* Add header/footer horizontal line */}
          <line 
            x1={0} 
            y1={HEADER_HEIGHT} 
            x2={dimensions.width} 
            y2={HEADER_HEIGHT} 
            stroke="#d1d5db" 
            strokeWidth={1.5} 
          />
          {companies.map((company, index) => (
            <g key={`company-${company.id}`}>
              {/* Company row background */}
              <rect
                x={0}
                y={index * COMPANY_HEIGHT + HEADER_HEIGHT}
                width={dimensions.width}
                height={COMPANY_HEIGHT}
                fill={company.color}
                opacity={0.05}
              />
              {/* Company name */}
              <text
                x={LABEL_WIDTH / 2} // Center in the label column
                y={index * COMPANY_HEIGHT + COMPANY_HEIGHT/2 + HEADER_HEIGHT}
                fontSize={14}
                fill="#374151"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {company.name}
              </text>
              <line 
                x1={LABEL_WIDTH} 
                y1={0} 
                x2={LABEL_WIDTH} 
                y2={dimensions.height} 
                stroke="#d1d5db" 
                strokeWidth={1.5} 
              />
              <line 
                x1={0} 
                y1={(index+1) * COMPANY_HEIGHT + HEADER_HEIGHT} 
                x2={dimensions.width} 
                y2={(index+1) * COMPANY_HEIGHT + HEADER_HEIGHT} 
                stroke="#e5e7eb" 
                strokeWidth={1} 
              />
            </g>
          ))}
          
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
          
          {timelineData.map(node => {
            const position = nodePositions[node.id];
            const branch = timelineBranches.find(b => b.id === node.branch);
            const isHighlighted = isNodeHighlighted(node.id);
            
            if (!position) return null;
            
            const company = companyMapping[node.id] || "other";
            const companyNodesCount = timelineData.filter(n => 
              n.year === node.year && (companyMapping[n.id] || "other") === company
            ).length;
            
            const baseRadius = companyNodesCount > 3 ? 6 : 8;
            const highlightedRadius = companyNodesCount > 3 ? 9 : 12;
            
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
                <circle
                  r={isHighlighted ? highlightedRadius : baseRadius}
                  fill={branch?.color || '#999'}
                  stroke={isHighlighted ? '#000' : '#fff'}
                  strokeWidth={2}
                  className="transition-all duration-300"
                />
                <text
                  y={-baseRadius - 8}
                  textAnchor="middle"
                  fontSize={isHighlighted ? 13 : 11}
                  fontWeight={isHighlighted ? 'bold' : 'normal'}
                  fill={isHighlighted ? '#000' : '#6b7280'}
                  className="transition-all duration-300"
                >
                  {companyNodesCount > 3 
                    ? (node.title.length > 15 ? `${node.title.substring(0, 15)}...` : node.title)
                    : (node.title.length > 25 ? `${node.title.substring(0, 25)}...` : node.title)
                  }
                </text>
                {node.modelSize && (
                  <text
                    y={baseRadius + 15}
                    x={0}
                    textAnchor="middle"
                    fontSize={9}
                    fill="#6b7280"
                  >
                    {node.modelSize}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      
      {selectedNode && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t-2 p-6 max-h-[50vh] overflow-y-auto details-panel">
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

export default CompanyTimeline;