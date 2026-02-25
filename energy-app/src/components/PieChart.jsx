import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export default function PieChart({ data, categoryKey, valueKey, colors = d3.schemeSet3 }) {
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 300, height: 300 });

    useEffect(() => {
        if (containerRef.current) {
            setDimensions({
                width: containerRef.current.clientWidth,
                height: Math.min(containerRef.current.clientWidth, 300)
            });
        }
    }, []);

    useEffect(() => {
        if (!svgRef.current || !data) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        if (data.length === 0) {
            svg.append("text")
                .attr("x", dimensions.width / 2)
                .attr("y", dimensions.height / 2)
                .text("Sin datos")
                .attr("text-anchor", "middle")
                .attr("fill", "#94a3b8")
                .style("font-size", "14px");
            return;
        }

        const rolled = d3.rollup(data, v => d3.sum(v, d => d[valueKey]), d => d[categoryKey]);
        let chartData = Array.from(rolled, ([key, value]) => ({ key, value })).sort((a, b) => b.value - a.value);

        // Group others if too many
        if (chartData.length > 5) {
            const top5 = chartData.slice(0, 5);
            const others = chartData.slice(5).reduce((acc, curr) => acc + curr.value, 0);
            chartData = [...top5, { key: "Otros", value: others }];
        }

        const width = dimensions.width;
        const height = dimensions.height;
        const radius = Math.min(width, height) / 2 - 10;

        const g = svg.append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        const color = d3.scaleOrdinal(colors);
        const pie = d3.pie().value(d => d.value).sort(null);
        const arc = d3.arc().innerRadius(radius * 0.55).outerRadius(radius); // Donut style
        const arcLabel = d3.arc().innerRadius(radius * 0.75).outerRadius(radius * 0.75); // For label positioning

        const arcs = g.selectAll(".arc")
            .data(pie(chartData))
            .join("g")
            .attr("class", "arc");

        const paths = arcs.append("path")
            .attr("d", arc)
            .attr("fill", d => color(d.data.key))
            .attr("stroke", "#0f172a") // match background
            .style("stroke-width", "3px")
            .on("mouseenter", function () { d3.select(this).attr("opacity", 0.8).attr("transform", "scale(1.05)"); })
            .on("mouseleave", function () { d3.select(this).attr("opacity", 1).attr("transform", "scale(1)"); })
            .style("transition", "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)");

        paths.append("title")
            .text(d => `${d.data.key}\n${Math.round(d.data.value).toLocaleString('es-CO')}`);

        const totalValue = d3.sum(chartData, d => d.value);

        arcs.append("text")
            .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .attr("fill", "#ffffff")
            .style("font-size", "11px")
            .style("font-weight", "600")
            .style("pointer-events", "none")
            .style("text-shadow", "0 1px 3px rgba(0,0,0,0.9)")
            .text(d => {
                // Solo mostrar la etiqueta si la tajada es mayor al 5%
                if (d.data.value / totalValue > 0.05) {
                    const shortVal = valueKey === 'costo' ? `$${Math.round(d.data.value / 1000)}k` : `${Math.round(d.data.value / 1000)}k`;
                    return `${d.data.key}`; // You can return `${d.data.key} (${shortVal})` if you want value directly
                }
                return "";
            });

        arcs.append("text")
            .attr("transform", d => `translate(${arcLabel.centroid(d)[0]}, ${arcLabel.centroid(d)[1] + 12})`)
            .attr("text-anchor", "middle")
            .attr("fill", "#e2e8f0")
            .style("font-size", "10px")
            .style("font-weight", "500")
            .style("pointer-events", "none")
            .style("text-shadow", "0 1px 2px rgba(0,0,0,0.9)")
            .text(d => {
                if (d.data.value / totalValue > 0.05) {
                    return valueKey === 'costo' ? `$${Math.round(d.data.value / 1000)}k` : `${Math.round(d.data.value / 1000)}k Wh`;
                }
                return "";
            });

    }, [data, categoryKey, valueKey, colors, dimensions]);

    return (
        <div ref={containerRef} className="w-full flex justify-center items-center h-[300px]">
            <svg ref={svgRef} width={dimensions.width} height={dimensions.height} style={{ overflow: 'visible' }} />
        </div>
    );
}
