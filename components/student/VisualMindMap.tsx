"use client";

import type { MindMapNode } from "@/types/mindmap";
import { Download, Maximize2 } from "lucide-react";
import { useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Handle,
  MarkerType,
  MiniMap,
  Node,
  Panel,
  Position,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";

interface VisualMindMapProps {
  nodes: MindMapNode[];
  locale: string;
  lessonId?: string;
}

// Custom node component for mind map nodes
function MindMapNodeComponent({ data }: { data: any }) {
  const isRTL = data.locale === "ar";
  const title = isRTL ? data.node.titleAr : data.node.titleEn;

  // Color based on type
  const getNodeColor = () => {
    switch (data.node.type) {
      case "ROOT":
        return "from-purple-500 to-pink-500";
      case "CATEGORY":
        return "from-blue-500 to-cyan-500";
      case "TOPIC":
        return "from-green-500 to-emerald-500";
      case "SUBTOPIC":
        return "from-orange-500 to-yellow-500";
      case "DETAIL":
        return "from-gray-500 to-slate-500";
      default:
        return "from-indigo-500 to-purple-500";
    }
  };

  // Size based on type
  const getNodeSize = () => {
    switch (data.node.type) {
      case "ROOT":
        return "px-8 py-6 text-xl font-bold";
      case "CATEGORY":
        return "px-6 py-4 text-lg font-semibold";
      case "TOPIC":
        return "px-5 py-3 text-base font-medium";
      case "SUBTOPIC":
        return "px-4 py-2 text-sm";
      default:
        return "px-3 py-2 text-xs";
    }
  };

  // Invisible handle style for student view (read-only)
  const handleStyle = {
    opacity: 0,
    pointerEvents: "none" as const,
  };

  return (
    <>
      {/* Invisible handles - needed for edges to connect but not visible to students */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={handleStyle}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={handleStyle}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={handleStyle}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={handleStyle}
      />

      <div
        className={`
          ${getNodeSize()}
          bg-gradient-to-br ${getNodeColor()}
          text-white rounded-2xl shadow-lg
          border-2 border-white/20
          backdrop-blur-sm
          transition-all duration-300
          hover:scale-105 hover:shadow-2xl
          cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${isRTL ? "text-right" : "text-left"}
        `}
        style={{
          minWidth: data.node.type === "ROOT" ? "200px" : "150px",
        }}
        tabIndex={0}
        role="button"
        aria-label={`${title} - ${data.node.type || "Node"}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            // Trigger click event on Enter or Space
            (e.currentTarget as HTMLElement).click();
          }
        }}
      >
        <div className="font-bold">{title}</div>
        {data.node.type && (
          <div className="text-xs opacity-75 mt-1">{data.node.type}</div>
        )}
      </div>
    </>
  );
}

const nodeTypes = {
  mindMapNode: MindMapNodeComponent,
};

function VisualMindMapInner({
  nodes: mindMapNodes,
  locale,
  lessonId,
}: VisualMindMapProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null);
  const [relationships, setRelationships] = useState<any[]>([]);

  // Load relationships
  useEffect(() => {
    const loadRelationships = async () => {
      if (!lessonId) {
        console.log("No lessonId provided to VisualMindMap");
        return;
      }

      console.log("Loading relationships for lessonId:", lessonId);

      try {
        const res = await fetch(
          `/api/student/mindmap/relationships?lessonId=${lessonId}`
        );
        console.log("Relationships API response status:", res.status);

        if (res.ok) {
          const data = await res.json();
          console.log("Loaded relationships:", data.relationships);
          setRelationships(data.relationships || []);
        } else {
          console.error("Failed to load relationships, status:", res.status);
        }
      } catch (error) {
        console.error("Failed to load relationships:", error);
      }
    };

    loadRelationships();
  }, [lessonId]);

  // Convert mind map nodes to ReactFlow nodes and edges
  useEffect(() => {
    if (!mindMapNodes || mindMapNodes.length === 0) return;

    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];
    const nodePositions = new Map<string, { x: number; y: number }>();

    // Calculate positions using a radial layout or use saved positions (same as admin)
    const centerX = 400;
    const centerY = 300;
    const radiusIncrement = 200;

    // Group nodes by level
    const nodesByLevel = new Map<number, MindMapNode[]>();
    mindMapNodes.forEach((node) => {
      const level = node.level || 0;
      if (!nodesByLevel.has(level)) {
        nodesByLevel.set(level, []);
      }
      nodesByLevel.get(level)!.push(node);
    });

    // Position nodes in a radial layout or use saved positions
    nodesByLevel.forEach((levelNodes, level) => {
      const radius = level * radiusIncrement;
      const angleStep = (2 * Math.PI) / Math.max(levelNodes.length, 1);

      levelNodes.forEach((node, index) => {
        // Use saved position if available, otherwise calculate
        let x, y;

        // Check if saved positions exist (must be numbers, not null/undefined)
        if (
          typeof node.positionX === "number" &&
          typeof node.positionY === "number"
        ) {
          x = node.positionX;
          y = node.positionY;
          console.log(`Using saved position for node ${node.id}:`, { x, y });
        } else {
          const angle = index * angleStep;
          x = centerX + radius * Math.cos(angle);
          y = centerY + radius * Math.sin(angle);
          console.log(`Calculating position for node ${node.id}:`, { x, y });
        }

        nodePositions.set(node.id, { x, y });

        flowNodes.push({
          id: node.id,
          type: "mindMapNode",
          position: { x, y },
          data: { node, locale },
          draggable: false, // Read-only for students
        });
      });
    });

    // Create edges from parent-child relationships (hierarchical structure)
    mindMapNodes.forEach((node) => {
      if (node.parentId) {
        flowEdges.push({
          id: `parent-${node.parentId}-${node.id}`,
          source: node.parentId,
          target: node.id,
          type: "smoothstep",
          animated: true,
          style: { stroke: "#94a3b8", strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#94a3b8",
            width: 20,
            height: 20,
          },
        });
      }
    });

    // Create edges from custom relationships (same as admin)
    relationships.forEach((rel) => {
      flowEdges.push({
        id: rel.id,
        source: rel.fromNodeId,
        target: rel.toNodeId,
        sourceHandle: rel.sourceHandle || undefined,
        targetHandle: rel.targetHandle || undefined,
        type: "smoothstep",
        animated: true,
        style: {
          stroke: rel.color || "#f59e0b",
          strokeWidth: rel.lineWidth || 3,
          strokeDasharray: rel.lineStyle === "dashed" ? "5,5" : undefined,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: rel.color || "#f59e0b",
          width: 25,
          height: 25,
        },
        label: locale === "ar" ? rel.labelAr : rel.labelEn,
      });
    });

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [mindMapNodes, locale, relationships]);

  const handleExport = () => {
    // Export as image (you can implement this with html2canvas or similar)
    alert("Export functionality - to be implemented");
  };

  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node.data.node);
  };

  return (
    <div
      className={`relative w-full ${
        isFullscreen ? "fixed inset-0 z-50" : "h-[800px]"
      } bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl overflow-hidden shadow-2xl`}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        zoomOnScroll={true}
        panOnScroll={true}
        panOnDrag={true}
      >
        <Background color="#94a3b8" gap={15} variant={"dots" as any} size={1} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const nodeData = node.data as any;
            return nodeData?.node?.color || "#6366f1";
          }}
          className="!bg-white/90 dark:!bg-slate-800/90"
        />

        {/* Control Panel */}
        <Panel position="top-right" className="flex gap-2">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            {locale === "ar" ? "تصدير" : "Export"}
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg flex items-center gap-2 transition-all"
          >
            <Maximize2 className="w-4 h-4" />
            {isFullscreen
              ? locale === "ar"
                ? "إغلاق ملء الشاشة"
                : "Exit Fullscreen"
              : locale === "ar"
              ? "ملء الشاشة"
              : "Fullscreen"}
          </button>
        </Panel>

        {/* Legend */}
        <Panel
          position="bottom-right"
          className="bg-white/90 dark:bg-slate-800/90 rounded-lg shadow-lg p-3"
        >
          <div className="text-xs font-semibold mb-2 text-slate-700 dark:text-slate-300">
            Node Types
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-500"></div>
              <span className="text-slate-600 dark:text-slate-400">Root</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500"></div>
              <span className="text-slate-600 dark:text-slate-400">
                Category
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-500 to-emerald-500"></div>
              <span className="text-slate-600 dark:text-slate-400">Topic</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500"></div>
              <span className="text-slate-600 dark:text-slate-400">
                Subtopic
              </span>
            </div>
          </div>
        </Panel>
      </ReactFlow>

      {/* Detail Panel */}
      {selectedNode && (
        <div
          dir={locale === "ar" ? "rtl" : "ltr"}
          className={`absolute top-0 ${
            locale === "ar" ? "left-0 border-r" : "right-0 border-l"
          } w-96 h-full bg-white dark:bg-slate-800 shadow-2xl border-slate-200 dark:border-slate-700 overflow-y-auto z-10`}
        >
          <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              {locale === "ar" ? "تفاصيل العقدة" : "Node Details"}
            </h3>
            <button
              onClick={() => setSelectedNode(null)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <span className="text-2xl text-slate-600 dark:text-slate-400">
                ×
              </span>
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Title */}
            <div>
              <h4 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                {locale === "ar" ? selectedNode.titleAr : selectedNode.titleEn}
              </h4>
              <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                {selectedNode.type}
              </span>
            </div>

            {/* Description */}
            {(selectedNode.descriptionAr || selectedNode.descriptionEn) && (
              <div>
                <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {locale === "ar" ? "الوصف" : "Description"}
                </h5>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-slate-600 dark:text-slate-400">
                    {locale === "ar"
                      ? selectedNode.descriptionAr
                      : selectedNode.descriptionEn}
                  </p>
                </div>
              </div>
            )}

            {/* Dates */}
            {(selectedNode.dateHijri || selectedNode.dateGregorian) && (
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <span>📅</span>
                  {locale === "ar" ? "التاريخ" : "Date"}
                </h5>
                {selectedNode.dateHijri && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-medium">
                      {locale === "ar" ? "هجري:" : "Hijri:"}
                    </span>{" "}
                    {selectedNode.dateHijri}
                  </p>
                )}
                {selectedNode.dateGregorian && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-medium">
                      {locale === "ar" ? "ميلادي:" : "Gregorian:"}
                    </span>{" "}
                    {selectedNode.dateGregorian}
                  </p>
                )}
              </div>
            )}

            {/* Location */}
            {selectedNode.location && (
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <span>📍</span>
                  {locale === "ar" ? "الموقع" : "Location"}
                </h5>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedNode.location}
                </p>
              </div>
            )}

            {/* Participants */}
            {selectedNode.participants &&
              (() => {
                try {
                  const participants =
                    typeof selectedNode.participants === "string"
                      ? JSON.parse(selectedNode.participants)
                      : selectedNode.participants;
                  if (Array.isArray(participants) && participants.length > 0) {
                    return (
                      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                        <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                          <span>👥</span>
                          {locale === "ar" ? "المشاركون" : "Participants"}
                        </h5>
                        <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1">
                          {participants.map((p: string, i: number) => (
                            <li key={i}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  }
                } catch (e) {
                  // If parsing fails, show as string
                  return (
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                      <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                        <span>👥</span>
                        {locale === "ar" ? "المشاركون" : "Participants"}
                      </h5>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {selectedNode.participants}
                      </p>
                    </div>
                  );
                }
                return null;
              })()}

            {/* Decision */}
            {selectedNode.decision && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <h5 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                  <span>⚖️</span>
                  {locale === "ar" ? "القرار" : "Decision"}
                </h5>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedNode.decision}
                </p>
              </div>
            )}

            {/* Moral Lessons */}
            {selectedNode.moralLessons &&
              (() => {
                try {
                  const lessons =
                    typeof selectedNode.moralLessons === "string"
                      ? JSON.parse(selectedNode.moralLessons)
                      : selectedNode.moralLessons;
                  if (Array.isArray(lessons) && lessons.length > 0) {
                    return (
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                        <h5 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center gap-2">
                          <span>💡</span>
                          {locale === "ar"
                            ? "الدروس المستفادة"
                            : "Moral Lessons"}
                        </h5>
                        <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1">
                          {lessons.map((lesson: string, i: number) => (
                            <li key={i}>{lesson}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  }
                } catch (e) {
                  return (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                      <h5 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center gap-2">
                        <span>💡</span>
                        {locale === "ar" ? "الدروس المستفادة" : "Moral Lessons"}
                      </h5>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {selectedNode.moralLessons}
                      </p>
                    </div>
                  );
                }
                return null;
              })()}

            {/* Modern Applications */}
            {selectedNode.modernApps &&
              (() => {
                try {
                  const apps =
                    typeof selectedNode.modernApps === "string"
                      ? JSON.parse(selectedNode.modernApps)
                      : selectedNode.modernApps;
                  if (Array.isArray(apps) && apps.length > 0) {
                    return (
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                        <h5 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-2">
                          <span>🎯</span>
                          {locale === "ar"
                            ? "التطبيقات المعاصرة"
                            : "Modern Applications"}
                        </h5>
                        <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1">
                          {apps.map((app: string, i: number) => (
                            <li key={i}>{app}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  }
                } catch (e) {
                  return (
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                      <h5 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-2">
                        <span>🎯</span>
                        {locale === "ar"
                          ? "التطبيقات المعاصرة"
                          : "Modern Applications"}
                      </h5>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {selectedNode.modernApps}
                      </p>
                    </div>
                  );
                }
                return null;
              })()}

            {/* Sources */}
            {selectedNode.sources &&
              (() => {
                try {
                  const sources =
                    typeof selectedNode.sources === "string"
                      ? JSON.parse(selectedNode.sources)
                      : selectedNode.sources;
                  if (Array.isArray(sources) && sources.length > 0) {
                    return (
                      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                        <h5 className="text-sm font-semibold text-orange-700 dark:text-orange-300 mb-2 flex items-center gap-2">
                          <span>📚</span>
                          {locale === "ar" ? "المصادر" : "Sources"}
                        </h5>
                        <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1">
                          {sources.map((source: string, i: number) => (
                            <li key={i}>{source}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  }
                } catch (e) {
                  return (
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                      <h5 className="text-sm font-semibold text-orange-700 dark:text-orange-300 mb-2 flex items-center gap-2">
                        <span>📚</span>
                        {locale === "ar" ? "المصادر" : "Sources"}
                      </h5>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {selectedNode.sources}
                      </p>
                    </div>
                  );
                }
                return null;
              })()}
          </div>
        </div>
      )}
    </div>
  );
}

export default function VisualMindMap(props: VisualMindMapProps) {
  return (
    <ReactFlowProvider>
      <VisualMindMapInner {...props} />
    </ReactFlowProvider>
  );
}
