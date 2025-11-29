"use client";

import type { MindMapNode } from "@/types/mindmap";
import { Maximize2, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Connection,
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

interface AdminVisualMindMapEditorProps {
  lessonId: number;
  locale: string;
  onSave?: () => void;
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

  const handleStyle = {
    background: "#3b82f6",
    width: "20px",
    height: "20px",
    border: "3px solid white",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
    cursor: "crosshair",
    zIndex: 10,
  };

  return (
    <>
      {/* Each handle can be both source and target - positioned on all 4 sides */}
      {/* Top handle */}
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        style={handleStyle}
        isConnectable={true}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{ ...handleStyle, opacity: 0, pointerEvents: "none" }}
        isConnectable={true}
      />

      {/* Right handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={handleStyle}
        isConnectable={true}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right"
        style={{ ...handleStyle, opacity: 0, pointerEvents: "none" }}
        isConnectable={true}
      />

      {/* Bottom handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={handleStyle}
        isConnectable={true}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom"
        style={{ ...handleStyle, opacity: 0, pointerEvents: "none" }}
        isConnectable={true}
      />

      {/* Left handle */}
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        style={handleStyle}
        isConnectable={true}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{ ...handleStyle, opacity: 0, pointerEvents: "none" }}
        isConnectable={true}
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
          cursor-move
          ${isRTL ? "text-right" : "text-left"}
        `}
        style={{
          minWidth: data.node.type === "ROOT" ? "200px" : "150px",
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

function AdminVisualMindMapEditorInner({
  lessonId,
  locale,
  onSave,
}: AdminVisualMindMapEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [mindMapNodes, setMindMapNodes] = useState<MindMapNode[]>([]);
  const [relationships, setRelationships] = useState<any[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [connectionLineWidth, setConnectionLineWidth] = useState(3);
  const [snapToGrid, setSnapToGrid] = useState(true);

  const loadMindMap = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/mindmap/tree?lessonId=${lessonId}`);
      const data = await res.json();
      setMindMapNodes(data.nodes);
      setRelationships(data.relationships || []);
    } catch (error) {
      console.error("Failed to load mind map:", error);
    }
  }, [lessonId]);

  // Load mind map data
  useEffect(() => {
    loadMindMap();
  }, [loadMindMap]);

  // Convert mind map nodes to ReactFlow nodes and edges
  useEffect(() => {
    if (!mindMapNodes || mindMapNodes.length === 0) return;

    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];
    const nodePositions = new Map<string, { x: number; y: number }>();

    // Calculate positions using a radial layout or use saved positions
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
        let x: number, y: number;
        if (
          node.positionX !== null &&
          node.positionX !== undefined &&
          node.positionY !== null &&
          node.positionY !== undefined
        ) {
          x = node.positionX;
          y = node.positionY;
        } else {
          const angle = index * angleStep;
          x = centerX + radius * Math.cos(angle);
          y = centerY + radius * Math.sin(angle);
        }

        nodePositions.set(node.id, { x, y });

        flowNodes.push({
          id: node.id,
          type: "mindMapNode",
          position: { x, y },
          data: { node, locale, onSelect: () => {} },
          draggable: true,
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

    // Create edges from custom relationships
    relationships.forEach((rel) => {
      flowEdges.push({
        id: rel.id,
        source: rel.fromNodeId,
        target: rel.toNodeId,
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
  }, [mindMapNodes, relationships, locale, setNodes, setEdges]);

  // Handle node drag end - save position
  const onNodeDragStop = useCallback(async (_event: any, node: Node) => {
    try {
      await fetch(`/api/admin/mindmap/nodes/${node.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          positionX: node.position.x,
          positionY: node.position.y,
        }),
      });
    } catch (error) {
      console.error("Failed to save node position:", error);
    }
  }, []);

  // Handle connection creation
  const onConnect = useCallback(
    async (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      console.log("Connection details:", {
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
      });

      try {
        console.log("Creating connection with lineWidth:", connectionLineWidth);

        // Create relationship in database with custom line width
        const res = await fetch("/api/admin/mindmap/relationships", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromNodeId: connection.source,
            toNodeId: connection.target,
            type: "RELATED", // Valid enum value
            lineWidth: connectionLineWidth, // Use the custom line width
          }),
        });

        if (res.ok) {
          const data = await res.json();
          console.log("Created relationship data:", data);

          // Add edge to UI with the relationship ID, arrowhead, and handle positions
          const newEdge: Edge = {
            id: data.id,
            source: connection.source,
            target: connection.target,
            sourceHandle: connection.sourceHandle || undefined,
            targetHandle: connection.targetHandle || undefined,
            type: "smoothstep",
            animated: true,
            style: {
              stroke: data.color || "#f59e0b",
              strokeWidth: data.lineWidth || connectionLineWidth, // Use the returned lineWidth from API
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: data.color || "#f59e0b",
              width: 25,
              height: 25,
            },
          };
          console.log("Adding edge with style:", newEdge.style);
          setEdges((eds) => [...eds, newEdge]);
        } else {
          // Show specific error message based on status code
          let errorMessage = "Failed to create connection";
          if (locale === "ar") {
            errorMessage = "فشل إنشاء الاتصال";
          }

          if (res.status === 409) {
            errorMessage =
              locale === "ar"
                ? "هذا الاتصال موجود بالفعل بين هذه العقد"
                : "This connection already exists between these nodes";
          } else {
            // Try to get error message from response
            try {
              const error = await res.json();
              console.error("Failed to create relationship:", error);
              if (error.error) {
                errorMessage = error.error;
              }
            } catch (e) {
              console.error("Failed to parse error response:", e);
            }
          }

          alert(errorMessage);
        }
      } catch (error) {
        console.error("Failed to create relationship:", error);
        alert(
          locale === "ar" ? "فشل إنشاء الاتصال" : "Failed to create connection"
        );
      }
    },
    [setEdges, locale, connectionLineWidth]
  );

  // Handle edge click (for deletion)
  const onEdgeClick = useCallback(
    async (_event: any, edge: Edge) => {
      // Only allow deletion of custom relationships (not parent-child edges)
      if (edge.id.startsWith("parent-")) {
        alert(
          locale === "ar"
            ? "لا يمكن حذف العلاقات الهرمية"
            : "Cannot delete hierarchical relationships"
        );
        return;
      }

      const confirmDelete = window.confirm(
        locale === "ar" ? "هل تريد حذف هذا الاتصال؟" : "Delete this connection?"
      );

      if (!confirmDelete) return;

      try {
        const res = await fetch(
          `/api/admin/mindmap/relationships?id=${edge.id}`,
          {
            method: "DELETE",
          }
        );

        if (res.ok) {
          setEdges((eds) => eds.filter((e) => e.id !== edge.id));
        } else {
          alert(
            locale === "ar" ? "فشل حذف الاتصال" : "Failed to delete connection"
          );
        }
      } catch (error) {
        console.error("Failed to delete relationship:", error);
        alert(
          locale === "ar" ? "فشل حذف الاتصال" : "Failed to delete connection"
        );
      }
    },
    [setEdges, locale]
  );

  // Save all positions
  const handleSavePositions = async () => {
    setIsSaving(true);
    try {
      const updates = nodes.map((node) => ({
        id: node.id,
        positionX: node.position.x,
        positionY: node.position.y,
      }));

      await fetch("/api/admin/mindmap/positions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });

      if (onSave) onSave();
    } catch (error) {
      console.error("Failed to save positions:", error);
    } finally {
      setIsSaving(false);
    }
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
        onNodeDragStop={onNodeDragStop}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        connectionLineType={"smoothstep" as any}
        connectionMode={"loose" as any}
        snapToGrid={snapToGrid}
        snapGrid={[15, 15]}
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
        <Panel position="top-right" className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={handleSavePositions}
              disabled={isSaving}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving
                ? locale === "ar"
                  ? "جاري الحفظ..."
                  : "Saving..."
                : locale === "ar"
                ? "حفظ المواضع"
                : "Save Positions"}
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
          </div>

          {/* Connection Line Width Control */}
          <div className="bg-white/90 dark:bg-slate-800/90 p-3 rounded-lg shadow-lg">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
              {locale === "ar" ? "سُمك خط الاتصال" : "Connection Line Width"}
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setConnectionLineWidth(Math.max(1, connectionLineWidth - 1))
                }
                className="p-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded"
                title={locale === "ar" ? "تقليل" : "Decrease"}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 12H4"
                  />
                </svg>
              </button>
              <span className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded min-w-[3rem] text-center">
                {connectionLineWidth}px
              </span>
              <button
                onClick={() =>
                  setConnectionLineWidth(Math.min(10, connectionLineWidth + 1))
                }
                className="p-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded"
                title={locale === "ar" ? "زيادة" : "Increase"}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Snap to Grid Toggle */}
          <div className="bg-white/90 dark:bg-slate-800/90 p-3 rounded-lg shadow-lg">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={snapToGrid}
                onChange={(e) => setSnapToGrid(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                  />
                </svg>
                {locale === "ar" ? "محاذاة للشبكة" : "Snap to Grid"}
              </span>
            </label>
          </div>
        </Panel>

        {/* Instructions Panel */}
        <Panel
          position="top-left"
          className="bg-white/90 dark:bg-slate-800/90 p-4 rounded-lg shadow-lg max-w-xs"
        >
          <h3 className="font-bold text-sm mb-2 text-gray-900 dark:text-white">
            {locale === "ar" ? "التعليمات" : "Instructions"}
          </h3>
          <ul className="text-xs space-y-1 text-gray-700 dark:text-gray-300">
            <li>
              {locale === "ar"
                ? "• اسحب العقد لتغيير موضعها (محاذاة للشبكة)"
                : "• Drag nodes to reposition (snaps to grid)"}
            </li>
            <li>
              {locale === "ar"
                ? "• اسحب من عقدة إلى أخرى لإنشاء اتصال"
                : "• Drag from one node to another to create connection"}
            </li>
            <li>
              {locale === "ar"
                ? "• اضبط سُمك خط الاتصال قبل الإنشاء"
                : "• Adjust connection line width before creating"}
            </li>
            <li>
              {locale === "ar"
                ? "• انقر على الاتصال لحذفه"
                : "• Click on connection to delete it"}
            </li>
            <li>
              {locale === "ar"
                ? "• استخدم عجلة الماوس للتكبير/التصغير"
                : "• Use mouse wheel to zoom in/out"}
            </li>
          </ul>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export default function AdminVisualMindMapEditor(
  props: AdminVisualMindMapEditorProps
) {
  return (
    <ReactFlowProvider>
      <AdminVisualMindMapEditorInner {...props} />
    </ReactFlowProvider>
  );
}
