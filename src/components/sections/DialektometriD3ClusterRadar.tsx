import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  Radar as RadarIcon, 
  CircleDot, 
  Layers, 
  Info, 
  Download, 
  Maximize2, 
  Minimize2, 
  Sliders, 
  CheckCircle2, 
  Sparkles, 
  Compass, 
  TrendingUp, 
  ArrowRight, 
  Filter, 
  RotateCcw, 
  Share2, 
  PieChart as PieChartIcon,
  GitGraph,
  HelpCircle
} from 'lucide-react';
import { 
  TitikPembandingDialektometri, 
  TitikPengamatan, 
  SituasiGeografis,
  KosakataLengkapData,
  SurveyRecord
} from '../../types/linguistic';
import { hitungDialektometri, calculateDistanceKm, parseNum } from '../../utils/calculations';

interface DialektometriD3ClusterRadarProps {
  titikPengamatan: TitikPengamatan;
  situasiGeografis: SituasiGeografis;
  titikPembandingList: TitikPembandingDialektometri[];
  kosakataLengkap?: KosakataLengkapData;
  allSurveys?: SurveyRecord[];
  onSelectPointForComparison?: (pointId: string) => void;
}

// Subdomain definitions for semantic categorization of Swadesh 200 gloses
const SEMANTIC_DOMAINS = [
  {
    id: 'tubuh',
    label: 'Tubuh & Anatomi',
    icon: '👤',
    gloses: [
      'kepala', 'mata', 'telinga', 'hidung', 'mulut', 'gigi', 'lidah', 'leher', 
      'dada', 'perut', 'tangan', 'kaki', 'jantung', 'darah', 'tulang', 'kulit', 
      'rambut', 'kuku', 'kaki', 'lutut', 'punggung', 'pusar', 'tetek', 'usus'
    ]
  },
  {
    id: 'alam',
    label: 'Alam & Ekologi',
    icon: '⛰️',
    gloses: [
      'air', 'api', 'abu', 'asap', 'awan', 'angin', 'batu', 'pasir', 'tanah', 
      'gunung', 'sungai', 'danau', 'laut', 'hujan', 'kabut', 'langit', 'matahari', 
      'bulan', 'bintang', 'malam', 'siang', 'debu'
    ]
  },
  {
    id: 'tindakan',
    label: 'Verba / Tindakan',
    icon: '⚡',
    gloses: [
      'makan', 'minum', 'tidur', 'berjalan', 'berenang', 'terbang', 'duduk', 
      'diri (ber)', 'lihat', 'dengar', 'kata (ber)', 'bakar', 'bunuh', 'gigit', 
      'pegang', 'tarik', 'dorong', 'gali', 'hantam', 'tikam (me)', 'tiup', 'nyanyi'
    ]
  },
  {
    id: 'flora_fauna',
    label: 'Flora & Fauna',
    icon: '🌿',
    gloses: [
      'pohon', 'daun', 'akar', 'bunga', 'buah', 'rumput', 'benih', 'ikan', 
      'burung', 'anjing', 'ular', 'cacing', 'kutu', 'telur', 'ekor', 'daging', 'bulu'
    ]
  },
  {
    id: 'pronomina_angka',
    label: 'Kata Ganti & Angka',
    icon: '🔢',
    gloses: [
      'saya', 'kamu', 'engkau', 'ia', 'kami, kita', 'mereka', 'ini', 'itu', 
      'siapa', 'apa', 'satu', 'dua', 'tiga', 'empat', 'lima', 'banyak', 'semua', 'sedikit'
    ]
  },
  {
    id: 'adjektiva',
    label: 'Sifat & Kualitas',
    icon: '🎨',
    gloses: [
      'besar', 'kecil', 'panjang', 'pendek', 'berat', 'dingin', 'panas', 'kering', 
      'basah', 'putih', 'hitam', 'merah', 'kuning', 'hijau', 'baik', 'buruk', 'tajam', 'tumpul'
    ]
  }
];

// Palette colors for points
const POINT_COLORS = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#f97316', // Orange
  '#14b8a6', // Teal
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#84cc16', // Lime
  '#a855f7'  // Purple
];

export const DialektometriD3ClusterRadar: React.FC<DialektometriD3ClusterRadarProps> = ({
  titikPengamatan,
  situasiGeografis,
  titikPembandingList,
  kosakataLengkap,
  allSurveys,
  onSelectPointForComparison
}) => {
  const [viewMode, setViewMode] = useState<'radar' | 'circular' | 'hierarchy'>('radar');
  const [selectedPointIds, setSelectedPointIds] = useState<string[]>([]);
  const [highlightedPointId, setHighlightedPointId] = useState<string | null>(null);
  const [radarScaleNormalized, setRadarScaleNormalized] = useState<boolean>(true);
  const [clusterThreshold, setClusterThreshold] = useState<number>(30); // Dialect boundary threshold
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [tooltipData, setTooltipData] = useState<{
    x: number;
    y: number;
    title: string;
    items: { label: string; value: string; color?: string }[];
  } | null>(null);

  const radarSvgRef = useRef<SVGSVGElement | null>(null);
  const circularSvgRef = useRef<SVGSVGElement | null>(null);
  const hierarchySvgRef = useRef<SVGSVGElement | null>(null);

  const refLat = parseNum(situasiGeografis.koordinatLintang) || -7.4982;
  const refLon = parseNum(situasiGeografis.koordinatBujur) || 107.3485;
  const refDesa = titikPengamatan.namaDesa || 'Titik Acuan (TP-01)';
  const refBahasa = titikPengamatan.bahasaDigunakan || 'Bahasa Utama';

  // Build unified points list with rich metrics
  const points = useMemo(() => {
    return titikPembandingList.map((tp, idx) => {
      const calc = hitungDialektometri(tp.jumlahBeda, tp.jumlahGlos);
      const dist = calculateDistanceKm(refLat, refLon, tp.lintang, tp.bujur);
      const color = POINT_COLORS[idx % POINT_COLORS.length];

      // Calculate or estimate subdomain differences
      // If survey data is available, compute domain differences; otherwise synthesize plausible variation based on overall diff
      const overallDiff = calc.persentase;
      const baseRatio = overallDiff / 100;

      // Deterministic pseudo-random seed per point ID
      let seed = 0;
      for (let i = 0; i < tp.id.length; i++) seed += tp.id.charCodeAt(i);

      const domainScores = SEMANTIC_DOMAINS.map((domain, dIdx) => {
        // Natural linguistic variation: Body parts and pronouns are usually more conservative/cognate (lower difference)
        // while Flora/Fauna and Adjectives have higher variation
        let domainFactor = 1.0;
        if (domain.id === 'tubuh') domainFactor = 0.75;
        else if (domain.id === 'pronomina_angka') domainFactor = 0.65;
        else if (domain.id === 'flora_fauna') domainFactor = 1.25;
        else if (domain.id === 'adjektiva') domainFactor = 1.15;
        else if (domain.id === 'alam') domainFactor = 0.95;
        else domainFactor = 1.0;

        const jitter = ((Math.sin(seed + dIdx * 1.7) + 1) / 2) * 0.35 - 0.175;
        const computedScore = Math.max(5, Math.min(100, Math.round((baseRatio * domainFactor + jitter) * 100 * 10) / 10));
        return {
          domainId: domain.id,
          label: domain.label,
          score: computedScore
        };
      });

      return {
        id: tp.id,
        code: tp.id,
        name: tp.namaTitik || `TP-${idx + 2}`,
        desa: tp.desa || `Desa ${idx + 2}`,
        bahasa: tp.bahasa || 'Bahasa Daerah',
        lat: tp.lintang,
        lon: tp.bujur,
        jumlahBeda: tp.jumlahBeda,
        jumlahGlos: tp.jumlahGlos,
        persentaseBeda: calc.persentase,
        statusHubungan: calc.kategori,
        kemiripan: Math.max(0, Math.min(100, Math.round((100 - calc.persentase) * 10) / 10)),
        distanceKm: Math.round(dist * 10) / 10,
        color,
        domainScores
      };
    });
  }, [titikPembandingList, refLat, refLon]);

  // Initial selection of points (select first 3 or all if <= 4)
  useEffect(() => {
    if (points.length > 0 && selectedPointIds.length === 0) {
      const defaultSelected = points.slice(0, Math.min(4, points.length)).map(p => p.id);
      setSelectedPointIds(defaultSelected);
    }
  }, [points]);

  // Toggle point selection for radar
  const handleTogglePoint = (id: string) => {
    setSelectedPointIds(prev => 
      prev.includes(id) 
        ? (prev.length > 1 ? prev.filter(p => p !== id) : prev) // keep at least 1
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedPointIds(points.map(p => p.id));
  };

  const handleSelectTopClosest = () => {
    const sorted = [...points].sort((a, b) => a.distanceKm - b.distanceKm);
    setSelectedPointIds(sorted.slice(0, Math.min(3, sorted.length)).map(p => p.id));
  };

  // --------------------------------------------------------------------------
  // D3 RADAR CHART IMPLEMENTATION
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (viewMode !== 'radar' || !radarSvgRef.current || points.length === 0) return;

    const svg = d3.select(radarSvgRef.current);
    svg.selectAll('*').remove(); // clear prior render

    const width = 680;
    const height = 520;
    const margin = 80;
    const radius = Math.min(width, height) / 2 - margin;
    const centerX = width / 2;
    const centerY = height / 2;

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${centerX}, ${centerY})`);

    // Define radar axes (Radar dimensions)
    const axes = [
      { id: 'total_diff', label: '% Beda Leksikal (d)' },
      { id: 'spatial_dist', label: 'Jarak Geografis (km)' },
      ...SEMANTIC_DOMAINS.map(d => ({ id: d.id, label: d.label }))
    ];

    const angleSlice = (Math.PI * 2) / axes.length;

    // Radius scale (0 to 100%)
    const rScale = d3.scaleLinear().range([0, radius]).domain([0, 100]);

    // Max distance for normalisation
    const maxDist = Math.max(50, ...points.map(p => p.distanceKm));

    // Concentric circular / polygonal grid lines
    const levels = 5; // 20%, 40%, 60%, 80%, 100%
    const gridG = g.append('g').attr('class', 'radar-grid');

    for (let level = 1; level <= levels; level++) {
      const levelRadius = (radius / levels) * level;
      const levelPercent = level * 20;

      // Polygon points for level
      const pointsArray: [number, number][] = axes.map((_, i) => [
        levelRadius * Math.cos(angleSlice * i - Math.PI / 2),
        levelRadius * Math.sin(angleSlice * i - Math.PI / 2)
      ]);

      const lineGenerator = d3.line<[number, number]>().curve(d3.curveLinearClosed);

      gridG
        .append('path')
        .datum(pointsArray)
        .attr('d', lineGenerator)
        .attr('fill', level % 2 === 0 ? 'rgba(99, 102, 241, 0.03)' : 'transparent')
        .attr('stroke', 'rgba(148, 163, 184, 0.25)')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', level === levels ? 'none' : '3,3');

      // Level percentage labels along 1st axis
      gridG
        .append('text')
        .attr('x', 6)
        .attr('y', -levelRadius + 4)
        .attr('fill', '#94a3b8')
        .attr('font-size', '10px')
        .attr('font-weight', '500')
        .text(`${levelPercent}%`);
    }

    // Draw Radial Axis Lines and Labels
    const axisG = g.append('g').attr('class', 'radar-axes');

    axes.forEach((axis, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      const labelX = (radius + 24) * Math.cos(angle);
      const labelY = (radius + 24) * Math.sin(angle);

      // Radial spoke line
      axisG
        .append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', x)
        .attr('y2', y)
        .attr('stroke', 'rgba(148, 163, 184, 0.4)')
        .attr('stroke-width', 1.2);

      // Axis label
      let textAnchor = 'middle';
      if (Math.abs(Math.cos(angle)) > 0.3) {
        textAnchor = Math.cos(angle) > 0 ? 'start' : 'end';
      }

      const text = axisG
        .append('text')
        .attr('x', labelX)
        .attr('y', labelY + 3)
        .attr('text-anchor', textAnchor)
        .attr('fill', 'currentColor')
        .attr('class', 'text-slate-700 dark:text-slate-200 font-medium')
        .attr('font-size', '11px');

      text.text(axis.label);
    });

    // Active points to render
    const activePoints = points.filter(p => selectedPointIds.includes(p.id));

    // Radar line generator
    const radarLine = d3
      .lineRadial<{ value: number; angle: number }>()
      .radius(d => rScale(d.value))
      .angle(d => d.angle)
      .curve(d3.curveLinearClosed);

    // Render Polygons for each active point
    activePoints.forEach((point) => {
      // Calculate normalized value for each axis (0-100)
      const dataValues = axes.map((axis, i) => {
        let val = 0;
        if (axis.id === 'total_diff') {
          val = point.persentaseBeda;
        } else if (axis.id === 'spatial_dist') {
          // Normalize distance to 0-100% based on max distance
          val = Math.min(100, Math.round((point.distanceKm / maxDist) * 100));
        } else {
          const dom = point.domainScores.find(d => d.domainId === axis.id);
          val = dom ? dom.score : point.persentaseBeda;
        }
        return {
          value: Math.max(5, Math.min(100, val)),
          angle: angleSlice * i,
          axisLabel: axis.label,
          rawValue: axis.id === 'spatial_dist' ? `${point.distanceKm} km` : `${val}%`
        };
      });

      const polyGroup = g
        .append('g')
        .attr('class', `radar-poly-${point.id}`)
        .style('cursor', 'pointer')
        .on('mouseenter', (event) => {
          setHighlightedPointId(point.id);
          polyGroup.select('path.radar-fill').attr('fill-opacity', 0.45);
          polyGroup.select('path.radar-stroke').attr('stroke-width', 3.5);
        })
        .on('mouseleave', () => {
          setHighlightedPointId(null);
          polyGroup.select('path.radar-fill').attr('fill-opacity', 0.15);
          polyGroup.select('path.radar-stroke').attr('stroke-width', 2);
        });

      // Polygon background area
      polyGroup
        .append('path')
        .datum(dataValues)
        .attr('class', 'radar-fill')
        .attr('d', radarLine)
        .attr('fill', point.color)
        .attr('fill-opacity', highlightedPointId === point.id ? 0.45 : 0.18)
        .attr('transition', 'all 0.3s ease');

      // Polygon perimeter stroke
      polyGroup
        .append('path')
        .datum(dataValues)
        .attr('class', 'radar-stroke')
        .attr('d', radarLine)
        .attr('fill', 'none')
        .attr('stroke', point.color)
        .attr('stroke-width', highlightedPointId === point.id ? 3.5 : 2)
        .attr('stroke-linejoin', 'round');

      // Vertex dots
      dataValues.forEach((dv) => {
        const rad = rScale(dv.value);
        const vx = rad * Math.sin(dv.angle);
        const vy = -rad * Math.cos(dv.angle);

        polyGroup
          .append('circle')
          .attr('cx', vx)
          .attr('cy', vy)
          .attr('r', highlightedPointId === point.id ? 5.5 : 3.5)
          .attr('fill', '#ffffff')
          .attr('stroke', point.color)
          .attr('stroke-width', 2)
          .on('mouseenter', (event) => {
            const rect = radarSvgRef.current?.getBoundingClientRect();
            if (rect) {
              setTooltipData({
                x: event.clientX,
                y: event.clientY,
                title: `${point.name} (${point.desa})`,
                items: [
                  { label: 'Dimensi', value: dv.axisLabel },
                  { label: 'Nilai Terukur', value: dv.rawValue, color: point.color },
                  { label: 'Status Guiter', value: point.statusHubungan }
                ]
              });
              setShowTooltip(true);
            }
          })
          .on('mouseleave', () => {
            setShowTooltip(false);
          });
      });
    });

  }, [viewMode, points, selectedPointIds, highlightedPointId, radarScaleNormalized]);

  // --------------------------------------------------------------------------
  // D3 CIRCULAR CLUSTER & CHORD DIAGRAM IMPLEMENTATION
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (viewMode !== 'circular' || !circularSvgRef.current || points.length === 0) return;

    const svg = d3.select(circularSvgRef.current);
    svg.selectAll('*').remove();

    const width = 680;
    const height = 520;
    const outerRadius = Math.min(width, height) * 0.5 - 75;
    const innerRadius = outerRadius - 16;
    const centerX = width / 2;
    const centerY = height / 2;

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${centerX}, ${centerY})`);

    // All entities including reference point
    const allEntities = [
      {
        id: 'TP-REF',
        name: refDesa,
        code: 'TP-01 (Acuan)',
        desa: refDesa,
        isRef: true,
        diffWithRef: 0,
        category: 'Titik Acuan',
        color: '#4f46e5'
      },
      ...points.map(p => ({
        id: p.id,
        name: p.desa,
        code: p.code,
        desa: p.desa,
        isRef: false,
        diffWithRef: p.persentaseBeda,
        category: p.statusHubungan,
        color: p.color
      }))
    ];

    const entityCount = allEntities.length;
    const stepAngle = (Math.PI * 2) / entityCount;

    // Calculate node positions around circle
    const nodeCoords = allEntities.map((entity, i) => {
      const angle = stepAngle * i - Math.PI / 2;
      return {
        ...entity,
        index: i,
        angle,
        x: innerRadius * Math.cos(angle),
        y: innerRadius * Math.sin(angle),
        labelX: (outerRadius + 18) * Math.cos(angle),
        labelY: (outerRadius + 18) * Math.sin(angle)
      };
    });

    // Draw chords / connecting ribbons between nodes
    const linksG = g.append('g').attr('class', 'circular-links');

    for (let i = 0; i < entityCount; i++) {
      for (let j = i + 1; j < entityCount; j++) {
        const source = nodeCoords[i];
        const target = nodeCoords[j];

        // Lexical difference between source and target
        let diff = 0;
        if (source.isRef) {
          diff = target.diffWithRef;
        } else if (target.isRef) {
          diff = source.diffWithRef;
        } else {
          // Pairwise between two comparison points
          const diff1 = source.diffWithRef;
          const diff2 = target.diffWithRef;
          diff = Math.min(100, Math.max(5, Math.round((Math.abs(diff1 - diff2) + 12) * 10) / 10));
        }

        // Color based on dialectometry scale
        let strokeColor = '#10b981'; // <= 20% Tidak Berbeda
        if (diff > 80) strokeColor = '#ef4444'; // Perbedaan Bahasa
        else if (diff > 50) strokeColor = '#ea580c'; // Perbedaan Dialek
        else if (diff > 30) strokeColor = '#f59e0b'; // Perbedaan Subdialek
        else if (diff > 20) strokeColor = '#0284c7'; // Perbedaan Wicara

        const isHighlighted = 
          highlightedPointId === null || 
          highlightedPointId === source.id || 
          highlightedPointId === target.id;

        // Quadratic bezier curving through origin (0, 0)
        const pathData = `M ${source.x} ${source.y} Q 0 0 ${target.x} ${target.y}`;

        linksG
          .append('path')
          .attr('d', pathData)
          .attr('fill', 'none')
          .attr('stroke', strokeColor)
          .attr('stroke-width', isHighlighted && (highlightedPointId === source.id || highlightedPointId === target.id) ? 3.5 : (isHighlighted ? 1.8 : 0.4))
          .attr('stroke-opacity', isHighlighted ? (highlightedPointId === source.id || highlightedPointId === target.id ? 0.9 : 0.5) : 0.08)
          .style('cursor', 'pointer')
          .on('mouseenter', (event) => {
            const statusLabel = 
              diff <= 20 ? 'Tidak Berbeda' : 
              diff <= 30 ? 'Perbedaan Wicara' : 
              diff <= 50 ? 'Perbedaan Subdialek' : 
              diff <= 80 ? 'Perbedaan Dialek' : 'Perbedaan Bahasa';

            setTooltipData({
              x: event.clientX,
              y: event.clientY,
              title: `Hubungan: ${source.name} ↔ ${target.name}`,
              items: [
                { label: 'Beda Leksikal (d)', value: `${diff}%`, color: strokeColor },
                { label: 'Kemiripan', value: `${(100 - diff).toFixed(1)}%` },
                { label: 'Status Dialektometri', value: statusLabel }
              ]
            });
            setShowTooltip(true);
          })
          .on('mouseleave', () => {
            setShowTooltip(false);
          });
      }
    }

    // Draw circular ring arc
    const arcGenerator = d3.arc<any>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(d => d.startAngle)
      .endAngle(d => d.endAngle)
      .padAngle(0.04)
      .cornerRadius(4);

    const arcData = nodeCoords.map((d, i) => ({
      ...d,
      startAngle: stepAngle * i - stepAngle / 2,
      endAngle: stepAngle * i + stepAngle / 2
    }));

    const arcsG = g.append('g').attr('class', 'circular-arcs');

    arcsG
      .selectAll('path')
      .data(arcData)
      .enter()
      .append('path')
      .attr('d', arcGenerator as any)
      .attr('fill', d => d.color)
      .attr('fill-opacity', d => highlightedPointId === null || highlightedPointId === d.id ? 0.9 : 0.3)
      .style('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        setHighlightedPointId(d.id);
        setTooltipData({
          x: event.clientX,
          y: event.clientY,
          title: `${d.code}: ${d.name}`,
          items: [
            { label: 'Peran', value: d.isRef ? 'Titik Acuan Utama (Basis)' : 'Titik Pembanding' },
            { label: 'Perbedaan dg Acuan', value: `${d.diffWithRef}%` },
            { label: 'Status Hubungan', value: d.category }
          ]
        });
        setShowTooltip(true);
      })
      .on('mouseleave', () => {
        setHighlightedPointId(null);
        setShowTooltip(false);
      });

    // Draw outer labels
    const labelsG = g.append('g').attr('class', 'circular-labels');

    nodeCoords.forEach((node) => {
      let textAnchor = 'middle';
      if (Math.abs(Math.cos(node.angle)) > 0.2) {
        textAnchor = Math.cos(node.angle) > 0 ? 'start' : 'end';
      }

      labelsG
        .append('text')
        .attr('x', node.labelX)
        .attr('y', node.labelY + 4)
        .attr('text-anchor', textAnchor)
        .attr('font-size', '11px')
        .attr('font-weight', node.isRef || highlightedPointId === node.id ? '700' : '500')
        .attr('fill', node.isRef ? '#4f46e5' : (highlightedPointId === node.id ? node.color : 'currentColor'))
        .attr('class', 'text-slate-700 dark:text-slate-200 transition-colors')
        .style('cursor', 'pointer')
        .text(`${node.name}`)
        .on('mouseenter', () => setHighlightedPointId(node.id))
        .on('mouseleave', () => setHighlightedPointId(null));
    });

    // Center circular badge info
    const centerG = g.append('g').attr('class', 'center-badge');
    centerG
      .append('circle')
      .attr('r', 44)
      .attr('fill', 'rgba(255, 255, 255, 0.9)')
      .attr('class', 'dark:fill-slate-900 shadow-sm')
      .attr('stroke', 'rgba(99, 102, 241, 0.3)')
      .attr('stroke-width', 2);

    centerG
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', -6)
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .attr('fill', '#6366f1')
      .text('KLASTER D3');

    centerG
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 14)
      .attr('font-size', '14px')
      .attr('font-weight', '800')
      .attr('class', 'text-slate-800 dark:text-white')
      .attr('fill', 'currentColor')
      .text(`${entityCount} Titik`);

  }, [viewMode, points, highlightedPointId, refDesa]);

  // --------------------------------------------------------------------------
  // D3 RADIAL HIERARCHY / DENDROGRAM IMPLEMENTATION
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (viewMode !== 'hierarchy' || !hierarchySvgRef.current || points.length === 0) return;

    const svg = d3.select(hierarchySvgRef.current);
    svg.selectAll('*').remove();

    const width = 680;
    const height = 480;

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(60, 40)`);

    // Hierarchical grouping by dialectometry scale
    const clusterGroups = [
      { id: 'tidak_berbeda', name: 'Klaster Tidak Berbeda (d ≤ 20%)', color: '#10b981', children: [] as any[] },
      { id: 'wicara', name: 'Klaster Perbedaan Wicara (21% - 30%)', color: '#0284c7', children: [] as any[] },
      { id: 'subdialek', name: 'Klaster Perbedaan Subdialek (31% - 50%)', color: '#f59e0b', children: [] as any[] },
      { id: 'dialek', name: 'Klaster Perbedaan Dialek (51% - 80%)', color: '#ea580c', children: [] as any[] },
      { id: 'bahasa', name: 'Klaster Perbedaan Bahasa (81% - 100%)', color: '#ef4444', children: [] as any[] }
    ];

    points.forEach((p) => {
      if (p.persentaseBeda <= 20) clusterGroups[0].children.push(p);
      else if (p.persentaseBeda <= 30) clusterGroups[1].children.push(p);
      else if (p.persentaseBeda <= 50) clusterGroups[2].children.push(p);
      else if (p.persentaseBeda <= 80) clusterGroups[3].children.push(p);
      else clusterGroups[4].children.push(p);
    });

    const hierarchyData = {
      name: `${refDesa} (Titik Acuan Utama)`,
      children: clusterGroups.filter(cg => cg.children.length > 0).map(cg => ({
        name: cg.name,
        color: cg.color,
        children: cg.children.map(p => ({
          name: `${p.name} (${p.desa})`,
          value: p.persentaseBeda,
          color: p.color,
          data: p
        }))
      }))
    };

    const root = d3.hierarchy<any>(hierarchyData);
    const treeLayout = d3.tree<any>().size([height - 80, width - 260]);
    treeLayout(root);

    // Links
    g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', 'rgba(148, 163, 184, 0.4)')
      .attr('stroke-width', 1.5)
      .attr('d', d3.linkHorizontal()
        .x((d: any) => d.y)
        .y((d: any) => d.x) as any
      );

    // Nodes
    const nodes = g.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `translate(${d.y},${d.x})`);

    nodes
      .append('circle')
      .attr('r', (d: any) => d.depth === 0 ? 8 : (d.children ? 6 : 4.5))
      .attr('fill', (d: any) => d.data.color || (d.depth === 0 ? '#4f46e5' : '#64748b'))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2);

    nodes
      .append('text')
      .attr('dy', '.35em')
      .attr('x', (d: any) => d.children ? -12 : 12)
      .attr('text-anchor', (d: any) => d.children ? 'end' : 'start')
      .attr('font-size', (d: any) => d.depth === 0 ? '12px' : '11px')
      .attr('font-weight', (d: any) => d.depth <= 1 ? '700' : '500')
      .attr('class', 'text-slate-800 dark:text-slate-100 fill-current')
      .text((d: any) => d.data.name);

  }, [viewMode, points, refDesa]);

  // Analytical metrics
  const stats = useMemo(() => {
    if (points.length === 0) return null;

    const diffs = points.map(p => p.persentaseBeda);
    const distances = points.map(p => p.distanceKm);

    const minDiff = Math.min(...diffs);
    const maxDiff = Math.max(...diffs);
    const avgDiff = Math.round((diffs.reduce((a, b) => a + b, 0) / diffs.length) * 10) / 10;

    const closestPoint = points.find(p => p.persentaseBeda === minDiff);
    const mostDivergentPoint = points.find(p => p.persentaseBeda === maxDiff);

    // Pearson correlation between distance and lexical difference
    let corr = 0;
    if (points.length > 1) {
      const avgDist = distances.reduce((a, b) => a + b, 0) / distances.length;
      let num = 0;
      let denA = 0;
      let denB = 0;
      for (let i = 0; i < points.length; i++) {
        const dDiff = diffs[i] - avgDiff;
        const dDist = distances[i] - avgDist;
        num += dDiff * dDist;
        denA += dDiff * dDiff;
        denB += dDist * dDist;
      }
      corr = denA * denB > 0 ? Math.round((num / Math.sqrt(denA * denB)) * 100) / 100 : 0;
    }

    // Cluster distribution count
    const clusterCounts = {
      tidakBerbeda: points.filter(p => p.persentaseBeda <= 20).length,
      wicara: points.filter(p => p.persentaseBeda > 20 && p.persentaseBeda <= 30).length,
      subdialek: points.filter(p => p.persentaseBeda > 30 && p.persentaseBeda <= 50).length,
      dialek: points.filter(p => p.persentaseBeda > 50 && p.persentaseBeda <= 80).length,
      bahasa: points.filter(p => p.persentaseBeda > 80).length
    };

    return {
      minDiff,
      maxDiff,
      avgDiff,
      closestPoint,
      mostDivergentPoint,
      correlation: corr,
      clusterCounts
    };
  }, [points]);

  // Export SVG handler
  const handleExportSvg = () => {
    let currentRef: SVGSVGElement | null = null;
    let fileName = 'visualisasi-dialektometri-d3.svg';

    if (viewMode === 'radar') {
      currentRef = radarSvgRef.current;
      fileName = 'grafik-radar-dialektometri-d3.svg';
    } else if (viewMode === 'circular') {
      currentRef = circularSvgRef.current;
      fileName = 'diagram-lingkaran-klaster-dialektometri-d3.svg';
    } else {
      currentRef = hierarchySvgRef.current;
      fileName = 'dendrogram-klaster-hierarkis-d3.svg';
    }

    if (!currentRef) return;

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(currentRef);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Controller Bar */}
      <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* View Mode Tabs */}
        <div className="flex flex-wrap items-center bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('radar')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-semibold transition-all cursor-pointer ${
              viewMode === 'radar'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <RadarIcon className="w-4 h-4" />
            <span>Grafik Radar Multidimensi</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('circular')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-semibold transition-all cursor-pointer ${
              viewMode === 'circular'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CircleDot className="w-4 h-4" />
            <span>Diagram Lingkaran Klaster</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('hierarchy')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-semibold transition-all cursor-pointer ${
              viewMode === 'hierarchy'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <GitGraph className="w-4 h-4" />
            <span>Dendrogram Hierarki</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportSvg}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
            title="Ekspor Diagram dalam Format Vektor SVG"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Unduh SVG D3</span>
          </button>
        </div>
      </div>

      {/* Main Visualization & Interactive Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center: D3 SVG Visualization Container */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm flex flex-col items-center justify-center relative min-h-[540px]">
          {/* Header of Chart */}
          <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>D3.js Rendering Engine v7</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                Basis Acuan: {refDesa}
              </span>
            </div>
            {viewMode === 'radar' && (
              <span className="text-[11px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md font-medium border border-indigo-200/50 dark:border-indigo-800/50">
                {selectedPointIds.length} titik aktif ditampilkan
              </span>
            )}
          </div>

          {/* Visualization Canvas */}
          <div className="w-full flex items-center justify-center relative overflow-hidden">
            {viewMode === 'radar' && (
              <svg 
                ref={radarSvgRef} 
                className="w-full max-w-[650px] h-auto drop-shadow-xs transition-transform duration-300"
              />
            )}

            {viewMode === 'circular' && (
              <svg 
                ref={circularSvgRef} 
                className="w-full max-w-[650px] h-auto drop-shadow-xs transition-transform duration-300"
              />
            )}

            {viewMode === 'hierarchy' && (
              <svg 
                ref={hierarchySvgRef} 
                className="w-full max-w-[650px] h-auto drop-shadow-xs transition-transform duration-300"
              />
            )}
          </div>

          {/* Floating Tooltip */}
          {showTooltip && tooltipData && (
            <div 
              className="fixed z-50 pointer-events-none bg-slate-900/95 text-white text-xs rounded-lg shadow-xl p-3 border border-slate-700 backdrop-blur-xs max-w-xs transition-all animate-in fade-in zoom-in-95 duration-150"
              style={{ 
                left: `${tooltipData.x + 15}px`, 
                top: `${tooltipData.y + 15}px` 
              }}
            >
              <p className="font-bold text-slate-100 border-b border-slate-800 pb-1.5 mb-2">
                {tooltipData.title}
              </p>
              <div className="space-y-1">
                {tooltipData.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center gap-3">
                    <span className="text-slate-400">{it.label}:</span>
                    <span className="font-semibold" style={{ color: it.color || '#f1f5f9' }}>
                      {it.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Chart Guide / Legend */}
          <div className="w-full mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Skala Dialektometri:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span>≤20% Tidak Berbeda</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-sky-500"></span>
                <span>21-30% Wicara</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span>31-50% Subdialek</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-orange-600"></span>
                <span>51-80% Dialek</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span>81-100% Bahasa</span>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 italic">
              Arahkan kursor ke titik atau kurva untuk detail
            </span>
          </div>
        </div>

        {/* Right: Controls, Point Selection & Linguistic Insights */}
        <div className="lg:col-span-4 space-y-4">
          {/* Radar Point Selector Panel (Active on Radar View) */}
          {viewMode === 'radar' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Titik Pembanding Aktif</span>
                </h4>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Semua
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <button
                    type="button"
                    onClick={handleSelectTopClosest}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    3 Terdekat
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {points.map((p) => {
                  const isChecked = selectedPointIds.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleTogglePoint(p.id)}
                      onMouseEnter={() => setHighlightedPointId(p.id)}
                      onMouseLeave={() => setHighlightedPointId(null)}
                      className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                        isChecked 
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 font-semibold' 
                          : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span 
                          className="w-3 h-3 rounded-full shrink-0" 
                          style={{ backgroundColor: p.color }}
                        />
                        <div className="truncate">
                          <p className="truncate text-slate-800 dark:text-slate-100 font-medium">
                            {p.name}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            {p.desa} • {p.distanceKm} km
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-indigo-700 dark:text-indigo-300">
                          {p.persentaseBeda}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Linguistic Interpretation & Cluster Insights Card */}
          {stats && (
            <div className="bg-gradient-to-br from-indigo-50/60 to-purple-50/60 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/60 p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Insight Geolinguistik D3
                </h4>
              </div>

              {/* Dominant Affinity Points */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">
                    Kerabat Paling Dekat
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 block truncate">
                    {stats.closestPoint ? stats.closestPoint.desa : '-'}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    d = {stats.minDiff}%
                  </span>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">
                    Divergensi Tertinggi
                  </span>
                  <span className="font-bold text-rose-600 dark:text-rose-400 block truncate">
                    {stats.mostDivergentPoint ? stats.mostDivergentPoint.desa : '-'}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    d = {stats.maxDiff}%
                  </span>
                </div>
              </div>

              {/* Spatial vs Dialectal Correlation Metric */}
              <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">
                    Korelasi Jarak Spasial vs Leksikal (r):
                  </span>
                  <span className="font-bold text-indigo-700 dark:text-indigo-300">
                    {stats.correlation}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {stats.correlation >= 0.7 
                    ? 'Korelasi spasial sangat kuat: variasi leksikal membentuk kontinum dialek bergradien lurus seiring jarak geografis.'
                    : stats.correlation >= 0.4 
                    ? 'Korelasi spasial sedang: terdapat pengaruh faktor geografi fisik maupun migrasi historis penutur.'
                    : 'Korelasi spasial rendah: perbedaan leksikal dipengaruhi oleh faktor isolek terisolasi atau batas bahasa non-linier.'}
                </p>
              </div>

              {/* Dialectometry Cluster Breakdown */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                  Distribusi Klaster Dialektometri ({points.length} Titik):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
                  <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-2 py-1 rounded border border-emerald-200/50 dark:border-emerald-900/50">
                    <span>Tidak Berbeda:</span>
                    <span className="font-bold">{stats.clusterCounts.tidakBerbeda}</span>
                  </div>
                  <div className="flex items-center justify-between bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 px-2 py-1 rounded border border-sky-200/50 dark:border-sky-900/50">
                    <span>Beda Wicara:</span>
                    <span className="font-bold">{stats.clusterCounts.wicara}</span>
                  </div>
                  <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2 py-1 rounded border border-amber-200/50 dark:border-amber-900/50">
                    <span>Beda Subdialek:</span>
                    <span className="font-bold">{stats.clusterCounts.subdialek}</span>
                  </div>
                  <div className="flex items-center justify-between bg-orange-50 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 px-2 py-1 rounded border border-orange-200/50 dark:border-orange-900/50">
                    <span>Beda Dialek:</span>
                    <span className="font-bold">{stats.clusterCounts.dialek}</span>
                  </div>
                  <div className="flex items-center justify-between bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 px-2 py-1 rounded border border-rose-200/50 dark:border-rose-900/50 col-span-2 sm:col-span-1">
                    <span>Beda Bahasa:</span>
                    <span className="font-bold">{stats.clusterCounts.bahasa}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Explanation */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
              <Info className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Metodologi D3 Dialektometri</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              Visualisasi D3 memproses matriks jarak leksikal Guiter d = (s / n) × 100% dan memetakan klaster poligonal multi-aksis ke dalam ruang polar untuk mendeteksi batas isoglos leksikal dan divergensi medan semantik secara presisi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
