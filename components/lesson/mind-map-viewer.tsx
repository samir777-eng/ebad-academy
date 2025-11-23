"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Circle } from "lucide-react";

type MindMapNode = {
  id: string;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  children?: MindMapNode[];
  color?: string;
};

type MindMapViewerProps = {
  data: MindMapNode;
  locale: string;
};

export function MindMapViewer({ data, locale }: MindMapViewerProps) {
  const isRTL = locale === "ar";

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="space-y-4">
        <MindMapNodeComponent node={data} isRTL={isRTL} level={0} />
      </div>
    </div>
  );
}

function MindMapNodeComponent({
  node,
  isRTL,
  level,
}: {
  node: MindMapNode;
  isRTL: boolean;
  level: number;
}) {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first 2 levels

  const hasChildren = node.children && node.children.length > 0;
  const title = isRTL && node.titleAr ? node.titleAr : node.title;
  const description =
    isRTL && node.descriptionAr ? node.descriptionAr : node.description;

  // Color scheme based on level
  const getColorClasses = () => {
    if (node.color) {
      return node.color;
    }

    switch (level) {
      case 0:
        return "bg-gradient-to-r from-primary-500 to-secondary-500 text-white";
      case 1:
        return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white";
      case 2:
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white";
    }
  };

  const getSizeClasses = () => {
    switch (level) {
      case 0:
        return "text-2xl font-bold p-6";
      case 1:
        return "text-xl font-semibold p-4";
      case 2:
        return "text-lg font-medium p-3";
      default:
        return "text-base p-2";
    }
  };

  return (
    <div className={`${level > 0 ? "ml-8" : ""}`}>
      {/* Node Card */}
      <div
        className={`rounded-xl shadow-md hover:shadow-lg transition-all duration-200 ${getColorClasses()} ${getSizeClasses()}`}
      >
        <div className="flex items-start gap-3">
          {/* Expand/Collapse Button */}
          {hasChildren && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex-shrink-0 mt-1 hover:scale-110 transition-transform"
            >
              {isExpanded ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
          )}

          {/* Node Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {!hasChildren && <Circle className="w-3 h-3 fill-current" />}
              <h3>{title}</h3>
            </div>
            {description && (
              <p
                className={`mt-2 text-sm opacity-90 ${
                  level === 0 ? "text-white" : ""
                }`}
              >
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="mt-4 space-y-3 border-l-2 border-gray-300 dark:border-gray-600 pl-4">
          {node.children!.map((child) => (
            <MindMapNodeComponent
              key={child.id}
              node={child}
              isRTL={isRTL}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Example mind map data structure
export const exampleMindMapData: MindMapNode = {
  id: "root",
  title: "Islamic Knowledge",
  titleAr: "العلوم الإسلامية",
  description: "Comprehensive Islamic education",
  descriptionAr: "التعليم الإسلامي الشامل",
  children: [
    {
      id: "aqeedah",
      title: "Aqeedah (Creed)",
      titleAr: "العقيدة",
      children: [
        {
          id: "tawheed",
          title: "Tawheed",
          titleAr: "التوحيد",
          description: "Oneness of Allah",
        },
        {
          id: "prophethood",
          title: "Prophethood",
          titleAr: "النبوة",
        },
      ],
    },
    {
      id: "fiqh",
      title: "Fiqh (Jurisprudence)",
      titleAr: "الفقه",
      children: [
        { id: "worship", title: "Worship", titleAr: "العبادات" },
        { id: "transactions", title: "Transactions", titleAr: "المعاملات" },
      ],
    },
  ],
};

