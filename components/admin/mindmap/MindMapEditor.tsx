"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Connection,
  Controls,
  Edge,
  MarkerType,
  Node,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";

interface MindMapEditorProps {
  lessonId: string;
  locale: string;
}

export default function MindMapEditor({
  lessonId,
  locale,
}: MindMapEditorProps) {
  const t = useTranslations("admin.mindmap");
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  // Load existing mind map
  useEffect(() => {
    loadMindMap();
  }, [lessonId]);

  const loadMindMap = async () => {
    try {
      const res = await fetch(`/api/admin/mindmap/tree?lessonId=${lessonId}`);
      const data = await res.json();

      // Convert to ReactFlow format
      const flowNodes: Node[] = data.nodes.map((node: any) => ({
        id: node.id,
        type: "default",
        data: {
          label: locale === "ar" ? node.titleAr : node.titleEn,
          ...node,
        },
        position: {
          x: node.positionX || Math.random() * 500,
          y: node.positionY || Math.random() * 500,
        },
        style: {
          background: node.color,
          color: "#fff",
          border: "1px solid #222138",
          borderRadius: node.shape === "circle" ? "50%" : "8px",
          padding: 10,
        },
      }));

      const flowEdges: Edge[] = data.relationships.map((rel: any) => ({
        id: rel.id,
        source: rel.fromNodeId,
        target: rel.toNodeId,
        type: "smoothstep",
        animated: rel.type === "LEADS_TO",
        style: {
          stroke: rel.color,
          strokeWidth: rel.lineWidth,
          strokeDasharray: rel.lineStyle === "dashed" ? "5,5" : undefined,
        },
        label: locale === "ar" ? rel.labelAr : rel.labelEn,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: rel.color,
        },
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
    } catch (error) {
      console.error("Failed to load mind map:", error);
    } finally {
      setLoading(false);
    }
  };

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node.data);
  };

  const handleSavePositions = async () => {
    try {
      // Save node positions to database
      const updates = nodes.map((node) => ({
        id: node.id,
        positionX: node.position.x,
        positionY: node.position.y,
      }));

      for (const update of updates) {
        await fetch(`/api/admin/mindmap/nodes/${update.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            positionX: update.positionX,
            positionY: update.positionY,
          }),
        });
      }

      alert(t("positionsSaved"));
    } catch (error) {
      console.error("Failed to save positions:", error);
      alert(t("saveFailed"));
    }
  };

  if (loading) {
    return <div className="p-8 text-center">{t("loading")}</div>;
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white border-b p-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">{t("editor")}</h2>
        <div className="flex gap-2">
          <button
            onClick={handleSavePositions}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {t("savePositions")}
          </button>
          <button
            onClick={() => setSelectedNode(null)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            {t("closePanel")}
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        <div className="flex-1 relative">
          {nodes.length === 0 ? (
            // Empty state with helpful instructions
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="max-w-2xl">
                <div className="mb-6">
                  <svg
                    className="w-32 h-32 mx-auto text-indigo-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {t("emptyStateTitle") || "Start Building Your Mind Map"}
                </h3>
                <p className="text-gray-600 mb-8 text-lg">
                  {t("emptyStateDescription") ||
                    "Create your first node using the form on the right to begin visualizing lesson concepts."}
                </p>

                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-left">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-bold">1</span>
                      </div>
                      <h4 className="font-semibold text-gray-900">
                        {t("step1Title") || "Create Root Node"}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      {t("step1") ||
                        "Fill in the form on the right with Arabic and English titles for your main concept"}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-left">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-green-600 font-bold">2</span>
                      </div>
                      <h4 className="font-semibold text-gray-900">
                        {t("step2Title") || "Add Child Nodes"}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      {t("step2") ||
                        "Click on a node to select it, then create child nodes to build your hierarchy"}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-left">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <span className="text-purple-600 font-bold">3</span>
                      </div>
                      <h4 className="font-semibold text-gray-900">
                        {t("step3Title") || "Customize Appearance"}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      {t("step3") ||
                        "Choose colors, shapes, and types to make your mind map visually organized"}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-left">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <span className="text-orange-600 font-bold">4</span>
                      </div>
                      <h4 className="font-semibold text-gray-900">
                        {t("step4Title") || "Save & Publish"}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      {t("step4") ||
                        "Save node positions and publish when ready for students to view"}
                    </p>
                  </div>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-left">
                  <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {t("proTip") || "Pro Tip"}
                  </h4>
                  <p className="text-sm text-indigo-800">
                    {t("proTipText") ||
                      "Use different node types (ROOT, CATEGORY, TOPIC, SUBTOPIC) to create a clear hierarchy. Drag nodes to arrange them visually after creation."}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={handleNodeClick}
              fitView
            >
              <Controls />
              <Background />
            </ReactFlow>
          )}
        </div>

        {selectedNode && (
          <div className="w-96 border-l bg-white p-4 overflow-y-auto">
            <h3 className="font-bold text-lg mb-4">
              {locale === "ar" ? selectedNode.titleAr : selectedNode.titleEn}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("type")}
                </label>
                <span className="text-sm">{selectedNode.type}</span>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("color")}
                </label>
                <div
                  className="w-12 h-12 rounded border"
                  style={{ background: selectedNode.color }}
                />
              </div>
              {selectedNode.descriptionAr && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("description")}
                  </label>
                  <p className="text-sm">
                    {locale === "ar"
                      ? selectedNode.descriptionAr
                      : selectedNode.descriptionEn}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
