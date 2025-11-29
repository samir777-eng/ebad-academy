'use client';

import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface SeerahNode {
  id: string;
  type: string;
  title: string;
  date_hijri: string;
  phase: string;
  category: string;
  description: string;
  modern_applications: string[];
}

const phaseColors: Record<string, string> = {
  'pre-prophethood': '#8B4513',
  'pre-revelation': '#A0522D',
  'mecca-secret': '#CD853F',
  'mecca-public': '#DEB887',
  'mecca': '#F4A460',
  'hijra': '#4169E1',
  'madinah-state': '#32CD32',
  'madinah-military': '#228B22',
  'madinah': '#90EE90',
  'badr': '#FF4500',
  'uhud': '#FF6347',
  'khandaq': '#FF7F50',
  'hudaybiyyah': '#FFD700',
  'expansion': '#9370DB',
  'conquest': '#8A2BE2',
  'consolidation': '#4B0082',
  'farewell': '#800080',
  'succession': '#9932CC',
  'all': '#696969',
};

const phaseNames: Record<string, string> = {
  'pre-prophethood': 'ما قبل النبوة',
  'pre-revelation': 'ما قبل الوحي',
  'mecca-secret': 'الدعوة السرية',
  'mecca-public': 'الدعوة الجهرية',
  'mecca': 'العهد المكي',
  'hijra': 'الهجرة',
  'madinah-state': 'بناء الدولة',
  'madinah-military': 'المرحلة العسكرية',
  'madinah': 'العهد المدني',
  'badr': 'بدر الكبرى',
  'uhud': 'أحد',
  'khandaq': 'الخندق',
  'hudaybiyyah': 'الحديبية',
  'expansion': 'التوسع',
  'conquest': 'الفتح',
  'consolidation': 'التوحيد',
  'farewell': 'حجة الوداع',
  'succession': 'الخلافة',
  'late-mecca-madinah': 'أواخر مكة وبداية المدينة',
  'all': 'الكل',
};

// Category icons
const categoryIcons: Record<string, string> = {
  'الأحداث': '📅',
  'الغزوات': '⚔️',
  'السرايا': '🎯',
  'الصحابة': '👤',
  'الأماكن': '📍',
  'التشريع': '📜',
  'الوفود': '🤝',
  'المعجزات': '✨',
  'الدعوة': '📢',
  'الهجرة': '🚶',
  'البيعات': '🤝',
  'الدبلوماسية': '🤝',
  'الاستخبارات': '🔍',
  'القيادة': '👑',
  'العسكرية': '⚔️',
};

export default function MindMapPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [seerahData, setSeerahData] = useState<SeerahNode[]>([]);
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<SeerahNode | null>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const navigateToPhase = useCallback((phase: string) => {
    if (!reactFlowInstance) return;

    const phaseNode = nodes.find(n => n.id === `phase-${phase}`);
    if (phaseNode) {
      reactFlowInstance.setCenter(
        phaseNode.position.x + 150,
        phaseNode.position.y + 100,
        { zoom: 0.6, duration: 800 }
      );
    }
  }, [reactFlowInstance, nodes]);

  useEffect(() => {
    fetch('/data/nodes.json')
      .then((res) => res.json())
      .then((data: SeerahNode[]) => {
        setSeerahData(data);

        // Extract unique categories
        const categories = Array.from(new Set(data.map(node => node.category))).sort();
        setUniqueCategories(categories);

        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading data:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (seerahData.length === 0) return;

    let filteredData = selectedPhase === 'all'
      ? seerahData
      : seerahData.filter(n => n.phase === selectedPhase);

    // Filter by category
    if (selectedCategory !== 'all') {
      filteredData = filteredData.filter(n => n.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredData = filteredData.filter(n =>
        n.title.toLowerCase().includes(query) ||
        n.description.toLowerCase().includes(query) ||
        n.participants.some(p => p.toLowerCase().includes(query))
      );
    }

    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];

    // Group by phase
    const phaseGroups: Record<string, SeerahNode[]> = {};
    filteredData.forEach((node) => {
      if (!phaseGroups[node.phase]) {
        phaseGroups[node.phase] = [];
      }
      phaseGroups[node.phase].push(node);
    });

    const phases = Object.keys(phaseGroups);
    const verticalSpacing = 800; // Increased spacing between phases
    const horizontalSpacing = 450; // Increased spacing between events
    const eventsPerRow = 6; // Events per row before wrapping
    const startX = 100;
    let currentY = 100;

    phases.forEach((phase, phaseIndex) => {
      const phaseEvents = phaseGroups[phase];

      // Create phase header node with gradient and icon
      const phaseNodeId = `phase-${phase}`;
      const phaseColor = phaseColors[phase] || '#666';
      flowNodes.push({
        id: phaseNodeId,
        type: 'default',
        position: { x: startX, y: currentY },
        data: {
          label: (
            <div
              className="text-center font-bold text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${phaseColor} 0%, ${phaseColor}dd 100%)`,
                borderTop: '4px solid rgba(255,255,255,0.3)',
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>
              <div className="relative z-10">
                <div className="text-3xl mb-3 font-extrabold tracking-wide drop-shadow-lg">
                  {phaseNames[phase] || phase}
                </div>
                <div className="text-lg bg-white bg-opacity-20 inline-block px-4 py-1 rounded-full">
                  {phaseEvents.length} حدث
                </div>
              </div>
            </div>
          )
        },
        style: {
          background: 'transparent',
          border: 'none',
          borderRadius: '24px',
          width: 320,
          boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
        },
      });

      // Create event nodes for this phase with wrapping
      phaseEvents.forEach((node, eventIndex) => {
        const row = Math.floor(eventIndex / eventsPerRow);
        const col = eventIndex % eventsPerRow;
        const xPos = startX + (col + 1) * horizontalSpacing;
        const yPos = currentY + row * 400;

        flowNodes.push({
          id: node.id,
          type: 'default',
          position: { x: xPos, y: yPos },
          data: {
            label: (
              <div
                className="text-sm p-5 text-right cursor-pointer transition-all duration-300 hover:scale-110 hover:-translate-y-2 group relative overflow-hidden"
                dir="rtl"
                onClick={() => setSelectedNode(node)}
                style={{
                  background: `linear-gradient(135deg, ${phaseColors[phase]}15 0%, ${phaseColors[phase]}08 100%)`,
                  backdropFilter: 'blur(10px)',
                }}
              >
                {/* Decorative corner with glow */}
                <div
                  className="absolute top-0 right-0 w-20 h-20 opacity-20 rounded-bl-full blur-sm"
                  style={{ backgroundColor: phaseColors[phase] || '#666' }}
                ></div>

                {/* Content */}
                <div className="relative z-10">
                  <div className="font-bold mb-3 text-base leading-tight text-white group-hover:text-emerald-200 drop-shadow-lg">
                    {node.title}
                  </div>
                  <div className="flex items-center gap-2 text-xs mb-2">
                    <span className="text-emerald-300">📅</span>
                    <span className="text-gray-200">{node.date_hijri}</span>
                  </div>

                  {node.modern_applications.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <div
                        className="text-center font-bold text-xs px-3 py-1.5 rounded-full inline-block shadow-lg"
                        style={{
                          backgroundColor: phaseColors[phase] || '#666',
                          color: 'white'
                        }}
                      >
                        💡 {node.modern_applications.length} تطبيق معاصر
                      </div>
                    </div>
                  )}

                  <div className="mt-3 text-center">
                    <span className="text-xs text-gray-300 group-hover:text-emerald-300 transition-colors font-medium">
                      ← انقر للتفاصيل
                    </span>
                  </div>
                </div>

                {/* Hover effect border with glow */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{
                    boxShadow: `0 0 20px ${phaseColors[phase]}80, 0 0 0 3px ${phaseColors[phase]}`
                  }}
                ></div>
              </div>
            )
          },
          style: {
            background: 'rgba(31, 41, 55, 0.8)',
            border: `2px solid ${phaseColors[phase] || '#666'}`,
            borderRadius: '20px',
            width: 280,
            fontSize: '12px',
            boxShadow: `0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px ${phaseColors[phase]}40`,
            cursor: 'pointer',
          },
        });

        // Connect phase header to first event in each row
        if (col === 0) {
          flowEdges.push({
            id: `${phaseNodeId}-${node.id}`,
            source: phaseNodeId,
            target: node.id,
            type: 'smoothstep',
            animated: false,
            style: {
              stroke: phaseColors[phase] || '#666',
              strokeWidth: 2,
            },
          });
        }

        // Connect to next event in same phase with gradient effect
        if (eventIndex < phaseEvents.length - 1) {
          const nextNode = phaseEvents[eventIndex + 1];
          const isNextRow = Math.floor((eventIndex + 1) / eventsPerRow) > row;

          flowEdges.push({
            id: `${node.id}-${nextNode.id}`,
            source: node.id,
            target: nextNode.id,
            type: 'smoothstep',
            animated: true,
            style: {
              stroke: phaseColors[phase] || '#666',
              strokeWidth: 2.5,
              strokeDasharray: isNextRow ? '5,5' : '0',
            },
            label: isNextRow ? '⤵' : '→',
            labelStyle: {
              fill: phaseColors[phase] || '#666',
              fontWeight: 700,
              fontSize: 18,
              backgroundColor: 'white',
              padding: '4px 8px',
              borderRadius: '8px',
            },
            labelBgPadding: [8, 4],
            labelBgBorderRadius: 8,
            labelBgStyle: { fill: 'white', fillOpacity: 0.9 },
          });
        }
      });

      // Connect last event of this phase to first event of next phase with special styling
      if (phaseIndex < phases.length - 1) {
        const lastEvent = phaseEvents[phaseEvents.length - 1];
        const nextPhase = phases[phaseIndex + 1];
        const nextPhaseFirstEvent = phaseGroups[nextPhase][0];

        flowEdges.push({
          id: `${lastEvent.id}-${nextPhaseFirstEvent.id}`,
          source: lastEvent.id,
          target: nextPhaseFirstEvent.id,
          type: 'smoothstep',
          animated: true,
          style: {
            stroke: '#10b981',
            strokeWidth: 3.5,
            strokeDasharray: '8,4',
          },
          label: '⬇ المرحلة التالية',
          labelStyle: {
            fill: '#10b981',
            fontWeight: 800,
            fontSize: 15,
            backgroundColor: 'white',
            padding: '6px 12px',
            borderRadius: '12px',
            border: '2px solid #10b981',
          },
          labelBgPadding: [10, 6],
          labelBgBorderRadius: 12,
          labelBgStyle: { fill: 'white', fillOpacity: 1, stroke: '#10b981', strokeWidth: 2 },
        });
      }

      // Calculate next Y position based on number of rows in current phase
      const rows = Math.ceil(phaseEvents.length / eventsPerRow);
      currentY += verticalSpacing + (rows - 1) * 400;
    });

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [seerahData, selectedPhase, selectedCategory, searchQuery, setNodes, setEdges]);

  const phases = ['all', ...Array.from(new Set(seerahData.map(n => n.phase))).filter(p => p !== 'all')];

  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-3xl text-emerald-400 font-bold animate-pulse">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col" dir="rtl" style={{ background: 'linear-gradient(to bottom, #1f2937 0%, #111827 50%, #0f172a 100%)' }}>
      {/* Header */}
      <header className="shadow-xl p-5 z-10 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #047857 0%, #059669 100%)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
        <div className="container mx-auto flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-3xl font-extrabold text-white drop-shadow-lg">
              🕌 الخريطة الذهنية للسيرة النبوية
            </h1>
            <p className="text-sm text-emerald-50 mt-1 font-medium">
              📚 {seerahData.length} حدث موثق من حياة النبي محمد صلى الله عليه وسلم
            </p>
          </div>
          <div className="flex gap-4 items-center flex-wrap">
            {/* Search Box */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 ابحث في الأحداث..."
                className="px-5 py-2.5 pr-12 rounded-xl text-gray-800 border-2 border-white bg-white shadow-lg font-bold hover:shadow-xl transition-all w-64"
                dir="rtl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 font-bold text-xl"
                >
                  ×
                </button>
              )}
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-5 py-2.5 rounded-xl text-gray-800 border-2 border-white bg-white shadow-lg font-bold hover:shadow-xl transition-all cursor-pointer"
              dir="rtl"
            >
              <option value="all">جميع الأنواع</option>
              {uniqueCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {/* Phase Filter */}
            <select
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(e.target.value)}
              className="px-5 py-2.5 rounded-xl text-gray-800 border-2 border-white bg-white shadow-lg font-bold hover:shadow-xl transition-all cursor-pointer"
            >
              {phases.map((phase) => (
                <option key={phase} value={phase}>
                  {phaseNames[phase] || phase}
                </option>
              ))}
            </select>

            <a
              href="/"
              className="bg-white text-emerald-800 px-6 py-2.5 rounded-xl hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl font-bold"
            >
              📋 عرض البطاقات
            </a>
          </div>
        </div>
      </header>

      {/* Mind Map */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          fitView
          minZoom={0.03}
          maxZoom={2.5}
          defaultZoom={0.2}
          attributionPosition="bottom-left"
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={true}
        >
          <Controls showInteractive={false} />
          <MiniMap
            nodeColor={(node) => {
              const phase = seerahData.find(n => n.id === node.id)?.phase;
              return phaseColors[phase || 'all'] || '#666';
            }}
            style={{ backgroundColor: '#1f2937', border: '2px solid #374151' }}
            maskColor="rgba(0, 0, 0, 0.6)"
            zoomable
            pannable
          />
          <Background gap={20} size={1.5} color="#374151" style={{ opacity: 0.3 }} />
        </ReactFlow>
      </div>

      {/* Legend */}
      <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 border-t-2 border-emerald-400 p-5 shadow-2xl">
        <div className="container mx-auto">
          <h3 className="font-bold mb-3 text-lg text-emerald-300 flex items-center gap-2">
            🎨 دليل الألوان والمراحل - انقر للانتقال:
          </h3>
          <div className="flex flex-wrap gap-4 text-sm">
            {Object.entries(phaseColors)
              .filter(([phase]) => phase !== 'all')
              .map(([phase, color]) => (
                <button
                  key={phase}
                  onClick={() => navigateToPhase(phase)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:scale-105 transition-all cursor-pointer shadow-lg hover:shadow-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                    border: `2px solid ${color}`,
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-md shadow-md bg-white bg-opacity-30"
                  ></div>
                  <span className="font-bold text-white drop-shadow-lg">{phaseNames[phase] || phase}</span>
                </button>
              ))}
          </div>
          <div className="mt-4 flex gap-6 text-sm text-emerald-100 bg-gray-700 bg-opacity-50 p-3 rounded-lg">
            <span className="flex items-center gap-2">💡 <strong>تطبيقات معاصرة</strong></span>
            <span className="flex items-center gap-2">→ <strong>الترتيب الزمني</strong></span>
            <span className="flex items-center gap-2">🖱️ <strong>انقر على أي حدث لعرض التفاصيل الكاملة</strong></span>
          </div>
        </div>
      </div>

      {/* Modal for Event Details */}
      {selectedNode && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={() => setSelectedNode(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            {/* Header */}
            <div
              className="sticky top-0 text-white p-10 rounded-t-3xl relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${phaseColors[selectedNode.phase] || '#666'} 0%, ${phaseColors[selectedNode.phase] || '#666'}dd 100%)`
              }}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>

              <div className="flex justify-between items-start relative z-10">
                <div className="flex-1">
                  <h2 className="text-4xl font-extrabold mb-4 drop-shadow-lg leading-tight text-white">
                    {selectedNode.title}
                  </h2>
                  <div className="flex gap-4 text-base mb-4 flex-wrap">
                    <span className="flex items-center gap-2 bg-gray-900 bg-opacity-60 px-5 py-2.5 rounded-full text-white font-bold border-2 border-white border-opacity-30 shadow-lg">
                      📅 {selectedNode.date_hijri}
                    </span>
                    <span className="flex items-center gap-2 bg-gray-900 bg-opacity-60 px-5 py-2.5 rounded-full text-white font-bold border-2 border-white border-opacity-30 shadow-lg">
                      📍 {selectedNode.location}
                    </span>
                    <span className="flex items-center gap-2 bg-gray-900 bg-opacity-60 px-5 py-2.5 rounded-full text-white font-bold border-2 border-white border-opacity-30 shadow-lg">
                      🏷️ {selectedNode.category}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-3 flex-wrap">
                    <span className="bg-white text-gray-800 px-5 py-2 rounded-full text-base font-bold shadow-lg">
                      {phaseNames[selectedNode.phase] || selectedNode.phase}
                    </span>
                    {selectedNode.modern_applications.length > 0 && (
                      <span className="bg-emerald-500 text-white px-5 py-2 rounded-full text-base font-bold shadow-lg">
                        💡 {selectedNode.modern_applications.length} تطبيق معاصر
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-white hover:bg-white hover:bg-opacity-30 rounded-full w-14 h-14 flex items-center justify-center text-4xl transition-all hover:rotate-90 shadow-lg"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6 bg-gradient-to-b from-white to-gray-50">
              {/* Description */}
              <div className="bg-white p-6 rounded-2xl shadow-md border-r-4" style={{ borderColor: phaseColors[selectedNode.phase] || '#666' }}>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                  <span className="text-3xl">📖</span>
                  <span>الوصف</span>
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">{selectedNode.description}</p>
              </div>

              {/* Basic Info Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-2xl shadow-md border-2 border-blue-200">
                  <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <span>📅</span>
                    <span>التاريخ الميلادي</span>
                  </h4>
                  <p className="text-blue-800 font-medium">{selectedNode.date_gregorian}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-2xl shadow-md border-2 border-purple-200">
                  <h4 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                    <span>{categoryIcons[selectedNode.category] || '🏷️'}</span>
                    <span>الفئة</span>
                  </h4>
                  <p className="text-purple-800 font-medium">{selectedNode.category}</p>
                </div>
              </div>

              {/* Participants */}
              {selectedNode.participants && selectedNode.participants.length > 0 && (
                <div className="bg-white p-6 rounded-2xl shadow-md">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                    <span className="text-3xl">👥</span>
                    <span>المشاركون</span>
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedNode.participants.map((p, i) => (
                      <span
                        key={i}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-full text-base font-bold shadow-md hover:shadow-lg transition-shadow"
                      >
                        👤 {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Decision */}
              {selectedNode.decision && (
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-2xl font-bold text-purple-900 mb-3 flex items-center gap-2">
                    <span>⚖️</span>
                    <span>القرار المتخذ</span>
                  </h3>
                  <p className="text-purple-800 text-lg">{selectedNode.decision}</p>
                </div>
              )}

              {/* Outcomes */}
              {selectedNode.outcomes && selectedNode.outcomes.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span>🎯</span>
                    <span>النتائج</span>
                  </h3>
                  <ul className="space-y-3">
                    {selectedNode.outcomes.map((o, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-700 text-lg">
                        <span className="text-green-600 text-xl">✓</span>
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Moral Lessons */}
              {selectedNode.moral_lessons && selectedNode.moral_lessons.length > 0 && (
                <div className="bg-amber-50 p-6 rounded-lg">
                  <h3 className="text-2xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                    <span>📚</span>
                    <span>الدروس المستفادة</span>
                  </h3>
                  <ul className="space-y-3">
                    {selectedNode.moral_lessons.map((l, i) => (
                      <li key={i} className="flex items-start gap-3 text-amber-800 text-lg">
                        <span className="text-amber-600 text-xl">•</span>
                        <span>{l}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Modern Applications */}
              {selectedNode.modern_applications && selectedNode.modern_applications.length > 0 && (
                <div className="bg-emerald-50 p-6 rounded-lg border-2 border-emerald-200">
                  <h3 className="text-2xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                    <span>💡</span>
                    <span>التطبيقات المعاصرة</span>
                  </h3>
                  <ul className="space-y-4">
                    {selectedNode.modern_applications.map((app, i) => (
                      <li key={i} className="flex items-start gap-3 text-emerald-800 text-lg bg-white p-4 rounded-lg">
                        <span className="text-emerald-600 text-xl font-bold">{i + 1}.</span>
                        <span>{app}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Security Impact */}
              {selectedNode.security_impact && (
                <div className="bg-red-50 p-6 rounded-lg border-2 border-red-200">
                  <h3 className="text-2xl font-bold text-red-900 mb-3 flex items-center gap-2">
                    <span>🔒</span>
                    <span>الأثر الأمني</span>
                  </h3>
                  <p className="text-red-800 text-lg">{selectedNode.security_impact}</p>
                </div>
              )}

              {/* Sources */}
              {selectedNode.sources && selectedNode.sources.length > 0 && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>📚</span>
                    <span>المصادر والمراجع</span>
                  </h3>
                  <ul className="space-y-2">
                    {selectedNode.sources.map((s, i) => (
                      <li key={i} className="text-gray-700 text-base flex items-start gap-2">
                        <span className="text-gray-500">[{i + 1}]</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

