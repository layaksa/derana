import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  GitBranch, 
  Sparkles, 
  Download, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Info, 
  Clock, 
  CheckCircle2, 
  Share2,
  Maximize2,
  CircleDot,
  Compass,
  ArrowRight,
  Filter,
  Check,
  Copy,
  Sliders,
  Calendar,
  Layers2,
  TreePine,
  Search,
  ExternalLink
} from 'lucide-react';
import { 
  TitikPengamatan, 
  TitikPembandingDialektometri, 
  SituasiGeografis,
  SurveyRecord,
  KosakataLengkapData 
} from '../../types/linguistic';
import { 
  LanguageLeafItem, 
  PhylogeneticNode, 
  buildPhylogeneticTree, 
  buildDialectometryPhylogeneticData,
  NUSANTARA_HISTORICAL_ERAS,
  getHistoricalEra 
} from '../../utils/phylogeneticTreeEngine';
import { estimateGlottochronologyTimeDepth } from '../../utils/linguisticClassification';

interface DialektometriPhylogeneticTreeProps {
  titikPengamatan: TitikPengamatan;
  situasiGeografis: SituasiGeografis;
  titikPembandingList: TitikPembandingDialektometri[];
  kosakataLengkap?: KosakataLengkapData;
  allSurveys?: SurveyRecord[];
  onSelectPointForComparison?: (pointId: string) => void;
  onNavigateToGlotokronologi?: () => void;
}

export type TreeLayoutMode = 'rectangular' | 'radial' | 'cladogram';

export const DialektometriPhylogeneticTree: React.FC<DialektometriPhylogeneticTreeProps> = ({
  titikPengamatan,
  situasiGeografis,
  titikPembandingList,
  kosakataLengkap,
  allSurveys = [],
  onSelectPointForComparison,
  onNavigateToGlotokronologi
}) => {
  // Visual layout mode: 'rectangular' (horizontal phylogram) | 'radial' (circular 360°) | 'cladogram' (stepped)
  const [layoutMode, setLayoutMode] = useState<TreeLayoutMode>('rectangular');
  // Include standard regional benchmark corpus languages (Sunda Baku, Jawa Banyumas) for calibration
  const [includeBenchmarks, setIncludeBenchmarks] = useState<boolean>(true);
  // Show historical time depth labels on tree branches
  const [showTimeLabels, setShowTimeLabels] = useState<boolean>(true);
  // Filter search for highlighting specific observation points
  const [searchQuery, setSearchQuery] = useState<string>('');
  // Selected node (leaf or ancestral node) for detail drawer
  const [selectedNode, setSelectedNode] = useState<PhylogeneticNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<PhylogeneticNode | null>(null);
  // Copy to clipboard indicator
  const [copiedStatus, setCopiedStatus] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // 1. DATA PREPARATION: Build complete matrix from observation points + comparison points
  const treeModel = useMemo(() => {
    const data = buildDialectometryPhylogeneticData(
      titikPengamatan,
      titikPembandingList,
      allSurveys,
      kosakataLengkap,
      includeBenchmarks
    );

    const root = buildPhylogeneticTree(data.leaves, data.distanceMatrix);
    return {
      root,
      leaves: data.leaves,
      distanceMatrix: data.distanceMatrix,
      timeMatrix: data.timeMatrix,
      maxDivergenceYears: data.maxDivergenceYears
    };
  }, [titikPengamatan, titikPembandingList, allSurveys, kosakataLengkap, includeBenchmarks]);

  // Summary statistics for analytical header
  const stats = useMemo(() => {
    const leaves = treeModel.leaves.filter(l => !l.isReference);
    if (leaves.length === 0) {
      return {
        closest: null,
        farthest: null,
        avgDiff: 0,
        maxYears: 0
      };
    }

    const sorted = [...leaves].sort((a, b) => (a.persentaseBeda ?? 0) - (b.persentaseBeda ?? 0));
    const closest = sorted[0];
    const farthest = sorted[sorted.length - 1];
    const avgDiff = Math.round((leaves.reduce((acc, l) => acc + (l.persentaseBeda ?? 0), 0) / leaves.length) * 10) / 10;
    const maxYears = farthest?.divergenceYears ?? 0;

    return {
      closest,
      farthest,
      avgDiff,
      maxYears
    };
  }, [treeModel.leaves]);

  // 2. D3 RENDER ENGINE: Builds SVG tree with zoom, pan, and smooth transitions
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // clear canvas

    const width = containerRef.current.clientWidth || 880;
    const height = layoutMode === 'radial' ? 680 : Math.max(480, treeModel.leaves.length * 52);

    svg.attr('viewBox', `0 0 ${width} ${height}`)
       .attr('width', '100%')
       .attr('height', height);

    // Filter highlight check helper
    const isHighlighted = (node: any) => {
      if (!searchQuery.trim()) return false;
      const q = searchQuery.toLowerCase().trim();
      const name = (node.data?.name || node.data?.desa || '').toLowerCase();
      const lang = (node.data?.language || '').toLowerCase();
      return name.includes(q) || lang.includes(q);
    };

    // Zoom container
    const gMain = svg.append('g').attr('class', 'tree-root-group');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3.5])
      .on('zoom', (event) => {
        gMain.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    // Convert PhylogeneticNode tree to D3 Hierarchy
    const hierarchyRoot = d3.hierarchy<PhylogeneticNode>(treeModel.root, d => d.children);

    if (layoutMode === 'radial') {
      // ------------------------------------------------------------------------
      // A. RADIAL / CIRCULAR PHYLOGENETIC TREE (D3 Cluster Projection)
      // ------------------------------------------------------------------------
      const radius = Math.min(width, height) / 2 - 90;
      const clusterLayout = d3.cluster<PhylogeneticNode>()
        .size([360, radius])
        .separation((a, b) => (a.parent === b.parent ? 1 : 2) / Math.max(1, a.depth));

      clusterLayout(hierarchyRoot);

      // Center the radial tree
      const gRadial = gMain.append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2})`);

      // Radial concentric background guide circles (representing time epochs)
      const guideRadii = [0.25, 0.5, 0.75, 1.0];
      guideRadii.forEach(ratio => {
        gRadial.append('circle')
          .attr('r', radius * ratio)
          .attr('fill', 'none')
          .attr('stroke', '#94a3b8')
          .attr('stroke-dasharray', '3,3')
          .attr('stroke-opacity', 0.22);
      });

      // Project links
      const radialLink = (d: any) => {
        const angleA = ((d.source.x - 90) * Math.PI) / 180;
        const angleB = ((d.target.x - 90) * Math.PI) / 180;
        const rA = d.source.y;
        const rB = d.target.y;

        const xA = rA * Math.cos(angleA);
        const yA = rA * Math.sin(angleA);
        const xB = rB * Math.cos(angleB);
        const yB = rB * Math.sin(angleB);

        // Circular arc from source to target angle, then straight line to target radius
        return `M ${xA} ${yA} A ${rA} ${rA} 0 0 ${d.target.x > d.source.x ? 1 : 0} ${rA * Math.cos(angleB)} ${rA * Math.sin(angleB)} L ${xB} ${yB}`;
      };

      // Draw branches
      gRadial.selectAll('.branch-path')
        .data(hierarchyRoot.links())
        .enter()
        .append('path')
        .attr('class', 'branch-path')
        .attr('d', radialLink)
        .attr('fill', 'none')
        .attr('stroke', d => (d.target.data.isLeaf ? (d.target.data.color || '#4f46e5') : '#94a3b8'))
        .attr('stroke-width', d => (d.target.data.isLeaf ? 2.2 : 1.8))
        .attr('stroke-opacity', 0.85);

      // Draw Nodes
      const nodeGroups = gRadial.selectAll('.tree-node')
        .data(hierarchyRoot.descendants())
        .enter()
        .append('g')
        .attr('class', 'tree-node')
        .attr('transform', (d: any) => {
          const angle = ((d.x - 90) * Math.PI) / 180;
          const x = d.y * Math.cos(angle);
          const y = d.y * Math.sin(angle);
          return `translate(${x}, ${y})`;
        })
        .style('cursor', 'pointer')
        .on('click', (event, d) => {
          event.stopPropagation();
          setSelectedNode(d.data);
        })
        .on('mouseenter', (_, d) => setHoveredNode(d.data))
        .on('mouseleave', () => setHoveredNode(null));

      // Node circles
      nodeGroups.append('circle')
        .attr('r', d => (d.data.isLeaf ? 6 : (d.data.isReference ? 7 : 4.5)))
        .attr('fill', d => {
          if (d.data.isReference) return '#4338ca';
          if (d.data.isLeaf) return d.data.color || '#10b981';
          return '#64748b';
        })
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2)
        .attr('class', d => (isHighlighted(d) ? 'ring-4 ring-amber-400 animate-pulse' : ''));

      // Radial Leaf Labels
      nodeGroups.filter(d => d.data.isLeaf)
        .append('text')
        .attr('transform', (d: any) => {
          const isRightSide = d.x < 180;
          const rotate = isRightSide ? d.x - 90 : d.x + 90;
          return `rotate(${rotate}) translate(${isRightSide ? 10 : -10}, 4)`;
        })
        .attr('text-anchor', (d: any) => (d.x < 180 ? 'start' : 'end'))
        .attr('font-size', '11px')
        .attr('font-weight', d => (d.data.isReference ? '800' : '600'))
        .attr('fill', d => (d.data.isReference ? '#4338ca' : '#1e293b'))
        .text(d => d.data.name);

    } else {
      // ------------------------------------------------------------------------
      // B. RECTANGULAR PHYLOGRAM / CLADOGRAM (Orthogonal Horizontal Branches)
      // ------------------------------------------------------------------------
      const padding = { top: 40, right: 230, bottom: 50, left: 70 };
      const plotWidth = Math.max(300, width - padding.left - padding.right);
      const plotHeight = Math.max(260, height - padding.top - padding.bottom);

      // Tree cluster layout
      const clusterLayout = d3.cluster<PhylogeneticNode>()
        .size([plotHeight, plotWidth]);

      clusterLayout(hierarchyRoot);

      // In a chronological phylogram, adjust X coordinates based on time depth / height
      const maxTreeHeight = Math.max(0.5, treeModel.root.height);
      hierarchyRoot.each((d: any) => {
        if (layoutMode === 'rectangular') {
          // X proportional to (maxTreeHeight - node.height)
          const normDist = (maxTreeHeight - d.data.height) / maxTreeHeight;
          d.y = padding.left + normDist * plotWidth;
        } else {
          // Cladogram layout
          d.y = padding.left + (d.y ?? 0);
        }
        d.x = padding.top + (d.x ?? 0);
      });

      // Background Chronological Time Grids & Rulers
      const timeGridGroup = gMain.append('g').attr('class', 'time-grids');
      const gridRatios = [0, 0.25, 0.5, 0.75, 1];
      gridRatios.forEach(ratio => {
        const xPos = padding.left + plotWidth * ratio;
        const yearsAgo = Math.round(treeModel.maxDivergenceYears * (1 - ratio));
        const era = getHistoricalEra(yearsAgo);

        timeGridGroup.append('line')
          .attr('x1', xPos)
          .attr('y1', padding.top - 15)
          .attr('x2', xPos)
          .attr('y2', height - padding.bottom + 15)
          .attr('stroke', '#94a3b8')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '3,3')
          .attr('stroke-opacity', 0.25);

        // Header year tag
        timeGridGroup.append('text')
          .attr('x', xPos)
          .attr('y', padding.top - 20)
          .attr('text-anchor', 'middle')
          .attr('font-size', '10px')
          .attr('font-family', 'monospace')
          .attr('font-weight', '700')
          .attr('fill', '#64748b')
          .text(ratio === 1 ? 'Masa Kini (2026 M)' : `± ${yearsAgo.toLocaleString()} thn`);
      });

      // Standard Orthogonal Phylogenetic Branch: Parent (X, Y) -> Child (X, Y)
      // Path: (parent.y, parent.x) -> (parent.y, child.x) -> (child.y, child.x)
      const orthogonalBranch = (d: any) => {
        const pX = d.source.y;
        const pY = d.source.x;
        const cX = d.target.y;
        const cY = d.target.x;
        return `M ${pX} ${pY} L ${pX} ${cY} L ${cX} ${cY}`;
      };

      // Draw branches
      gMain.selectAll('.branch-path')
        .data(hierarchyRoot.links())
        .enter()
        .append('path')
        .attr('class', 'branch-path')
        .attr('d', orthogonalBranch)
        .attr('fill', 'none')
        .attr('stroke', d => (d.target.data.isLeaf ? (d.target.data.color || '#4f46e5') : '#94a3b8'))
        .attr('stroke-width', d => (d.target.data.isLeaf ? 2.4 : 2.0))
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .attr('stroke-opacity', 0.85);

      // Branch time depth labels
      if (showTimeLabels) {
        gMain.selectAll('.branch-label')
          .data(hierarchyRoot.descendants().filter(d => !d.data.isLeaf && d.data.divergenceYears > 0))
          .enter()
          .append('g')
          .attr('class', 'branch-label')
          .attr('transform', (d: any) => `translate(${d.y}, ${d.x})`)
          .each(function(d: any) {
            const el = d3.select(this);
            el.append('rect')
              .attr('x', -35)
              .attr('y', -18)
              .attr('width', 70)
              .attr('height', 15)
              .attr('rx', 4)
              .attr('fill', 'rgba(15, 23, 42, 0.78)');

            el.append('text')
              .attr('text-anchor', 'middle')
              .attr('y', -7)
              .attr('font-size', '9px')
              .attr('font-family', 'monospace')
              .attr('font-weight', '700')
              .attr('fill', '#ffffff')
              .text(`± ${d.data.divergenceYears.toLocaleString()} th`);
          });
      }

      // Draw Nodes
      const nodeGroups = gMain.selectAll('.tree-node')
        .data(hierarchyRoot.descendants())
        .enter()
        .append('g')
        .attr('class', 'tree-node')
        .attr('transform', (d: any) => `translate(${d.y}, ${d.x})`)
        .style('cursor', 'pointer')
        .on('click', (event, d) => {
          event.stopPropagation();
          setSelectedNode(d.data);
        })
        .on('mouseenter', (_, d) => setHoveredNode(d.data))
        .on('mouseleave', () => setHoveredNode(null));

      // Node circles
      nodeGroups.append('circle')
        .attr('r', d => (d.data.isReference ? 7 : (d.data.isLeaf ? 5.5 : 4.5)))
        .attr('fill', d => {
          if (d.data.isReference) return '#4338ca';
          if (d.data.isLeaf) return d.data.color || '#3b82f6';
          return '#64748b';
        })
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2);

      // Leaf Labels
      const leafGroups = nodeGroups.filter(d => d.data.isLeaf);

      // Primary Title Label
      leafGroups.append('text')
        .attr('x', 14)
        .attr('y', 4)
        .attr('font-size', '12px')
        .attr('font-weight', d => (d.data.isReference ? '800' : '600'))
        .attr('fill', d => (d.data.isReference ? '#4338ca' : '#1e293b'))
        .text(d => d.data.name);

      // Subtitle (Bahasa & Persentase Beda)
      leafGroups.append('text')
        .attr('x', 14)
        .attr('y', 17)
        .attr('font-size', '10px')
        .attr('font-family', 'monospace')
        .attr('fill', '#64748b')
        .text(d => {
          if (d.data.isReference) return 'Acuan (0% beda)';
          return `d% ${d.data.persentaseBeda}% • ${d.data.statusHubungan || 'Pembanding'}`;
        });
    }

  }, [treeModel, layoutMode, showTimeLabels, searchQuery]);

  // Reset D3 Zoom & Center
  const handleResetZoom = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(450)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
  };

  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .call(zoomBehaviorRef.current.scaleBy, 1.3);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .call(zoomBehaviorRef.current.scaleBy, 0.77);
  };

  // Export SVG file
  const handleExportSVG = () => {
    if (!svgRef.current) return;
    const svgClone = svgRef.current.cloneNode(true) as SVGSVGElement;
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const svgData = new XMLSerializer().serializeToString(svgClone);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Pohon_Filogenetik_Dialektometri_${titikPengamatan.namaDesa || 'Acuan'}_${new Date().toISOString().slice(0, 10)}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Copy Analysis Summary to Clipboard
  const handleCopySummary = () => {
    const text = `=== RINGKASAN REKONSTRUKSI FILOGENETIK DIALEKTOMETRI ===
Titik Acuan: ${titikPengamatan.namaDesa} (${titikPengamatan.bahasaDigunakan})
Total Titik Terpohonkan: ${treeModel.leaves.length} titik
Kedalaman Waktu Divergensi Maksimum: ± ${treeModel.maxDivergenceYears.toLocaleString()} tahun lalu
Rata-rata Perbedaan Leksikal: ${stats.avgDiff}% (Kognat ${Math.round((100 - stats.avgDiff) * 10) / 10}%)
Titik Terdekat: ${stats.closest?.name || '-'} (${stats.closest?.persentaseBeda}%, ± ${stats.closest?.divergenceYears} thn)
Titik Terjauh: ${stats.farthest?.name || '-'} (${stats.farthest?.persentaseBeda}%, ± ${stats.farthest?.divergenceYears} thn)
Metode: Algoritma UPGMA & Rumus Retensi Swadesh (r = 0.805)
Dihasilkan oleh Sistem Derana Pemetaan Bahasa.`;

    navigator.clipboard.writeText(text);
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-5 transition-all">
      {/* 1. HEADER & CONTROL TOOLBAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
            <TreePine className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Pohon Filogenetik Kekerabatan Dialek (D3.js)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                UPGMA &amp; Glotokronologi
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Rekonstruksi silsilah divergensi titik pengamatan berdasarkan matriks perbedaan leksikal Swadesh 200 glos dan konstanta retensi $r = 0.805$.
            </p>
          </div>
        </div>

        {/* Layout Mode Toggles & Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Layout Mode Segmented Control */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <button
              type="button"
              onClick={() => setLayoutMode('rectangular')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                layoutMode === 'rectangular'
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Filogram Siku</span>
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('radial')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                layoutMode === 'radial'
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <CircleDot className="w-3.5 h-3.5" />
              <span>Radial 360°</span>
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('cladogram')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                layoutMode === 'cladogram'
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Layers2 className="w-3.5 h-3.5" />
              <span>Kladogram</span>
            </button>
          </div>

          {/* Action Buttons */}
          <button
            type="button"
            onClick={handleCopySummary}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            title="Salin Ringkasan Analisis"
          >
            {copiedStatus ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={handleExportSVG}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            title="Unduh Diagram SVG"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Unduh SVG</span>
          </button>
        </div>
      </div>

      {/* 2. ANALYTICAL SUMMARY BENTO CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center justify-between">
            <span>Kedalaman Waktu Rumpun</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-black text-indigo-950 dark:text-indigo-100 font-mono">
            ± {treeModel.maxDivergenceYears.toLocaleString()} thn
          </div>
          <div className="text-[11px] text-indigo-700 dark:text-indigo-300">
            {getHistoricalEra(treeModel.maxDivergenceYears).name}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
            <span>Kekerabatan Terdekat</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="text-base font-black text-emerald-950 dark:text-emerald-100 truncate">
            {stats.closest?.name || '—'}
          </div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-mono">
            d% {stats.closest?.persentaseBeda}% • ± {stats.closest?.divergenceYears} thn
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center justify-between">
            <span>Divergensi Terjauh</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="text-base font-black text-rose-950 dark:text-rose-100 truncate">
            {stats.farthest?.name || '—'}
          </div>
          <div className="text-[11px] text-rose-700 dark:text-rose-300 font-mono">
            d% {stats.farthest?.persentaseBeda}% • ± {stats.farthest?.divergenceYears} thn
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center justify-between">
            <span>Rerata Beda Leksikal</span>
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-black text-amber-950 dark:text-amber-100 font-mono">
            {stats.avgDiff}%
          </div>
          <div className="text-[11px] text-amber-700 dark:text-amber-300">
            Kognat Retensi: {Math.max(0, Math.round((100 - stats.avgDiff) * 10) / 10)}%
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE SEARCH & FILTER CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={includeBenchmarks}
              onChange={(e) => setIncludeBenchmarks(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <span>Sertakan Korpus Acuan Regional (Sunda Priangan, Jawa Banyumas)</span>
          </label>

          <label className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showTimeLabels}
              onChange={(e) => setShowTimeLabels(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <span>Tampilkan Label Tahun Pisah pada Cabang</span>
          </label>
        </div>

        {/* Search highlight */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari titik / desa..."
            className="pl-8 pr-3 py-1 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 w-44"
          />
        </div>
      </div>

      {/* 4. D3 INTERACTIVE CANVAS CONTAINER */}
      <div 
        ref={containerRef}
        className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-b from-slate-50/50 via-white to-slate-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-850 overflow-hidden"
      >
        {/* Floating D3 Zoom & Pan Tools */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 p-1 bg-white/90 dark:bg-slate-850/90 backdrop-blur-xs rounded-xl border border-slate-200 dark:border-slate-700 shadow-md">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Perbesar (Zoom In)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Perkecil (Zoom Out)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Reset Posisi (Center)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Informative Hint */}
        <div className="absolute bottom-3 left-3 z-10 text-[10px] text-slate-400 bg-white/80 dark:bg-slate-900/80 px-2 py-1 rounded-md border border-slate-200/50 dark:border-slate-700/50">
          💡 Geser untuk menggeser kanvas (pan), gulir untuk zoom, klik titik untuk melihat detail.
        </div>

        {/* SVG Element */}
        <svg ref={svgRef} className="w-full cursor-grab active:cursor-grabbing select-none" />
      </div>

      {/* 5. HISTORICAL CHRONOLOGY ERA TICK TAPE */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
          <span>Panduan Era Sejarah Nusantara Terhadap Umur Divergensi Bahasa:</span>
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-[10px]">
          {NUSANTARA_HISTORICAL_ERAS.slice(0, 6).map((era) => (
            <div 
              key={era.name} 
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-0.5"
            >
              <div className="flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: era.color }} />
                <span className="truncate">{era.epoch}</span>
              </div>
              <p className="text-slate-500 truncate">{era.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 6. SELECTED / HOVERED NODE DETAIL MODAL CARD */}
      {(selectedNode || hoveredNode) && (
        <div className="p-4 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs animate-in fade-in transition-all">
          {(() => {
            const active = selectedNode || hoveredNode!;
            return (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-200">
                      {active.isLeaf ? (active.isReference ? 'Titik Acuan Utama' : 'Titik Pengamatan') : 'Nodus Percabangan Leluhur'}
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {active.name}
                    </h4>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300">
                    {active.isLeaf ? (
                      <>
                        Bahasa: <strong>{active.language}</strong> • Wilayah: <strong>{active.province || active.desa}</strong>
                        {active.persentaseBeda !== undefined && (
                          <span> • Beda leksikal terhadap acuan: <strong>{active.persentaseBeda}%</strong> ({active.statusHubungan})</span>
                        )}
                      </>
                    ) : (
                      <>
                        Rekonstruksi percabangan <strong>{active.leafCount} varian turunan</strong>. Perkiraan waktu pisah: <strong>± {active.divergenceYears.toLocaleString()} tahun lalu ({active.separationYearCalendar})</strong>.
                      </>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {active.isLeaf && !active.isReference && onSelectPointForComparison && (
                    <button
                      type="button"
                      onClick={() => onSelectPointForComparison(active.kodeTitik || active.id)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Bandingkan Kata</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                  {selectedNode && (
                    <button
                      type="button"
                      onClick={() => setSelectedNode(null)}
                      className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
                    >
                      Tutup
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
