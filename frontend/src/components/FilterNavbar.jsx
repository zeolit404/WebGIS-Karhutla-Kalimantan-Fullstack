'use client';

import { useState, useEffect } from 'react';
import { Flame, Calendar, RotateCcw, Home, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function FilterNavbar({
  filters,
  onFilterChange,
  onResetFilters,
  onResetView,
  onRefresh,
  hotspotCount,
  loading,
}) {
  const [countdown, setCountdown] = useState(60);

  // Timer lokal terisolasi: Tidak memicu re-render pada seluruh halaman / chart
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (onRefresh) onRefresh();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onRefresh]);

  return (
    <nav className="absolute top-3 left-4 right-4 z-[1000] glass-panel rounded-2xl p-2.5 px-4 shadow-xl flex items-center justify-between gap-3 max-w-[calc(100vw-32px)]">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 text-white flex items-center justify-center shadow-md shadow-red-500/20">
          <Flame className="w-5 h-5" />
        </div>
        <div className="hidden sm:block">
          <h1 className="text-sm font-bold text-slate-800 leading-tight">WebGIS Karhutla Kalimantan</h1>
          <p className="text-[11px] text-slate-500">Next.js & Django GraphQL (Ultra-Fast 60 FPS)</p>
        </div>
      </div>

      {/* Filter Controls Group */}
      <div className="flex items-center gap-2 bg-slate-100/90 p-1.5 rounded-xl border border-slate-200">
        {/* Filter Tahun */}
        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 text-xs">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filters.tahun}
            onChange={(e) => onFilterChange('tahun', e.target.value)}
            className="bg-transparent font-medium text-slate-700 outline-none cursor-pointer"
          >
            <option value="semua">Semua Tahun</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>

        {/* Filter Bulan */}
        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 text-xs">
          <select
            value={filters.bulan}
            onChange={(e) => onFilterChange('bulan', e.target.value)}
            className="bg-transparent font-medium text-slate-700 outline-none cursor-pointer"
          >
            <option value="semua">Semua Bulan</option>
            <option value="1">Januari</option>
            <option value="2">Februari</option>
            <option value="3">Maret</option>
            <option value="4">April</option>
            <option value="5">Mei</option>
            <option value="6">Juni</option>
            <option value="7">Juli (Kemarau)</option>
            <option value="8">Agustus (Puncak)</option>
            <option value="9">September (El-Nino)</option>
            <option value="10">Oktober (El-Nino)</option>
            <option value="11">November</option>
            <option value="12">Desember</option>
          </select>
        </div>

        {/* Filter Status */}
        <div className="hidden md:flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 text-xs">
          <select
            value={filters.statusPenanganan}
            onChange={(e) => onFilterChange('statusPenanganan', e.target.value)}
            className="bg-transparent font-medium text-slate-700 outline-none cursor-pointer"
          >
            <option value="semua">Semua Status</option>
            <option value="Dalam Pemadaman">Dalam Pemadaman</option>
            <option value="Pendinginan">Pendinginan</option>
            <option value="Padam">Padam</option>
          </select>
        </div>

        {/* Reset Button */}
        <button
          onClick={onResetFilters}
          className="flex items-center gap-1 px-2 py-1 bg-slate-200/80 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-all"
          title="Reset Semua Filter"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Reset</span>
        </button>
      </div>

      {/* Quick Status & Timer */}
      <div className="flex items-center gap-2">
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>GraphQL: {hotspotCount} Titik</span>
        </div>

        <button
          onClick={() => {
            setCountdown(60);
            if (onRefresh) onRefresh();
          }}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-all cursor-pointer"
          title="Klik untuk refresh manual sekarang"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{countdown}s</span>
        </button>

        <button
          onClick={onResetView}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700 shadow-sm transition-all"
        >
          <Home className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Home</span>
        </button>
      </div>
    </nav>
  );
}
