# PRD: WebGIS Karhutla Kalimantan Fullstack Modern

## 1. Core Problem & User Journey
- **Masalah:** Menggantikan arsitektur monolitik statis vanilla HTML/JS dengan arsitektur decoupled fullstack modern berefisiensi tinggi.
- **User Journey:**
  1. Pengguna membuka antarmuka web modern (Next.js + Tailwind CSS).
  2. Data analitik hotspot, KPI agregasi, dan mutasi data diambil secara fleksibel via GraphQL endpoint (Django backend).
  3. Peta interaktif Leaflet memuat layer WMS berkinerja tinggi (Tile Cache GWC) dari GeoServer dan titik spasial via GraphQL/WFS.
  4. Pengguna memfilter data (tahun, bulan, status mitigasi, wilayah) secara reaktif tanpa reload halaman.

## 2. Scope Boundaries
- **In Scope:**
  - **Frontend:** Next.js (React), Tailwind CSS, Leaflet / React-Leaflet, Chart.js, Lucide Icons, Apollo Client / GraphQL Fetcher.
  - **Backend:** Python Django + Graphene-Django (GraphQL API) + PostgreSQL/PostGIS (`webgis_karhutla_kalimantan`).
  - **Map Engine:** GeoServer 3.0.1 (Java-based) untuk WMS Tile Caching GWC.
- **Out of Scope:**
  - Penggunaan vanilla HTML file:// statis lama.
  - Menulis ulang data spasial PostgreSQL (tetap menggunakan 280 data aktual NASA FIRMS & SiPongi yang telah terverifikasi).

## 3. Tech Stack & Dependensi Inti
| Lapisan | Teknologi | Peran Fungsional |
| :--- | :--- | :--- |
| **Frontend** | Next.js (React.js) + Tailwind CSS | UI responsif, reactive state, visualisasi peta & chart |
| **Backend API** | Python Django + Graphene-Django (GraphQL) | Resolusi query GraphQL, agregasi data, filter backend |
| **Database** | PostgreSQL 18 + PostGIS | Penyimpanan relasional spasial tabel `kejadian_karhutla_kalimantan` |
| **Map Server** | GeoServer 3.0.1 (Java Jetty) | WMS Tile Caching GWC untuk layer raster & poligon batas |

## 4. Rencana Struktur Proyek
```text
WebGIS_Fullstack/
├── backend/                  # Python Django + GraphQL API
│   ├── manage.py
│   ├── config/               # Settings, urls, schema GraphQL
│   └── karhutla_api/         # Model PostGIS, type GraphQL, resolver
├── frontend/                 # Next.js + React + Tailwind CSS
│   ├── package.json
│   ├── src/
│   │   ├── app/              # Next.js App Router (page.tsx/jsx)
│   │   ├── components/       # MapView, KPICards, FilterBar, Charts
│   │   └── lib/              # GraphQL Client & WMS Helpers
└── PRD.md                    # Dokumen kompas resmi
```
