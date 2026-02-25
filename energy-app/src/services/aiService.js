// AI Service — Supports Gemini, OpenAI, and Anthropic APIs

function buildPrompt(stats, filteredData, customPrompt) {
    const equiposSummary = filteredData.map(d =>
        `- ${d.equipo || d.equipoName} (${d.tipo}): ${d.localizacion} / ${d.area}, ` +
        `Cant: ${d.cantidad}, Pot: ${d.potencia}W, Hrs: ${d.horas}h/día, ` +
        `Consumo: ${Math.round(d.consumo_wh).toLocaleString()} Wh/mes, ` +
        `Costo: $${Math.round(d.costo).toLocaleString()} COP/mes`
    ).join('\n');

    const basePrompt = `Eres un consultor experto en gestión energética según la norma ISO 50001. 
Analiza los siguientes datos de consumo energético de una instalación y genera un informe profesional de autodiagnóstico energético.

## DATOS DEL INVENTARIO ENERGÉTICO

**Resumen General:**
- Consumo Total: ${Math.round(stats.totalConsumo).toLocaleString()} Wh/mes (${(stats.totalConsumo / 1000).toFixed(1)} kWh/mes)
- Costo Total Estimado: $${Math.round(stats.totalCosto).toLocaleString()} COP/mes
- Equipos Activos: ${stats.equiposActivos}

**Detalle por Equipo:**
${equiposSummary}

## INSTRUCCIONES PARA EL INFORME

Genera un informe profesional que incluya:

1. **Resumen Ejecutivo**: Panorama general del consumo energético.
2. **Identificación de Usos Significativos de Energía (USEs)**: Los equipos o áreas que más consumen.
3. **Análisis por Área/Localización**: Distribución del consumo por zonas.
4. **Oportunidades de Mejora**: Recomendaciones concretas de ahorro energético con estimación de impacto.
5. **Plan de Acción ISO 50001**: Pasos recomendados para implementar un Sistema de Gestión Energética.
6. **Indicadores Sugeridos (IDEn)**: Métricas clave para el seguimiento.

El informe debe ser técnico pero comprensible, con datos cuantitativos y recomendaciones accionables.
Redacta en español. Extensión: aproximadamente 500 palabras.`;

    return customPrompt ? `${basePrompt}\n\nInstrucciones adicionales del usuario:\n${customPrompt}` : basePrompt;
}

async function callGemini(apiKey, model, prompt) {
    const modelId = model || 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 2048, temperature: 0.7 }
        })
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `Error de API Gemini: ${res.status}`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No se generó respuesta.';
}

async function callOpenAI(apiKey, model, prompt) {
    const modelId = model || 'gpt-4o-mini';
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: modelId,
            messages: [
                { role: 'system', content: 'Eres un consultor experto en gestión energética ISO 50001.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 2048,
            temperature: 0.7
        })
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `Error de API OpenAI: ${res.status}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'No se generó respuesta.';
}

async function callAnthropic(apiKey, model, prompt) {
    const modelId = model || 'claude-3-haiku-20240307';
    const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: modelId,
            max_tokens: 2048,
            messages: [{ role: 'user', content: prompt }]
        })
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `Error de API Anthropic: ${res.status}`);
    }

    const data = await res.json();
    return data.content?.[0]?.text || 'No se generó respuesta.';
}

export async function generateReport(config, stats, filteredData) {
    if (!config.apiKey) {
        throw new Error('No se ha configurado una API Key. Ve a Configuración para agregarla.');
    }

    const prompt = buildPrompt(stats, filteredData, config.customPrompt);

    switch (config.apiProvider) {
        case 'gemini':
            return callGemini(config.apiKey, config.apiModel, prompt);
        case 'openai':
            return callOpenAI(config.apiKey, config.apiModel, prompt);
        case 'anthropic':
            return callAnthropic(config.apiKey, config.apiModel, prompt);
        default:
            throw new Error(`Proveedor de IA no soportado: ${config.apiProvider}`);
    }
}
