import React, { useState } from 'react';
import { 
  Navigation, 
  Loader2, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Compass, 
  Check
} from 'lucide-react';
import { TitikPengamatan } from '../../types/linguistic';
import { ValidatedInput } from '../common/ValidatedInput';
import { FormValidationStatus } from '../common/FormValidationStatus';
import { validateSection1 } from '../../utils/formValidation';
import { useLanguage } from '../../contexts/LanguageContext';

interface Section1Props {
  data: TitikPengamatan;
  onChange: (field: keyof TitikPengamatan, value: string) => void;
  onBatchUpdate?: (updates: Partial<TitikPengamatan>) => void;
}

interface ReverseGeocodeResult {
  desa?: string;
  kecamatan?: string;
  kabupaten?: string;
  provinsi?: string;
  pulau?: string;
  displayName?: string;
}

export const Section1TitikPengamatan: React.FC<Section1Props> = ({ 
  data, 
  onChange,
  onBatchUpdate 
}) => {
  const { t, isIndonesian } = useLanguage();
  const errors = validateSection1(data);

  // Geolocation & Reverse Geocoding States
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<{
    type: 'success' | 'error';
    message: string;
    accuracy?: number;
    timestamp?: string;
  } | null>(null);
  const [suggestedArea, setSuggestedArea] = useState<ReverseGeocodeResult | null>(null);
  const [appliedSuggested, setAppliedSuggested] = useState<boolean>(false);

  // Geolocation API handler
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus({
        type: 'error',
        message: isIndonesian
          ? 'Peramban (browser) Anda tidak mendukung fitur Geolocation API.'
          : 'Your browser does not support the Geolocation API.'
      });
      return;
    }

    setIsLocating(true);
    setLocationStatus(null);
    setSuggestedArea(null);
    setAppliedSuggested(false);

    const geoOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const rawLat = position.coords.latitude;
        const rawLng = position.coords.longitude;
        const accuracy = Math.round(position.coords.accuracy);
        
        // Format to standard 6 decimal places (approx. 0.1 meter precision)
        const formattedLat = rawLat.toFixed(6);
        const formattedLng = rawLng.toFixed(6);

        // Update coordinates
        if (onBatchUpdate) {
          onBatchUpdate({
            koordinatLintang: formattedLat,
            koordinatBujur: formattedLng
          });
        } else {
          onChange('koordinatLintang', formattedLat);
          onChange('koordinatBujur', formattedLng);
        }

        const now = new Date().toLocaleTimeString(isIndonesian ? 'id-ID' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });

        setLocationStatus({
          type: 'success',
          message: isIndonesian
            ? `Koordinat GPS berhasil diperoleh (${formattedLat}, ${formattedLng})`
            : `GPS coordinates acquired successfully (${formattedLat}, ${formattedLng})`,
          accuracy,
          timestamp: now
        });
        setIsLocating(false);

        // Background Reverse Geocoding via OpenStreetMap Nominatim
        try {
          setIsReverseGeocoding(true);
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${rawLat}&lon=${rawLng}&zoom=14&addressdetails=1`,
            {
              headers: {
                'Accept-Language': isIndonesian ? 'id, en' : 'en, id'
              }
            }
          );

          if (response.ok) {
            const geoData = await response.json();
            const addr = geoData.address || {};

            const detectedDesa = addr.village || addr.suburb || addr.hamlet || addr.neighbourhood || addr.quarter || '';
            const detectedKec = addr.municipality || addr.district || addr.subdistrict || addr.city_district || '';
            const detectedKab = addr.city || addr.regency || addr.county || addr.town || '';
            const detectedProv = addr.state || addr.province || addr.region || '';
            const detectedPulau = addr.island || '';

            if (detectedDesa || detectedKec || detectedKab || detectedProv) {
              setSuggestedArea({
                desa: detectedDesa,
                kecamatan: detectedKec,
                kabupaten: detectedKab,
                provinsi: detectedProv,
                pulau: detectedPulau,
                displayName: geoData.display_name
              });
            }
          }
        } catch (fetchErr) {
          // Non-blocking: Coordinates are already saved safely
          console.warn('Reverse geocoding not reachable:', fetchErr);
        } finally {
          setIsReverseGeocoding(false);
        }
      },
      (error) => {
        setIsLocating(false);
        let errorMsg = isIndonesian
          ? 'Gagal mendeteksi lokasi perangkat.'
          : 'Failed to acquire device location.';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = isIndonesian
              ? 'Izin akses lokasi ditolak oleh browser. Mohon izinkan izin lokasi di bilah alamat browser Anda.'
              : 'Location permission was denied. Please allow location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = isIndonesian
              ? 'Informasi lokasi perangkat (GPS) tidak tersedia saat ini.'
              : 'Device location information (GPS) is currently unavailable.';
            break;
          case error.TIMEOUT:
            errorMsg = isIndonesian
              ? 'Waktu permintaan lokasi habis (timeout). Silakan periksa koneksi GPS dan coba lagi.'
              : 'Location request timed out. Please check your GPS connection and try again.';
            break;
          default:
            if (error.message) errorMsg = error.message;
        }

        setLocationStatus({
          type: 'error',
          message: errorMsg
        });
      },
      geoOptions
    );
  };

  // Apply reverse-geocoded administrative suggestions to empty or all fields
  const handleApplySuggestedArea = () => {
    if (!suggestedArea) return;

    if (onBatchUpdate) {
      const updates: Partial<TitikPengamatan> = {};
      if (suggestedArea.desa) updates.namaDesa = suggestedArea.desa;
      if (suggestedArea.kecamatan) updates.kecamatan = suggestedArea.kecamatan;
      if (suggestedArea.kabupaten) updates.kabupatenKota = suggestedArea.kabupaten;
      if (suggestedArea.provinsi) updates.provinsi = suggestedArea.provinsi;
      if (suggestedArea.pulau && !data.pulau) updates.pulau = suggestedArea.pulau;
      onBatchUpdate(updates);
    } else {
      if (suggestedArea.desa) onChange('namaDesa', suggestedArea.desa);
      if (suggestedArea.kecamatan) onChange('kecamatan', suggestedArea.kecamatan);
      if (suggestedArea.kabupaten) onChange('kabupatenKota', suggestedArea.kabupaten);
      if (suggestedArea.provinsi) onChange('provinsi', suggestedArea.provinsi);
      if (suggestedArea.pulau && !data.pulau) onChange('pulau', suggestedArea.pulau);
    }

    setAppliedSuggested(true);
  };

  const hasCoordinates = Boolean(data.koordinatLintang && data.koordinatBujur);
  const latStr = String(data.koordinatLintang || '');
  const lngStr = String(data.koordinatBujur || '');

  return (
    <section id="section-1" className="scroll-mt-36 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs p-5 md:p-6 transition-all">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-100 dark:border-indigo-900/50 shrink-0 mt-0.5">
            1
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              {t('section1.title', 'Gambaran Titik Pengamatan')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('section1.desc', 'Identitas administratif desa, bahasa utama yang digunakan, serta nama lain bahasa setempat.')}
            </p>
          </div>
        </div>

        {/* Action Button: Gunakan Lokasi Saat Ini */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={isLocating}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer ${
              isLocating
                ? 'bg-indigo-400 dark:bg-indigo-600 text-white cursor-wait opacity-85'
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 dark:focus:ring-offset-slate-900'
            }`}
            title={isIndonesian ? 'Deteksi koordinat GPS otomatis melalui browser' : 'Auto-detect GPS coordinates via browser'}
          >
            {isLocating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{t('section1.detectingLocation', 'Mendeteksi Posisi GPS...')}</span>
              </>
            ) : (
              <>
                <Navigation className="w-3.5 h-3.5" />
                <span>{t('section1.useCurrentLocation', 'Gunakan Lokasi Saat Ini')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Real-time Section Validation Feedback Banner */}
      <FormValidationStatus 
        errors={errors} 
        sectionTitle={t('section1.title', 'Titik Pengamatan')} 
        className="mb-5" 
      />

      {/* Geolocation Status Alert */}
      {locationStatus && (
        <div
          className={`mb-5 p-3.5 rounded-xl border text-xs flex items-start gap-3 transition-all ${
            locationStatus.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300'
          }`}
        >
          {locationStatus.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <div className="font-semibold">{locationStatus.message}</div>
            {locationStatus.accuracy !== undefined && (
              <div className="text-[11px] opacity-85 mt-0.5 flex items-center gap-3">
                <span>
                  {t('section1.accuracy', 'Akurasi')}: ±{locationStatus.accuracy} m
                </span>
                {locationStatus.timestamp && (
                  <span>• {locationStatus.timestamp}</span>
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setLocationStatus(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-1.5 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Suggested Administrative Area Banner (from Reverse Geocoding) */}
      {suggestedArea && (
        <div className="mb-5 p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/70 to-blue-50/70 dark:from-indigo-950/40 dark:to-blue-950/30 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-indigo-950 dark:text-indigo-200">
                {t('section1.suggestedArea', 'Wilayah Terdeteksi dari GPS')}:
              </span>
              <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                {[
                  suggestedArea.desa && `Desa/Kel. ${suggestedArea.desa}`,
                  suggestedArea.kecamatan && `Kec. ${suggestedArea.kecamatan}`,
                  suggestedArea.kabupaten && suggestedArea.kabupaten,
                  suggestedArea.provinsi && `Prov. ${suggestedArea.provinsi}`
                ]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleApplySuggestedArea}
            disabled={appliedSuggested}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition-colors ${
              appliedSuggested
                ? 'bg-emerald-600 text-white cursor-default'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs'
            }`}
          >
            {appliedSuggested ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{isIndonesian ? 'Diterapkan' : 'Applied'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('section1.applySuggested', 'Terapkan Wilayah Administratif')}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Coordinates Subsection */}
      <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              {t('section1.coordsTitle', 'Koordinat Geografis (GPS)')}
            </h3>
          </div>
          {hasCoordinates && (
            <div className="flex items-center gap-2 text-xs">
              <a
                href={`https://www.google.com/maps?q=${encodeURIComponent(latStr)},${encodeURIComponent(lngStr)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                <span>Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <a
                href={`https://www.openstreetmap.org/?mlat=${encodeURIComponent(latStr)}&mlon=${encodeURIComponent(lngStr)}#map=15/${encodeURIComponent(latStr)}/${encodeURIComponent(lngStr)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                <span>OpenStreetMap</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Koordinat Lintang (Latitude) */}
          <ValidatedInput
            id="tp-lat"
            label={t('section1.latLabel', 'Koordinat Lintang (Latitude)')}
            value={data.koordinatLintang ?? ''}
            coordinateType="lat"
            onChange={(val) => onChange('koordinatLintang', val)}
            placeholder="Contoh: -6.917464"
            helperText={isIndonesian ? 'Rentang valid: -90.0 hingga +90.0 (desimal)' : 'Valid range: -90.0 to +90.0 (decimal)'}
          />

          {/* Koordinat Bujur (Longitude) */}
          <ValidatedInput
            id="tp-lng"
            label={t('section1.lngLabel', 'Koordinat Bujur (Longitude)')}
            value={data.koordinatBujur ?? ''}
            coordinateType="lng"
            onChange={(val) => onChange('koordinatBujur', val)}
            placeholder="Contoh: 107.619123"
            helperText={isIndonesian ? 'Rentang valid: -180.0 hingga +180.0 (desimal)' : 'Valid range: -180.0 to +180.0 (decimal)'}
          />
        </div>
      </div>

      {/* Administrative Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Nama Desa */}
        <ValidatedInput
          id="tp-nama-desa"
          label={isIndonesian ? 'Nama Desa / Kelurahan' : 'Village / Sub-district Name'}
          value={data.namaDesa}
          onChange={(val) => onChange('namaDesa', val)}
          placeholder="Contoh: Karangwangi"
          required
          minLength={3}
          helperText={isIndonesian ? 'Masukkan nama resmi desa atau kelurahan titik pengamatan.' : 'Enter official name of observation point village.'}
        />

        {/* Bahasa yang Digunakan */}
        <ValidatedInput
          id="tp-bahasa"
          label={isIndonesian ? 'Bahasa yang Digunakan' : 'Primary Language Used'}
          value={data.bahasaDigunakan}
          onChange={(val) => onChange('bahasaDigunakan', val)}
          placeholder="Contoh: Bahasa Sunda"
          required
          minLength={3}
          helperText={isIndonesian ? 'Bahasa dominan yang digunakan masyarakat setempat.' : 'Dominant language spoken by local community.'}
        />

        {/* Nama Lain Bahasa Tersebut */}
        <ValidatedInput
          id="tp-nama-lain"
          label={isIndonesian ? 'Nama Lain Bahasa Tersebut' : 'Local / Alternative Language Name'}
          value={data.namaLainBahasa}
          onChange={(val) => onChange('namaLainBahasa', val)}
          placeholder="Contoh: Basa Sunda Pesisir Kidul"
          helperText={isIndonesian ? 'Nama lokal atau varian dialek setempat (opsional).' : 'Local or dialectal variant name (optional).'}
        />

        {/* Kecamatan */}
        <ValidatedInput
          id="tp-kecamatan"
          label={isIndonesian ? 'Kecamatan' : 'District (Kecamatan)'}
          value={data.kecamatan}
          onChange={(val) => onChange('kecamatan', val)}
          placeholder="Contoh: Cidaun"
          required
          minLength={3}
        />

        {/* Kabupaten / Kota */}
        <ValidatedInput
          id="tp-kabupaten"
          label={isIndonesian ? 'Kabupaten / Kota' : 'Regency / City'}
          value={data.kabupatenKota}
          onChange={(val) => onChange('kabupatenKota', val)}
          placeholder="Contoh: Kabupaten Cianjur"
          required
          minLength={3}
        />

        {/* Pulau */}
        <ValidatedInput
          id="tp-pulau"
          label={isIndonesian ? 'Pulau' : 'Island'}
          value={data.pulau}
          onChange={(val) => onChange('pulau', val)}
          placeholder="Contoh: Pulau Jawa"
          helperText={isIndonesian ? 'Nama pulau tempat titik pengamatan berada.' : 'Name of island where observation point is located.'}
        />

        {/* Provinsi */}
        <ValidatedInput
          id="tp-provinsi"
          label={isIndonesian ? 'Provinsi' : 'Province'}
          value={data.provinsi}
          onChange={(val) => onChange('provinsi', val)}
          placeholder="Contoh: Jawa Barat"
          required
          minLength={3}
        />

        {/* Kode Titik Pengamatan */}
        <ValidatedInput
          id="tp-kode"
          label={isIndonesian ? 'Kode Titik Pengamatan' : 'Observation Point Code'}
          value={data.kodeTitik || ''}
          onChange={(val) => onChange('kodeTitik', val)}
          placeholder="Contoh: TP-01"
          helperText={isIndonesian ? 'Kode identifikasi survei (misal TP-01, TP-02).' : 'Survey ID code (e.g., TP-01, TP-02).'}
        />
      </div>
    </section>
  );
};
