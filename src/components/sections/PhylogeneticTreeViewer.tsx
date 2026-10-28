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
  TreePine,
  Maximize2,
  CircleDot,
  Copy,
  Check,
  Calendar,
  Layers2
} from 'lucide-react';
import { 
  LanguageLeafItem, 
  PhylogeneticNode, 
  buildPhylogeneticTree, 
  NUSANTARA_HISTORICAL_ERAS,
  getHistoricalEra 
} from '../../utils/phylogeneticTreeEngine';

interface PhylogeneticTreeViewerProps {
  leaves: LanguageLeafItem[];
  distanceMatrix: number[][];
  title?: string;
  subtitle?: string;
}

export const PhylogeneticTreeViewer: React.FC<PhylogeneticTreeViewerProps> = ({
  leaves,
  distanceMatrix,
  title = "Pohon Kekerabatan Filogenetik Bahasa Nusantara",
  subtitle = "Rekonstruksi percabangan bahasa purba berdasarkan matriks perbedaan leksikal Swadesh 200 glos (UPGMA Algoritma & Glotokronologi)."
}) => {
  const [selectedNode, setSelectedNode] = useState<PhylogeneticNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<PhylogeneticNode | null>(null);
  const [showTimeLabels, setShowTimeLabels] = useState<boolean>(true);
  const [layoutMode, setLayoutMode] = useState<'rectangular' | 'radial' | 'cladogram'>('rectangular');
  const [copiedStatus, setCopiedStatus] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // Build tree data safely
  const treeModel = useMemo(() => {
    const root = buildPhylogeneticTree(leaves, distanceMatrix);
    return {
      root,
      maxDivergenceYears: root.divergenceYears || 1500
    };
  }, [leaves, distanceMatrix]);

  // Render D3 Tree
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = containerRef.current.clientWidth || 840;
    const height = layoutMode === 'radial' ? 660 : Math.max(420, leaves.length * 48);

    svg.attr('viewBox', `0 0 ${width} ${height}`)
       .attr('width', '100%')
       .attr('height', height);

    const gMain = svg.append('g').attr('class', 'tree-viewport');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3.5])
      .on('zoom', (event) => {
        gMain.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    const hierarchyRoot = d3.hierarchy<PhylogeneticNode>(treeModel.root, d => d.children);

    if (layoutMode === 'radial') {
      // Radial / Circular projection
      const radius = Math.min(width, height) / 2 - 85;
      const clusterLayout = d3.cluster<PhylogeneticNode>()
        .size([360, radius])
        .separation((a, b) => (a.parent === b.parent ? 1 : 2) / Math.max(1, a.depth));

      clusterLayout(hierarchyRoot);

      const gRadial = gMain.append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2})`);

      // Guide concentric rings
      [0.33, 0.66, 1.0].forEach(ratio => {
        gRadial.append('circle')
          .attr('r', radius * ratio)
          .attr('fill', 'none')
          .attr('stroke', '#94a3b8')
          .attr('stroke-dasharray', '3,3')
          .attr('stroke-opacity', 0.2);
      });

      const radialLink = (d: any) => {
        const angleA = ((d.source.x - 90) * Math.PI) / 180;
        const angleB = ((d.target.x - 90) * Math.PI) / 180;
        const rA = d.source.y;
        const rB = d.target.y;

        const xA = rA * Math.cos(angleA);
        const yA = rA * Math.sin(angleA);
        const xB = rB * Math.cos(angleB);
        const yB = rB * Math.sin(angleB);

        return `M ${xA} ${yA} A ${rA} ${rA} 0 0 ${d.target.x > d.source.x ? 1 : 0} ${rA * Math.cos(angleB)} ${rA * Math.sin(angleB)} L ${xB} ${yB}`;
      };

      gRadial.selectAll('.branch-path')
        .data(hierarchyRoot.links())
        .enter()
        .append('path')
        .attr('class', 'branch-path')
        .attr('d', radialLink)
        .attr('fill', 'none')
        .attr('stroke', d => (d.target.data.isLeaf ? (d.target.data.color || '#4f46e5') : '#94a3b8'))
        .attr('stroke-width', 2)
        .attr('stroke-opacity', 0.85);

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

      nodeGroups.append('circle')
        .attr('r', d => (d.data.isLeaf ? 6 : 4.5))
        .attr('fill', d => (d.data.isLeaf ? (d.data.color || '#10b981') : '#64748b'))
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2);

      nodeGroups.filter(d => d.data.isLeaf)
        .append('text')
        .attr('transform', (d: any) => {
          const isRightSide = d.x < 180;
          const rotate = isRightSide ? d.x - 90 : d.x + 90;
          return `rotate(${rotate}) translate(${isRightSide ? 10 : -10}, 4)`;
        })
        .attr('text-anchor', (d: any) => (d.x < 180 ? 'start' : 'end'))
        .attr('font-size', '11px')
        .attr('font-weight', '700')
        .attr('fill', '#1e293b')
        .text(d => d.data.name);

    } else {
      // Rectangular / Cladogram horizontal layout
      const padding = { top: 40, right: 200, bottom: 45, left: 60 };
      const plotWidth = Math.max(300, width - padding.left - padding.right);
      const plotHeight = Math.max(260, height - padding.top - padding.bottom);

      const clusterLayout = d3.cluster<PhylogeneticNode>()
        .size([plotHeight, plotWidth]);

      clusterLayout(hierarchyRoot);

      const maxTreeHeight = Math.max(0.5, treeModel.root.height);
      hierarchyRoot.each((d: any) => {
        if (layoutMode === 'rectangular') {
          const normDist = (maxTreeHeight - d.data.height) / maxTreeHeight;
          d.y = padding.left + normDist * plotWidth;
        } else {
          d.y = padding.left + (d.y ?? 0);
        }
        d.x = padding.top + (d.x ?? 0);
      });

      // Background Chronological Time Rulers
      const timeGridGroup = gMain.append('g').attr('class', 'time-grids');
      const gridRatios = [0, 0.25, 0.5, 0.75, 1];
      gridRatios.forEach(ratio => {
        const xPos = padding.left + plotWidth * ratio;
        const yearsAgo = Math.round(treeModel.maxDivergenceYears * (1 - ratio));

        timeGridGroup.append('line')
          .attr('x1', xPos)
          .attr('y1', padding.top - 15)
          .attr('x2', xPos)
          .attr('y2', height - padding.bottom + 15)
          .attr('stroke', '#94a3b8')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '3,3')
          .attr('stroke-opacity', 0.25);

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

      const orthogonalBranch = (d: any) => {
        const pX = d.source.y;
        const pY = d.source.x;
        const cX = d.target.y;
        const cY = d.target.x;
        return `M ${pX} ${pY} L ${pX} ${cY} L ${cX} ${cY}`;
      };

      gMain.selectAll('.branch-path')
        .data(hierarchyRoot.links())
        .enter()
        .append('path')
        .attr('class', 'branch-path')
        .attr('d', orthogonalBranch)
        .attr('fill', 'none')
        .attr('stroke', d => (d.target.data.isLeaf ? (d.target.data.color || '#4f46e5') : '#94a3b8'))
        .attr('stroke-width', 2.2)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .attr('stroke-opacity', 0.85);

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
              .attr('x', -34)
              .attr('y', -18)
              .attr('width', 68)
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

      nodeGroups.append('circle')
        .attr('r', d => (d.data.isLeaf ? 5.5 : 4.5))
        .attr('fill', d => (d.data.isLeaf ? (d.data.color || '#3b82f6') : '#64748b'))
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2);

      const leafGroups = nodeGroups.filter(d => d.data.isLeaf);

      leafGroups.append('text')
        .attr('x', 14)
        .attr('y', 4)
        .attr('font-size', '12px')
        .attr('font-weight', '700')
        .attr('fill', '#1e293b')
        .text(d => d.data.name);

      leafGroups.append('text')
        .attr('x', 14)
        .attr('y', 17)
        .attr('font-size', '10px')
        .attr('font-family', 'monospace')
        .attr('fill', '#64748b')
        .text(d => d.data.province || d.data.language || '');
    }

  }, [treeModel, layoutMode, showTimeLabels, leaves.length]);

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

  const handleExportSVG = () => {
    if (!svgRef.current) return;
    const svgClone = svgRef.current.cloneNode(true) as SVGSVGElement;
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const svgData = new XMLSerializer().serializeToString(svgClone);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Pohon_Filogenetik_Nusantara_${new Date().toISOString().slice(0, 10)}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySummary = () => {
    const text = `=== POHON FILOGENETIK BAHASA NUSANTARA ===
Divergensi Maksimum: ± ${treeModel.maxDivergenceYears.toLocaleString()} tahun lalu
Jumlah Bahasa Teranalisis: ${leaves.length} varian
Metode: Algoritma UPGMA & Rumus Retensi Swadesh (r = 0.805)
Dihasilkan oleh Sistem Derana Pemetaan Bahasa.`;

    navigator.clipboard.writeText(text);
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4 transition-all">
      {/* 1. HEADER & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{title}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                UPGMA &amp; D3.js
              </span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center shrink-0">
          {/* Layout Mode Toggles */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <button
              type="button"
              onClick={() => setLayoutMode('rectangular')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                layoutMode === 'rectangular'
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Siku</span>
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('radial')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                layoutMode === 'radial'
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <CircleDot className="w-3.5 h-3.5" />
              <span>Radial</span>
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('cladogram')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                layoutMode === 'cladogram'
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Layers2 className="w-3.5 h-3.5" />
              <span>Kladogram</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowTimeLabels(!showTimeLabels)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              showTimeLabels
                ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5 inline mr-1 text-indigo-500" />
            <span>Label Waktu</span>
          </button>

          <button
            type="button"
            onClick={handleCopySummary}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            title="Salin Ringkasan"
          >
            {copiedStatus ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleExportSVG}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Unduh SVG</span>
          </button>
        </div>
      </div>

      {/* 2. CHRONOLOGICAL TIME DEPTH RULER */}
      <div className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>Akar Purba (*Proto-Language*)</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">± {treeModel.maxDivergenceYears.toLocaleString()} thn lalu</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Skala Divergensi: <strong>Kiri (Purba) → Kanan (Kontemporer)</strong></span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
      </div>

      {/* 3. D3 SVG CANVAS */}
      <div 
        ref={containerRef}
        className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50/40 via-white to-slate-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-850 p-2"
      >
        {/* Floating Zoom Controls */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 p-1 bg-white/90 dark:bg-slate-850/90 backdrop-blur-xs rounded-xl border border-slate-200 dark:border-slate-700 shadow-md">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <svg ref={svgRef} className="w-full cursor-grab active:cursor-grabbing select-none" />
      </div>

      {/* 4. HISTORICAL ERAS */}
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

      {/* 5. SELECTED / HOVERED NODE DETAIL CARD */}
      {(selectedNode || hoveredNode) && (
        <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {(() => {
            const node = selectedNode || hoveredNode!;
            return (
              <>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-0.5">
                    {node.isLeaf ? 'Detail Varian Bahasa Terpilih' : 'Titik Percabangan Purba (*Nodus Leluhur*)'}
                  </span>
                  <div className="flex items-center gap-2">
                    <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {node.name}
                    </h5>
                    {!node.isLeaf && (
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                        {node.leafCount} varian turunan
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mt-1">
                    {node.isLeaf 
                      ? `Varian bahasa daerah aktif di ${node.province || 'wilayah survei'}.`
                      : `Estimasi divergensi leksikal: ± ${node.divergenceYears.toLocaleString()} tahun lalu (${node.divergenceCentury}).`}
                  </p>
                </div>

                {selectedNode && (
                  <button
                    type="button"
                    onClick={() => setSelectedNode(null)}
                    className="self-end sm:self-center px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
                  >
                    Tutup Info
                  </button>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};
