export async function fetchGraphQL(query, variables = {}) {
  try {
    const res = await fetch('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });
    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}`);
    }
    const json = await res.json();
    if (json.errors) {
      console.error('GraphQL Errors:', json.errors);
      throw new Error(json.errors[0]?.message || 'GraphQL Query Error');
    }
    return json.data;
  } catch (err) {
    console.error('fetchGraphQL Failed:', err);
    throw err;
  }
}

export const QUERY_FULL_DASHBOARD = `
  query GetDashboardData(
    $tahun: Int,
    $bulan: Int,
    $statusPenanganan: String,
    $provinsi: String
  ) {
    kpiSummary(
      tahun: $tahun,
      bulan: $bulan,
      statusPenanganan: $statusPenanganan,
      provinsi: $provinsi
    ) {
      totalHotspot
      totalLuasHa
      rataFrpMw
      totalProvinsi
      totalGambut
      totalMineral
      totalPadam
      totalAktif
    }
    statsPerProvinsi(tahun: $tahun, bulan: $bulan) {
      provinsi
      kodeProv
      totalHotspot
      totalLuasHa
      rataFrpMw
    }
    statsPerBulan(tahun: $tahun, provinsi: $provinsi) {
      bulan
      namaBulan
      totalHotspot
      totalLuasHa
    }
    allHotspots(
      tahun: $tahun,
      bulan: $bulan,
      statusPenanganan: $statusPenanganan,
      provinsi: $provinsi
    ) {
      id
      idKejadian
      kodeProv
      provinsi
      kabupaten
      kecamatan
      tglKejadian
      jamKejadian
      tahun
      bulan
      luasTerdampakHa
      frpMw
      confidence
      confidencePct
      satelit
      tipeLahan
      isGambut
      statusPenanganan
      latitude
      longitude
    }
  }
`;
