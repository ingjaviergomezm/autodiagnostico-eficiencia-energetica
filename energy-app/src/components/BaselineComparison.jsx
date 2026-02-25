import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Target, TrendingDown, TrendingUp, AlertTriangle, RefreshCw, X } from 'lucide-react';

export default function BaselineComparison({ baseline, stats, filteredData, saveBaseline, clearBaseline }) {
    const chartRef = useRef(null);
    const [showConfirm, setShowConfirm] = useState(false);

    // D3 Chart rendering
    useEffect(() => {
        if (!baseline || !chartRef.current) return;

        // Prepare data for Comparison Chart (Location)
        const currentByLoc = {};
        filteredData.forEach(d => {
            currentByLoc[d.localizacion] = (currentByLoc[d.localizacion] || 0) + d.consumo_wh;
        });

        const baseByLoc = {};
        baseline.dataSnapshot.forEach(d => {
            baseByLoc[d.localizacion] = (baseByLoc[d.localizacion] || 0) + d.consumo_wh;
        });

        // Get all unique locations from both sets
        const allLocs = Array.from(new Set([...Object.keys(currentByLoc), ...Object.keys(baseByLoc)]));

        const chartData = allLocs.map(loc => ({
            localizacion: loc,
            Base: (baseByLoc[loc] || 0) / 1000, // kWh
            Actual: (currentByLoc[loc] || 0) / 1000 // kWh
        })).sort((a, b) => b.Base - a.Base).slice(0, 5); // Top 5

        if (chartData.length === 0) return;

        // Clear previous chart
        d3.select(chartRef.current).selectAll('*').remove();

        const margin = { top: 20, right: 20, bottom: 30, left: 60 };
        const width = chartRef.current.clientWidth - margin.left - margin.right;
        const height = 250 - margin.top - margin.bottom;

        const svg = d3.select(chartRef.current)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const subgroups = ['Base', 'Actual'];
        const groups = chartData.map(d => d.localizacion);

        // Add X axis
        const x = d3.scaleBand()
            .domain(groups)
            .range([0, width])
            .padding([0.2]);

        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).tickSizeOuter(0))
            .selectAll('text')
            .attr('class', 'text-xs text-slate-400 font-sans')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .attr('transform', 'rotate(-45)');

        // Add Y axis
        const maxVal = d3.max(chartData, d => Math.max(d.Base, d.Actual));
        const y = d3.scaleLinear()
            .domain([0, maxVal * 1.1])
            .range([height, 0]);

        svg.append('g')
            .call(d3.axisLeft(y).ticks(5).tickFormat(d => d >= 1000 ? `${(d / 1000).toFixed(1)}k` : d))
            .selectAll('text')
            .attr('class', 'text-xs text-slate-400 font-sans');

        // Clean axis lines
        svg.selectAll('.domain').attr('stroke', '#334155');
        svg.selectAll('.tick line').attr('stroke', '#334155');

        // Color palette
        const color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(['#94a3b8', '#0ea5e9']); // Slate for Base, Sky for Actual

        // Another scale for subgroup position
        const xSubgroup = d3.scaleBand()
            .domain(subgroups)
            .range([0, x.bandwidth()])
            .padding([0.05]);

        // Add bars
        svg.append('g')
            .selectAll('g')
            .data(chartData)
            .join('g')
            .attr('transform', d => `translate(${x(d.localizacion)}, 0)`)
            .selectAll('rect')
            .data(d => subgroups.map(key => ({ key, value: d[key] })))
            .join('rect')
            .attr('x', d => xSubgroup(d.key))
            .attr('y', height)
            .attr('width', xSubgroup.bandwidth())
            .attr('height', 0)
            .attr('fill', d => color(d.key))
            .attr('rx', 2)
            .transition()
            .duration(800)
            .attr('y', d => y(d.value))
            .attr('height', d => height - y(d.value));

    }, [baseline, filteredData]);

    const calculateVariation = (base, current) => {
        if (!base) return { val: 0, percent: 0, improved: false };
        const diff = current - base;
        const percent = (diff / base) * 100;
        // ISO 50001: reduction is improvement (true)
        return {
            val: diff,
            percent: percent,
            improved: diff <= 0
        };
    };

    if (!baseline) {
        return (
            <div className="glass-panel p-6 border border-sky-500/30 bg-sky-500/5 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
                            <Target className="text-sky-400" />
                            Línea Base Energética (EnB)
                        </h3>
                        <p className="text-slate-400 text-sm max-w-2xl">
                            La norma ISO 50001 requiere establecer una Línea Base Energética para cuantificar el desempeño a lo largo del tiempo. Establezca el estado actual como su punto de referencia.
                        </p>
                    </div>
                    <button
                        onClick={saveBaseline}
                        className="btn-primary flex items-center gap-2 whitespace-nowrap"
                    >
                        <Target size={18} />
                        Establecer Línea Base Actual
                    </button>
                </div>
            </div>
        );
    }

    const varConsumo = calculateVariation(baseline.totalConsumo, stats.totalConsumo);
    const varCosto = calculateVariation(baseline.totalCosto, stats.totalCosto);

    return (
        <div className="glass-panel p-6 border border-slate-700/50">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Target className="text-sky-400" />
                        Comparativa vs. Línea Base (EnB)
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                        Establecida el {new Date(baseline.date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors"
                    >
                        <RefreshCw size={14} />
                        Actualizar EnB
                    </button>
                    <button
                        onClick={clearBaseline}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm transition-colors"
                        title="Eliminar Línea Base"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            {showConfirm && (
                <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="text-orange-400 shrink-0 mt-0.5" size={20} />
                    <div>
                        <h4 className="font-semibold text-orange-400">¿Actualizar Línea Base?</h4>
                        <p className="text-sm text-slate-300 mt-1 mb-3">
                            Esto sobrescribirá la línea base anterior con el consumo actual. Perderá el registro comparativo anterior.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => { saveBaseline(); setShowConfirm(false); }} className="px-3 py-1 bg-orange-500 text-white text-sm rounded-md font-medium hover:bg-orange-600">Reemplazar</button>
                            <button onClick={() => setShowConfirm(false)} className="px-3 py-1 bg-slate-800 text-slate-300 text-sm rounded-md hover:bg-slate-700">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* KPIs Comparativos */}
                <div className="space-y-4 lg:col-span-1">
                    {/* Tarjeta Consumo */}
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                        <p className="text-sm font-medium text-slate-400 mb-2">Variación de Consumo</p>
                        <div className="flex items-end gap-3 mb-1">
                            <h4 className="text-2xl font-bold">{Math.round(stats.totalConsumo / 1000).toLocaleString('es-CO')} <span className="text-xs font-normal text-slate-400">kWh</span></h4>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Base: {Math.round(baseline.totalConsumo / 1000).toLocaleString('es-CO')}</span>
                            <div className={`flex items-center gap-1 font-semibold ${varConsumo.improved ? 'text-green-400' : 'text-red-400'}`}>
                                {varConsumo.improved ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                                {Math.abs(varConsumo.percent).toFixed(1)}%
                            </div>
                        </div>
                    </div>

                    {/* Tarjeta Costo */}
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                        <p className="text-sm font-medium text-slate-400 mb-2">Variación de Costo</p>
                        <div className="flex items-end gap-3 mb-1">
                            <h4 className="text-2xl font-bold">${Math.round(stats.totalCosto).toLocaleString('es-CO')}</h4>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Base: ${Math.round(baseline.totalCosto).toLocaleString('es-CO')}</span>
                            <div className={`flex items-center gap-1 font-semibold ${varCosto.improved ? 'text-green-400' : 'text-red-400'}`}>
                                {varCosto.improved ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                                {Math.abs(varCosto.percent).toFixed(1)}%
                            </div>
                        </div>
                    </div>

                    {/* Leyenda del gráfico */}
                    <div className="flex gap-4 pt-2 justify-center lg:justify-start">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-slate-400"></div><span className="text-xs text-slate-400">Línea Base</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-sky-500"></div><span className="text-xs text-slate-400">Actual</span></div>
                    </div>
                </div>

                {/* Gráfico Comparativo Agrupado */}
                <div className="lg:col-span-2 bg-slate-900/30 p-4 rounded-xl border border-slate-800 relative">
                    <p className="text-sm font-medium text-slate-400 mb-4 text-center">Consumo por Localización (kWh/mes)</p>
                    <div ref={chartRef} className="w-full h-[250px]"></div>
                </div>
            </div>
        </div>
    );
}
