import { 
  InstrumenPemetaanBahasaData, 
  TitikPengamatan, 
  SituasiGeografis, 
  PendudukData, 
  NarasumberData 
} from '../types/linguistic';

export interface FieldValidationError {
  fieldId: string;
  fieldLabel: string;
  message: string;
  sectionNumber: number;
  sectionTitle: string;
  severity: 'error' | 'warning';
}

/**
 * Validates a numeric value:
 * - Must be parseable as a finite number
 * - Must satisfy min / max bounds
 * - Non-empty string check if required
 */
export function validateNumeric(
  value: string | number | undefined | null,
  options: {
    min?: number;
    max?: number;
    required?: boolean;
    integerOnly?: boolean;
    label?: string;
  } = {}
): { isValid: boolean; error?: string } {
  const { min = 0, max, required = false, integerOnly = false, label = 'Kolom' } = options;

  if (value === undefined || value === null || value === '') {
    if (required) {
      return { isValid: false, error: `${label} wajib diisi dengan angka.` };
    }
    return { isValid: true };
  }

  const str = String(value).trim();
  if (str === '') {
    if (required) {
      return { isValid: false, error: `${label} wajib diisi.` };
    }
    return { isValid: true };
  }

  // Check if string contains invalid characters for numbers
  const cleaned = str.replace(',', '.');
  const num = Number(cleaned);

  if (isNaN(num) || !isFinite(num)) {
    return { isValid: false, error: `${label} harus berupa angka yang valid (tanpa huruf/simbol).` };
  }

  if (integerOnly && !Number.isInteger(num)) {
    return { isValid: false, error: `${label} harus berupa bilangan bulat (tanpa koma/desimal).` };
  }

  if (min !== undefined && num < min) {
    return { isValid: false, error: `${label} tidak boleh kurang dari ${min}.` };
  }

  if (max !== undefined && num > max) {
    return { isValid: false, error: `${label} tidak boleh lebih dari ${max}.` };
  }

  return { isValid: true };
}

/**
 * Validates text string:
 * - Minimum length check
 * - Required check (not whitespace-only)
 */
export function validateText(
  value: string | undefined | null,
  options: {
    minLength?: number;
    maxLength?: number;
    required?: boolean;
    label?: string;
  } = {}
): { isValid: boolean; error?: string } {
  const { minLength = 0, maxLength, required = false, label = 'Kolom' } = options;

  const str = value ? String(value).trim() : '';

  if (required && str.length === 0) {
    return { isValid: false, error: `${label} wajib diisi.` };
  }

  if (str.length > 0 && minLength > 0 && str.length < minLength) {
    return { isValid: false, error: `${label} minimal harus berisi ${minLength} karakter (saat ini ${str.length}).` };
  }

  if (maxLength && str.length > maxLength) {
    return { isValid: false, error: `${label} maksimal ${maxLength} karakter.` };
  }

  return { isValid: true };
}

/**
 * Validates geographic coordinates
 */
export function validateCoordinate(
  value: string | number | undefined | null,
  type: 'lat' | 'lng'
): { isValid: boolean; error?: string } {
  if (value === undefined || value === null || String(value).trim() === '') {
    return { isValid: true }; // optional coordinate
  }

  const str = String(value).trim().replace(',', '.');
  const num = Number(str);

  if (isNaN(num)) {
    return { isValid: false, error: `Koordinat ${type === 'lat' ? 'Lintang' : 'Bujur'} harus berupa angka derajat desimal valid.` };
  }

  if (type === 'lat') {
    if (num < -90 || num > 90) {
      return { isValid: false, error: 'Lintang (Latitude) harus berada di rentang -90° hingga 90°.' };
    }
  } else {
    if (num < -180 || num > 180) {
      return { isValid: false, error: 'Bujur (Longitude) harus berada di rentang -180° hingga 180°.' };
    }
  }

  return { isValid: true };
}

/**
 * Validate Section 1: Titik Pengamatan
 */
export function validateSection1(data: TitikPengamatan): FieldValidationError[] {
  const errors: FieldValidationError[] = [];
  const sNum = 1;
  const sTitle = 'Titik Pengamatan';

  const vDesa = validateText(data.namaDesa, { minLength: 3, required: true, label: 'Nama Desa / Kelurahan' });
  if (!vDesa.isValid) {
    errors.push({ fieldId: 'tp-nama-desa', fieldLabel: 'Nama Desa', message: vDesa.error!, sectionNumber: sNum, sectionTitle: sTitle, severity: 'error' });
  }

  const vBahasa = validateText(data.bahasaDigunakan, { minLength: 3, required: true, label: 'Bahasa yang Digunakan' });
  if (!vBahasa.isValid) {
    errors.push({ fieldId: 'tp-bahasa', fieldLabel: 'Bahasa yang Digunakan', message: vBahasa.error!, sectionNumber: sNum, sectionTitle: sTitle, severity: 'error' });
  }

  const vKec = validateText(data.kecamatan, { minLength: 3, required: true, label: 'Kecamatan' });
  if (!vKec.isValid) {
    errors.push({ fieldId: 'tp-kecamatan', fieldLabel: 'Kecamatan', message: vKec.error!, sectionNumber: sNum, sectionTitle: sTitle, severity: 'error' });
  }

  const vKab = validateText(data.kabupatenKota, { minLength: 3, required: true, label: 'Kabupaten / Kota' });
  if (!vKab.isValid) {
    errors.push({ fieldId: 'tp-kabupaten', fieldLabel: 'Kabupaten/Kota', message: vKab.error!, sectionNumber: sNum, sectionTitle: sTitle, severity: 'error' });
  }

  const vProv = validateText(data.provinsi, { minLength: 3, required: true, label: 'Provinsi' });
  if (!vProv.isValid) {
    errors.push({ fieldId: 'tp-provinsi', fieldLabel: 'Provinsi', message: vProv.error!, sectionNumber: sNum, sectionTitle: sTitle, severity: 'error' });
  }

  if (data.koordinatLintang !== undefined && data.koordinatLintang !== '') {
    const vLat = validateCoordinate(data.koordinatLintang, 'lat');
    if (!vLat.isValid) {
      errors.push({ fieldId: 'tp-lat', fieldLabel: 'Koordinat Lintang', message: vLat.error!, sectionNumber: sNum, sectionTitle: sTitle, severity: 'error' });
    }
  }

  if (data.koordinatBujur !== undefined && data.koordinatBujur !== '') {
    const vLng = validateCoordinate(data.koordinatBujur, 'lng');
    if (!vLng.isValid) {
      errors.push({ fieldId: 'tp-lng', fieldLabel: 'Koordinat Bujur', message: vLng.error!, sectionNumber: sNum, sectionTitle: sTitle, severity: 'error' });
    }
  }

  return errors;
}

/**
 * Validate Section 3: Situasi Geografis
 */
export function validateSection3(data: SituasiGeografis): FieldValidationError[] {
  const errors: FieldValidationError[] = [];
  const sNum = 3;
  const sTitle = 'Situasi Geografis';

  const vJarak = validateNumeric(data.jarakDariPantaiKm, { min: 0, label: 'Jarak dari Pantai' });
  if (!vJarak.isValid) {
    errors.push({ fieldId: 'geo-jarak-pantai', fieldLabel: 'Jarak dari Pantai', message: vJarak.error!, sectionNumber: sNum, sectionTitle: sTitle, severity: 'error' });
  }

  const vLat = validateCoordinate(data.koordinatLintang, 'lat');
  if (!vLat.isValid) {
    errors.push({ fieldId: 'geo-lat', fieldLabel: 'Koordinat Lintang (Lat)', message: vLat.error!, sectionNumber: sNum, sectionTitle: sTitle, severity: 'error' });
  }

  const vLng = validateCoordinate(data.koordinatBujur, 'lng');
  if (!vLng.isValid) {
    errors.push({ fieldId: 'geo-lng', fieldLabel: 'Koordinat Bujur (Lng)', message: vLng.error!, sectionNumber: sNum, sectionTitle: sTitle, severity: 'error' });
  }

  return errors;
}

/**
 * Validate Section 4: Penduduk & Penutur
 */
export function validateSection4(data: PendudukData): FieldValidationError[] {
  const errors: FieldValidationError[] = [];
  const sNum = 4;
  const sTitle = 'Penduduk & Penutur';

  const numFields: Array<{ id: string; key: keyof PendudukData; label: string }> = [
    { id: 'penduduk-pria', key: 'jumlahPria', label: 'Jumlah Penduduk Pria' },
    { id: 'penduduk-wanita', key: 'jumlahWanita', label: 'Jumlah Penduduk Wanita' },
    { id: 'penduduk-u20', key: 'umurBawah20', label: 'Penduduk Umur < 20' },
    { id: 'penduduk-u20sd40', key: 'umur20sd40', label: 'Penduduk Umur 20-40' },
    { id: 'penduduk-u40', key: 'umurDiatas40', label: 'Penduduk Umur > 40' },
    { id: 'penutur-pria', key: 'penuturPria', label: 'Jumlah Penutur Pria' },
    { id: 'penutur-wanita', key: 'penuturWanita', label: 'Jumlah Penutur Wanita' },
    { id: 'penutur-u20', key: 'penuturUmurBawah20', label: 'Penutur Umur < 20' },
    { id: 'penutur-u20sd40', key: 'penuturUmur20sd40', label: 'Penutur Umur 20-40' },
    { id: 'penutur-u40', key: 'penuturUmurDiatas40', label: 'Penutur Umur > 40' },
  ];

  for (const { id, key, label } of numFields) {
    const v = validateNumeric(data[key], { min: 0, integerOnly: true, label });
    if (!v.isValid) {
      errors.push({ fieldId: id, fieldLabel: label, message: v.error!, sectionNumber: sNum, sectionTitle: sTitle, severity: 'error' });
    }
  }

  // Validate percentages if given
  if (data.mayoritasEtnikPersen !== '' && data.mayoritasEtnikPersen !== undefined) {
    const v = validateNumeric(data.mayoritasEtnikPersen, { min: 0, max: 100, label: 'Persentase Mayoritas Etnik' });
    if (!v.isValid) {
      errors.push({ fieldId: 'etnik-mayoritas-persen', fieldLabel: 'Persentase Mayoritas Etnik', message: v.error!, sectionNumber: sNum, sectionTitle: sTitle, severity: 'error' });
    }
  }

  if (data.minoritasEtnikPersen !== '' && data.minoritasEtnikPersen !== undefined) {
    const v = validateNumeric(data.minoritasEtnikPersen, { min: 0, max: 100, label: 'Persentase Minoritas Etnik' });
    if (!v.isValid) {
      errors.push({ fieldId: 'etnik-minoritas-persen', fieldLabel: 'Persentase Minoritas Etnik', message: v.error!, sectionNumber: sNum, sectionTitle: sTitle, severity: 'error' });
    }
  }

  return errors;
}

/**
 * Validate Section 14: Narasumber
 */
export function validateSection14(narasumberList: NarasumberData[]): FieldValidationError[] {
  const errors: FieldValidationError[] = [];
  const sNum = 14;
  const sTitle = 'Profil Narasumber';

  if (!narasumberList || narasumberList.length === 0) {
    errors.push({
      fieldId: 'ns-list',
      fieldLabel: 'Daftar Narasumber',
      message: 'Setidaknya satu narasumber harus diisi.',
      sectionNumber: sNum,
      sectionTitle: sTitle,
      severity: 'error'
    });
    return errors;
  }

  narasumberList.forEach((ns, idx) => {
    // Only validate if active or partially filled
    const hasAnyValue = Boolean(ns.nama || ns.usia || ns.pekerjaan?.sebagaiApa);
    if (idx === 0 || hasAnyValue) {
      const vNama = validateText(ns.nama, { minLength: 3, required: true, label: `Nama Informan #${idx + 1}` });
      if (!vNama.isValid) {
        errors.push({
          fieldId: `ns-${idx}-nama`,
          fieldLabel: `Nama Informan #${idx + 1}`,
          message: vNama.error!,
          sectionNumber: sNum,
          sectionTitle: sTitle,
          severity: 'error'
        });
      }

      if (ns.usia !== '' && ns.usia !== undefined) {
        const vUsia = validateNumeric(ns.usia, { min: 10, max: 120, integerOnly: true, label: `Usia Informan #${idx + 1}` });
        if (!vUsia.isValid) {
          errors.push({
            fieldId: `ns-${idx}-usia`,
            fieldLabel: `Usia Informan #${idx + 1}`,
            message: vUsia.error!,
            sectionNumber: sNum,
            sectionTitle: sTitle,
            severity: 'error'
          });
        }
      }

      if (ns.tahunKelahiran !== '' && ns.tahunKelahiran !== undefined) {
        const vTahun = validateNumeric(ns.tahunKelahiran, { min: 1900, max: 2026, integerOnly: true, label: `Tahun Lahir Informan #${idx + 1}` });
        if (!vTahun.isValid) {
          errors.push({
            fieldId: `ns-${idx}-tahun-lahir`,
            fieldLabel: `Tahun Lahir Informan #${idx + 1}`,
            message: vTahun.error!,
            sectionNumber: sNum,
            sectionTitle: sTitle,
            severity: 'error'
          });
        }
      }
    }
  });

  return errors;
}

/**
 * Validate any section by its index (1 to 16)
 */
export function validateSection(sectionNumber: number, data: InstrumenPemetaanBahasaData): FieldValidationError[] {
  switch (sectionNumber) {
    case 1:
      return validateSection1(data.titikPengamatan);
    case 3:
      return validateSection3(data.situasiGeografis);
    case 4:
      return validateSection4(data.penduduk);
    case 14:
      return validateSection14(data.narasumberList);
    default:
      return [];
  }
}

/**
 * Validate full survey data across all sections
 */
export function validateFullSurvey(data: InstrumenPemetaanBahasaData): {
  isValid: boolean;
  totalErrors: number;
  errors: FieldValidationError[];
  errorsBySection: Record<number, FieldValidationError[]>;
} {
  const allErrors: FieldValidationError[] = [
    ...validateSection1(data.titikPengamatan),
    ...validateSection3(data.situasiGeografis),
    ...validateSection4(data.penduduk),
    ...validateSection14(data.narasumberList)
  ];

  const errorsBySection: Record<number, FieldValidationError[]> = {};
  for (let s = 1; s <= 16; s++) {
    errorsBySection[s] = [];
  }

  for (const err of allErrors) {
    if (!errorsBySection[err.sectionNumber]) {
      errorsBySection[err.sectionNumber] = [];
    }
    errorsBySection[err.sectionNumber].push(err);
  }

  return {
    isValid: allErrors.length === 0,
    totalErrors: allErrors.length,
    errors: allErrors,
    errorsBySection
  };
}
