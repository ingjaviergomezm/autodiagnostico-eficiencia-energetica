import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export default function BarChart({ data, mode = 'consumo' }) {
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 600, height: 300 });

    useEffect(() => {
        if (containerRef.current) {
            setDimensions({
                width: containerRef.current.clientWidth,
                height: 300
            });
        }

        const handleResize = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: 300
                });
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!svgRef.current || !data) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        if (data.length === 0) {
            svg.append("text")
                .attr("x", dimensions.width / 2)
                .attr("y", dimensions.height / 2)
                .text("Sin datos para graficar")
                .attr("text-anchor", "middle")
                .attr("fill", "#94a3b8");
            return;
        }

        const rolled = d3.rollup(data, v => d3.sum(v, d => mode === 'consumo' ? d.consumo_wh : d.costo), d => d.localizacion);
        const chartData = Array.from(rolled, ([key, value]) => ({ key, value })).sort((a, b) => b.value - a.value);

        const width = dimensions.width;
        const height = dimensions.height;
        const margin = { top: 20, right: 20, bottom: 60, left: 60 };

        const x = d3.scaleBand()
            .domain(chartData.map(d => d.key))
            .range([margin.left, width - margin.right])
            .padding(0.2);

        const y = d3.scaleLinear()
            .domain([0, d3.max(chartData, d => d.value)]).nice()
            .range([height - margin.bottom, margin.top]);

        // Gradient
        const defs = svg.append("defs");
        const gradient = defs.append("linearGradient")
            .attr("id", "bar-gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "0%")
            .attr("y2", "100%");
        gradient.append("stop").attr("offset", "0%").attr("stop-color", "#38bdf8"); // sky-400
        gradient.append("stop").attr("offset", "100%").attr("stop-color", "#0284c7"); // sky-600

        // Bars
        svg.append("g")
            .selectAll("rect")
            .data(chartData)
            .join("rect")
            .attr("x", d => x(d.key))
            .attr("y", d => y(d.value))
            .attr("height", d => y(0) - y(d.value))
            .attr("width", x.bandwidth())
            .attr("fill", "url(#bar-gradient)")
            .attr("rx", 4)
            .on("mouseenter", function () { d3.select(this).attr("opacity", 0.8); })
            .on("mouseleave", function () { d3.select(this).attr("opacity", 1); })
            .append("title")
            .text(d => `${d.key}\n${Math.round(d.value).toLocaleString('es-CO')} ${mode === 'consumo' ? 'Wh' : 'COP'}`);

        // X Axis
        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).tickSizeOuter(0))
            .attr("color", "#64748b")
            .selectAll("text")
            .attr("transform", "rotate(-15)")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .style("font-family", "inherit");

        // Y Axis
        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y).ticks(5).tickFormat(d => mode === 'consumo' ? `${d / 1000}k` : `$${d / 1000}k`))
            .attr("color", "#64748b")
            .style("font-family", "inherit");

    }, [data, mode, dimensions]);

    return (
        <div ref={containerRef} className="w-full h-[300px]">
            <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
        </div>
    );
}
