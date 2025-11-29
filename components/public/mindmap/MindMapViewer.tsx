"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

interface MindMapViewerProps {
  lessonId: number;
  locale: string;
}

interface Node {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  type: string;
  color: string;
  icon?: string | null;
  level: number;
  children: Node[];
  attachments?: any[];
}

export default function MindMapViewer({
  lessonId,
  locale,
}: MindMapViewerProps) {
  const t = useTranslations("mindmap");
  const [tree, setTree] = useState<Node[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMindMap();
  }, [lessonId]);

  const loadMindMap = async () => {
    try {
      const res = await fetch(`/api/admin/mindmap/tree?lessonId=${lessonId}`);
      const data = await res.json();
      setTree(data.tree);

      // Auto-expand root nodes
      const rootIds = data.tree.map((n: Node) => n.id);
      setExpandedNodes(new Set(rootIds));
    } catch (error) {
      console.error("Failed to load mind map:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const renderNode = (node: Node, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const title = locale === "ar" ? node.titleAr : node.titleEn;

    return (
      <div
        key={node.id}
        className="mb-2"
        style={{ marginLeft: `${depth * 24}px` }}
      >
        <div
          className="flex items-center gap-2 p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all"
          style={{
            borderColor: node.color,
            backgroundColor: `${node.color}10`,
          }}
          onClick={() => {
            if (hasChildren) toggleNode(node.id);
            setSelectedNode(node);
          }}
        >
          {hasChildren && (
            <span className="text-lg">{isExpanded ? "▼" : "▶"}</span>
          )}
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: node.color }}
          />
          <span className="font-medium">{title}</span>
          {node.icon && <span className="text-lg">{node.icon}</span>}
        </div>

        {isExpanded && hasChildren && (
          <div className="mt-2">
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (tree.length === 0) {
    return (
      <div className="text-center p-12 text-gray-500">{t("noMindMap")}</div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-2">
        <h3 className="text-xl font-bold mb-4">{t("mindMap")}</h3>
        {tree.map((node) => renderNode(node))}
      </div>

      {selectedNode && (
        <div className="bg-white rounded-lg border p-6 sticky top-4">
          <h4 className="text-lg font-bold mb-2">
            {locale === "ar" ? selectedNode.titleAr : selectedNode.titleEn}
          </h4>

          {(selectedNode.descriptionAr || selectedNode.descriptionEn) && (
            <p className="text-sm text-gray-600 mb-4">
              {locale === "ar"
                ? selectedNode.descriptionAr
                : selectedNode.descriptionEn}
            </p>
          )}

          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">{t("type")}:</span>{" "}
              <span className="text-gray-600">{selectedNode.type}</span>
            </div>
            <div>
              <span className="font-medium">{t("level")}:</span>{" "}
              <span className="text-gray-600">{selectedNode.level}</span>
            </div>
          </div>

          {selectedNode.attachments && selectedNode.attachments.length > 0 && (
            <div className="mt-4">
              <h5 className="font-medium mb-2">{t("attachments")}:</h5>
              <div className="space-y-2">
                {selectedNode.attachments.map((att) => (
                  <div key={att.id} className="p-2 bg-gray-50 rounded text-sm">
                    <div className="font-medium">
                      {locale === "ar" ? att.titleAr : att.titleEn}
                    </div>
                    {att.contentAr && (
                      <div className="text-gray-600 mt-1">
                        {locale === "ar" ? att.contentAr : att.contentEn}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
