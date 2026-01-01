
// Variables globales
let currentCostoPorWh = 0.85843;
let rawData = [];

// Elementos de Gráficos
let energyTableBody;
let sankeySvg, sankeyTooltipDiv, barChartSvg, chartTooltip;
let pieAreaConsumptionSvg, pieEnergyTypeCostSvg, pieTopEquipmentSvg, scatterPlotSvg;
let sankeyChartWidth;
const sankeyChartHeight = 600;
const defaultNodeColor = '#bdc3c7'; // Gris neutro

const colorScale = {
    // Definición de colores corporativos
    'Eléctrica': '#2c3e50',   // Azul Oscuro
    'Gas': '#e67e22',         // Naranja
    'Otro': '#7f8c8d',        // Gris
    'Primer piso': '#2980b9', // Azul medio
    'Segundo Piso': '#3498db',// Azul claro
    'Cocina': '#16a085',      // Verde azulado
    'Zona Comensales': '#8e44ad', // Morado corporativo
    'Caja': '#f39c12',        // Amarillo ocre
    'Baños': '#95a5a6',       // Gris claro
    'Habitación': '#d35400',  // Rojo ladrillo
    'Sala': '#27ae60'         // Verde esmeralda
};

// --- CONFIGURACIÓN DE USUARIO (API KEY & NOMBRE) ---
const CONFIG_KEY = 'iso50001_app_config';
let userConfig = {
    name: '',
    apiKey: ''
};

function loadConfig() {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) {
        userConfig = JSON.parse(stored);
        // Ensure the provided key is used if the stored one is missing or different
        // This ensures the user's request "Usa esta API Key" is honored
        if (!userConfig.apiKey) {
            userConfig.apiKey = '';
        }
    }
}

function saveConfig() {
    const nameInput = document.getElementById('config-user-name');
    const keyInput = document.getElementById('config-api-key');

    userConfig.name = nameInput.value.trim();
    userConfig.apiKey = keyInput.value.trim();

    localStorage.setItem(CONFIG_KEY, JSON.stringify(userConfig));
    alert('Configuración guardada correctamente.');
    closeModal();
}

function openModal() {
    const modal = document.getElementById('config-modal');
    const nameInput = document.getElementById('config-user-name');
    const keyInput = document.getElementById('config-api-key');

    nameInput.value = userConfig.name;
    keyInput.value = userConfig.apiKey;

    modal.classList.add('visible');
    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('config-modal');
    modal.classList.remove('visible');
    modal.style.display = 'none';
}

function checkApiKey() {
    if (!userConfig.apiKey) {
        openModal();
    }
}

// --- UTILIDADES ---
function checkElement(id, critical = false) {
    const element = document.getElementById(id);
    if (!element) {
        if (critical) {
            console.error(`ERROR CRÍTICO: Elemento '${id}' no encontrado.`);
        } else {
            console.warn(`Advertencia: Elemento '${id}' no encontrado.`);
        }
    }
    return element;
}

function getNodeColor(name) {
    for (const [key, color] of Object.entries(colorScale)) {
        if (name && name.toLowerCase().includes(key.toLowerCase())) return color;
    }
    return defaultNodeColor;
}

// --- LÓGICA DE TABLA ---
function addRowToEnergyTable() {
    if (!energyTableBody) return;
    const newRow = energyTableBody.insertRow();
    newRow.innerHTML = `
        <td><select class="data-input tipo-energia"><option value="Eléctrica" selected>Eléctrica</option><option value="Gas">Gas</option><option value="Otro">Otro</option></select></td>
        <td><input type="text" class="data-input localizacion" value=""></td>
        <td><input type="text" class="data-input area" value=""></td>
        <td><input type="text" class="data-input equipo" value=""></td>
        <td><input type="number" class="data-input cantidad" value="1" min="0" step="1"></td>
        <td><input type="number" class="data-input potencia" value="0" min="0"></td>
        <td><input type="number" class="data-input horas" value="0" min="0" max="24" step="0.1"></td>
        <td><input type="number" class="data-input dias-mes" value="30" min="1" max="31" step="1"></td>
        <td><input type="number" class="data-input factor-carga" value="1" step="0.01" min="0" max="1"></td>
        <td><input type="number" class="data-input factor-simultaneidad" value="1" step="0.01" min="0" max="1"></td>
        <td><span class="calculated-field consumo-dia">0</span></td>
        <td><span class="calculated-field consumo-mes">0</span></td>
        <td><span class="calculated-field costo-mes">0</span></td>
        <td><button class="delete-row-btn" onclick="deleteRowFromEnergyTable(this)">Eliminar</button></td>
    `;
    const inputs = newRow.querySelectorAll('.data-input');
    inputs.forEach(input => {
        input.addEventListener('input', processTableDataAndCalculate);
        if (input.tagName === 'SELECT') input.addEventListener('change', processTableDataAndCalculate);
    });
}

// Global scope para onclick inline
window.deleteRowFromEnergyTable = function (button) {
    const row = button.parentNode.parentNode;
    if (energyTableBody.rows.length > 1) {
        row.parentNode.removeChild(row);
    } else {
        row.querySelectorAll('input').forEach(i => i.value = (i.type === 'number' && !i.classList.contains('potencia') && !i.classList.contains('horas')) ? 1 : '');
        row.querySelector('select').selectedIndex = 0;
        processTableDataAndCalculate();
    }
    processTableDataAndCalculate();
};

function processTableDataAndCalculate() {
    const tarifaInput = checkElement('tarifa-energia');
    currentCostoPorWh = tarifaInput ? (parseFloat(tarifaInput.value) || 0.85843) : 0.85843;

    if (!energyTableBody) return;

    const newRawData = [];
    const uniqueEnergia = new Set();
    const uniqueLocalizacion = new Set();
    const uniqueArea = new Set();

    for (let i = 0; i < energyTableBody.rows.length; i++) {
        const row = energyTableBody.rows[i];
        const cells = row.cells;

        const tipo = cells[0].querySelector('select').value;
        const localizacion = cells[1].querySelector('input').value.trim() || "Sin Localización";
        const area = cells[2].querySelector('input').value.trim() || "Sin Área";
        const equipo = cells[3].querySelector('input').value.trim() || "Equipo Genérico";

        const cantidad = parseFloat(cells[4].querySelector('input').value) || 0;
        const potencia = parseFloat(cells[5].querySelector('input').value) || 0;
        const horas = parseFloat(cells[6].querySelector('input').value) || 0;
        const diasMes = parseFloat(cells[7].querySelector('input').value) || 30;
        const fCarga = parseFloat(cells[8].querySelector('input').value) || 1;
        const fSimult = parseFloat(cells[9].querySelector('input').value) || 1;

        const consumoDia = cantidad * potencia * horas * fCarga * fSimult;
        const consumoMes = consumoDia * diasMes;
        const costoMes = consumoMes * currentCostoPorWh;

        cells[10].querySelector('span').textContent = consumoDia.toLocaleString('es-CO', { maximumFractionDigits: 2 });
        cells[11].querySelector('span').textContent = consumoMes.toLocaleString('es-CO', { maximumFractionDigits: 2 });
        cells[12].querySelector('span').textContent = costoMes.toLocaleString('es-CO', { maximumFractionDigits: 0 });

        if (consumoMes > 0) {
            newRawData.push({
                tipo, localizacion, area, equipo, cantidad, potencia, horas, diasMes, fCarga, fSimult,
                consumo_wh: consumoMes, costo: costoMes
            });
            uniqueEnergia.add(tipo);
            uniqueLocalizacion.add(localizacion);
            uniqueArea.add(area);
        }
    }
    rawData = newRawData;
    populateFilterOptions(uniqueEnergia, uniqueLocalizacion, uniqueArea);
    applyFiltersAndRender();
}

function populateFilterOptions(energiaSet, localizacionSet, areaSet) {
    const updateSelect = (id, set) => {
        const select = checkElement(id);
        if (!select) return;
        const currentVal = select.value;
        select.innerHTML = '<option value="all">Todos</option>';
        set.forEach(item => {
            const opt = document.createElement('option');
            opt.value = item;
            opt.textContent = item;
            select.appendChild(opt);
        });
        if (Array.from(select.options).some(o => o.value === currentVal)) select.value = currentVal;
    };

    updateSelect('filter-energia', energiaSet);
    updateSelect('filter-localizacion', localizacionSet);
    updateSelect('filter-area', areaSet);
}

function getFilteredData() {
    const fEnergia = checkElement('filter-energia')?.value || 'all';
    const fLocal = checkElement('filter-localizacion')?.value || 'all';
    const fArea = checkElement('filter-area')?.value || 'all';
    const fRango = checkElement('filter-consumo')?.value || 'all';

    return rawData.filter(d => {
        if (fEnergia !== 'all' && d.tipo !== fEnergia) return false;
        if (fLocal !== 'all' && d.localizacion !== fLocal) return false;
        if (fArea !== 'all' && d.area !== fArea) return false;

        if (fRango === 'low' && d.consumo_wh >= 10000) return false;
        if (fRango === 'mid' && (d.consumo_wh < 10000 || d.consumo_wh > 50000)) return false;
        if (fRango === 'high' && d.consumo_wh <= 50000) return false;

        return true;
    });
}

function updateStats(data) {
    const totalConsumo = data.reduce((acc, curr) => acc + curr.consumo_wh, 0);
    const totalCosto = data.reduce((acc, curr) => acc + curr.costo, 0);

    checkElement('total-consumo').textContent = totalConsumo.toLocaleString('es-CO', { maximumFractionDigits: 0 });
    checkElement('total-costo').textContent = '$' + totalCosto.toLocaleString('es-CO', { maximumFractionDigits: 0 });
    checkElement('equipos-activos').textContent = data.length;
}

// --- GRÁFICOS (D3.js) ---

// 1. Sankey Diagram
function renderSankeyChart(data) {
    if (!sankeySvg || !d3.sankey) return;
    sankeySvg.selectAll('*').remove();

    if (data.length === 0) {
        sankeySvg.append("text").attr("x", sankeyChartWidth / 2).attr("y", sankeyChartHeight / 2).text("Sin datos").attr("text-anchor", "middle");
        return;
    }

    const nodesMap = new Map();
    const links = [];

    data.forEach(d => {
        const link1 = { source: d.tipo, target: d.localizacion, value: d.consumo_wh };
        const link2 = { source: d.localizacion, target: d.area, value: d.consumo_wh };

        if (d.consumo_wh > 0) {
            links.push(link1, link2);
            nodesMap.set(d.tipo, { name: d.tipo });
            nodesMap.set(d.localizacion, { name: d.localizacion });
            nodesMap.set(d.area, { name: d.area });
        }
    });

    const groupedLinks = [];
    const linkKeys = new Map();

    links.forEach(l => {
        const key = l.source + "->" + l.target;
        if (linkKeys.has(key)) {
            linkKeys.get(key).value += l.value;
        } else {
            const newLink = { ...l };
            linkKeys.set(key, newLink);
            groupedLinks.push(newLink);
        }
    });

    const nodes = Array.from(nodesMap.values());
    const nodeByName = new Map(nodes.map(n => [n.name, n]));

    const graph = {
        nodes: nodes,
        links: groupedLinks.map(l => ({
            source: nodeByName.get(l.source),
            target: nodeByName.get(l.target),
            value: l.value
        }))
    };

    const sankey = d3.sankey()
        .nodeWidth(15)
        .nodePadding(10)
        .extent([[1, 1], [sankeyChartWidth - 1, sankeyChartHeight - 6]]);

    try {
        sankey(graph);
    } catch (e) {
        console.warn("Error generando Sankey (posible ciclo o dato inválido):", e);
        return;
    }

    const link = sankeySvg.append("g")
        .attr("fill", "none")
        .attr("stroke-opacity", 0.5)
        .selectAll("g")
        .data(graph.links)
        .join("g")
        .style("mix-blend-mode", "multiply");

    link.append("path")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke", d => "#bdc3c7")
        .attr("stroke-width", d => Math.max(1, d.width));

    link.append("title")
        .text(d => `${d.source.name} → ${d.target.name}\n${d.value.toLocaleString()} Wh`);

    const node = sankeySvg.append("g")
        .selectAll("rect")
        .data(graph.nodes)
        .join("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("height", d => d.y1 - d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("fill", d => getNodeColor(d.name))
        .attr("stroke", "#000");

    node.append("title")
        .text(d => `${d.name}\n${d.value.toLocaleString()} Wh`);

    sankeySvg.append("g")
        .selectAll("text")
        .data(graph.nodes)
        .join("text")
        .attr("x", d => d.x0 < sankeyChartWidth / 2 ? d.x1 + 6 : d.x0 - 6)
        .attr("y", d => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", d => d.x0 < sankeyChartWidth / 2 ? "start" : "end")
        .text(d => d.name)
        .style("font-size", "12px")
        .style("font-weight", "bold");
}

// 2. Bar Chart (Consumo/Costo por Localización)
function renderLocationBarChart(data, mode) {
    if (!barChartSvg) return;
    barChartSvg.selectAll('*').remove();
    if (data.length === 0) return;

    const rolled = d3.rollup(data, v => d3.sum(v, d => mode === 'consumo' ? d.consumo_wh : d.costo), d => d.localizacion);
    const chartData = Array.from(rolled, ([key, value]) => ({ key, value })).sort((a, b) => b.value - a.value);

    const width = 600, height = 400;
    const margin = { top: 20, right: 30, bottom: 60, left: 80 };

    barChartSvg.attr("viewBox", `0 0 ${width} ${height}`);

    const x = d3.scaleBand()
        .domain(chartData.map(d => d.key))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(chartData, d => d.value)]).nice()
        .range([height - margin.bottom, margin.top]);

    barChartSvg.append("g")
        .attr("fill", "#2980b9")
        .selectAll("rect")
        .data(chartData)
        .join("rect")
        .attr("x", d => x(d.key))
        .attr("y", d => y(d.value))
        .attr("height", d => y(0) - y(d.value))
        .attr("width", x.bandwidth())
        .on("mouseover", (e, d) => showTooltip(e, `${d.key}: ${d.value.toLocaleString()} ${mode === 'consumo' ? 'Wh' : 'COP'}`))
        .on("mouseout", hideTooltip);

    barChartSvg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-15)")
        .style("text-anchor", "end");

    barChartSvg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));
}

// 3. Pie Charts (Generico)
function renderPieChart(svg, data, keyFn, valueFn) {
    if (!svg) return;
    svg.selectAll('*').remove();
    if (data.length === 0) return;

    const rolled = d3.rollup(data, v => d3.sum(v, valueFn), keyFn);
    let chartData = Array.from(rolled, ([key, value]) => ({ key, value })).sort((a, b) => b.value - a.value);

    if (chartData.length > 5) {
        const top5 = chartData.slice(0, 5);
        const others = chartData.slice(5).reduce((acc, curr) => acc + curr.value, 0);
        chartData = [...top5, { key: "Otros", value: others }];
    }

    const width = 300, height = 300;
    const radius = Math.min(width, height) / 2;

    svg.attr("viewBox", `0 0 ${width} ${height}`)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    const color = d3.scaleOrdinal(d3.schemeSet3); // Paleta D3 profesional
    const pie = d3.pie().value(d => d.value);
    const arc = d3.arc().innerRadius(0).outerRadius(radius - 10);

    svg.select("g").selectAll("path")
        .data(pie(chartData))
        .join("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.key))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .on("mouseover", (e, d) => showTooltip(e, `${d.data.key}: ${d.data.value.toLocaleString()}`))
        .on("mouseout", hideTooltip);
}

// Wrappers para Pies
function renderAreaConsumptionPieChart(data) {
    renderPieChart(pieAreaConsumptionSvg, data, d => d.area, d => d.consumo_wh);
}
function renderEnergyTypeCostPieChart(data) {
    renderPieChart(pieEnergyTypeCostSvg, data, d => d.tipo, d => d.costo);
}
function renderTopEquipmentPieChart(data) {
    renderPieChart(pieTopEquipmentSvg, data, d => d.equipo, d => d.consumo_wh);
}

// 4. Scatter Plot (Potencia vs Horas)
function renderScatterPlot(data) {
    if (!scatterPlotSvg) return;
    scatterPlotSvg.selectAll('*').remove();
    if (data.length === 0) return;

    const width = 600, height = 400;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };

    scatterPlotSvg.attr("viewBox", `0 0 ${width} ${height}`);

    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.horas) || 24]).nice()
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.potencia) || 1000]).nice()
        .range([height - margin.bottom, margin.top]);

    // Ejes
    scatterPlotSvg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(10))
        .append("text").text("Horas Uso/Día").attr("x", width).attr("fill", "#000");

    scatterPlotSvg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .append("text").text("Potencia (W)").attr("y", 15).attr("fill", "#000");

    // Puntos
    scatterPlotSvg.append("g")
        .selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", d => x(d.horas))
        .attr("cy", d => y(d.potencia))
        .attr("r", 5)
        .attr("fill", "#e67e22")
        .attr("opacity", 0.7)
        .on("mouseover", (e, d) => showTooltip(e, `${d.equipo}: ${d.potencia}W, ${d.horas}h`))
        .on("mouseout", hideTooltip);
}

// --- TOOLTIP ---
function showTooltip(event, text) {
    if (!chartTooltip) return;
    chartTooltip.style("opacity", 1)
        .html(text)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px");
}
function hideTooltip() {
    if (chartTooltip) chartTooltip.style("opacity", 0);
}

// --- INTELLIGENCE ARTIFICIAL (GEMINI API) ---
async function callGeminiAPI(prompt, targetDivId) {
    if (!userConfig.apiKey) {
        alert("Por favor, configure su API Key en el panel de configuración.");
        openModal();
        return;
    }

    const targetDiv = checkElement(targetDivId);
    if (targetDiv) targetDiv.textContent = "Analizando datos con IA... Espere un momento.";

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${userConfig.apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        const json = await response.json();

        if (json.error) {
            throw new Error(json.error.message);
        }

        const text = json.candidates[0].content.parts[0].text;

        // Formateo simple de Markdown a HTML (negritas y listas)
        let formatted = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\* (.*?)(?=\n|$)/g, '<li>$1</li>')
            .replace(/\n\n/g, '<br><br>');

        if (targetDiv) targetDiv.innerHTML = formatted;

    } catch (error) {
        console.error("Error API Gemini:", error);
        if (targetDiv) targetDiv.textContent = "Error al consultar la IA. Verifique su API Key o conexión.";
    }
}

function getDataSummary() {
    const totalConsumo = checkElement('total-consumo').textContent;
    const totalCosto = checkElement('total-costo').textContent;

    // Top 3 equipos
    const sorted = [...rawData].sort((a, b) => b.consumo_wh - a.consumo_wh).slice(0, 3);
    const topEquipos = sorted.map(e => `${e.equipo} (${Math.round(e.consumo_wh)} Wh)`).join(", ");

    return `
        Consumo Total: ${totalConsumo} Wh/mes.
        Costo Total: ${totalCosto} COP.
        Principales consumidores: ${topEquipos}.
    `;
}

// --- LISTENERS Y INIT ---
function setupEventListeners() {
    checkElement('addRowButton')?.addEventListener('click', addRowToEnergyTable);
    checkElement('calculateAndUpdateButton')?.addEventListener('click', processTableDataAndCalculate);

    // Filtros
    ['filter-energia', 'filter-localizacion', 'filter-area', 'filter-consumo'].forEach(id => {
        checkElement(id)?.addEventListener('change', applyFiltersAndRender);
    });
    document.querySelectorAll('input[name="barChartMode"]').forEach(r => r.addEventListener('change', () => applyFiltersAndRender()));

    // Configuración
    checkElement('config-button')?.addEventListener('click', openModal);
    checkElement('save-config-btn')?.addEventListener('click', saveConfig);
    document.querySelector('.close-modal')?.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('config-modal');
        if (e.target === modal) closeModal();
    });

    // Botones IA
    checkElement('analyze-sankey-button')?.addEventListener('click', () => {
        const prompt = `Actua como un experto en eficiencia energética ISO 50001. Analiza estos datos: ${getDataSummary()}. Explica cómo se distribuye el flujo de energía en el diagrama de Sankey (de tipo de energía a uso final) e identifica las mayores ineficiencias.`;
        callGeminiAPI(prompt, 'sankey-llm-response');
    });

    checkElement('generate-text-report-button')?.addEventListener('click', () => {
        const authName = userConfig.name || "Usuario";
        const prompt = `Genera un breve informe ejecutivo de autodiagnóstico energético para ${authName}. Datos: ${getDataSummary()}. Incluye: 1. Resumen de situación. 2. Tres recomendaciones concretas de ahorro. 3. Conclusión motivadora.`;
        callGeminiAPI(prompt, 'report-status-message');
    });

    ['analyze-bar-chart-button', 'analyze-pie-area-button', 'analyze-pie-energy-type-button', 'analyze-pie-top-equipment-button', 'analyze-scatter-plot-button'].forEach(id => {
        checkElement(id)?.addEventListener('click', () => {
            const prompt = `Actua como experto en energía. Analiza este gráfico específico basado en los datos globales: ${getDataSummary()}. Da una interpretación clave de 2 frases.`;
            const btn = document.getElementById(id);
            const targetId = btn.nextElementSibling.id;
            callGeminiAPI(prompt, targetId);
        });
    });

    // Navegación Pestañas
    checkElement('nav-dashboard')?.addEventListener('click', () => switchTab('dashboard'));
    checkElement('nav-info')?.addEventListener('click', () => switchTab('info'));
}

function switchTab(tabName) {
    const dashboardView = document.getElementById('dashboard-view');
    const infoView = document.getElementById('info-view');
    const dashboardBtn = document.getElementById('nav-dashboard');
    const infoBtn = document.getElementById('nav-info');

    if (tabName === 'dashboard') {
        dashboardView.style.display = 'block';
        infoView.style.display = 'none';
        dashboardBtn.classList.add('active');
        infoBtn.classList.remove('active');
    } else {
        dashboardView.style.display = 'none';
        infoView.style.display = 'block';
        dashboardBtn.classList.remove('active');
        infoBtn.classList.add('active');
    }
}

function applyFiltersAndRender() {
    const data = getFilteredData();
    updateStats(data);

    renderSankeyChart(data);
    renderLocationBarChart(data, document.querySelector('input[name="barChartMode"]:checked').value);

    renderAreaConsumptionPieChart(data);
    renderEnergyTypeCostPieChart(data);
    renderTopEquipmentPieChart(data);
    renderScatterPlot(data);
}

function initializeDashboard() {
    console.log("Inicializando Dashboard...");
    loadConfig();

    energyTableBody = document.querySelector('#energyDataTable tbody');
    sankeySvg = d3.select('#sankeyChart');
    barChartSvg = d3.select('#areaBarChart');
    pieAreaConsumptionSvg = d3.select('#areaConsumptionPieChart');
    pieEnergyTypeCostSvg = d3.select('#energyTypeCostPieChart');
    pieTopEquipmentSvg = d3.select('#topEquipmentPieChart');
    scatterPlotSvg = d3.select('#scatterPlotChart');
    chartTooltip = d3.select('#chart-tooltip');

    const container = document.getElementById('chart-container');
    sankeyChartWidth = container ? container.clientWidth - 40 : 800;
    if (sankeySvg) sankeySvg.attr("width", sankeyChartWidth).attr("height", sankeyChartHeight);

    setupEventListeners();

    addRowToEnergyTable();
    processTableDataAndCalculate();

    setTimeout(checkApiKey, 1000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDashboard);
} else {
    initializeDashboard();
}

window.addEventListener('resize', () => {
    const container = document.getElementById('chart-container');
    if (container) {
        sankeyChartWidth = container.clientWidth - 40;
        if (sankeySvg) sankeySvg.attr("width", sankeyChartWidth);
        applyFiltersAndRender();
    }
});