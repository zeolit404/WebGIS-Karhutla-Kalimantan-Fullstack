'use client';

import { useEffect, useRef, memo } from 'react';

function MapViewComponent({ hotspots = [], onMarkerClick, mapRefExternal, boundaryOpacity = 0.6 }) {
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersLayerRef = useRef(null);
  const canvasRendererRef = useRef(null);
  const wmsLayerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;
      const L = (await import('leaflet')).default;

      if (!leafletMapRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [-0.5, 114.5],
          zoom: 6,
          zoomControl: false,
          minZoom: 4,
          maxZoom: 18,
          preferCanvas: true, // Optimasi GPU Canvas Renderer
        });

        L.control.zoom({ position: 'topright' }).addTo(map);

        // Basemaps
        const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        });

        const esriSat = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          {
            maxZoom: 18,
            attribution: 'Tiles &copy; Esri',
          }
        );

        esriSat.addTo(map);

        // Pilar 1: Tile Caching WMS GeoServer (GWC) dengan SLD Symbology Tematik Transparan
        const wmsBatasProv = L.tileLayer.wms('/geoserver/praktikum/wms', {
          layers: 'praktikum:batas_provinsi_kalimantan',
          styles: 'batas_provinsi_kalimantan_style',
          format: 'image/png',
          transparent: true,
          version: '1.1.1',
          tiled: true,
          opacity: boundaryOpacity,
          attribution: 'GeoServer WMS GWC (Symbology Tematik)',
        });
        wmsBatasProv.addTo(map);
        wmsLayerRef.current = wmsBatasProv;

        // High-Performance Canvas Renderer
        const canvasRenderer = L.canvas({ padding: 0.5 });
        canvasRendererRef.current = canvasRenderer;

        // Layer Group for Canvas Markers
        const markersGroup = L.layerGroup().addTo(map);
        markersLayerRef.current = markersGroup;

        // Layer Control
        L.control
          .layers(
            { 'Esri Satellite': esriSat, OpenStreetMap: osm },
            { 'Batas Provinsi (GeoServer WMS GWC)': wmsBatasProv, 'Hotspot Karhutla (Canvas)': markersGroup },
            { position: 'topright', collapsed: true }
          )
          .addTo(map);

        // Scale bar
        L.control.scale({ position: 'bottomleft', metric: true, imperial: false }).addTo(map);

        leafletMapRef.current = map;
        if (mapRefExternal) {
          mapRefExternal.current = map;
        }
      }
    }

    initMap();

    return () => {
      isMounted = false;
    };
  }, []);

  // Sinkronisasi Slider Opacity Lapisan Batas Wilayah
  useEffect(() => {
    if (wmsLayerRef.current) {
      wmsLayerRef.current.setOpacity(boundaryOpacity);
    }
  }, [boundaryOpacity]);

  // Update Hotspot Markers via Canvas Renderer (0 DOM Overhead)
  useEffect(() => {
    async function updateMarkers() {
      if (!leafletMapRef.current || !markersLayerRef.current) return;
      const L = (await import('leaflet')).default;

      markersLayerRef.current.clearLayers();

      const renderer = canvasRendererRef.current || L.canvas({ padding: 0.5 });

      hotspots.forEach((item) => {
        if (!item.latitude || !item.longitude) return;

        const frp = parseFloat(item.frpMw) || 50;
        const isGambut = item.isGambut;
        const radius = frp > 150 ? 9 : frp > 80 ? 6.5 : 4.5;
        const color = isGambut ? '#dc2626' : frp > 100 ? '#ea580c' : '#f59e0b';

        // L.circleMarker with Canvas Renderer: Blazing fast 60fps pan/zoom
        const marker = L.circleMarker([item.latitude, item.longitude], {
          renderer: renderer,
          radius: radius,
          fillColor: color,
          fillOpacity: 0.85,
          color: '#ffffff',
          weight: 1.5,
        });

        const statusBadge =
          item.statusPenanganan === 'Padam'
            ? '<span style="background:#dcfce7; color:#15803d; padding:2px 7px; border-radius:12px; font-weight:700;">Padam</span>'
            : item.statusPenanganan === 'Dalam Pemadaman'
            ? '<span style="background:#fee2e2; color:#b91c1c; padding:2px 7px; border-radius:12px; font-weight:700;">Dalam Pemadaman</span>'
            : '<span style="background:#fef3c7; color:#b45309; padding:2px 7px; border-radius:12px; font-weight:700;">Pendinginan</span>';

        const popupHtml = `
          <div style="font-family:'Poppins',sans-serif; min-width:270px; font-size:12px;">
            <div style="background:#0f172a; color:#fff; padding:8px 10px; border-radius:6px 6px 0 0; margin:-14px -20px 8px -20px;">
              <div style="font-size:10px; color:#38bdf8; font-weight:700; text-transform:uppercase;">${item.idKejadian}</div>
              <div style="font-size:13px; font-weight:700;">${item.kecamatan}, ${item.kabupaten}</div>
            </div>
            <table style="width:100%; border-collapse:collapse; margin-top:6px; font-size:11.5px;">
              <tr><td style="color:#64748b; padding:2px 0;">Provinsi:</td><td><b>${item.provinsi}</b></td></tr>
              <tr><td style="color:#64748b; padding:2px 0;">Waktu:</td><td><b>${item.tglKejadian} &bull; ${item.jamKejadian || ''}</b></td></tr>
              <tr><td style="color:#64748b; padding:2px 0;">Luas Terdampak:</td><td><b style="color:#dc2626; font-size:13px;">${item.luasTerdampakHa} Ha</b></td></tr>
              <tr><td style="color:#64748b; padding:2px 0;">Radiasi (FRP):</td><td><b>${item.frpMw} MW</b> (${item.confidence} Conf)</td></tr>
              <tr><td style="color:#64748b; padding:2px 0;">Ekosistem:</td><td><span style="background:${item.isGambut ? '#ffedd5' : '#f1f5f9'}; color:${item.isGambut ? '#c2410c' : '#334155'}; padding:1px 6px; border-radius:4px; font-weight:600;">${item.tipeLahan}</span></td></tr>
              <tr><td style="color:#64748b; padding:2px 0;">Satelit:</td><td>${item.satelit}</td></tr>
              <tr><td style="color:#64748b; padding:4px 0 0 0;">Status Regu:</td><td style="padding-top:4px;">${statusBadge}</td></tr>
            </table>
          </div>
        `;

        marker.bindPopup(popupHtml);
        markersLayerRef.current.addLayer(marker);
      });
    }

    updateMarkers();
  }, [hotspots]);

  return <div ref={mapContainerRef} className="w-full h-full min-h-screen" />;
}

export default memo(MapViewComponent);
