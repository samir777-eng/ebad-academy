'use client';

import { useState, useEffect } from 'react';

interface SeerahNode {
  id: string;
  type: string;
  title: string;
  date_hijri: string;
  date_gregorian: string;
  location: string;
  category: string;
  phase: string;
  description: string;
  participants: string[];
  decision: string;
  alternatives: string[];
  sources: string[];
  outcomes: string[];
  moral_lessons: string[];
  security_impact: string;
  modern_applications: string[];
}

export default function Home() {
  const [nodes, setNodes] = useState<SeerahNode[]>([]);
  const [filteredNodes, setFilteredNodes] = useState<SeerahNode[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPhase, setSelectedPhase] = useState('all');
  const [selectedNode, setSelectedNode] = useState<SeerahNode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/nodes.json')
      .then(res => res.json())
      .then(data => {
        setNodes(data);
        setFilteredNodes(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading data:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let filtered = nodes;

    if (searchTerm) {
      filtered = filtered.filter(node =>
        node.title.includes(searchTerm) ||
        node.description.includes(searchTerm) ||
        node.modern_applications.some(app => app.includes(searchTerm))
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(node => node.type === selectedType);
    }

    if (selectedPhase !== 'all') {
      filtered = filtered.filter(node => node.phase === selectedPhase);
    }

    setFilteredNodes(filtered);
  }, [searchTerm, selectedType, selectedPhase, nodes]);

  const types = ['all', ...Array.from(new Set(nodes.map(n => n.type))).filter(t => t !== 'all')];
  const phases = ['all', ...Array.from(new Set(nodes.map(n => n.phase))).filter(p => p !== 'all')];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-2xl text-emerald-800">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100" dir="rtl">
      {/* Header */}
      <header className="bg-emerald-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-center mb-2">
            السيرة النبوية التفاعلية الشاملة
          </h1>
          <p className="text-center text-emerald-100">
            منظور قيادي واستراتيجي مع تطبيقات معاصرة
          </p>
          <div className="mt-4 text-center flex justify-center gap-4">
            <span className="bg-emerald-700 px-4 py-2 rounded-full text-sm">
              {nodes.length} حدث موثق
            </span>
            <a
              href="/mindmap"
              className="bg-white text-emerald-800 px-6 py-2 rounded-full text-sm font-bold hover:bg-emerald-100 transition"
            >
              🗺️ عرض الخريطة الذهنية
            </a>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                بحث
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث في الأحداث..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                النوع
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                {types.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'الكل' : type}
                  </option>
                ))}
              </select>
            </div>

            {/* Phase Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المرحلة
              </label>
              <select
                value={selectedPhase}
                onChange={(e) => setSelectedPhase(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                {phases.map(phase => (
                  <option key={phase} value={phase}>
                    {phase === 'all' ? 'الكل' : phase}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            عرض {filteredNodes.length} من {nodes.length} حدث
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNodes.map(node => (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node)}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer p-6 border-r-4 border-emerald-600"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-gray-800 flex-1">
                  {node.title}
                </h3>
                <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                  {node.type}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {node.description}
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-500">
                  <span className="font-medium ml-2">📅</span>
                  {node.date_hijri}
                </div>
                <div className="flex items-center text-gray-500">
                  <span className="font-medium ml-2">📍</span>
                  {node.location}
                </div>
                {node.modern_applications.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <span className="text-xs font-medium text-emerald-700">
                      💡 تطبيقات معاصرة
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedNode && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedNode(null)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-emerald-800 text-white p-6 rounded-t-lg">
              <div className="flex justify-between items-start">
                <h2 className="text-3xl font-bold flex-1">{selectedNode.title}</h2>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-white hover:text-emerald-200 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="mt-2 flex gap-2">
                <span className="bg-emerald-700 px-3 py-1 rounded-full text-sm">
                  {selectedNode.type}
                </span>
                <span className="bg-emerald-700 px-3 py-1 rounded-full text-sm">
                  {selectedNode.phase}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">الوصف</h3>
                <p className="text-gray-700">{selectedNode.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-1">التاريخ الهجري</h3>
                  <p className="text-gray-700">{selectedNode.date_hijri}</p>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-1">التاريخ الميلادي</h3>
                  <p className="text-gray-700">{selectedNode.date_gregorian}</p>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-1">الموقع</h3>
                  <p className="text-gray-700">{selectedNode.location}</p>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-1">الفئة</h3>
                  <p className="text-gray-700">{selectedNode.category}</p>
                </div>
              </div>

              {selectedNode.participants.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">المشاركون</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedNode.participants.map((p, i) => (
                      <span key={i} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedNode.decision && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">القرار</h3>
                  <p className="text-gray-700">{selectedNode.decision}</p>
                </div>
              )}

              {selectedNode.outcomes.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">النتائج</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedNode.outcomes.map((o, i) => (
                      <li key={i} className="text-gray-700">{o}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedNode.moral_lessons.length > 0 && (
                <div className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-amber-900 mb-2">الدروس المستفادة</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedNode.moral_lessons.map((l, i) => (
                      <li key={i} className="text-amber-800">{l}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedNode.modern_applications.length > 0 && (
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-emerald-900 mb-2">💡 التطبيقات المعاصرة</h3>
                  <ul className="list-disc list-inside space-y-2">
                    {selectedNode.modern_applications.map((app, i) => (
                      <li key={i} className="text-emerald-800">{app}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedNode.security_impact && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-red-900 mb-2">🔒 الأثر الأمني</h3>
                  <p className="text-red-800">{selectedNode.security_impact}</p>
                </div>
              )}

              {selectedNode.sources.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">المصادر</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedNode.sources.map((s, i) => (
                      <li key={i} className="text-gray-700 text-sm">{s}</li>
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
