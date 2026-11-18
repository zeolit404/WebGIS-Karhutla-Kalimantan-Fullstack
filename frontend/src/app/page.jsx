'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import FilterNavbar from '../components/FilterNavbar';
import Sidebar from '../components/Sidebar';
import { fetchGraphQL, QUERY_FULL_DASHBOARD } from '../lib/graphqlClient';

// Dynamically import MapView to disable SSR for Leaflet
const MapView = dynamic(() => import('../components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-slate-900 flex items-center justify-center text-white text-sm font-medium">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <span>Memuat Peta Spasial Kalimantan...</span>
      </div>
    </div>
  ),
});

export default function Home() {
  const [filters, setFilters] = useState({
    tahun: 'semua',
    bulan: 'semua',
    statusPenanganan: 'semua',
    provinsi: 'semua',
  });

  const [dashboardData, setDashboardData] = useState({
    summary: null,
    statsProvinsi: [],
    statsBulan: [],
    hotspots: [],
  });

  const [loading, setLoading] = useState(false);
  const [boundaryOpacity, setBoundaryOpacity] = useState(0.55);
  const mapRef = useRef(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const vars = {};
      if (filters.tahun !== 'semua') vars.tahun = parseInt(filters.tahun, 10);
      if (filters.bulan !== 'semua') vars.bulan = parseInt(filters.bulan, 10);
      if (filters.statusPenanganan !== 'semua') vars.statusPenanganan = filters.statusPenanganan;
      if (filters.provinsi !== 'semua') vars.provinsi = filters.provinsi;

      const data = await fetchGraphQL(QUERY_FULL_DASHBOARD, vars);
      if (data) {
        setDashboardData({
          summary: data.kpiSummary,
          statsProvinsi: data.statsPerProvinsi || [],
          statsBulan: data.statsPerBulan || [],
          hotspots: data.allHotspots || [],
        });
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      tahun: 'semua',
      bulan: 'semua',
      statusPenanganan: 'semua',
      provinsi: 'semua',
    });
  };

  const handleZoomToRegion = (reg) => {
    if (mapRef.current) {
      mapRef.current.flyTo([reg.lat, reg.lng], reg.zoom, { duration: 1.2 });
    }
    if (reg.id !== 'gambut') {
      const provFullNameMap = {
        kalteng: 'Kalimantan Tengah',
        kaltim: 'Kalimantan Timur',
        kalbar: 'Kalimantan Barat',
        kalsel: 'Kalimantan Selatan',
        kaltara: 'Kalimantan Utara',
      };
      setFilters((prev) => ({ ...prev, provinsi: provFullNameMap[reg.id] || 'semua' }));
    }
  };

  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.flyTo([-0.5, 114.5], 6, { duration: 1.2 });
    }
    handleResetFilters();
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-900">
      {/* 1. Header Filter Navbar */}
      <FilterNavbar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        onResetView={handleResetView}
        onRefresh={loadData}
        hotspotCount={dashboardData.hotspots.length}
        loading={loading}
      />

      {/* 2. Left Statistics & Analytics Sidebar */}
      <Sidebar
        summary={dashboardData.summary}
        statsProvinsi={dashboardData.statsProvinsi}
        statsBulan={dashboardData.statsBulan}
        onZoomToRegion={handleZoomToRegion}
        boundaryOpacity={boundaryOpacity}
        onOpacityChange={setBoundaryOpacity}
      />

      {/* 3. Interactive Leaflet Map */}
      <div className="absolute inset-0 z-0">
        <MapView
          hotspots={dashboardData.hotspots}
          mapRefExternal={mapRef}
          boundaryOpacity={boundaryOpacity}
        />
      </div>
    </main>
  );
}
