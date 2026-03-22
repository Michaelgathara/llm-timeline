import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TimelineNode, timelineBranches, timelineData } from '../data/timelineData';

const YEAR_START = 2017;
const YEAR_END = 2025;
const YEAR_HEIGHT = 190;
const TOP_PADDING = 92;
const BOTTOM_PADDING = 80;
const CLUSTER_THRESHOLD = 3;

type Point = {
  x: number;
  y: number;
};

type Cluster = {
  id: string;
  branch: string;
  year: number;
  month: number;
  memberIds: string[];
  point: Point;
};

type DisplayNode = {
  kind: 'node';
  id: string;
  point: Point;
  node: TimelineNode;
  memberIds: string[];
};

type DisplayCluster = {
  kind: 'cluster';
  id: string;
  point: Point;
  cluster: Cluster;
  memberIds: string[];
};

type DisplayItem = DisplayNode | DisplayCluster;

type DisplayTarget = {
  key: string;
  point: Point;
  memberIds: string[];
};

type Edge = {
  id: string;
  path: string;
  color: string;
  sourceIds: string[];
  targetIds: string[];
  weight: number;
};

const years = Array.from({ length: YEAR_END - YEAR_START + 1 }, (_, index) => YEAR_START + index);

const estimateTextWidth = (title: string) => Math.min(title.length * 8, 200) + 20;

const getLaneLabelLines = (label: string, laneWidth: number) => {
  const compactLabels: Record<string, string[]> = {
    Foundation: ['Foundation'],
    'Decoder-Only Models': laneWidth < 150 ? ['Decoder', 'Only'] : ['Decoder-Only'],
    'Encoder-Only Models': laneWidth < 150 ? ['Encoder', 'Only'] : ['Encoder-Only'],
    'Encoder-Decoder Models': laneWidth < 150 ? ['Encoder', 'Decoder'] : ['Encoder-Decoder'],
    'Mixture-of-Experts': laneWidth < 150 ? ['MoE'] : ['Mixture-of-Experts'],
    'Open-Source Models': laneWidth < 150 ? ['Open', 'Source'] : ['Open-Source'],
    'Alignment Techniques': laneWidth < 150 ? ['Alignment'] : ['Alignment Techniques'],
    'Theoretical Advances': laneWidth < 150 ? ['Theory'] : ['Theoretical Advances'],
    'Multimodal Models': laneWidth < 150 ? ['Multimodal'] : ['Multimodal Models'],
    'Hybrid Approaches': laneWidth < 150 ? ['Hybrid'] : ['Hybrid Approaches'],
  };

  return compactLabels[label] || [label];
};

const Timeline: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<TimelineNode | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [expandedClusters, setExpandedClusters] = useState<Set<string>>(new Set());
  const [dimensions, setDimensions] = useState({ width: 1280, height: 1800 });
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      const viewportWidth =
        canvasRef.current?.clientWidth ||
        (typeof window !== 'undefined' ? window.innerWidth - 64 : 1280);

      setDimensions({
        width: Math.max(1200, Math.floor(viewportWidth * 1.08)),
        height: TOP_PADDING + years.length * YEAR_HEIGHT + BOTTOM_PADDING,
      });
    };

    updateDimensions();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateDimensions);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', updateDimensions);
      }
    };
  }, []);

  const graphState = useMemo(() => {
    const laneWidth = Math.max(120, dimensions.width / timelineBranches.length);
    const totalUsedWidth = laneWidth * timelineBranches.length;
    const leftPadding = Math.max(0, (dimensions.width - totalUsedWidth) / 2);
    
    const laneCenters = new Map(
      timelineBranches.map((branch, index) => [branch.id, leftPadding + laneWidth * (index + 0.5)])
    );
    const basePositions = new Map<string, Point>();

    timelineData.forEach((node) => {
      const month = node.month || 6;
      basePositions.set(node.id, {
        x: laneCenters.get(node.branch) || leftPadding + laneWidth / 2,
        y: TOP_PADDING + (node.year - YEAR_START) * YEAR_HEIGHT + ((month - 1) / 12) * YEAR_HEIGHT,
      });
    });

    const densityBuckets = new Map<string, TimelineNode[]>();
    timelineData.forEach((node) => {
      const bucketKey = `${node.branch}:${node.year}:${node.month || 6}`;
      const bucket = densityBuckets.get(bucketKey) || [];
      bucket.push(node);
      densityBuckets.set(bucketKey, bucket);
    });

    const clusters: Cluster[] = [];
    const collapsedMembers = new Map<string, string>();
    const displayItems: DisplayItem[] = [];
    const displayTargets = new Map<string, DisplayTarget>();

    densityBuckets.forEach((nodes, bucketKey) => {
      const points = nodes
        .map((node) => basePositions.get(node.id))
        .filter(Boolean) as Point[];

      if (points.length === 0) {
        return;
      }

      const point = {
        x: points.reduce((sum, item) => sum + item.x, 0) / points.length,
        y: points.reduce((sum, item) => sum + item.y, 0) / points.length,
      };

      const cluster: Cluster = {
        id: `cluster-${bucketKey}`,
        branch: nodes[0].branch,
        year: nodes[0].year,
        month: nodes[0].month || 6,
        memberIds: nodes.map((node) => node.id),
        point,
      };

      if (nodes.length >= CLUSTER_THRESHOLD) {
        clusters.push(cluster);
      }

      if (nodes.length >= CLUSTER_THRESHOLD && !expandedClusters.has(cluster.id)) {
        cluster.memberIds.forEach((memberId) => {
          collapsedMembers.set(memberId, cluster.id);
        });

        const clusterItem: DisplayCluster = {
          kind: 'cluster',
          id: cluster.id,
          point,
          cluster,
          memberIds: cluster.memberIds,
        };

        displayItems.push(clusterItem);
        displayTargets.set(cluster.id, {
          key: cluster.id,
          point,
          memberIds: cluster.memberIds,
        });
        return;
      }

      nodes.forEach((node, index) => {
        const laneCenter = laneCenters.get(node.branch) || leftPadding + laneWidth / 2;
        const maxSpread = Math.min(laneWidth * 0.3, 45);
        const spreadX = nodes.length > 1 ? (index - (nodes.length - 1) / 2) * maxSpread : 0;
        const spreadY = nodes.length > 1 ? ((index % 2 === 0 ? -1 : 1) * Math.floor(index / 2)) * 18 : 0;
        const itemPoint = {
          x: laneCenter + spreadX,
          y: point.y + spreadY,
        };

        const displayNode: DisplayNode = {
          kind: 'node',
          id: node.id,
          point: itemPoint,
          node,
          memberIds: [node.id],
        };

        displayItems.push(displayNode);
        displayTargets.set(node.id, {
          key: node.id,
          point: itemPoint,
          memberIds: [node.id],
        });
      });
    });

    const nodeItems = displayItems.filter((item): item is DisplayNode => item.kind === 'node');

    for (let iteration = 0; iteration < 28; iteration += 1) {
      let maxMovement = 0;

      nodeItems.forEach((item) => {
        const laneCenter = laneCenters.get(item.node.branch) || leftPadding + laneWidth / 2;
        let dx = 0;

        nodeItems.forEach((other) => {
          if (item.id === other.id) {
            return;
          }

          const verticalDist = Math.abs(other.point.y - item.point.y);
          if (verticalDist > 68) {
            return;
          }

          const baseGap = Math.max(laneWidth * 0.5, 72);
          const textGap = (estimateTextWidth(item.node.title) + estimateTextWidth(other.node.title)) / 2.2;
          const minGap = Math.max(baseGap, textGap);
          const horizontalDist = Math.abs(other.point.x - item.point.x);
          if (horizontalDist >= minGap) {
            return;
          }

          const force = (minGap - horizontalDist) * 0.18;
          dx += other.point.x < item.point.x ? force : -force;
        });

        const oldX = item.point.x;
        const maxOffset = Math.min(laneWidth * 0.42, 55);
        item.point.x = Math.max(
          laneCenter - maxOffset,
          Math.min(laneCenter + maxOffset, item.point.x + dx)
        );
        maxMovement = Math.max(maxMovement, Math.abs(item.point.x - oldX));
      });

      if (maxMovement < 0.5) {
        break;
      }
    }

    nodeItems.forEach((item) => {
      displayTargets.set(item.id, {
        key: item.id,
        point: item.point,
        memberIds: [item.id],
      });
    });

    const createPath = (from: Point, to: Point) => {
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const bend = Math.max(30, Math.min(120, Math.abs(dx) * 0.5 + Math.abs(dy) * 0.12));
      const direction = dx === 0 ? 1 : Math.sign(dx);
      const ctrl1X = from.x + bend * direction;
      const ctrl1Y = from.y + dy * 0.32;
      const ctrl2X = to.x - bend * direction;
      const ctrl2Y = to.y - dy * 0.28;
      return `M ${from.x} ${from.y} C ${ctrl1X} ${ctrl1Y}, ${ctrl2X} ${ctrl2Y}, ${to.x} ${to.y}`;
    };

    const resolveTarget = (nodeId: string): DisplayTarget | null => {
      const collapsedClusterId = collapsedMembers.get(nodeId);
      if (collapsedClusterId) {
        return displayTargets.get(collapsedClusterId) || null;
      }

      return displayTargets.get(nodeId) || null;
    };

    const edgeMap = new Map<string, Edge>();

    timelineData.forEach((node) => {
      (node.parentIds || []).forEach((parentId) => {
        const source = resolveTarget(parentId);
        const target = resolveTarget(node.id);

        if (!source || !target || source.key === target.key) {
          return;
        }

        const edgeId = `${source.key}-${target.key}`;
        const existing = edgeMap.get(edgeId);
        const color = timelineBranches.find((branch) => branch.id === node.branch)?.color || '#999';

        if (existing) {
          existing.weight += 1;
          existing.sourceIds = Array.from(new Set([...existing.sourceIds, ...source.memberIds]));
          existing.targetIds = Array.from(new Set([...existing.targetIds, ...target.memberIds]));
          return;
        }

        edgeMap.set(edgeId, {
          id: edgeId,
          path: createPath(source.point, target.point),
          color,
          sourceIds: source.memberIds,
          targetIds: target.memberIds,
          weight: 1,
        });
      });
    });

    return {
      laneWidth,
      leftPadding,
      clusters,
      collapsedMembers,
      displayItems: displayItems.sort((a, b) => a.point.y - b.point.y),
      displayTargets,
      edges: Array.from(edgeMap.values()),
    };
  }, [dimensions.width, expandedClusters]);

  const hoveredIds = useMemo(() => {
    if (!hoveredKey) {
      return new Set<string>();
    }

    const hoveredTarget = graphState.displayTargets.get(hoveredKey);
    return new Set(hoveredTarget?.memberIds || []);
  }, [graphState.displayTargets, hoveredKey]);

  const selectedIds = useMemo(() => {
    if (!selectedNode) {
      return new Set<string>();
    }

    const childIds = timelineData
      .filter((node) => node.parentIds?.includes(selectedNode.id))
      .map((node) => node.id);

    return new Set([selectedNode.id, ...(selectedNode.parentIds || []), ...childIds]);
  }, [selectedNode]);

  const isItemHighlighted = (item: DisplayItem) => {
    if (hoveredIds.size > 0) {
      return item.memberIds.some((memberId) => hoveredIds.has(memberId));
    }

    if (!selectedNode) {
      return false;
    }

    return item.memberIds.some((memberId) => selectedIds.has(memberId));
  };

  const isEdgeHighlighted = (edge: Edge) => {
    if (hoveredIds.size > 0) {
      return (
        edge.sourceIds.some((memberId) => hoveredIds.has(memberId)) ||
        edge.targetIds.some((memberId) => hoveredIds.has(memberId))
      );
    }

    if (!selectedNode) {
      return false;
    }

    return (
      edge.sourceIds.some((memberId) => selectedIds.has(memberId)) ||
      edge.targetIds.some((memberId) => selectedIds.has(memberId))
    );
  };

  const toggleCluster = (clusterId: string) => {
    const target = graphState.displayTargets.get(clusterId);

    setExpandedClusters((previous) => {
      const next = new Set(previous);
      if (next.has(clusterId)) {
        next.delete(clusterId);
      } else {
        next.add(clusterId);
      }
      return next;
    });

    if (target) {
      canvasRef.current?.scrollTo({
        top: Math.max(target.point.y - 140, 0),
        behavior: 'smooth',
      });
    }
  };

  const selectNode = (node: TimelineNode) => {
    const collapsedClusterId = graphState.collapsedMembers.get(node.id);

    if (collapsedClusterId) {
      setExpandedClusters((previous) => new Set(previous).add(collapsedClusterId));
    }

    setSelectedNode(node);

    const target = graphState.displayTargets.get(node.id);
    if (target) {
      canvasRef.current?.scrollTo({
        top: Math.max(target.point.y - 180, 0),
        behavior: 'smooth',
      });
    }
  };

  const selectedBranch = selectedNode
    ? timelineBranches.find((branch) => branch.id === selectedNode.branch)
    : null;

  return (
    <div className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3 text-sm text-slate-600">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span>Click dense bubbles to expand</span>
          <span>Click a node to inspect it</span>
          {timelineBranches.map((branch) => (
            <span key={branch.id} className="inline-flex items-center gap-2 text-xs text-slate-500">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: branch.color }} />
              {branch.name}
            </span>
          ))}
        </div>
      </div>

      <div ref={canvasRef} className="timeline-scroll relative max-h-[82vh] min-h-[82vh] overflow-auto">
        <svg width={dimensions.width} height={dimensions.height} className="timeline-svg">
          {timelineBranches.map((branch, index) => {
            const laneStart = graphState.leftPadding + graphState.laneWidth * index;
            const laneCenter = laneStart + graphState.laneWidth / 2;
            const labelLines = getLaneLabelLines(branch.name, graphState.laneWidth);
            return (
              <g key={branch.id}>
                <rect
                  x={laneStart + 10}
                  y={18}
                  width={graphState.laneWidth - 20}
                  height={labelLines.length > 1 ? 54 : 40}
                  rx={18}
                  fill={branch.color}
                  opacity={0.08}
                />
                <text
                  x={laneCenter}
                  y={labelLines.length > 1 ? 33 : 43}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight="bold"
                  fill="#0f172a"
                >
                  {labelLines.map((line, lineIndex) => (
                    <tspan
                      key={`${branch.id}-${line}`}
                      x={laneCenter}
                      dy={lineIndex === 0 ? 0 : 13}
                    >
                      {line}
                    </tspan>
                  ))}
                </text>
                {index > 0 && (
                  <line
                    x1={laneStart}
                    y1={TOP_PADDING - 26}
                    x2={laneStart}
                    y2={dimensions.height}
                    stroke="#e2e8f0"
                    strokeWidth={1}
                  />
                )}
              </g>
            );
          })}

          {years.map((year) => {
            const y = TOP_PADDING + (year - YEAR_START) * YEAR_HEIGHT;
            return (
              <g key={year}>
                <line
                  x1={0}
                  y1={y}
                  x2={dimensions.width}
                  y2={y}
                  stroke="#cbd5e1"
                  strokeWidth={1}
                  strokeDasharray="6,8"
                />
                <text x={18} y={y - 12} fontSize={13} fontWeight="bold" fill="#475569">
                  {year}
                </text>
              </g>
            );
          })}

          {graphState.clusters
            .filter((cluster) => expandedClusters.has(cluster.id))
            .map((cluster) => (
              <circle
                key={`${cluster.id}-ring`}
                cx={cluster.point.x}
                cy={cluster.point.y}
                r={40 + Math.min(cluster.memberIds.length * 3, 18)}
                fill="none"
                stroke={timelineBranches.find((branch) => branch.id === cluster.branch)?.color || '#999'}
                strokeWidth={1.5}
                strokeDasharray="6,4"
                opacity={0.35}
              />
            ))}

          {graphState.edges.map((edge) => (
            <path
              key={edge.id}
              d={edge.path}
              stroke={edge.color}
              strokeWidth={isEdgeHighlighted(edge) ? 3 : Math.min(2.6, 1.2 + edge.weight * 0.25)}
              fill="none"
              opacity={hoveredIds.size > 0 || selectedNode ? (isEdgeHighlighted(edge) ? 0.95 : 0.12) : 0.5}
              className="transition-all duration-300"
            />
          ))}

          {graphState.displayItems.map((item) => {
            const isHighlighted = isItemHighlighted(item);
            const faded = hoveredIds.size > 0 || selectedNode ? !isHighlighted && hoveredKey !== item.id : false;

            if (item.kind === 'cluster') {
              const branch =
                timelineBranches.find((entry) => entry.id === item.cluster.branch) || timelineBranches[0];
              const radius = 15 + Math.min(item.cluster.memberIds.length * 1.8, 14);
              const isExpanded = expandedClusters.has(item.cluster.id);

              return (
                <g
                  key={item.id}
                  transform={`translate(${item.point.x}, ${item.point.y})`}
                  onClick={() => toggleCluster(item.cluster.id)}
                  onMouseEnter={() => setHoveredKey(item.id)}
                  onMouseLeave={() => setHoveredKey(null)}
                  className="cursor-pointer transition-all duration-300"
                  style={{ opacity: faded ? 0.28 : 1 }}
                >
                  <circle
                    r={radius}
                    fill="white"
                    stroke={branch.color}
                    strokeWidth={isExpanded ? 3 : 2.5}
                  />
                  <circle r={radius - 6} fill={branch.color} opacity={0.14} />
                  <text y={4} textAnchor="middle" fontSize={12} fontWeight="bold" fill="#0f172a">
                    {item.cluster.memberIds.length}
                  </text>
                </g>
              );
            }

            const branch =
              timelineBranches.find((entry) => entry.id === item.node.branch) || timelineBranches[0];

            return (
              <g
                key={item.id}
                transform={`translate(${item.point.x}, ${item.point.y})`}
                onClick={() => selectNode(item.node)}
                onMouseEnter={() => setHoveredKey(item.id)}
                onMouseLeave={() => setHoveredKey(null)}
                className="cursor-pointer transition-all duration-300"
                style={{ opacity: faded ? 0.22 : 1 }}
              >
                <rect
                  x={-estimateTextWidth(item.node.title) / 2}
                  y={-28}
                  width={estimateTextWidth(item.node.title)}
                  height={20}
                  rx={6}
                  ry={6}
                  fill="white"
                  opacity={0.92}
                />
                <circle
                  r={isHighlighted ? 11 : 7}
                  fill={branch.color}
                  stroke={isHighlighted ? '#0f172a' : '#ffffff'}
                  strokeWidth={2}
                />
                <text
                  y={-14}
                  textAnchor="middle"
                  fontSize={isHighlighted ? 13 : 12}
                  fontWeight={isHighlighted ? 'bold' : 'normal'}
                  fill={isHighlighted ? '#0f172a' : '#475569'}
                >
                  {item.node.title.length > 26 ? `${item.node.title.substring(0, 26)}...` : item.node.title}
                </text>
              </g>
            );
          })}
        </svg>

        {selectedNode && (
          <div className="pointer-events-none absolute bottom-4 right-4 max-w-sm rounded-3xl border border-slate-200 bg-white/96 p-4 shadow-lg backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                  Selected
                </p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">{selectedNode.title}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedNode.year}
                  {selectedNode.month ? ` / ${selectedNode.month.toString().padStart(2, '0')}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="pointer-events-auto rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {selectedBranch && (
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                  style={{ backgroundColor: selectedBranch.color }}
                >
                  {selectedBranch.name}
                </span>
              )}
              {selectedNode.modelSize && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                  {selectedNode.modelSize}
                </span>
              )}
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-700">{selectedNode.description}</p>

            {selectedNode.link && (
              <a
                href={selectedNode.link}
                target="_blank"
                rel="noopener noreferrer"
                className="pointer-events-auto mt-3 inline-flex items-center text-sm font-medium text-sky-700 hover:underline"
              >
                View source
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;