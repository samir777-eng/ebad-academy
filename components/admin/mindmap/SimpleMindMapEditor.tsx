"use client";

import type { MindMapNode } from "@/types/mindmap";
import {
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import DatePicker from "./DatePicker";
import MarkdownEditor from "./MarkdownEditor";

interface SimpleMindMapEditorProps {
  lessonId: string;
  locale: string;
}

export default function SimpleMindMapEditor({
  lessonId,
  locale,
}: SimpleMindMapEditorProps) {
  const [nodes, setNodes] = useState<MindMapNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [parentNode, setParentNode] = useState<MindMapNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    titleAr: "",
    titleEn: "",
    descriptionAr: "",
    descriptionEn: "",
    type: "TOPIC",
    color: "#4F46E5",
    shape: "circle",
    isPublished: false,

    // Historical Context
    dateHijri: "",
    dateGregorian: "",
    location: "",
    participants: "[]", // JSON array

    // Decision Analysis
    decision: "",
    alternatives: "[]", // JSON array
    outcomes: "[]", // JSON array

    // Learning & Application
    moralLessons: "[]", // JSON array
    modernApps: "[]", // JSON array
    securityImpact: "",

    // Documentation
    sources: "[]", // JSON array
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [draggedNode, setDraggedNode] = useState<MindMapNode | null>(null);
  const [dragOverNode, setDragOverNode] = useState<string | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [bulkOperation, setBulkOperation] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Memoize loadMindMap to prevent recreation on every render
  const loadMindMap = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/mindmap/tree?lessonId=${lessonId}`);
      const data = await res.json();

      // Build tree structure
      const nodeMap = new Map<string, MindMapNode>();
      data.nodes.forEach((node: any) => {
        nodeMap.set(node.id, { ...node, children: [] });
      });

      const rootNodes: MindMapNode[] = [];
      data.nodes.forEach((node: any) => {
        const currentNode = nodeMap.get(node.id)!;
        if (node.parentId) {
          const parent = nodeMap.get(node.parentId);
          if (parent) {
            parent.children = parent.children || [];
            parent.children.push(currentNode);
          }
        } else {
          rootNodes.push(currentNode);
        }
      });

      setNodes(rootNodes);
      // Expand all nodes by default
      setExpandedNodes(new Set(data.nodes.map((n: any) => n.id)));
    } catch (error) {
      console.error("Failed to load mind map:", error);
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  // useEffect with cleanup to prevent race conditions
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!cancelled) {
        await loadMindMap();
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [loadMindMap]);

  const addNodeToTree = (
    nodes: MindMapNode[],
    newNode: MindMapNode,
    parentId: string | null
  ): MindMapNode[] => {
    if (!parentId) {
      // Add as root node
      return [...nodes, newNode];
    }

    // Recursively find parent and add child
    return nodes.map((node) => {
      if (node.id === parentId) {
        return {
          ...node,
          children: [...(node.children || []), newNode],
        };
      }
      if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: addNodeToTree(node.children, newNode, parentId),
        };
      }
      return node;
    });
  };

  // Validation function
  const validateForm = (): string[] => {
    const errors: string[] = [];

    // Required fields
    if (!formData.titleAr.trim()) {
      errors.push(
        locale === "ar" ? "العنوان بالعربية مطلوب" : "Arabic title is required"
      );
    }
    if (!formData.titleEn.trim()) {
      errors.push(
        locale === "ar"
          ? "العنوان بالإنجليزية مطلوب"
          : "English title is required"
      );
    }

    // Type-specific validation
    if (formData.type === "EVENT") {
      if (!formData.dateHijri && !formData.dateGregorian) {
        errors.push(
          locale === "ar"
            ? "الأحداث يجب أن تحتوي على تاريخ واحد على الأقل"
            : "Events should have at least one date"
        );
      }
    }

    if (formData.type === "BATTLE" || formData.type === "TREATY") {
      if (!formData.location) {
        errors.push(
          locale === "ar"
            ? "الموقع مطلوب للمعارك والمعاهدات"
            : "Location is required for battles and treaties"
        );
      }
    }

    if (formData.type === "DECISION") {
      if (!formData.decision) {
        errors.push(
          locale === "ar"
            ? "وصف القرار مطلوب"
            : "Decision description is required"
        );
      }
    }

    if (formData.type === "LESSON") {
      if (formData.moralLessons === "[]") {
        errors.push(
          locale === "ar"
            ? "يجب إضافة درس واحد على الأقل"
            : "At least one lesson is required"
        );
      }
    }

    return errors;
  };

  const handleCreateNode = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Clear previous errors
    setValidationErrors([]);
    setIsCreating(true);

    try {
      const res = await fetch("/api/admin/mindmap/nodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          lessonId: parseInt(lessonId),
          parentId: parentNode?.id || null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Failed to create node:", errorData);
        throw new Error(errorData.error || "Failed to create node");
      }

      const newNode = await res.json();

      // Add node to state without reloading
      setNodes((prevNodes) =>
        addNodeToTree(
          prevNodes,
          { ...newNode, children: [] },
          parentNode?.id || null
        )
      );

      // Expand parent node if adding a child
      if (parentNode?.id) {
        setExpandedNodes((prev) => new Set([...prev, parentNode.id]));
      }

      // Reset form
      setFormData({
        titleAr: "",
        titleEn: "",
        descriptionAr: "",
        descriptionEn: "",
        type: "TOPIC",
        color: "#4F46E5",
        shape: "circle",
        isPublished: false,
        dateHijri: "",
        dateGregorian: "",
        location: "",
        participants: "[]",
        decision: "",
        alternatives: "[]",
        outcomes: "[]",
        moralLessons: "[]",
        modernApps: "[]",
        securityImpact: "",
        sources: "[]",
      });
      setShowForm(false);
      setParentNode(null);
      setShowAdvanced(false);
      setValidationErrors([]); // Clear validation errors
    } catch (error: any) {
      console.error("Failed to create node:", error);
      alert(
        locale === "ar"
          ? `فشل في إنشاء العقدة: ${error.message}`
          : `Failed to create node: ${error.message}`
      );
    } finally {
      setIsCreating(false);
    }
  };

  const removeNodeFromTree = (
    nodes: MindMapNode[],
    nodeId: string
  ): MindMapNode[] => {
    return nodes
      .filter((node) => node.id !== nodeId)
      .map((node) => ({
        ...node,
        children: node.children
          ? removeNodeFromTree(node.children, nodeId)
          : undefined,
      }));
  };

  const handleDeleteNode = async (nodeId: string) => {
    if (
      !confirm(
        locale === "ar"
          ? "هل أنت متأكد من حذف هذه العقدة وجميع العقد الفرعية؟"
          : "Are you sure you want to delete this node and all its children?"
      )
    )
      return;

    setIsDeleting(nodeId);
    try {
      const res = await fetch(`/api/admin/mindmap/nodes/${nodeId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete node");

      // Remove node from state without reloading
      setNodes((prevNodes) => removeNodeFromTree(prevNodes, nodeId));
    } catch (error) {
      console.error("Failed to delete node:", error);
      alert(locale === "ar" ? "فشل في حذف العقدة" : "Failed to delete node");
    } finally {
      setIsDeleting(null);
    }
  };

  const toggleExpand = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // Drag and Drop Handlers
  const handleDragStart = (node: MindMapNode) => (e: React.DragEvent) => {
    setDraggedNode(node);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.currentTarget.innerHTML);
  };

  const handleDragOver = (nodeId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverNode(nodeId);
  };

  const handleDragLeave = () => {
    setDragOverNode(null);
  };

  const handleDrop =
    (targetNode: MindMapNode) => async (e: React.DragEvent) => {
      e.preventDefault();
      setDragOverNode(null);

      if (!draggedNode || draggedNode.id === targetNode.id) {
        setDraggedNode(null);
        return;
      }

      // Prevent dropping a parent into its own child
      const isDescendant = (parent: MindMapNode, childId: string): boolean => {
        if (parent.id === childId) return true;
        if (!parent.children) return false;
        return parent.children.some((child) => isDescendant(child, childId));
      };

      if (isDescendant(draggedNode, targetNode.id)) {
        alert(
          locale === "ar"
            ? "لا يمكن نقل عقدة إلى أحد أبنائها"
            : "Cannot move a node into its own descendant"
        );
        setDraggedNode(null);
        return;
      }

      try {
        // Call API to reorder
        const response = await fetch("/api/admin/mindmap/reorder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nodeId: draggedNode.id,
            newParentId: targetNode.id,
            newOrder: 0,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to reorder node");
        }

        // Reload the mind map
        await loadMindMap();
        setDraggedNode(null);
      } catch (error) {
        console.error("Failed to reorder node:", error);
        alert(
          locale === "ar"
            ? "فشل في إعادة ترتيب العقدة"
            : "Failed to reorder node"
        );
        setDraggedNode(null);
      }
    };

  const handleDragEnd = () => {
    setDraggedNode(null);
    setDragOverNode(null);
  };

  // Bulk Operations Handlers
  const toggleNodeSelection = (nodeId: string) => {
    const newSelected = new Set(selectedNodes);
    if (newSelected.has(nodeId)) {
      newSelected.delete(nodeId);
    } else {
      newSelected.add(nodeId);
    }
    setSelectedNodes(newSelected);
  };

  const selectAll = () => {
    const allIds = new Set<string>();
    const collectIds = (nodes: MindMapNode[]) => {
      nodes.forEach((node) => {
        allIds.add(node.id);
        if (node.children) {
          collectIds(node.children);
        }
      });
    };
    collectIds(nodes);
    setSelectedNodes(allIds);
  };

  const deselectAll = () => {
    setSelectedNodes(new Set());
  };

  const handleBulkOperation = async (operation: string) => {
    if (selectedNodes.size === 0) {
      alert(
        locale === "ar"
          ? "الرجاء تحديد عقدة واحدة على الأقل"
          : "Please select at least one node"
      );
      return;
    }

    // Show confirmation for delete operation
    if (operation === "delete") {
      setBulkOperation(operation);
      setShowBulkConfirm(true);
      return;
    }

    await executeBulkOperation(operation);
  };

  const executeBulkOperation = async (operation: string) => {
    setIsBulkProcessing(true);
    try {
      const nodeIds = Array.from(selectedNodes);

      if (operation === "export") {
        // Export operation
        const response = await fetch("/api/admin/mindmap/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ operation, nodeIds }),
        });

        if (!response.ok) {
          throw new Error("Export failed");
        }

        const result = await response.json();

        // Download as JSON file
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `mindmap-export-${new Date().toISOString()}.json`;
        link.click();
        URL.revokeObjectURL(url);

        alert(
          locale === "ar"
            ? `تم تصدير ${result.count} عقدة بنجاح`
            : `Successfully exported ${result.count} nodes`
        );
      } else {
        // Publish, unpublish, or delete operation
        const response = await fetch("/api/admin/mindmap/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ operation, nodeIds }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Bulk operation failed:", errorData);
          throw new Error(errorData.error || "Bulk operation failed");
        }

        const result = await response.json();

        alert(
          locale === "ar"
            ? `تم ${
                operation === "publish"
                  ? "نشر"
                  : operation === "unpublish"
                  ? "إلغاء نشر"
                  : "حذف"
              } ${result.affected} عقدة`
            : `Successfully ${operation}ed ${result.affected} nodes`
        );

        // Reload mind map and clear selection
        await loadMindMap();
        setSelectedNodes(new Set());
        setBulkMode(false);
      }
    } catch (error: any) {
      console.error("Bulk operation failed:", error);
      alert(
        locale === "ar"
          ? `فشلت العملية الجماعية: ${error.message}`
          : `Bulk operation failed: ${error.message}`
      );
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const renderNode = (node: MindMapNode, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const title = locale === "ar" ? node.titleAr : node.titleEn;
    const isDragOver = dragOverNode === node.id;
    const isDragging = draggedNode?.id === node.id;
    const isSelected = selectedNodes.has(node.id);

    // Keyboard navigation handler
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (bulkMode) {
        // Space or Enter to toggle selection
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          toggleNodeSelection(node.id);
        }
      } else {
        // Arrow keys for navigation
        if (e.key === "ArrowRight" && hasChildren && !isExpanded) {
          e.preventDefault();
          toggleExpand(node.id);
        } else if (e.key === "ArrowLeft" && hasChildren && isExpanded) {
          e.preventDefault();
          toggleExpand(node.id);
        } else if (e.key === "Enter") {
          e.preventDefault();
          setParentNode(node);
          setShowForm(true);
        } else if (e.key === "Delete" && !bulkMode) {
          e.preventDefault();
          handleDeleteNode(node.id);
        }
      }
    };

    return (
      <div key={node.id} className="mb-2">
        <div
          draggable={!bulkMode}
          onDragStart={!bulkMode ? handleDragStart(node) : undefined}
          onDragOver={!bulkMode ? handleDragOver(node.id) : undefined}
          onDragLeave={!bulkMode ? handleDragLeave : undefined}
          onDrop={!bulkMode ? handleDrop(node) : undefined}
          onDragEnd={!bulkMode ? handleDragEnd : undefined}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role={bulkMode ? "checkbox" : "treeitem"}
          aria-checked={bulkMode ? isSelected : undefined}
          aria-expanded={hasChildren ? isExpanded : undefined}
          aria-label={`${title} - ${node.type} - ${
            locale === "ar" ? "المستوى" : "Level"
          } ${node.level}`}
          className={`flex items-center gap-2 p-3 bg-white rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
            bulkMode ? "cursor-pointer" : "cursor-move"
          } ${
            isSelected
              ? "border-indigo-600 bg-indigo-50"
              : isDragging
              ? "opacity-50 border-indigo-400"
              : isDragOver
              ? "border-indigo-500 bg-indigo-50"
              : "border-gray-200 hover:border-indigo-300"
          }`}
          style={{ marginLeft: `${depth * 24}px` }}
          onClick={bulkMode ? () => toggleNodeSelection(node.id) : undefined}
        >
          {/* Bulk mode checkbox */}
          {bulkMode && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleNodeSelection(node.id)}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              onClick={(e) => e.stopPropagation()}
            />
          )}

          {/* Expand/Collapse button */}
          {!bulkMode && hasChildren && (
            <button
              onClick={() => toggleExpand(node.id)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              )}
            </button>
          )}
          {!bulkMode && !hasChildren && <div className="w-6" />}

          {/* Node color indicator */}
          <div
            className="w-4 h-4 rounded-full border-2 border-gray-300"
            style={{ backgroundColor: node.color }}
          />

          {/* Node title */}
          <div className="flex-1">
            <div className="font-semibold text-gray-900">{title}</div>
            <div className="text-xs text-gray-700">
              {node.type} • Level {node.level}
            </div>
          </div>

          {/* Published status */}
          {node.isPublished ? (
            <Eye className="w-4 h-4 text-green-600" />
          ) : (
            <EyeOff className="w-4 h-4 text-gray-400" />
          )}

          {/* Actions */}
          <button
            onClick={() => {
              setParentNode(node);
              setShowForm(true);
            }}
            className="p-2 hover:bg-indigo-50 rounded text-indigo-600"
            title="Add child node"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteNode(node.id)}
            disabled={isDeleting === node.id}
            className="p-2 hover:bg-red-50 rounded text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title={locale === "ar" ? "حذف العقدة" : "Delete node"}
          >
            {isDeleting === node.id ? (
              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Render children */}
        {isExpanded && hasChildren && (
          <div className="mt-1">
            {node.children!.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600">Loading mind map...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {locale === "ar" ? "هيكل الخريطة الذهنية" : "Mind Map Structure"}
          {bulkMode && selectedNodes.size > 0 && (
            <span className="ml-3 text-sm font-normal text-indigo-600">
              ({selectedNodes.size} {locale === "ar" ? "محدد" : "selected"})
            </span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          {!bulkMode ? (
            <>
              <button
                onClick={() => setBulkMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                {locale === "ar" ? "عمليات جماعية" : "Bulk Operations"}
              </button>
              <button
                onClick={() => {
                  setParentNode(null);
                  setShowForm(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                {locale === "ar" ? "إضافة عقدة جذرية" : "Add Root Node"}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={selectAll}
                className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                {locale === "ar" ? "تحديد الكل" : "Select All"}
              </button>
              <button
                onClick={deselectAll}
                className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                {locale === "ar" ? "إلغاء تحديد الكل" : "Deselect All"}
              </button>
              <button
                onClick={() => handleBulkOperation("publish")}
                disabled={selectedNodes.size === 0 || isBulkProcessing}
                className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isBulkProcessing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : null}
                {locale === "ar" ? "نشر" : "Publish"}
              </button>
              <button
                onClick={() => handleBulkOperation("unpublish")}
                disabled={selectedNodes.size === 0 || isBulkProcessing}
                className="px-3 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isBulkProcessing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : null}
                {locale === "ar" ? "إلغاء النشر" : "Unpublish"}
              </button>
              <button
                onClick={() => handleBulkOperation("export")}
                disabled={selectedNodes.size === 0 || isBulkProcessing}
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isBulkProcessing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : null}
                {locale === "ar" ? "تصدير" : "Export"}
              </button>
              <button
                onClick={() => handleBulkOperation("delete")}
                disabled={selectedNodes.size === 0 || isBulkProcessing}
                className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isBulkProcessing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : null}
                {locale === "ar" ? "حذف" : "Delete"}
              </button>
              <button
                onClick={() => {
                  setBulkMode(false);
                  setSelectedNodes(new Set());
                }}
                className="px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                {locale === "ar" ? "إلغاء" : "Cancel"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Node creation form */}
      {showForm && (
        <div className="mb-6 bg-white rounded-lg border-2 border-indigo-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {parentNode
                ? `${
                    locale === "ar" ? "إضافة عقدة فرعية إلى:" : "Add child to:"
                  } ${
                    locale === "ar" ? parentNode.titleAr : parentNode.titleEn
                  }`
                : locale === "ar"
                ? "إنشاء عقدة جذرية"
                : "Create Root Node"}
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                setParentNode(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleCreateNode} className="space-y-4">
            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <span className="text-red-600 text-xl">⚠️</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-900 mb-2">
                      {locale === "ar"
                        ? "يرجى تصحيح الأخطاء التالية:"
                        : "Please fix the following errors:"}
                    </h4>
                    <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {locale === "ar" ? "العنوان بالعربية" : "Arabic Title"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.titleAr}
                  onChange={(e) =>
                    setFormData({ ...formData, titleAr: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900"
                  dir="rtl"
                  placeholder="مثال: التوحيد"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {locale === "ar" ? "العنوان بالإنجليزية" : "English Title"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.titleEn}
                  onChange={(e) =>
                    setFormData({ ...formData, titleEn: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900"
                  placeholder="Example: Tawheed"
                />
              </div>
            </div>

            {/* Description Fields with Markdown Editor */}
            <div className="grid grid-cols-2 gap-4">
              <MarkdownEditor
                value={formData.descriptionAr}
                onChange={(value) =>
                  setFormData({ ...formData, descriptionAr: value })
                }
                label={
                  locale === "ar" ? "الوصف بالعربية" : "Arabic Description"
                }
                placeholder={
                  locale === "ar"
                    ? "اكتب الوصف هنا..."
                    : "Write description here..."
                }
                locale={locale}
                minHeight="150px"
              />
              <MarkdownEditor
                value={formData.descriptionEn}
                onChange={(value) =>
                  setFormData({ ...formData, descriptionEn: value })
                }
                label={
                  locale === "ar" ? "الوصف بالإنجليزية" : "English Description"
                }
                placeholder="Write description here..."
                locale={locale}
                minHeight="150px"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {locale === "ar" ? "النوع" : "Type"}
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900"
                >
                  <option value="ROOT">
                    🌳 {locale === "ar" ? "جذر" : "Root"}
                  </option>
                  <option value="CATEGORY">
                    📁 {locale === "ar" ? "فئة" : "Category"}
                  </option>
                  <option value="TOPIC">
                    📌 {locale === "ar" ? "موضوع" : "Topic"}
                  </option>
                  <option value="SUBTOPIC">
                    📍 {locale === "ar" ? "موضوع فرعي" : "Subtopic"}
                  </option>
                  <option value="DETAIL">
                    📝 {locale === "ar" ? "تفصيل" : "Detail"}
                  </option>
                  <option value="NOTE">
                    💡 {locale === "ar" ? "ملاحظة" : "Note"}
                  </option>
                  <option value="EVENT">
                    ⭐ {locale === "ar" ? "حدث" : "Event"}
                  </option>
                  <option value="DECISION">
                    ⚖️ {locale === "ar" ? "قرار" : "Decision"}
                  </option>
                  <option value="POLICY">
                    📜 {locale === "ar" ? "سياسة" : "Policy"}
                  </option>
                  <option value="BATTLE">
                    ⚔️ {locale === "ar" ? "معركة" : "Battle"}
                  </option>
                  <option value="TREATY">
                    🤝 {locale === "ar" ? "معاهدة" : "Treaty"}
                  </option>
                  <option value="REVELATION">
                    📖 {locale === "ar" ? "وحي" : "Revelation"}
                  </option>
                  <option value="MIRACLE">
                    ✨ {locale === "ar" ? "معجزة" : "Miracle"}
                  </option>
                  <option value="LESSON">
                    🎓 {locale === "ar" ? "درس" : "Lesson"}
                  </option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="node-color-picker"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  {locale === "ar" ? "اللون" : "Color"}
                </label>
                <input
                  id="node-color-picker"
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="w-full h-11 border border-gray-300 rounded-lg cursor-pointer"
                  aria-label={
                    locale === "ar" ? "اختر لون العقدة" : "Select node color"
                  }
                  title={
                    locale === "ar"
                      ? `اللون الحالي: ${formData.color}`
                      : `Current color: ${formData.color}`
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {locale === "ar" ? "الشكل" : "Shape"}
                </label>
                <select
                  value={formData.shape}
                  onChange={(e) =>
                    setFormData({ ...formData, shape: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900"
                >
                  <option value="circle">
                    ⭕ {locale === "ar" ? "دائرة" : "Circle"}
                  </option>
                  <option value="rect">
                    ▭ {locale === "ar" ? "مستطيل" : "Rectangle"}
                  </option>
                  <option value="diamond">
                    ◆ {locale === "ar" ? "معين" : "Diamond"}
                  </option>
                </select>
              </div>
            </div>

            {/* Advanced Metadata Toggle */}
            <div className="border-t pt-4">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                {showAdvanced ? "▼" : "▶"}{" "}
                {locale === "ar"
                  ? "البيانات المتقدمة (التواريخ، المشاركون، الدروس، إلخ)"
                  : "Advanced Metadata (Dates, Participants, Lessons, etc.)"}
              </button>
            </div>

            {/* Advanced Metadata Fields */}
            {showAdvanced && (
              <div className="space-y-4 border-t pt-4">
                {/* Historical Context Section */}
                <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    📅{" "}
                    {locale === "ar" ? "السياق التاريخي" : "Historical Context"}
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <DatePicker
                      label={locale === "ar" ? "التاريخ الهجري" : "Hijri Date"}
                      value={formData.dateHijri}
                      onChange={(value) =>
                        setFormData({ ...formData, dateHijri: value })
                      }
                      type="hijri"
                      locale={locale}
                      placeholder={
                        locale === "ar"
                          ? "مثال: 12 ربيع الأول 1 هـ"
                          : "e.g., 12 Rabi' al-Awwal 1 AH"
                      }
                    />
                    <DatePicker
                      label={
                        locale === "ar" ? "التاريخ الميلادي" : "Gregorian Date"
                      }
                      value={formData.dateGregorian}
                      onChange={(value) =>
                        setFormData({ ...formData, dateGregorian: value })
                      }
                      type="gregorian"
                      locale={locale}
                      placeholder={
                        locale === "ar"
                          ? "مثال: 24 سبتمبر 622 م"
                          : "e.g., 24 September 622 CE"
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      {locale === "ar" ? "الموقع" : "Location"}
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
                      placeholder={
                        locale === "ar"
                          ? "مثال: مكة، المدينة"
                          : "e.g., Makkah, Madinah"
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      {locale === "ar"
                        ? "المشاركون (واحد في كل سطر)"
                        : "Participants (one per line)"}
                    </label>
                    <textarea
                      value={
                        formData.participants === "[]"
                          ? ""
                          : JSON.parse(formData.participants).join("\n")
                      }
                      onChange={(e) => {
                        const lines = e.target.value
                          .split("\n")
                          .filter((l) => l.trim());
                        setFormData({
                          ...formData,
                          participants: JSON.stringify(lines),
                        });
                      }}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
                      rows={3}
                      placeholder={
                        locale === "ar"
                          ? "مثال: النبي محمد ﷺ&#10;أبو بكر رضي الله عنه"
                          : "e.g., Prophet Muhammad ﷺ&#10;Abu Bakr رضي الله عنه"
                      }
                    />
                  </div>
                </div>

                {/* Decision Analysis Section */}
                <div className="bg-purple-50 p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    ⚖️ {locale === "ar" ? "تحليل القرار" : "Decision Analysis"}
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      {locale === "ar" ? "القرار الرئيسي" : "Main Decision"}
                    </label>
                    <textarea
                      value={formData.decision}
                      onChange={(e) =>
                        setFormData({ ...formData, decision: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
                      rows={2}
                      placeholder={
                        locale === "ar"
                          ? "ما هو القرار الرئيسي الذي تم اتخاذه؟"
                          : "What was the main decision made?"
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      {locale === "ar"
                        ? "البدائل المدروسة (واحد في كل سطر)"
                        : "Alternatives Considered (one per line)"}
                    </label>
                    <textarea
                      value={
                        formData.alternatives === "[]"
                          ? ""
                          : JSON.parse(formData.alternatives).join("\n")
                      }
                      onChange={(e) => {
                        const lines = e.target.value
                          .split("\n")
                          .filter((l) => l.trim());
                        setFormData({
                          ...formData,
                          alternatives: JSON.stringify(lines),
                        });
                      }}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
                      rows={2}
                      placeholder={
                        locale === "ar"
                          ? "ما هي الخيارات الأخرى المتاحة؟"
                          : "What other options were available?"
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      {locale === "ar"
                        ? "النتائج (واحد في كل سطر)"
                        : "Outcomes/Results (one per line)"}
                    </label>
                    <textarea
                      value={
                        formData.outcomes === "[]"
                          ? ""
                          : JSON.parse(formData.outcomes).join("\n")
                      }
                      onChange={(e) => {
                        const lines = e.target.value
                          .split("\n")
                          .filter((l) => l.trim());
                        setFormData({
                          ...formData,
                          outcomes: JSON.stringify(lines),
                        });
                      }}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
                      rows={2}
                      placeholder={
                        locale === "ar"
                          ? "ما هي النتائج؟"
                          : "What were the results?"
                      }
                    />
                  </div>
                </div>

                {/* Learning & Application Section */}
                <div className="bg-green-50 p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    💡{" "}
                    {locale === "ar"
                      ? "التعلم والتطبيق"
                      : "Learning & Application"}
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      {locale === "ar"
                        ? "الدروس الأخلاقية/الروحية (واحد في كل سطر)"
                        : "Moral/Spiritual Lessons (one per line)"}
                    </label>
                    <textarea
                      value={
                        formData.moralLessons === "[]"
                          ? ""
                          : JSON.parse(formData.moralLessons).join("\n")
                      }
                      onChange={(e) => {
                        const lines = e.target.value
                          .split("\n")
                          .filter((l) => l.trim());
                        setFormData({
                          ...formData,
                          moralLessons: JSON.stringify(lines),
                        });
                      }}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
                      rows={3}
                      placeholder={
                        locale === "ar"
                          ? "ما هي الدروس التي يمكننا تعلمها؟"
                          : "What lessons can we learn?"
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      {locale === "ar"
                        ? "التطبيقات الحديثة (واحد في كل سطر)"
                        : "Modern Applications (one per line)"}
                    </label>
                    <textarea
                      value={
                        formData.modernApps === "[]"
                          ? ""
                          : JSON.parse(formData.modernApps).join("\n")
                      }
                      onChange={(e) => {
                        const lines = e.target.value
                          .split("\n")
                          .filter((l) => l.trim());
                        setFormData({
                          ...formData,
                          modernApps: JSON.stringify(lines),
                        });
                      }}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
                      rows={3}
                      placeholder={
                        locale === "ar"
                          ? "كيف يمكن تطبيق هذا اليوم؟"
                          : "How can this be applied today?"
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      {locale === "ar"
                        ? "التأثير الأمني/الاستراتيجي"
                        : "Security/Strategic Impact"}
                    </label>
                    <textarea
                      value={formData.securityImpact}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          securityImpact: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
                      rows={2}
                      placeholder={
                        locale === "ar"
                          ? "ما هي الأهمية الأمنية أو الاستراتيجية؟"
                          : "What was the security or strategic significance?"
                      }
                    />
                  </div>
                </div>

                {/* Documentation Section */}
                <div className="bg-amber-50 p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    📚{" "}
                    {locale === "ar"
                      ? "التوثيق والمصادر"
                      : "Documentation & Sources"}
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      {locale === "ar"
                        ? "المصادر/المراجع (واحد في كل سطر)"
                        : "Sources/References (one per line)"}
                    </label>
                    <textarea
                      value={
                        formData.sources === "[]"
                          ? ""
                          : JSON.parse(formData.sources).join("\n")
                      }
                      onChange={(e) => {
                        const lines = e.target.value
                          .split("\n")
                          .filter((l) => l.trim());
                        setFormData({
                          ...formData,
                          sources: JSON.stringify(lines),
                        });
                      }}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
                      rows={3}
                      placeholder={
                        locale === "ar"
                          ? "مثال: صحيح البخاري، كتاب 1، حديث 1&#10;القرآن 2:255"
                          : "e.g., Sahih Bukhari, Book 1, Hadith 1&#10;Quran 2:255"
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={formData.isPublished}
                onChange={(e) =>
                  setFormData({ ...formData, isPublished: e.target.checked })
                }
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
              />
              <label
                htmlFor="isPublished"
                className="text-sm font-semibold text-gray-700"
              >
                {locale === "ar" ? "نشر فوراً" : "Publish immediately"}
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isCreating}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {locale === "ar" ? "جاري الإنشاء..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {locale === "ar" ? "إنشاء عقدة" : "Create Node"}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setParentNode(null);
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 font-semibold"
              >
                {locale === "ar" ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mind map tree */}
      {nodes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-gray-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
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
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {locale === "ar" ? "لا توجد عقد بعد" : "No nodes yet"}
          </h3>
          <p className="text-gray-600 mb-4">
            {locale === "ar"
              ? 'انقر على "إضافة عقدة جذرية" لبدء بناء خريطتك الذهنية'
              : 'Click "Add Root Node" to start building your mind map'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {nodes.map((node) => renderNode(node, 0))}
        </div>
      )}

      {/* Bulk Delete Confirmation Dialog */}
      {showBulkConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {locale === "ar" ? "تأكيد الحذف" : "Confirm Delete"}
            </h3>
            <p className="text-gray-600 mb-6">
              {locale === "ar"
                ? `هل أنت متأكد من حذف ${selectedNodes.size} عقدة؟ سيتم حذف جميع العقد الفرعية أيضًا. لا يمكن التراجع عن هذا الإجراء.`
                : `Are you sure you want to delete ${selectedNodes.size} nodes? All child nodes will also be deleted. This action cannot be undone.`}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowBulkConfirm(false);
                  setBulkOperation("");
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                {locale === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button
                onClick={async () => {
                  setShowBulkConfirm(false);
                  await executeBulkOperation(bulkOperation);
                  setBulkOperation("");
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {locale === "ar" ? "حذف" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
