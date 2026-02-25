---
description: Agente 1 — Prioridad Alta. Implementa las funcionalidades core de la app ISO 50001 (Informe IA, Excel, Persistencia).
---

# Agente 1 — Prioridad Alta (Funcionalidades Core)

## Contexto del Proyecto

Aplicación de Autodiagnóstico Energético basada en ISO 50001 ubicada en:
`c:\Users\Usuario\OneDrive\Documentos\App Autodiagnostico Energetico Interactivo ISO 50001\energy-app`

**Stack:** Vite + React + Tailwind CSS (v4 con `@tailwindcss/postcss`) + D3.js
**Estado:** App funcional con Dashboard (KPIs, inventario, Sankey, barras, donuts), Metodología y Settings Modal.

### Archivos clave existentes:
- `src/App.jsx` — Layout principal, tabs, modal de settings
- `src/hooks/useEnergyData.js` — Hook central de estado (equipos, tarifa, filtros, config IA)
- `src/components/Dashboard.jsx` — Vista principal con KPIs, tabla, gráficos
- `src/components/SettingsModal.jsx` — Configuración de API (provider, model, key)
- `src/components/EnergySankey.jsx` — Diagrama Sankey D3
- `src/components/BarChart.jsx` — Gráfico de barras D3
- `src/components/PieChart.jsx` — Gráfico donut D3

### Datos del hook useEnergyData:
- `equipos[]` — Array de objetos con: id, tipo, localizacion, area, equipo, cantidad, potencia, horas, diasMes, fCarga, fSimult
- `tarifa` — Número (COP/kWh), default 858.43
- `filteredData[]` — Equipos con campos calculados: consumo_wh, costo
- `stats` — { totalConsumo, totalCosto, equiposActivos }
- `config` — { name, apiProvider, apiModel, apiKey, customPrompt }

---

## Tareas a ejecutar (en orden)

### Tarea 1.4: Persistencia de Datos en localStorage

**Ejecutar primero** porque es prerrequisito de los otros agentes.

1. Abrir `src/hooks/useEnergyData.js`
2. Agregar una constante `DATA_KEY = 'iso50001_app_data'`
3. En el `useEffect` de carga inicial, además de cargar `config`, cargar `equipos` y `tarifa` desde localStorage con la key `DATA_KEY`
4. Agregar un `useEffect` que escuche cambios en `equipos` y `tarifa` y los guarde automáticamente en localStorage:
```javascript
useEffect(() => {
    localStorage.setItem(DATA_KEY, JSON.stringify({ equipos, tarifa, version: 1 }));
}, [equipos, tarifa]);
```
5. Agregar función `resetData()` que borre la key de localStorage y restaure los equipos por defecto
6. Exportar `resetData` en el return del hook
7. Verificar que al recargar la página los datos persisten

---

### Tarea 1.1: Generación de Informe con IA

1. Crear `src/services/aiService.js` con funciones para llamar a 3 APIs:
   - **Gemini**: `POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}`
   - **OpenAI**: `POST https://api.openai.com/v1/chat/completions` con header `Authorization: Bearer {apiKey}`
   - **Anthropic**: `POST https://api.anthropic.com/v1/messages` con header `x-api-key: {apiKey}` y `anthropic-version: 2023-06-01`
   
2. Crear función `generateReport(config, stats, filteredData)` que:
   - Construya un prompt profesional con los datos del inventario y estadísticas
   - Llame a la API según `config.apiProvider`
   - Retorne el texto del informe
   - El prompt debe solicitar: diagnóstico energético, identificación de USEs (Usos Significativos de Energía), recomendaciones de ahorro, y plan de acción según ISO 50001

3. Crear `src/components/AIReportModal.jsx`:
   - Modal fullscreen con overlay oscuro
   - Estado: `loading`, `error`, `success`
   - Mientras carga: skeleton animado
   - Al completar: mostrar informe con formato markdown (usar secciones con headers)
   - Botón "Cerrar" y botón "Copiar al portapapeles"
   - Manejar errores mostrando mensaje amigable

4. Modificar `src/components/Dashboard.jsx`:
   - Importar `AIReportModal`
   - Agregar estado `isReportOpen`
   - Conectar el botón "Generar Informe IA" existente para abrir el modal
   - Pasar `config`, `stats`, `filteredData` al modal

5. Verificar: configurar una API key real en Settings, generar un informe y confirmar que se muestra correctamente

---

### Tarea 1.2: Exportar a Excel/CSV

// turbo
1. Instalar dependencia:
```bash
npm install xlsx
```

2. Crear `src/services/exportService.js`:
```javascript
import * as XLSX from 'xlsx';

export function exportToExcel(equipos, filteredData, stats, tarifa) {
    // Hoja 1: Inventario de Equipos con datos calculados
    // Hoja 2: Resumen (KPIs, tarifa, fecha de exportación)
    // Descargar como .xlsx
}
```

3. Modificar `src/components/Dashboard.jsx`:
   - Importar `exportToExcel` del servicio
   - Agregar botón "Exportar Excel" (con icono `Download` de lucide-react) junto al título "Inventario de Equipos"
   - Al hacer click, llamar a `exportToExcel(equipos, filteredData, stats, tarifa)`

4. Verificar: agregar equipos, exportar, abrir el archivo en Excel y confirmar que los datos son correctos

---

### Tarea 1.3: Importar Datos desde CSV/Excel

1. Crear `src/components/ImportModal.jsx`:
   - Modal con zona de drag & drop para archivos .xlsx/.csv
   - Al soltar/seleccionar archivo, parsear con `xlsx`
   - Mostrar preview de los datos en una tabla
   - Mapear columnas del archivo a los campos de `equipos[]`:
     - Columnas esperadas: Tipo, Localización, Área, Equipo, Cantidad, Potencia(W), Horas/Día, Días/Mes, F.Carga, F.Simultaneidad
   - Botones: "Reemplazar datos actuales" y "Agregar a datos existentes"
   - Validar que los datos numéricos sean válidos

2. Modificar `src/hooks/useEnergyData.js`:
   - Agregar función `importEquipos(newEquipos, mode)` donde mode = 'replace' | 'append'
   - Si mode es 'replace': `setEquipos(newEquipos)`
   - Si mode es 'append': `setEquipos([...equipos, ...newEquipos])` asignando IDs nuevos

3. Modificar `src/components/Dashboard.jsx`:
   - Agregar botón "Importar" (con icono `Upload` de lucide-react) junto al botón de exportar
   - Al hacer click, abrir `ImportModal`

4. Verificar: crear un archivo Excel con equipos de prueba, importarlo, y confirmar que los datos aparecen en la tabla

---

## Verificación Final

1. Ejecutar `npm run dev` y confirmar que no hay errores en consola
2. Probar el flujo completo: agregar equipos → persistencia al recargar → generar informe IA → exportar Excel → importar Excel
3. Confirmar que todos los gráficos (Sankey, barras, donuts) siguen funcionando correctamente
