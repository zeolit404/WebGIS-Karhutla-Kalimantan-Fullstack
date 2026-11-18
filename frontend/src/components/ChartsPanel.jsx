'use client';

import { memo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function ChartsPanelComponent({ statsProvinsi = [], statsBulan = [], summary }) {
  // 1. Data Bar Chart
  const barLabels = statsProvinsi.map((p) => p.provinsi.replace('Kalimantan ', 'Kal-'));
  const barData = {
    labels: barLabels,
    datasets: [
      {
        label: 'Luas Terbakar (Ha)',
        data: statsProvinsi.map((p) => Math.round(p.totalLuasHa)),
        backgroundColor: '#dc2626',
        borderRadius: 4,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { font: { size: 9, family: 'Poppins' } }, grid: { display: false } },
      y: { ticks: { font: { size: 9, family: 'Poppins' } }, grid: { color: '#f1f5f9' } },
    },
  };

  // 2. Data Line Chart
  const lineData = {
    labels: statsBulan.map((b) => b.namaBulan),
    datasets: [
      {
        label: 'Jumlah Hotspot',
        data: statsBulan.map((b) => b.totalHotspot),
        borderColor: '#ea580c',
        backgroundColor: 'rgba(234, 88, 12, 0.12)',
        fill: true,
        tension: 0.35,
        pointRadius: 2.5,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { font: { size: 9, family: 'Poppins' } }, grid: { display: false } },
      y: { ticks: { font: { size: 9, family: 'Poppins' } }, grid: { color: '#f1f5f9' } },
    },
  };

  // 3. Data Doughnut Chart
  const gambut = summary?.totalGambut || 0;
  const mineral = summary?.totalMineral || 0;
  const doughnutData = {
    labels: ['Gambut KHG', 'Non-Gambut'],
    datasets: [
      {
        data: [gambut, mineral],
        backgroundColor: ['#dc2626', '#059669'],
        borderWidth: 1,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 10, font: { size: 9.5, family: 'Poppins' } },
      },
    },
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Chart 1: Bar */}
      <div className="p-3 rounded-xl bg-white/90 border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-800">Luas Terbakar per Provinsi</span>
          <span className="text-[10px] text-slate-400 font-medium">(Ha)</span>
        </div>
        <div className="h-28 w-full">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>

      {/* Chart 2: Line */}
      <div className="p-3 rounded-xl bg-white/90 border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-800">Tren Kejadian Bulanan</span>
          <span className="text-[10px] text-slate-400 font-medium">(Titik Hotspot)</span>
        </div>
        <div className="h-24 w-full">
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>

      {/* Chart 3: Doughnut */}
      <div className="p-3 rounded-xl bg-white/90 border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-800">Proporsi Ekosistem Lahan</span>
        </div>
        <div className="h-28 w-full">
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </div>
    </div>
  );
}

export default memo(ChartsPanelComponent);
