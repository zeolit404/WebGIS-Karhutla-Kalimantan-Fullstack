from django.db import models

class KejadianKarhutla(models.Model):
    id = models.BigAutoField(primary_key=True)
    id_kejadian = models.CharField(unique=True, max_length=30, blank=True, null=True)
    kode_prov = models.CharField(max_length=10, blank=True, null=True)
    provinsi = models.CharField(max_length=60, blank=True, null=True)
    kabupaten = models.CharField(max_length=60, blank=True, null=True)
    kecamatan = models.CharField(max_length=60, blank=True, null=True)
    tgl_kejadian = models.DateField(blank=True, null=True)
    jam_kejadian = models.TimeField(blank=True, null=True)
    tahun = models.IntegerField(blank=True, null=True)
    bulan = models.IntegerField(blank=True, null=True)
    luas_terdampak_ha = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    frp_mw = models.DecimalField(max_digits=6, decimal_places=1, blank=True, null=True)
    confidence = models.CharField(max_length=20, blank=True, null=True)
    confidence_pct = models.IntegerField(blank=True, null=True)
    satelit = models.CharField(max_length=50, blank=True, null=True)
    tipe_lahan = models.CharField(max_length=80, blank=True, null=True)
    is_gambut = models.BooleanField(blank=True, null=True)
    status_penanganan = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'kejadian_karhutla_kalimantan'
        ordering = ['-tgl_kejadian', '-jam_kejadian']

    def __str__(self):
        return f"{self.id_kejadian} ({self.kabupaten}, {self.provinsi})"
