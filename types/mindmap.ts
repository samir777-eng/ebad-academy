/**
 * Mind Map Type Definitions
 * Shared types for the mind map system across admin and student components
 */

/**
 * All possible node types in the mind map system
 */
export type NodeType =
  | "ROOT"
  | "CATEGORY"
  | "TOPIC"
  | "SUBTOPIC"
  | "DETAIL"
  | "NOTE"
  | "EVENT"
  | "DECISION"
  | "POLICY"
  | "BATTLE"
  | "TREATY"
  | "REVELATION"
  | "MIRACLE"
  | "LESSON";

/**
 * All possible node shapes
 */
export type NodeShape = "circle" | "rect" | "diamond";

/**
 * Main Mind Map Node interface
 * Represents a single node in the hierarchical mind map structure
 */
export interface MindMapNode {
  // Core fields
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  type: NodeType;
  color: string;
  shape: NodeShape;
  isPublished: boolean;
  parentId?: string | null;
  children?: MindMapNode[];
  level: number;

  // Position fields for visual editor
  positionX?: number | null;
  positionY?: number | null;

  // Historical Context
  dateHijri?: string; // Hijri calendar date (e.g., "12 Rabi' al-Awwal 1 AH")
  dateGregorian?: string; // Gregorian calendar date (e.g., "622 CE")
  location?: string; // Geographic location
  participants?: string; // JSON string array of participants

  // Decision Analysis
  decision?: string; // Main decision made
  alternatives?: string; // JSON string array of alternative options
  outcomes?: string; // JSON string array of results/consequences

  // Learning & Application
  moralLessons?: string; // JSON string array of moral/spiritual lessons
  modernApps?: string; // JSON string array of modern applications
  securityImpact?: string; // Strategic/security significance

  // Documentation
  sources?: string; // JSON string array of references (Quran, Hadith, books)

  // Flexible metadata for future extensions
  metadata?: string; // JSON string for additional custom fields
}

/**
 * Filter state for mind map viewer
 */
export interface MindMapFilters {
  type: string;
  location: string;
  searchText: string;
}

/**
 * View mode for mind map display
 */
export type ViewMode = "tree" | "timeline";

/**
 * Props for Mind Map Editor component
 */
export interface MindMapEditorProps {
  lessonId: string;
  locale: string;
}

/**
 * Props for Mind Map Viewer component
 */
export interface MindMapViewerProps {
  lessonId: string;
  locale: string;
}

/**
 * API response for mind map tree
 */
export interface MindMapTreeResponse {
  nodes: MindMapNode[];
}

/**
 * Form data for creating/editing a node
 */
export interface NodeFormData {
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  type: NodeType;
  color: string;
  shape: NodeShape;
  isPublished: boolean;

  // Historical Context
  dateHijri: string;
  dateGregorian: string;
  location: string;
  participants: string; // JSON string

  // Decision Analysis
  decision: string;
  alternatives: string; // JSON string
  outcomes: string; // JSON string

  // Learning & Application
  moralLessons: string; // JSON string
  modernApps: string; // JSON string
  securityImpact: string;

  // Documentation
  sources: string; // JSON string
}
