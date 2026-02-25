import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { TrendingUp, TrendingDown, Save, CalendarClock, Trash2 } from 'lucide-react';

export default function TimelineChart({ history, saveMonthlyRecord, clearHistory }) {
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 300 });

    useEffect(() => {
        const resizeObserver = new ResizeObserver(entries => {
            if (entries[0] && entries[0].contentRect.width > 0) {
                setDimensions({
                    width: entries[0].contentRect.width,
                    height: 300
                });
            }
        });
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }
        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        if (!history || history.length === 0 || dimensions.width === 0) return;

        const { width, height } = dimensions;
        const margin = { top: 20, right: 60, bottom: 40, left: 60 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        // Clear previous render
        d3.select(svgRef.current).selectAll('*').remove();

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Format data
        const data = history.map((d, i) => ({
            ...d,
            index: i,
            kwh: d.totalConsumo / 1000
        }));

        // Scales
        const xScale = d3.scalePoint()
            .domain(data.map(d => d.month))
            .range([0, innerWidth])
            .padding(0.5);

        const yConsumoScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.kwh) * 1.2])
            .range([innerHeight, 0]);

        const yCostoScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.totalCosto) * 1.2])
            .range([innerHeight, 0]);

        // Lines
        const lineConsumo = d3.line()
            .x(d => xScale(d.month))
            .y(d => yConsumoScale(d.kwh))
            .curve(d3.curveMonotoneX);

        const lineCosto = d3.line()
            .x(d => xScale(d.month))
            .y(d => yCostoScale(d.totalCosto))
            .curve(d3.curveMonotoneX);

        // Add X axis
        svg.append('g')
            .attr('transform', `translate(0,${innerHeight})`)
            .call(d3.axisBottom(xScale))
            .attr('class', 'text-slate-400 font-sans text-xs')
            .call(g => g.select(".domain").attr("stroke", "currentColor").attr("stroke-opacity", 0.2))
            .call(g => g.selectAll(".tick line").attr("stroke", "none"));

        // Add Y axis (Consumo - Left)
        svg.append('g')
            .call(d3.axisLeft(yConsumoScale).ticks(5).tickFormat(d => `${d}k`))
            .attr('class', 'text-sky-400 font-sans text-xs')
            .call(g => g.select(".domain").attr("stroke", "currentColor").attr("stroke-opacity", 0.5))
            .call(g => g.selectAll(".tick line").attr("stroke", "currentColor").attr("stroke-opacity", 0.1).attr("x2", innerWidth));

        // Add Y axis (Costo - Right)
        svg.append('g')
            .attr('transform', `translate(${innerWidth},0)`)
            .call(d3.axisRight(yCostoScale).ticks(5).tickFormat(d => `$${(d / 1000000).toFixed(1)}M`))
            .attr('class', 'text-green-400 font-sans text-xs')
            .call(g => g.select(".domain").attr("stroke", "currentColor").attr("stroke-opacity", 0.5))
            .call(g => g.selectAll(".tick line").attr("stroke", "none"));

        // Add Consumo Line
        svg.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', '#38bdf8') // sky-400
            .attr('stroke-width', 3)
            .attr('d', lineConsumo);

        // Add Costo Line
        svg.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', '#4ade80') // green-400
            .attr('stroke-width', 3)
            .attr('d', lineCosto);

        // Add dots and tooltips
        const tooltip = d3.select(containerRef.current)
            .append("div")
            .attr("class", "absolute opacity-0 bg-slate-800 text-white p-3 rounded-lg border border-slate-700 pointer-events-none shadow-xl transition-opacity z-50 text-sm")
            .style("left", "0px")
            .style("top", "0px");

        // Consumo Dots
        svg.selectAll(".dot-consumo")
            .data(data)
            .join("circle")
            .attr("class", "dot-consumo cursor-pointer transition-all hover:r-5")
            .attr("cx", d => xScale(d.month))
            .attr("cy", d => yConsumoScale(d.kwh))
            .attr("r", 4)
            .attr("fill", "#0f172a")
            .attr("stroke", "#38bdf8")
            .attr("stroke-width", 2)
            .on("mouseover", (event, d) => {
                d3.select(event.currentTarget).attr("r", 6).attr("fill", "#38bdf8");
                tooltip.transition().duration(200).style("opacity", 1);
                tooltip.html(`
                    <strong className="block mb-1 border-b border-slate-600 pb-1">${d.month}</strong>
                    <div className="flex items-center gap-2 text-sky-400">
                        <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                        Consumo: ${Math.round(d.kwh).toLocaleString()} kWh
                    </div>
                `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", (event) => {
                d3.select(event.currentTarget).attr("r", 4).attr("fill", "#0f172a");
                tooltip.transition().duration(500).style("opacity", 0);
            });

        // Costo Dots
        svg.selectAll(".dot-costo")
            .data(data)
            .join("circle")
            .attr("class", "dot-costo cursor-pointer transition-all hover:r-5")
            .attr("cx", d => xScale(d.month))
            .attr("cy", d => yCostoScale(d.totalCosto))
            .attr("r", 4)
            .attr("fill", "#0f172a")
            .attr("stroke", "#4ade80")
            .attr("stroke-width", 2)
            .on("mouseover", (event, d) => {
                d3.select(event.currentTarget).attr("r", 6).attr("fill", "#4ade80");
                tooltip.transition().duration(200).style("opacity", 1);
                tooltip.html(`
                    <strong className="block mb-1 border-b border-slate-600 pb-1">${d.month}</strong>
                    <div className="flex items-center gap-2 text-green-400">
                        <span className="w-2 h-2 rounded-full bg-green-400"></span>
                        Costo: $${Math.round(d.totalCosto).toLocaleString()} COP
                    </div>
                `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", (event) => {
                d3.select(event.currentTarget).attr("r", 4).attr("fill", "#0f172a");
                tooltip.transition().duration(500).style("opacity", 0);
            });

        return () => {
            d3.select(containerRef.current).selectAll(".absolute").remove(); // Remove tooltip on unmount
        };

    }, [history, dimensions]);

    // Calculate trend if >= 2 records
    let trend = null;
    let trendValue = 0;
    if (history && history.length >= 2) {
        const last = history[history.length - 1].totalConsumo;
        const prev = history[history.length - 2].totalConsumo;
        trendValue = ((last - prev) / prev) * 100;
        trend = trendValue <= 0 ? 'down' : 'up';
    }

    return (
        <div className="glass-panel p-6 border border-slate-700/50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                        <CalendarClock className="text-purple-400" />
                        Historial y Evolución Temporal
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                        Registra el consumo mensual para identificar tendencias a largo plazo.
                    </p>
                </div>

                <div className="flex gap-3">
                    {history && history.length > 0 && (
                        <button
                            onClick={() => {
                                if (window.confirm('¿Desea limpiar todo el historial?')) clearHistory();
                            }}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 rounded-lg transition-colors border border-slate-700"
                            title="Limpiar Historial"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                    <button
                        onClick={saveMonthlyRecord}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors border border-purple-500/30 font-medium text-sm"
                    >
                        <Save size={16} />
                        Guardar Registro Actual
                    </button>
                </div>
            </div>

            {(!history || history.length === 0) ? (
                <div className="h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-slate-700/50 rounded-xl bg-slate-900/30">
                    <CalendarClock size={48} className="text-slate-600 mb-4" />
                    <p className="text-slate-400 text-center max-w-md">
                        Aún no hay registros históricos. Haz clic en "Guardar Registro Actual" para crear una instantánea del consumo de este mes y comenzar a trazar la línea de tendencia.
                    </p>
                </div>
            ) : (
                <div className="relative">
                    {/* Legend and Trend */}
                    <div className="flex justify-between items-center mb-4 px-4 bg-slate-900/50 py-3 rounded-lg border border-slate-800">
                        <div className="flex gap-6">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-sky-400"></span>
                                <span className="text-sm text-slate-300">Consumo (kWh)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-green-400"></span>
                                <span className="text-sm text-slate-300">Costo (COP)</span>
                            </div>
                        </div>

                        {trend && (
                            <div className={`flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full ${trend === 'down' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                {trend === 'down' ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                                {trend === 'down' ? 'Reducción' : 'Incremento'}: {Math.abs(trendValue).toFixed(1)}% vs mes anterior
                            </div>
                        )}
                    </div>

                    {/* Chart Container */}
                    <div ref={containerRef} className="w-full relative h-[300px]">
                        <svg ref={svgRef}></svg>
                    </div>
                </div>
            )}
        </div>
    );
}
