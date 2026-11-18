/* ==============================================================================
   WEBGIS KARHUTLA KALIMANTAN - LOGIKA OGC WMS/WFS, DASHBOARD KPI & FILTER TEMPORAL
   Mengintegrasikan 4 Pilar Praktikum:
   1. GeoWebCache (WMS Caching tiled=true)
   2. Efisiensi WFS (Pagination, BBOX, propertyName)
   3. Single Source of Truth + Chart.js (Bar, Line, Doughnut) + 3 Kartu KPI
   4. Server-Side CQL_FILTER + Interaksi Terhubung + Polling 60s
   ============================================================================== */

const NAMA_BULAN_ID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

// State Utama Aplikasi (Single Source of Truth)
const KarhutlaState = {
  rawFeatures: [],
  filteredFeatures: [],
  selectedProv: 'semua',
  filterTahun: 'semua',
  filterBulan: 'semua',
  filterStatus: 'semua',
  countdown: 60,
  timerInterval: null,
  charts: {
    barProv: null,
    lineTrend: null,
    doughnutGambut: null
  }
};

// Layer Titik Kejadian Karhutla
let karhutlaLayerGroup = L.layerGroup();

// Icon Pin Api Dinamis berdasarkan FRP (Fire Radiative Power)
function createFireIcon(frp, isGambut) {
  const size = frp > 150 ? 32 : (frp > 80 ? 26 : 20);
  const color = isGambut ? '#d90429' : (frp > 100 ? '#f72585' : '#f59e0b');
  const pulseClass = frp > 120 ? 'fire-pulse' : '';
  
  return L.divIcon({
    className: 'custom-fire-marker',
    html: `
      <div class="fire-marker-wrapper ${pulseClass}" style="width:${size}px; height:${size}px; background:${color}; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 10px ${color}; border:2px solid #ffffff;">
        <i class="fas fa-fire" style="color:#ffffff; font-size:${size * 0.5}px;"></i>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
}

// 1. Memuat Data Titik Karhutla via WFS (Pillar 2 & 4)
async function muatDataKarhutlaWFS() {
  const statusEl = document.getElementById('syncStatusText');
  if (statusEl) statusEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memuat data WFS...';

  try {
    const baseUrl = window.location.origin.includes('3000') ? '/geoserver' : 'http://localhost:8080/geoserver';
    const u = new URL(`${baseUrl}/praktikum/ows`);
    const p = u.searchParams;

    p.set('service', 'WFS');
    p.set('version', '2.0.0');
    p.set('request', 'GetFeature');
    p.set('typeNames', 'praktikum:kejadian_karhutla_kalimantan');
    p.set('outputFormat', 'application/json');
    p.set('srsName', 'EPSG:4326');
    
    // Pilar 2: Hanya ambil kolom yang dibutuhkan tanpa redundansi
    p.set('propertyName', 'id,id_kejadian,kode_prov,provinsi,kabupaten,kecamatan,tgl_kejadian,jam_kejadian,tahun,bulan,luas_terdampak_ha,frp_mw,confidence,satelit,tipe_lahan,is_gambut,status_penanganan,geom');

    // Pilar 4: Bangun CQL_FILTER jika ada filter aktif
    const cqlParts = [];
    if (KarhutlaState.filterTahun !== 'semua') {
      cqlParts.push(`tahun = ${KarhutlaState.filterTahun}`);
    }
    if (KarhutlaState.filterBulan !== 'semua') {
      cqlParts.push(`bulan = ${KarhutlaState.filterBulan}`);
    }
    if (KarhutlaState.filterStatus !== 'semua') {
      cqlParts.push(`status_penanganan = '${KarhutlaState.filterStatus}'`);
    }

    if (cqlParts.length > 0) {
      p.set('CQL_FILTER', cqlParts.join(' AND '));
    }

    const t0 = performance.now();
    const res = await fetch(u.toString());
    const geojson = await res.json();
    const duration = Math.round(performance.now() - t0);

    KarhutlaState.rawFeatures = (geojson.features || []).map(f => ({
      ...f.properties,
      geometry: f.geometry,
      coordinates: f.geometry.coordinates
    }));

    // Terapkan filter wilayah klien jika ada provinsi terpilih
    filterDanRender();

    if (statusEl) {
      statusEl.innerHTML = `<i class="fas fa-check-circle" style="color:#10b981;"></i> WFS Sync: ${KarhutlaState.rawFeatures.length} titik (${duration} ms)`;
    }

    // Reset countdown polling
    KarhutlaState.countdown = 60;
  } catch(err) {
    console.error('Gagal memuat WFS Karhutla:', err);
    if (statusEl) statusEl.innerHTML = `<i class="fas fa-exclamation-triangle" style="color:#ef4444;"></i> Gagal sinkron WFS`;
  }
}

// 2. Filter Klien & Render Dashboard Terpadu (Pillar 3 & 4)
function filterDanRender() {
  let list = KarhutlaState.rawFeatures;

  // Filter klik wilayah (interaksi peta klien)
  if (KarhutlaState.selectedProv !== 'semua') {
    list = list.filter(item => item.provinsi.toLowerCase() === KarhutlaState.selectedProv.toLowerCase() || item.kode_prov === KarhutlaState.selectedProv);
  }

  KarhutlaState.filteredFeatures = list;

  // Update elemen UI
  renderMarkers(list);
  renderKPI(list);
  renderCharts(list);
}

// Render Titik di Peta Leaflet
function renderMarkers(items) {
  karhutlaLayerGroup.clearLayers();

  items.forEach(item => {
    const lat = item.coordinates[1];
    const lon = item.coordinates[0];

    const icon = createFireIcon(item.frp_mw || 50, item.is_gambut);
    const marker = L.marker([lat, lon], { icon: icon });

    const statusBadge = item.status_penanganan === 'Padam' 
      ? '<span style="background:#dcfce7; color:#15803d; padding:2px 7px; border-radius:12px; font-weight:700;">Padam</span>'
      : (item.status_penanganan === 'Dalam Pemadaman'
        ? '<span style="background:#fee2e2; color:#b91c1c; padding:2px 7px; border-radius:12px; font-weight:700;">Dalam Pemadaman</span>'
        : '<span style="background:#fef3c7; color:#b45309; padding:2px 7px; border-radius:12px; font-weight:700;">Pendinginan</span>');

    const rawTgl = item.tgl_kejadian ? item.tgl_kejadian.replace('Z','').split('T')[0] : '-';
    let rawJam = item.jam_kejadian ? (item.jam_kejadian.includes('T') ? item.jam_kejadian.split('T')[1].replace('Z','').substring(0,5) : item.jam_kejadian.substring(0,5)) : '';
    if (rawJam) rawJam += ' UTC';

    const popupHtml = `
      <div style="font-family:'Poppins',sans-serif; min-width:270px; font-size:12px;">
        <div style="background:#0f172a; color:#fff; padding:8px 10px; border-radius:6px 6px 0 0; margin:-14px -20px 8px -20px;">
          <div style="font-size:11px; color:#38bdf8; font-weight:700; text-transform:uppercase;">${item.id_kejadian || 'KEJADIAN KARHUTLA'}</div>
          <div style="font-size:13px; font-weight:700;">${item.kecamatan}, ${item.kabupaten}</div>
        </div>
        <table style="width:100%; border-collapse:collapse; margin-bottom:8px;">
          <tr><td style="color:#64748b; padding:2px 0;">Provinsi:</td><td><b>${item.provinsi}</b></td></tr>
          <tr><td style="color:#64748b; padding:2px 0;">Waktu Kejadian:</td><td><b>${rawTgl} &bull; ${rawJam}</b></td></tr>
          <tr><td style="color:#64748b; padding:2px 0;">Luas Terbakar:</td><td><b style="color:#e63946; font-size:13px;">${item.luas_terdampak_ha ? item.luas_terdampak_ha.toLocaleString('id-ID') + ' Ha' : '-'}</b></td></tr>
          <tr><td style="color:#64748b; padding:2px 0;">Intensitas (FRP):</td><td><b>${item.frp_mw || 0} MW</b> (${item.confidence} Conf)</td></tr>
          <tr><td style="color:#64748b; padding:2px 0;">Tipe Ekosistem:</td><td><span style="background:${item.is_gambut ? '#ffedd5' : '#f1f5f9'}; color:${item.is_gambut ? '#c2410c' : '#334155'}; padding:1px 6px; border-radius:3px; font-weight:600;">${item.tipe_lahan}</span></td></tr>
          <tr><td style="color:#64748b; padding:2px 0;">Satelit Sensor:</td><td>${item.satelit}</td></tr>
          <tr><td style="color:#64748b; padding:4px 0 0 0;">Status Regu:</td><td style="padding-top:4px;">${statusBadge}</td></tr>
        </table>
      </div>
    `;

    marker.bindPopup(popupHtml);
    karhutlaLayerGroup.addLayer(marker);
  });
}

// 3. Render 3 Kartu KPI
function renderKPI(items) {
  const totalHotspotEl = document.getElementById('kpiTotalHotspot');
  const totalLuasEl = document.getElementById('kpiTotalLuas');
  const rataFrpEl = document.getElementById('kpiRataFrp');

  if (!totalHotspotEl) return;

  const totalTitik = items.length;
  const totalLuas = items.reduce((acc, curr) => acc + (parseFloat(curr.luas_terdampak_ha) || 0), 0);
  const rataFrp = totalTitik > 0 
    ? (items.reduce((acc, curr) => acc + (parseFloat(curr.frp_mw) || 0), 0) / totalTitik).toFixed(1)
    : 0;

  totalHotspotEl.textContent = `${totalTitik} Titik`;
  totalLuasEl.textContent = `${Math.round(totalLuas).toLocaleString('id-ID')} Ha`;
  rataFrpEl.textContent = `${rataFrp} MW`;
}

// 4. Inisialisasi & Render 3 Grafik Chart.js
function initCharts() {
  const ctxBar = document.getElementById('chartBarProv');
  const ctxLine = document.getElementById('chartLineTrend');
  const ctxPie = document.getElementById('chartDoughnutGambut');

  if (ctxBar) {
    KarhutlaState.charts.barProv = new Chart(ctxBar, {
      type: 'bar',
      data: { labels: [], datasets: [{ label: 'Luas Terbakar (Ha)', data: [], backgroundColor: '#e63946', borderRadius: 4 }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { font: { size: 9, family: 'Poppins' } }, grid: { display: false } },
          y: { ticks: { font: { size: 9, family: 'Poppins' } }, grid: { color: '#f1f5f9' } }
        }
      }
    });
  }

  if (ctxLine) {
    KarhutlaState.charts.lineTrend = new Chart(ctxLine, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Jumlah Titik',
          data: [],
          borderColor: '#f4a261',
          backgroundColor: 'rgba(244,162,97,0.15)',
          fill: true,
          tension: 0.35,
          pointRadius: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { font: { size: 9, family: 'Poppins' } }, grid: { display: false } },
          y: { ticks: { font: { size: 9, family: 'Poppins' } }, grid: { color: '#f1f5f9' } }
        }
      }
    });
  }

  if (ctxPie) {
    KarhutlaState.charts.doughnutGambut = new Chart(ctxPie, {
      type: 'doughnut',
      data: {
        labels: ['Lahan Gambut (KHG)', 'Non-Gambut / Mineral'],
        datasets: [{
          data: [0, 0],
          backgroundColor: ['#d90429', '#2a9d8f']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 9.5, family: 'Poppins' } } }
        }
      }
    });
  }
}

function renderCharts(items) {
  if (!KarhutlaState.charts.barProv) return;

  // 1. Bar Chart: Luas Terbakar per Provinsi
  const provMap = new Map();
  items.forEach(it => {
    const p = it.provinsi.replace('Kalimantan ', 'Kal-');
    const cur = provMap.get(p) || 0;
    provMap.set(p, cur + (parseFloat(it.luas_terdampak_ha) || 0));
  });

  const sortedProv = [...provMap.keys()].sort();
  KarhutlaState.charts.barProv.data.labels = sortedProv;
  KarhutlaState.charts.barProv.data.datasets[0].data = sortedProv.map(k => Math.round(provMap.get(k)));
  KarhutlaState.charts.barProv.update();

  // 2. Line Chart: Tren per Bulan
  const monthMap = new Map();
  for (let m = 1; m <= 12; m++) monthMap.set(m, 0);
  items.forEach(it => {
    const b = it.bulan || 1;
    monthMap.set(b, (monthMap.get(b) || 0) + 1);
  });

  const monthLabels = [...monthMap.keys()].map(m => NAMA_BULAN_ID[m - 1].substring(0, 3));
  KarhutlaState.charts.lineTrend.data.labels = monthLabels;
  KarhutlaState.charts.lineTrend.data.datasets[0].data = [...monthMap.values()];
  KarhutlaState.charts.lineTrend.update();

  // 3. Doughnut Chart: Gambut vs Non-Gambut
  let gambutCount = 0;
  let nonGambutCount = 0;
  items.forEach(it => {
    if (it.is_gambut) gambutCount++;
    else nonGambutCount++;
  });

  KarhutlaState.charts.doughnutGambut.data.datasets[0].data = [gambutCount, nonGambutCount];
  KarhutlaState.charts.doughnutGambut.update();
}

// 5. Kontrol Filter Temporal (Pillar 4)
function setFilterTahun(thn) {
  KarhutlaState.filterTahun = thn;
  muatDataKarhutlaWFS();
}

function setFilterBulan(bln) {
  KarhutlaState.filterBulan = bln;
  muatDataKarhutlaWFS();
}

function setFilterStatus(st) {
  KarhutlaState.filterStatus = st;
  muatDataKarhutlaWFS();
}

function resetAllFilter() {
  KarhutlaState.filterTahun = 'semua';
  KarhutlaState.filterBulan = 'semua';
  KarhutlaState.filterStatus = 'semua';
  KarhutlaState.selectedProv = 'semua';

  const fThn = document.getElementById('filterTahunSelect');
  const fBln = document.getElementById('filterBulanSelect');
  const fSts = document.getElementById('filterStatusSelect');
  if (fThn) fThn.value = 'semua';
  if (fBln) fBln.value = 'semua';
  if (fSts) fSts.value = 'semua';

  muatDataKarhutlaWFS();
}

// 6. Polling Timer 60 Detik (Pillar 4)
function startPollingTimer() {
  if (KarhutlaState.timerInterval) clearInterval(KarhutlaState.timerInterval);

  KarhutlaState.timerInterval = setInterval(() => {
    KarhutlaState.countdown--;
    const el = document.getElementById('timerText');
    if (el) el.textContent = `${KarhutlaState.countdown}s`;

    if (KarhutlaState.countdown <= 0) {
      KarhutlaState.countdown = 60;
      console.log('Auto-refreshing Karhutla data via WFS...');
      muatDataKarhutlaWFS();
    }
  }, 1000);
}

// Inisialisasi saat peta siap
window.addEventListener('DOMContentLoaded', () => {
  if (typeof map !== 'undefined') {
    karhutlaLayerGroup.addTo(map);

    // Tambahkan layer ke layer control jika tersedia
    if (typeof overlayMaps !== 'undefined' && typeof layerControl !== 'undefined') {
      overlayMaps["<span style='font-weight:700; color:#e63946;'><i class='fas fa-fire-alt'></i> Titik Karhutla & Dampak (WFS)</span>"] = karhutlaLayerGroup;
      map.removeControl(layerControl);
      layerControl = L.control.layers(baseMaps, overlayMaps, { position: 'topright', collapsed: true }).addTo(map);
    }
  }

  initCharts();
  muatDataKarhutlaWFS();
  startPollingTimer();
});
