import graphene
from graphene_django import DjangoObjectType
from django.db.models import Sum, Avg, Count, Q
from .models import KejadianKarhutla

class KejadianKarhutlaType(DjangoObjectType):
    latitude = graphene.Float()
    longitude = graphene.Float()

    class Meta:
        model = KejadianKarhutla
        fields = (
            'id', 'id_kejadian', 'kode_prov', 'provinsi', 'kabupaten', 'kecamatan',
            'tgl_kejadian', 'jam_kejadian', 'tahun', 'bulan', 'luas_terdampak_ha',
            'frp_mw', 'confidence', 'confidence_pct', 'satelit', 'tipe_lahan',
            'is_gambut', 'status_penanganan'
        )

    def resolve_latitude(self, info):
        return getattr(self, 'latitude', None)

    def resolve_longitude(self, info):
        return getattr(self, 'longitude', None)

class KPISummaryType(graphene.ObjectType):
    total_hotspot = graphene.Int()
    total_luas_ha = graphene.Float()
    rata_frp_mw = graphene.Float()
    total_provinsi = graphene.Int()
    total_gambut = graphene.Int()
    total_mineral = graphene.Int()
    total_padam = graphene.Int()
    total_aktif = graphene.Int()

class ProvinsiStatType(graphene.ObjectType):
    provinsi = graphene.String()
    kode_prov = graphene.String()
    total_hotspot = graphene.Int()
    total_luas_ha = graphene.Float()
    rata_frp_mw = graphene.Float()

class BulanStatType(graphene.ObjectType):
    bulan = graphene.Int()
    nama_bulan = graphene.String()
    total_hotspot = graphene.Int()
    total_luas_ha = graphene.Float()

class Query(graphene.ObjectType):
    all_hotspots = graphene.List(
        KejadianKarhutlaType,
        tahun=graphene.Int(),
        bulan=graphene.Int(),
        status_penanganan=graphene.String(),
        provinsi=graphene.String(),
        is_gambut=graphene.Boolean(),
        limit=graphene.Int()
    )
    kpi_summary = graphene.Field(
        KPISummaryType,
        tahun=graphene.Int(),
        bulan=graphene.Int(),
        status_penanganan=graphene.String(),
        provinsi=graphene.String()
    )
    stats_per_provinsi = graphene.List(
        ProvinsiStatType,
        tahun=graphene.Int(),
        bulan=graphene.Int()
    )
    stats_per_bulan = graphene.List(
        BulanStatType,
        tahun=graphene.Int(),
        provinsi=graphene.String()
    )

    def resolve_all_hotspots(self, info, tahun=None, bulan=None, status_penanganan=None, provinsi=None, is_gambut=None, limit=None):
        qs = KejadianKarhutla.objects.extra(
            select={'longitude': 'ST_X(geom)', 'latitude': 'ST_Y(geom)'}
        )
        if tahun:
            qs = qs.filter(tahun=tahun)
        if bulan:
            qs = qs.filter(bulan=bulan)
        if status_penanganan and status_penanganan != 'semua':
            qs = qs.filter(status_penanganan=status_penanganan)
        if provinsi and provinsi != 'semua':
            qs = qs.filter(provinsi__icontains=provinsi)
        if is_gambut is not None:
            qs = qs.filter(is_gambut=is_gambut)
        if limit:
            qs = qs[:limit]
        return qs

    def resolve_kpi_summary(self, info, tahun=None, bulan=None, status_penanganan=None, provinsi=None):
        qs = KejadianKarhutla.objects.all()
        if tahun:
            qs = qs.filter(tahun=tahun)
        if bulan:
            qs = qs.filter(bulan=bulan)
        if status_penanganan and status_penanganan != 'semua':
            qs = qs.filter(status_penanganan=status_penanganan)
        if provinsi and provinsi != 'semua':
            qs = qs.filter(provinsi__icontains=provinsi)

        # Satu query tunggal dengan conditional aggregation (PostgreSQL)
        agg = qs.aggregate(
            total_hotspot=Count('id'),
            total_luas=Sum('luas_terdampak_ha'),
            avg_frp=Avg('frp_mw'),
            total_gambut=Count('id', filter=Q(is_gambut=True)),
            total_padam=Count('id', filter=Q(status_penanganan='Padam')),
            total_prov=Count('provinsi', distinct=True)
        )
        total_hotspot = agg['total_hotspot'] or 0
        total_gambut = agg['total_gambut'] or 0
        total_padam = agg['total_padam'] or 0

        return KPISummaryType(
            total_hotspot=total_hotspot,
            total_luas_ha=round(float(agg['total_luas'] or 0.0), 2),
            rata_frp_mw=round(float(agg['avg_frp'] or 0.0), 1),
            total_provinsi=agg['total_prov'] or 0,
            total_gambut=total_gambut,
            total_mineral=total_hotspot - total_gambut,
            total_padam=total_padam,
            total_aktif=total_hotspot - total_padam
        )

    def resolve_stats_per_provinsi(self, info, tahun=None, bulan=None):
        qs = KejadianKarhutla.objects.all()
        if tahun:
            qs = qs.filter(tahun=tahun)
        if bulan:
            qs = qs.filter(bulan=bulan)

        grouped = qs.values('provinsi', 'kode_prov').annotate(
            total_titik=Count('id'),
            total_luas=Sum('luas_terdampak_ha'),
            avg_frp=Avg('frp_mw')
        ).order_by('provinsi')

        return [
            ProvinsiStatType(
                provinsi=g['provinsi'],
                kode_prov=g['kode_prov'],
                total_hotspot=g['total_titik'],
                total_luas_ha=round(float(g['total_luas'] or 0.0), 2),
                rata_frp_mw=round(float(g['avg_frp'] or 0.0), 1)
            ) for g in grouped
        ]

    def resolve_stats_per_bulan(self, info, tahun=None, provinsi=None):
        NAMA_BULAN = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
        qs = KejadianKarhutla.objects.all()
        if tahun:
            qs = qs.filter(tahun=tahun)
        if provinsi and provinsi != 'semua':
            qs = qs.filter(provinsi__icontains=provinsi)

        grouped = qs.values('bulan').annotate(
            total_titik=Count('id'),
            total_luas=Sum('luas_terdampak_ha')
        ).order_by('bulan')

        month_dict = {g['bulan']: g for g in grouped}
        result = []
        for m in range(1, 13):
            data = month_dict.get(m, {'total_titik': 0, 'total_luas': 0.0})
            result.append(
                BulanStatType(
                    bulan=m,
                    nama_bulan=NAMA_BULAN[m-1],
                    total_hotspot=data['total_titik'],
                    total_luas_ha=round(float(data['total_luas'] or 0.0), 2)
                )
            )
        return result
