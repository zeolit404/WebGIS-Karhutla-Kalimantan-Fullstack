'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, BarChart3, MapPin, Sliders } from 'lucide-react';
import KPICards from './KPICards';
import ChartsPanel from './ChartsPanel';

export default function Sidebar({
  summary,
  statsProvinsi,
  statsBulan,
  onZoomToRegion,
  boundaryOpacity = 0.6,
  onOpacityChange,
}) {
  const [collapsed, setCollapsed] = useState(false);

  const regions = [
    { label: 'Kalteng', id: 'kalteng', lat: -1.5, lng: 113.8, zoom: 7 },
    { label: 'Kaltim', id: 'kaltim', lat: -0.4, lng: 116.8, zoom: 7 },
    { label: 'Kalbar', id: 'kalbar', lat: 0.1, lng: 110.8, zoom: 7 },
    { label: 'Kalsel', id: 'kalsel', lat: -2.9, lng: 115.3, zoom: 8 },
    { label: 'Kaltara', id: 'kaltara', lat: 3.0, lng: 116.2, zoom: 7 },
    { label: 'KHG Gambut', id: 'gambut', lat: -2.2, lng: 113.9, zoom: 8 },
  ];

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="absolute top-20 left-4 z-[999] w-11 h-11 rounded-2xl glass-panel shadow-xl flex items-center justify-center text-slate-700 hover:text-red-600 hover:scale-105 transition-all"
        title="Buka Panel Statistik"
      >
        <BarChart3 className="w-5 h-5" />
      </button>
    );
  }

  return (
    <aside className="absolute top-20 left-4 z-[999] w-80 max-h-[calc(100vh-100px)] glass-panel rounded-2xl shadow-xl flex flex-col overflow-hidden transition-all animate-fadeIn">
      {/* Header */}
      <div className="p-3.5 px-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800">Statistik Spasial</h3>
            <p className="text-[10px] text-slate-400">Kalimantan Monitoring Dashboard</p>
          </div>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="w-7 h-7 rounded-lg bg-slate-200/60 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all"
          title="Tutup Panel"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Body with Scroll */}
      <div className="p-3.5 flex flex-col gap-3.5 overflow-y-auto max-h-[calc(100vh-160px)]">
        {/* KPI Cards */}
        <KPICards summary={summary} />

        {/* Charts */}
        <ChartsPanel
          statsProvinsi={statsProvinsi}
          statsBulan={statsBulan}
          summary={summary}
        />

        {/* Layer Transparency & Symbology Control */}
        <div className="p-3 rounded-xl bg-white/90 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1.5">
            <div className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span>Transparansi Batas (Opacity)</span>
            </div>
            <span className="text-[11px] font-bold text-sky-600">
              {Math.round(boundaryOpacity * 100)}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={boundaryOpacity}
            onChange={(e) => onOpacityChange && onOpacityChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600 mb-3"
            title="Geser untuk mengatur tingkat transparansi layer batas wilayah"
          />

          {/* Symbology Legend */}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5 text-[11px]">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
              Symbology Status Karhutla (SLD)
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-red-500/35 border-2 border-red-600" />
              <span className="text-slate-700 font-medium">Prioritas Siaga I (Kalteng, Kaltim)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-orange-500/35 border-2 border-orange-600" />
              <span className="text-slate-700 font-medium">Siaga II Karhutla (Kalbar, Kalsel)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-yellow-500/30 border-2 border-yellow-600" />
              <span className="text-slate-700 font-medium">Waspada (Kaltara)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-slate-400/20 border border-dashed border-slate-500" />
              <span className="text-slate-500">Luar Wilayah Kajian</span>
            </div>
          </div>
        </div>

        {/* Quick Zoom */}
        <div className="p-3 rounded-xl bg-white/90 border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 mb-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>Fokus Wilayah (Zoom)</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {regions.map((reg) => (
              <button
                key={reg.id}
                onClick={() => onZoomToRegion(reg)}
                className="py-1 px-2 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 border border-slate-200/60 transition-all text-center truncate"
              >
                {reg.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
