# Add Interactive Mind Map Feature to Existing Ebad Academy Platform

## PROJECT CONTEXT

**Existing Platform**: Ebad Academy - Islamic education platform
**Stack**: Next.js 16, Prisma, NextAuth, Vercel Postgres (production), SQLite (local)
**Current Structure**: 4 Levels × 6 Branches with lessons, quizzes, progress tracking
**Languages**: Arabic (primary) + English with next-intl
**Admin Email**: samireldirini@gmail.com

---

## OBJECTIVE

Add an interactive mind map system that allows:
1. **Admins**: Create/edit mind maps for each lesson via visual editor
2. **Students**: View interactive, expandable mind maps within lessons
3. **Export**: Generate SVG/PNG/PDF from mind maps

---

## PHASE 1: DATABASE SCHEMA ADDITIONS

Add these models to `prisma/schema.prisma`:
```prisma
// Mind Map Node Model
model MindMapNode {
  id              String   @id @default(cuid())
  
  // Link to existing lesson
  lessonId        String
  lesson          Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  
  // Hierarchy
  parentId        String?
  parent          MindMapNode?  @relation("NodeHierarchy", fields: [parentId], references: [id], onDelete: Restrict)
  children        MindMapNode[] @relation("NodeHierarchy")
  
  // Bilingual content
  titleAr         String
  titleEn         String
  descriptionAr   String?  @db.Text
  descriptionEn   String?  @db.Text
  
  // Metadata
  type            MindMapNodeType @default(TOPIC)
  level           Int      @default(0)  // Depth in tree
  order           Int      @default(0)  // Display order among siblings
  
  // Visual properties
  color           String   @default("#4F46E5")
  icon            String?
  shape           String   @default("circle") // circle, rect, diamond
  
  // Canvas positioning (for admin visual editor)
  positionX       Float?
  positionY       Float?
  collapsed       Boolean  @default(false)
  
  // Status
  isPublished     Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  createdBy       String
  creator         User     @relation("CreatedMindMapNodes", fields: [createdBy], references: [id])
  
  // Relations
  relationships   MindMapRelationship[] @relation("FromNode")
  relatedTo       MindMapRelationship[] @relation("ToNode")
  attachments     MindMapAttachment[]
  
  @@index([lessonId])
  @@index([parentId])
  @@index([isPublished])
}

enum MindMapNodeType {
  ROOT
  CATEGORY
  TOPIC
  SUBTOPIC
  DETAIL
  NOTE
}

// Mind Map Relationship (connections between nodes)
model MindMapRelationship {
  id              String   @id @default(cuid())
  
  fromNodeId      String
  fromNode        MindMapNode @relation("FromNode", fields: [fromNodeId], references: [id], onDelete: Cascade)
  
  toNodeId        String
  toNode          MindMapNode @relation("ToNode", fields: [toNodeId], references: [id], onDelete: Cascade)
  
  type            RelationType @default(RELATED)
  labelAr         String?
  labelEn         String?
  
  // Visual properties
  lineStyle       String   @default("solid") // solid, dashed, dotted
  lineWidth       Int      @default(2)
  color           String   @default("#94a3b8")
  
  createdAt       DateTime @default(now())
  
  @@unique([fromNodeId, toNodeId, type])
  @@index([fromNodeId])
  @@index([toNodeId])
}

enum RelationType {
  RELATED
  PREREQUISITE
  LEADS_TO
  EXAMPLE_OF
  CONTRADICTS
  ELABORATES
  PART_OF
}

// Attachments to nodes (Ayahs, Hadiths, notes, links)
model MindMapAttachment {
  id              String   @id @default(cuid())
  nodeId          String
  node            MindMapNode @relation(fields: [nodeId], references: [id], onDelete: Cascade)
  
  type            AttachmentType
  titleAr         String
  titleEn         String
  contentAr       String?  @db.Text
  contentEn       String?  @db.Text
  url             String?
  
  order           Int      @default(0)
  createdAt       DateTime @default(now())
  
  @@index([nodeId])
}

enum AttachmentType {
  AYAH           // Quranic verse
  HADITH         // Hadith reference
  NOTE           // Additional note
  LINK           // External resource
  IMAGE          // Image URL
}

// Update existing Lesson model
model Lesson {
  // ... existing fields
  
  mindMapNodes    MindMapNode[]
  hasMindMap      Boolean  @default(false)
  mindMapData     Json?    // Backup: serialized mind map structure
  
  // ... rest of existing fields
}

// Update existing User model
model User {
  // ... existing fields
  
  createdMindMapNodes MindMapNode[] @relation("CreatedMindMapNodes")
  
  // ... rest of existing fields
}
```

**Migration Commands:**
```bash
# Local (SQLite)
npm run db:push

# Production (run after pushing code)
# Vercel will auto-run migrations via scripts/migrate-db.js
```

---

## PHASE 2: API ROUTES

Create these API routes in `app/api/admin/mindmap/`:

### 2.1 Node Management API

**File**: `app/api/admin/mindmap/nodes/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createNodeSchema = z.object({
  lessonId: z.string().min(1),
  parentId: z.string().optional().nullable(),
  titleAr: z.string().min(1),
  titleEn: z.string().min(1),
  descriptionAr: z.string().optional(),
  descriptionEn: z.string().optional(),
  type: z.enum(['ROOT', 'CATEGORY', 'TOPIC', 'SUBTOPIC', 'DETAIL', 'NOTE']),
  color: z.string().default('#4F46E5'),
  icon: z.string().optional(),
  shape: z.string().default('circle'),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
  order: z.number().default(0),
  isPublished: z.boolean().default(false),
});

// GET all nodes for a lesson
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get('lessonId');

    if (!lessonId) {
      return NextResponse.json({ error: 'lessonId required' }, { status: 400 });
    }

    // Check if user is admin or student (students only see published)
    const isAdmin = session.user.role === 'admin';
    
    const nodes = await prisma.mindMapNode.findMany({
      where: {
        lessonId,
        ...(isAdmin ? {} : { isPublished: true }),
      },
      include: {
        children: true,
        parent: {
          select: {
            id: true,
            titleAr: true,
            titleEn: true,
          },
        },
        relationships: {
          include: {
            toNode: {
              select: {
                id: true,
                titleAr: true,
                titleEn: true,
              },
            },
          },
        },
        attachments: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: [
        { level: 'asc' },
        { order: 'asc' },
      ],
    });

    return NextResponse.json({ nodes, count: nodes.length });
  } catch (error) {
    console.error('Error fetching mind map nodes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nodes' },
      { status: 500 }
    );
  }
}

// POST create new node
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = createNodeSchema.parse(body);

    // Calculate level based on parent
    let level = 0;
    if (validatedData.parentId) {
      const parent = await prisma.mindMapNode.findUnique({
        where: { id: validatedData.parentId },
        select: { level: true, lessonId: true },
      });

      if (!parent) {
        return NextResponse.json({ error: 'Parent node not found' }, { status: 404 });
      }

      // Ensure parent belongs to same lesson
      if (parent.lessonId !== validatedData.lessonId) {
        return NextResponse.json(
          { error: 'Parent node must belong to same lesson' },
          { status: 400 }
        );
      }

      level = parent.level + 1;
    }

    const node = await prisma.mindMapNode.create({
      data: {
        ...validatedData,
        level,
        createdBy: session.user.id,
      },
      include: {
        children: true,
        relationships: true,
        attachments: true,
      },
    });

    // Update lesson to mark it has mind map
    await prisma.lesson.update({
      where: { id: validatedData.lessonId },
      data: { hasMindMap: true },
    });

    return NextResponse.json(node, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating mind map node:', error);
    return NextResponse.json(
      { error: 'Failed to create node' },
      { status: 500 }
    );
  }
}
```

**File**: `app/api/admin/mindmap/nodes/[id]/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET single node with full details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const node = await prisma.mindMapNode.findUnique({
      where: { id: params.id },
      include: {
        children: {
          orderBy: { order: 'asc' },
        },
        parent: true,
        relationships: {
          include: {
            toNode: true,
          },
        },
        relatedTo: {
          include: {
            fromNode: true,
          },
        },
        attachments: {
          orderBy: { order: 'asc' },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        lesson: {
          select: {
            id: true,
            titleAr: true,
            titleEn: true,
            branch: {
              select: {
                nameAr: true,
                nameEn: true,
              },
            },
            level: {
              select: {
                nameAr: true,
                nameEn: true,
              },
            },
          },
        },
      },
    });

    if (!node) {
      return NextResponse.json({ error: 'Node not found' }, { status: 404 });
    }

    // Students can only see published nodes
    if (session.user.role !== 'admin' && !node.isPublished) {
      return NextResponse.json({ error: 'Node not found' }, { status: 404 });
    }

    return NextResponse.json(node);
  } catch (error) {
    console.error('Error fetching mind map node:', error);
    return NextResponse.json(
      { error: 'Failed to fetch node' },
      { status: 500 }
    );
  }
}

// PUT update node
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    
    // Recalculate level if parent changed
    if (body.parentId !== undefined) {
      if (body.parentId) {
        const parent = await prisma.mindMapNode.findUnique({
          where: { id: body.parentId },
        });
        if (parent) {
          body.level = parent.level + 1;
        }
      } else {
        body.level = 0;
      }
    }

    const node = await prisma.mindMapNode.update({
      where: { id: params.id },
      data: body,
      include: {
        children: true,
        relationships: true,
        attachments: true,
      },
    });

    return NextResponse.json(node);
  } catch (error) {
    console.error('Error updating mind map node:', error);
    return NextResponse.json(
      { error: 'Failed to update node' },
      { status: 500 }
    );
  }
}

// DELETE node
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Check if node has children
    const node = await prisma.mindMapNode.findUnique({
      where: { id: params.id },
      include: { children: true },
    });

    if (!node) {
      return NextResponse.json({ error: 'Node not found' }, { status: 404 });
    }

    if (node.children.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete node with children. Delete children first.' },
        { status: 400 }
      );
    }

    await prisma.mindMapNode.delete({
      where: { id: params.id },
    });

    // Check if lesson still has nodes
    const remainingNodes = await prisma.mindMapNode.count({
      where: { lessonId: node.lessonId },
    });

    if (remainingNodes === 0) {
      await prisma.lesson.update({
        where: { id: node.lessonId },
        data: { hasMindMap: false },
      });
    }

    return NextResponse.json({ success: true, message: 'Node deleted' });
  } catch (error) {
    console.error('Error deleting mind map node:', error);
    return NextResponse.json(
      { error: 'Failed to delete node' },
      { status: 500 }
    );
  }
}
```

### 2.2 Tree Structure API

**File**: `app/api/admin/mindmap/tree/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface TreeNode {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  type: string;
  color: string;
  icon?: string;
  shape: string;
  level: number;
  positionX?: number;
  positionY?: number;
  children: TreeNode[];
  attachments?: any[];
  [key: string]: any;
}

function buildTree(nodes: any[], parentId: string | null = null): TreeNode[] {
  return nodes
    .filter((node) => node.parentId === parentId)
    .sort((a, b) => a.order - b.order)
    .map((node) => ({
      ...node,
      children: buildTree(nodes, node.id),
    }));
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get('lessonId');

    if (!lessonId) {
      return NextResponse.json({ error: 'lessonId required' }, { status: 400 });
    }

    const isAdmin = session.user.role === 'admin';

    const nodes = await prisma.mindMapNode.findMany({
      where: {
        lessonId,
        ...(isAdmin ? {} : { isPublished: true }),
      },
      include: {
        relationships: {
          include: {
            toNode: {
              select: {
                id: true,
                titleAr: true,
                titleEn: true,
              },
            },
          },
        },
        attachments: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: [
        { level: 'asc' },
        { order: 'asc' },
      ],
    });

    const tree = buildTree(nodes);
    const relationships = nodes.flatMap((n) => n.relationships);

    return NextResponse.json({
      nodes,
      tree,
      relationships,
      meta: {
        totalNodes: nodes.length,
        maxDepth: Math.max(...nodes.map(n => n.level), 0),
        rootNodes: tree.length,
      },
    });
  } catch (error) {
    console.error('Error building mind map tree:', error);
    return NextResponse.json(
      { error: 'Failed to build tree' },
      { status: 500 }
    );
  }
}
```

### 2.3 Relationship Management API

**File**: `app/api/admin/mindmap/relationships/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createRelationshipSchema = z.object({
  fromNodeId: z.string().min(1),
  toNodeId: z.string().min(1),
  type: z.enum([
    'RELATED',
    'PREREQUISITE',
    'LEADS_TO',
    'EXAMPLE_OF',
    'CONTRADICTS',
    'ELABORATES',
    'PART_OF',
  ]),
  labelAr: z.string().optional(),
  labelEn: z.string().optional(),
  lineStyle: z.string().default('solid'),
  lineWidth: z.number().min(1).max(10).default(2),
  color: z.string().default('#94a3b8'),
});

// POST create relationship
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = createRelationshipSchema.parse(body);

    // Verify both nodes exist and belong to same lesson
    const [fromNode, toNode] = await Promise.all([
      prisma.mindMapNode.findUnique({ 
        where: { id: validatedData.fromNodeId },
        select: { id: true, lessonId: true }
      }),
      prisma.mindMapNode.findUnique({ 
        where: { id: validatedData.toNodeId },
        select: { id: true, lessonId: true }
      }),
    ]);

    if (!fromNode || !toNode) {
      return NextResponse.json(
        { error: 'One or both nodes not found' },
        { status: 404 }
      );
    }

    if (fromNode.lessonId !== toNode.lessonId) {
      return NextResponse.json(
        { error: 'Nodes must belong to same lesson' },
        { status: 400 }
      );
    }

    // Prevent self-reference
    if (validatedData.fromNodeId === validatedData.toNodeId) {
      return NextResponse.json(
        { error: 'Node cannot relate to itself' },
        { status: 400 }
      );
    }

    const relationship = await prisma.mindMapRelationship.create({
      data: validatedData,
      include: {
        fromNode: {
          select: {
            id: true,
            titleAr: true,
            titleEn: true,
          },
        },
        toNode: {
          select: {
            id: true,
            titleAr: true,
            titleEn: true,
          },
        },
      },
    });

    return NextResponse.json(relationship, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating relationship:', error);
    return NextResponse.json(
      { error: 'Failed to create relationship' },
      { status: 500 }
    );
  }
}

// DELETE relationship
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Relationship id required' }, { status: 400 });
    }

    await prisma.mindMapRelationship.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Relationship deleted' });
  } catch (error) {
    console.error('Error deleting relationship:', error);
    return NextResponse.json(
      { error: 'Failed to delete relationship' },
      { status: 500 }
    );
  }
}
```

### 2.4 Attachment Management API

**File**: `app/api/admin/mindmap/attachments/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createAttachmentSchema = z.object({
  nodeId: z.string().min(1),
  type: z.enum(['AYAH', 'HADITH', 'NOTE', 'LINK', 'IMAGE']),
  titleAr: z.string().min(1),
  titleEn: z.string().min(1),
  contentAr: z.string().optional(),
  contentEn: z.string().optional(),
  url: z.string().url().optional(),
  order: z.number().default(0),
});

// POST create attachment
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = createAttachmentSchema.parse(body);

    const attachment = await prisma.mindMapAttachment.create({
      data: validatedData,
    });

    return NextResponse.json(attachment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating attachment:', error);
    return NextResponse.json(
      { error: 'Failed to create attachment' },
      { status: 500 }
    );
  }
}

// DELETE attachment
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Attachment id required' }, { status: 400 });
    }

    await prisma.mindMapAttachment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Attachment deleted' });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    return NextResponse.json(
      { error: 'Failed to delete attachment' },
      { status: 500 }
    );
  }
}
```

---

## PHASE 3: ADMIN COMPONENTS

Create admin interface for managing mind maps in `components/admin/mindmap/`:

### 3.1 Mind Map Editor Component

**File**: `components/admin/mindmap/MindMapEditor.tsx`
```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface MindMapEditorProps {
  lessonId: string;
  locale: string;
}

export default function MindMapEditor({ lessonId, locale }: MindMapEditorProps) {
  const t = useTranslations('admin.mindmap');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
        type: 'default',
        data: {
          label: locale === 'ar' ? node.titleAr : node.titleEn,
          ...node,
        },
        position: {
          x: node.positionX || Math.random() * 500,
          y: node.positionY || Math.random() * 500,
        },
        style: {
          background: node.color,
          color: '#fff',
          border: '1px solid #222138',
          borderRadius: node.shape === 'circle' ? '50%' : '8px',
          padding: 10,
        },
      }));

      const flowEdges: Edge[] = data.relationships.map((rel: any) => ({
        id: rel.id,
        source: rel.fromNodeId,
        target: rel.toNodeId,
        type: 'smoothstep',
        animated: rel.type === 'LEADS_TO',
        style: {
          stroke: rel.color,
          strokeWidth: rel.lineWidth,
          strokeDasharray: rel.lineStyle === 'dashed' ? '5,5' : undefined,
        },
        label: locale === 'ar' ? rel.labelAr : rel.labelEn,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: rel.color,
        },
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
    } catch (error) {
      console.error('Failed to load mind map:', error);
    } finally {
      setLoading(false);
    }
  };

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
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
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            positionX: update.positionX,
            positionY: update.positionY,
          }),
        });
      }

      alert(t('positionsSaved'));
    } catch (error) {
      console.error('Failed to save positions:', error);
      alert(t('saveFailed'));
    }
  };

  if (loading) {
    return <div className="p-8 text-center">{t('loading')}</div>;
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white border-b p-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">{t('editor')}</h2>
        <div className="flex gap-2">
          <button
            onClick={handleSavePositions}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {t('savePositions')}
          </button>
          <button
            onClick={() => setSelectedNode(null)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            {t('closePanel')}
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        <div className="flex-1">
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
        </div>

        {selectedNode && (
          <div className="w-96 border-l bg-white p-4 overflow-y-auto">
            <h3 className="font-bold text-lg mb-4">
              {locale === 'ar' ? selectedNode.titleAr : selectedNode.titleEn}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('type')}</label>
                <span className="text-sm">{selectedNode.type}</span>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('color')}</label>
                <div
                  className="w-12 h-12 rounded border"
                  style={{ background: selectedNode.color }}
                />
              </div>
              {selectedNode.descriptionAr && (
                <div>
                  <label className="block text-sm font-medium mb-1">{t('description')}</label>
                  <p className="text-sm">
                    {locale === 'ar' ? selectedNode.descriptionAr : selectedNode.descriptionEn}
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
```

### 3.2 Node Creation Form

**File**: `components/admin/mindmap/NodeForm.tsx`
```typescript
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface NodeFormProps {
  lessonId: string;
  parentId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function NodeForm({ lessonId, parentId, onSuccess, onCancel }: NodeFormProps) {
  const t = useTranslations('admin.mindmap');
  const [formData, setFormData] = useState({
    titleAr: '',
    titleEn: '',
    descriptionAr: '',
    descriptionEn: '',
    type: 'TOPIC',
    color: '#4F46E5',
    icon: '',
    shape: 'circle',
    isPublished: false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/mindmap/nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          lessonId,
          parentId: parentId || null,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create node');
      }

      alert(t('nodeCreated'));
      onSuccess();
    } catch (error: any) {
      console.error('Failed to create node:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-bold">{t('createNode')}</h3>

      <div>
        <label className="block text-sm font-medium mb-1">{t('titleArabic')}</label>
        <input
          type="text"
          required
          value={formData.titleAr}
          onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
          className="w-full border rounded px-3 py-2"
          dir="rtl"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t('titleEnglish')}</label>
        <input
          type="text"
          required
          value={formData.titleEn}
          onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t('descriptionArabic')}</label>
        <textarea
          value={formData.descriptionAr}
          onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
          className="w-full border rounded px-3 py-2"
          rows={3}
          dir="rtl"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t('descriptionEnglish')}</label>
        <textarea
          value={formData.descriptionEn}
          onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
          className="w-full border rounded px-3 py-2"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t('type')}</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="w-full border rounded px-3 py-2"
        >
          <option value="ROOT">{t('root')}</option>
          <option value="CATEGORY">{t('category')}</option>
          <option value="TOPIC">{t('topic')}</option>
          <option value="SUBTOPIC">{t('subtopic')}</option>
          <option value="DETAIL">{t('detail')}</option>
          <option value="NOTE">{t('note')}</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t('color')}</label>
        <input
          type="color"
          value={formData.color}
          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
          className="w-20 h-10 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t('shape')}</label>
        <select
          value={formData.shape}
          onChange={(e) => setFormData({ ...formData, shape: e.target.value })}
          className="w-full border rounded px-3 py-2"
        >
          <option value="circle">{t('circle')}</option>
          <option value="rect">{t('rectangle')}</option>
          <option value="diamond">{t('diamond')}</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPublished"
          checked={formData.isPublished}
          onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
          className="rounded"
        />
        <label htmlFor="isPublished" className="text-sm">
          {t('publishImmediately')}
        </label>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? t('creating') : t('create')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
        >
          {t('cancel')}
        </button>
      </div>
    </form>
  );
}
```

---

## PHASE 4: STUDENT VIEWER COMPONENT

Create student-facing mind map viewer in `components/public/mindmap/`:

**File**: `components/public/mindmap/MindMapViewer.tsx`
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface MindMapViewerProps {
  lessonId: string;
  locale: string;
}

interface Node {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  type: string;
  color: string;
  icon?: string;
  level: number;
  children: Node[];
  attachments?: any[];
}

export default function MindMapViewer({ lessonId, locale }: MindMapViewerProps) {
  const t = useTranslations('mindmap');
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
      console.error('Failed to load mind map:', error);
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
    const title = locale === 'ar' ? node.titleAr : node.titleEn;
    const description = locale === 'ar' ? node.descriptionAr : node.descriptionEn;

    return (
      <div key={node.id} className="mb-2" style={{ marginLeft: `${depth * 24}px` }}>
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
            <span className="text-lg">
              {isExpanded ? '▼' : '▶'}
            </span>
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
      <div className="text-center p-12 text-gray-500">
        {t('noMindMap')}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-2">
        <h3 className="text-xl font-bold mb-4">{t('mindMap')}</h3>
        {tree.map((node) => renderNode(node))}
      </div>

      {selectedNode && (
        <div className="bg-white rounded-lg border p-6 sticky top-4">
          <h4 className="text-lg font-bold mb-2">
            {locale === 'ar' ? selectedNode.titleAr : selectedNode.titleEn}
          </h4>
          
          {(selectedNode.descriptionAr || selectedNode.descriptionEn) && (
            <p className="text-sm text-gray-600 mb-4">
              {locale === 'ar' ? selectedNode.descriptionAr : selectedNode.descriptionEn}
            </p>
          )}

          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">{t('type')}:</span>{' '}
              <span className="text-gray-600">{selectedNode.type}</span>
            </div>
            <div>
              <span className="font-medium">{t('level')}:</span>{' '}
              <span className="text-gray-600">{selectedNode.level}</span>
            </div>
          </div>

          {selectedNode.attachments && selectedNode.attachments.length > 0 && (
            <div className="mt-4">
              <h5 className="font-medium mb-2">{t('attachments')}:</h5>
              <div className="space-y-2">
                {selectedNode.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="p-2 bg-gray-50 rounded text-sm"
                  >
                    <div className="font-medium">
                      {locale === 'ar' ? att.titleAr : att.titleEn}
                    </div>
                    {att.contentAr && (
                      <div className="text-gray-600 mt-1">
                        {locale === 'ar' ? att.contentAr : att.contentEn}
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
```

---

## PHASE 5: ADMIN PAGE INTEGRATION

### 5.1 Add Mind Map Tab to Admin Lesson Editor

**File**: `app/[locale]/admin/lessons/[id]/edit/page.tsx` (modify existing)

Add a "Mind Map" tab to the lesson editor:
```typescript
// Add this tab alongside existing "Content", "Quiz", etc. tabs

<Tab label={t('mindMap')}>
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-bold">{t('manageMindMap')}</h3>
      <Link
        href={`/${locale}/admin/mindmap/editor/${lesson.id}`}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {t('openEditor')}
      </Link>
    </div>
    
    {lesson.hasMindMap ? (
      <div className="bg-green-50 border border-green-200 rounded p-4">
        <p className="text-green-800">{t('mindMapExists')}</p>
      </div>
    ) : (
      <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
        <p className="text-yellow-800">{t('noMindMapYet')}</p>
      </div>
    )}
  </div>
</Tab>
```

### 5.2 Create Dedicated Mind Map Editor Page

**File**: `app/[locale]/admin/mindmap/editor/[lessonId]/page.tsx`
```typescript
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import MindMapEditor from '@/components/admin/mindmap/MindMapEditor';
import NodeForm from '@/components/admin/mindmap/NodeForm';

export default async function MindMapEditorPage({
  params,
}: {
  params: { lessonId: string; locale: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'admin') {
    redirect(`/${params.locale}/login`);
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.lessonId },
    include: {
      branch: true,
      level: true,
    },
  });

  if (!lesson) {
    return <div>Lesson not found</div>;
  }

  return (
    <div>
      <div className="bg-white border-b p-4">
        <h1 className="text-2xl font-bold">
          Mind Map Editor: {params.locale === 'ar' ? lesson.titleAr : lesson.titleEn}
        </h1>
        <p className="text-sm text-gray-600">
          {params.locale === 'ar' ? lesson.branch.nameAr : lesson.branch.nameEn} -{' '}
          {params.locale === 'ar' ? lesson.level.nameAr : lesson.level.nameEn}
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 p-6">
        <div className="lg:col-span-3">
          <MindMapEditor lessonId={params.lessonId} locale={params.locale} />
        </div>

        <div>
          <NodeForm
            lessonId={params.lessonId}
            onSuccess={() => window.location.reload()}
            onCancel={() => {}}
          />
        </div>
      </div>
    </div>
  );
}
```

---

## PHASE 6: STUDENT PAGE INTEGRATION

### Integrate Mind Map into Lesson Page

**File**: `app/[locale]/lesson/[id]/page.tsx` (modify existing)

Add mind map viewer below or in a tab with lesson content:
```typescript
import MindMapViewer from '@/components/public/mindmap/MindMapViewer';

// Inside the lesson page component, add:

{lesson.hasMindMap && (
  <div className="mt-8">
    <MindMapViewer lessonId={lesson.id} locale={locale} />
  </div>
)}
```

---

## PHASE 7: TRANSLATIONS

### Add to `messages/ar.json`:
```json
{
  "admin": {
    "mindmap": {
      "editor": "محرر الخريطة الذهنية",
      "createNode": "إنشاء عقدة جديدة",
      "loading": "جاري التحميل...",
      "savePositions": "حفظ المواضع",
      "saveFailed": "فشل الحفظ",
      "positionsSaved": "تم حفظ المواضع بنجاح",
      "closePanel": "إغلاق اللوحة",
      "type": "النوع",
      "color": "اللون",
      "description": "الوصف",
      "titleArabic": "العنوان بالعربية",
      "titleEnglish": "العنوان بالإنجليزية",
      "descriptionArabic": "الوصف بالعربية",
      "descriptionEnglish": "الوصف بالإنجليزية",
      "root": "جذر",
      "category": "فئة",
      "topic": "موضوع",
      "subtopic": "موضوع فرعي",
      "detail": "تفصيل",
      "note": "ملاحظة",
      "shape": "الشكل",
      "circle": "دائرة",
      "rectangle": "مستطيل",
      "diamond": "معين",
      "publishImmediately": "نشر فوراً",
      "create": "إنشاء",
      "creating": "جاري الإنشاء...",
      "cancel": "إلغاء",
      "nodeCreated": "تم إنشاء العقدة بنجاح",
      "manageMindMap": "إدارة الخريطة الذهنية",
      "openEditor": "فتح المحرر",
      "mindMapExists": "توجد خريطة ذهنية لهذا الدرس",
      "noMindMapYet": "لا توجد خريطة ذهنية بعد"
    }
  },
  "mindmap": {
    "mindMap": "الخريطة الذهنية",
    "noMindMap": "لا توجد خريطة ذهنية لهذا الدرس",
    "type": "النوع",
    "level": "المستوى",
    "attachments": "المرفقات"
  }
}
```

### Add to `messages/en.json`:
```json
{
  "admin": {
    "mindmap": {
      "editor": "Mind Map Editor",
      "createNode": "Create New Node",
      "loading": "Loading...",
      "savePositions": "Save Positions",
      "saveFailed": "Save Failed",
      "positionsSaved": "Positions saved successfully",
      "closePanel": "Close Panel",
      "type": "Type",
      "color": "Color",
      "description": "Description",
      "titleArabic": "Title (Arabic)",
      "titleEnglish": "Title (English)",
      "descriptionArabic": "Description (Arabic)",
      "descriptionEnglish": "Description (English)",
      "root": "Root",
      "category": "Category",
      "topic": "Topic",
      "subtopic": "Subtopic",
      "detail": "Detail",
      "note": "Note",
      "shape": "Shape",
      "circle": "Circle",
      "rectangle": "Rectangle",
      "diamond": "Diamond",
      "publishImmediately": "Publish Immediately",
      "create": "Create",
      "creating": "Creating...",
      "cancel": "Cancel",
      "nodeCreated": "Node created successfully",
      "manageMindMap": "Manage Mind Map",
      "openEditor": "Open Editor",
      "mindMapExists": "Mind map exists for this lesson",
      "noMindMapYet": "No mind map yet"
    }
  },
  "mindmap": {
    "mindMap": "Mind Map",
    "noMindMap": "No mind map for this lesson",
    "type": "Type",
    "level": "Level",
    "attachments": "Attachments"
  }
}
```

---

## PHASE 8: DEPENDENCIES

Add to `package.json`:
```json
{
  "dependencies": {
    "reactflow": "^11.10.4"
  }
}
```

Install:
```bash
npm install reactflow
```

---

## PHASE 9: DEPLOYMENT CHECKLIST

### Local Testing
```bash
# 1. Update schema
npm run db:push

# 2. Verify migrations worked
npm run db:studio

# 3. Create test mind map via admin panel
# 4. View mind map as student
# 5. Test all CRUD operations
```

### Production Deployment
```bash
# 1. Commit changes
git add .
git commit -m "Add mind map system"

# 2. Push to GitHub (auto-deploys to Vercel)
git push origin main

# 3. Verify on production
# - Check database schema updated
# - Test admin editor
# - Test student viewer
```

---

## SUMMARY OF WHAT WAS CREATED

### Database Models (5 new)
- ✅ MindMapNode
- ✅ MindMapRelationship
- ✅ MindMapAttachment
- ✅ Updated Lesson model
- ✅ Updated User model

### API Routes (8 new)
- ✅ GET/POST `/api/admin/mindmap/nodes`
- ✅ GET/PUT/DELETE `/api/admin/mindmap/nodes/[id]`
- ✅ GET `/api/admin/mindmap/tree`
- ✅ POST/DELETE `/api/admin/mindmap/relationships`
- ✅ POST/DELETE `/api/admin/mindmap/attachments`

### Admin Components (2 new)
- ✅ MindMapEditor (ReactFlow visual editor)
- ✅ NodeForm (create/edit nodes)

### Student Components (1 new)
- ✅ MindMapViewer (collapsible tree view)

### Pages (1 new)
- ✅ `/admin/mindmap/editor/[lessonId]`

### Features Implemented
- ✅ Visual drag-and-drop editor for admins
- ✅ Hierarchical node structure (parent-child)
- ✅ Cross-node relationships (prerequisites, examples, etc.)
- ✅ Bilingual content (Arabic/English)
- ✅ Attachments (Ayahs, Hadiths, notes, links)
- ✅ Publish/draft status
- ✅ Interactive viewer for students
- ✅ Expandable/collapsible tree structure
- ✅ Node detail panel
- ✅ Color coding and custom shapes

---

## NEXT STEPS

1. **Test locally**: Create a mind map for a test lesson
2. **Export feature**: Add SVG/PNG export (Phase 10 - optional)
3. **Auto-layout**: Add automatic node positioning algorithms
4. **Search**: Add search within mind maps
5. **Print**: Add print-friendly view

**Ready to implement? Let me know if you need any clarifications!**