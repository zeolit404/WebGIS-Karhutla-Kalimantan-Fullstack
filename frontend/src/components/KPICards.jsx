'use client';

import { Flame, Trees, Zap, MapPin } from 'lucide-react';

export default function KPICards({ summary }) {
  const kpiData = [
    {
      label: 'Total Hotspot',
      value: summary ? `${summary.totalHotspot} Titik` : '...',
      subtext: 'GraphQL Live Query',
      icon: Flame,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      label: 'Luas Terdampak',
      value: summary ? `${Math.round(summary.totalLuasHa).toLocaleString('id-ID')} Ha` : '...',
      subtext: 'Area Terbakar',
      icon: Zap,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Rata FRP',
      value: summary ? `${summary.rataFrpMw} MW` : '...',
      subtext: 'Intensitas Termal',
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Lahan Gambut',
      value: summary ? `${summary.totalGambut} Titik` : '...',
      subtext: 'Restorasi KHG',
      icon: Trees,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {kpiData.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="p-2.5 rounded-xl bg-white/90 border border-slate-200/90 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Icon className={`w-3.5 h-3.5 ${item.color}`} />
              <span>{item.label}</span>
            </div>
            <div className="text-sm font-bold text-slate-800 mt-1">{item.value}</div>
            <div className="text-[10px] text-slate-400">{item.subtext}</div>
          </div>
        );
      })}
    </div>
  );
}
