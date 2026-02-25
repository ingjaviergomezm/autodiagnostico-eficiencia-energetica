import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';

const colorScale = {
    'Eléctrica': '#2c3e50',
    'Gas': '#e67e22',
    'Otro': '#7f8c8d',
    'Primer piso': '#2980b9',
    'Segundo Piso': '#3498db',
    'Cocina': '#16a085',
    'Zona Comensales': '#8e44ad',
    'Caja': '#f39c12',
    'Baños': '#95a5a6',
    'Habitación': '#d35400',
    'Sala': '#27ae60'
};

function getNodeColor(name) {
    for (const [key, color] of Object.entries(colorScale)) {
        if (name && name.toLowerCase().includes(key.toLowerCase())) return color;
    }
    return '#475569'; // slate-600
}

export default function EnergySankey({ data, tarifa = 0 }) {
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

    useEffect(() => {
        if (containerRef.current) {
            setDimensions({
                width: containerRef.current.clientWidth,
                height: 400
            });
        }

        const handleResize = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: 400
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
                .text("Agregue equipos para visualizar el flujo")
                .attr("text-anchor", "middle")
                .attr("fill", "#94a3b8");
            return;
        }

        const nodesMap = new Map();
        const links = [];

        data.forEach(d => {
            const link1 = { source: d.tipo, target: d.localizacion, value: Math.max(d.consumo_wh, 0.1) };
            const link2 = { source: d.localizacion, target: d.area, value: Math.max(d.consumo_wh, 0.1) };

            if (d.consumo_wh > 0) {
                links.push(link1, link2);
                nodesMap.set(d.tipo, { name: d.tipo });
                nodesMap.set(d.localizacion, { name: d.localizacion });
                nodesMap.set(d.area, { name: d.area });
            }
        });

        const groupedLinksMap = new Map();
        links.forEach(l => {
            const key = l.source + "->" + l.target;
            if (groupedLinksMap.has(key)) {
                groupedLinksMap.get(key).value += l.value;
            } else {
                groupedLinksMap.set(key, { ...l });
            }
        });

        const groupedLinks = Array.from(groupedLinksMap.values());
        const nodes = Array.from(nodesMap.values());
        const nodeByName = new Map(nodes.map(n => [n.name, n]));

        const graph = {
            nodes: nodes.map(d => Object.assign({}, d)),
            links: groupedLinks.map(l => ({
                source: nodes.findIndex(n => n.name === l.source),
                target: nodes.findIndex(n => n.name === l.target),
                value: l.value
            }))
        };

        const sankeyGenerator = sankey()
            .nodeWidth(15)
            .nodePadding(10)
            .extent([[1, 1], [dimensions.width - 1, dimensions.height - 6]]);

        try {
            sankeyGenerator(graph);
        } catch (e) {
            console.warn("Error Sankey:", e);
            return;
        }

        // Dibujar enlaces
        const link = svg.append("g")
            .attr("fill", "none")
            .attr("stroke-opacity", 0.4)
            .selectAll("g")
            .data(graph.links)
            .join("g")
            .style("mix-blend-mode", "screen");

        const path = link.append("path")
            .attr("d", sankeyLinkHorizontal())
            .attr("stroke", d => {
                const gradientId = `gradient-${d.source.index}-${d.target.index}`;
                const gradient = svg.append("linearGradient")
                    .attr("id", gradientId)
                    .attr("gradientUnits", "userSpaceOnUse")
                    .attr("x1", d.source.x1)
                    .attr("x2", d.target.x0);
                gradient.append("stop").attr("offset", "0%").attr("stop-color", getNodeColor(d.source.name));
                gradient.append("stop").attr("offset", "100%").attr("stop-color", getNodeColor(d.target.name));
                return `url(#${gradientId})`;
            })
            .attr("stroke-width", d => Math.max(1, d.width))
            .style("transition", "stroke-opacity 0.2s")
            .on("mouseover", function () {
                d3.select(this).style("stroke-opacity", 0.8);
            })
            .on("mouseout", function () {
                d3.select(this).style("stroke-opacity", 0.4);
            });

        path.append("title")
            .text(d => {
                const costo = (d.value / 1000) * tarifa;
                return `${d.source.name} → ${d.target.name}\nFlujo: ${Math.round(d.value).toLocaleString('es-CO')} Wh/mes\nCosto: $${Math.round(costo).toLocaleString('es-CO')} COP`;
            });

        // Dibujar nodos
        const node = svg.append("g")
            .selectAll("rect")
            .data(graph.nodes)
            .join("rect")
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("height", d => d.y1 - d.y0)
            .attr("width", d => d.x1 - d.x0)
            .attr("fill", d => getNodeColor(d.name))
            .attr("stroke", "rgba(255,255,255,0.2)")
            .attr("stroke-width", 2)
            .attr("rx", 4)
            .style("cursor", "pointer")
            .style("transition", "fill-opacity 0.2s")
            .on("mouseover", function (event, d) {
                // Highlight related links
                path.style("stroke-opacity", l => l.source.index === d.index || l.target.index === d.index ? 0.8 : 0.1);
                d3.select(this).style("fill-opacity", 0.8);
            })
            .on("mouseout", function () {
                path.style("stroke-opacity", 0.4);
                d3.select(this).style("fill-opacity", 1);
            });

        node.append("title")
            .text(d => {
                const costo = (d.value / 1000) * tarifa;
                return `${d.name}\nTotal: ${Math.round(d.value).toLocaleString('es-CO')} Wh/mes\nCosto: $${Math.round(costo).toLocaleString('es-CO')} COP`;
            });

        // Etiquetas
        svg.append("g")
            .selectAll("text")
            .data(graph.nodes)
            .join("text")
            .attr("x", d => d.x0 < dimensions.width / 2 ? d.x1 + 8 : d.x0 - 8)
            .attr("y", d => (d.y1 + d.y0) / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", d => d.x0 < dimensions.width / 2 ? "start" : "end")
            .attr("fill", "#f8fafc")
            .text(d => d.name)
            .style("font-size", "13px")
            .style("font-weight", "600")
            .style("pointer-events", "none")
            .style("text-shadow", "0 2px 4px rgba(0,0,0,0.9)");

    }, [data, dimensions]);

    return (
        <div ref={containerRef} className="w-full h-96">
            <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
        </div>
    );
}
