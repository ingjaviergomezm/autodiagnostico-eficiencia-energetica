---
description: Agente 3 — Prioridad Baja. Implementa funcionalidades avanzadas ISO 50001 (EnPIs, Historial, Multi-Proyecto, PDF).
---

# Agente 3 — Prioridad Baja (Escalabilidad y Profundidad)

## Contexto del Proyecto

Aplicación de Autodiagnóstico Energético basada en ISO 50001 ubicada en:
`c:\Users\Usuario\OneDrive\Documentos\App Autodiagnostico Energetico Interactivo ISO 50001\energy-app`

**Stack:** Vite + React + Tailwind CSS (v4 con `@tailwindcss/postcss`) + D3.js
**Prerequisitos:**
- Agente 1 completó: Persistencia, Informe IA, Export/Import Excel
- Agente 2 completó: Filtros, Línea Base, Simulador, Metas

### Archivos clave existentes:
- `src/App.jsx` — Layout principal con routing por tabs (dashboard, info, simulator)
- `src/hooks/useEnergyData.js` — Hook central con: equipos, tarifa, filters, filteredData, stats, config, baseline, goals, persistencia en localStorage
- `src/components/Dashboard.jsx` — KPIs, FilterBar, inventario, Sankey, barras, donuts, BaselineComparison, GoalTracker
- `src/components/Sidebar.jsx` — Navegación: Dashboard, Metodología, Simulador
- `src/components/AIReportModal.jsx` — Modal de informe IA generado
- `src/services/aiService.js` — Llamadas a APIs de IA
- `src/services/exportService.js` — Exportación a Excel

### Estilo CSS:
- Clases: `glass-panel`, `btn-primary`, `neon-text-blue/green/purple`, `custom-scrollbar`
- Tema oscuro: `bg-slate-900`, `text-slate-100/300/400`
- Iconos: `lucide-react`

---

## Tareas a ejecutar

### Tarea 3.1: Indicadores de Desempeño Energético (IDEn / EnPIs)

1. Modificar `src/hooks/useEnergyData.js`:
   - Agregar estado `normalization` con `useState({ areaMt2: 0, empleados: 0, produccion: 0 })`
   - Persistir en localStorage con key `iso50001_normalization`
   - Crear `saveNormalization(newNorm)` y exportarla
   - Agregar al `stats` los EnPIs calculados:
     ```javascript
     kwhPorMt2: normalization.areaMt2 > 0 ? (totalConsumo / 1000) / normalization.areaMt2 : null,
     kwhPorEmpleado: normalization.empleados > 0 ? (totalConsumo / 1000) / normalization.empleados : null,
     kwhPorProduccion: normalization.produccion > 0 ? (totalConsumo / 1000) / normalization.produccion : null
     ```

2. Crear `src/components/EnPIPanel.jsx`:
   - Formulario compacto inline para ingresar: Área (m²), Empleados, Producción mensual (unidades)
   - Debajo, 3 tarjetas estilo KPI mostrando los indicadores calculados:
     - **kWh/m²** — Intensidad energética por área
     - **kWh/empleado** — Consumo per cápita
     - **kWh/unidad** — Eficiencia productiva
   - Si el valor es `null` (denominador = 0), mostrar "Sin datos" en gris
   - Estilo consistente con las tarjetas KPIs existentes (glass-panel, neon-text)
   - Iconos sugeridos: `Ruler` (m²), `Users` (empleados), `PackageCheck` (producción)

3. Modificar `src/components/Dashboard.jsx`:
   - Insertar `<EnPIPanel />` después de las tarjetas KPIs principales
   - Pasar props: `stats`, `normalization`, `saveNormalization`

4. Verificar: ingresar valores de normalización → confirmar que los EnPIs se calculan y se persisten al recargar

---

### Tarea 3.2: Historial y Seguimiento Temporal

1. Modificar `src/hooks/useEnergyData.js`:
   - Agregar estado `history` con `useState([])` — array de registros mensuales
   - Cargar de localStorage con key `iso50001_history`
   - Crear función `saveMonthlyRecord()`:
     ```javascript
     const record = {
         date: new Date().toISOString(),
         month: new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'short' }),
         totalConsumo: stats.totalConsumo,
         totalCosto: stats.totalCosto,
         equiposActivos: stats.equiposActivos
     };
     const updated = [...history, record];
     setHistory(updated);
     localStorage.setItem('iso50001_history', JSON.stringify(updated));
     ```
   - Crear función `clearHistory()` y exportar todo

2. Crear `src/components/TimelineChart.jsx`:
   - Recibe `history[]` como prop
   - Si history está vacío: mostrar mensaje "No hay registros. Guarde un registro mensual para empezar."
   - Si hay datos: gráfico de líneas D3 con:
     - Eje X: meses
     - Eje Y (izquierda): consumo en kWh
     - Eje Y (derecha, opcional): costo en COP
     - Dos líneas: una para consumo (azul), otra para costo (verde)
     - Tooltips al hover mostrando valores exactos
     - Puntos en cada dato con efecto hover
   - Indicador de tendencia: flecha ↑ o ↓ comparando último mes vs penúltimo
   - Botón "Guardar Registro Actual" que llame a `saveMonthlyRecord()`

3. Modificar `src/components/Dashboard.jsx`:
   - Insertar `<TimelineChart history={dataState.history} saveMonthlyRecord={dataState.saveMonthlyRecord} />` después de los gráficos analíticos (barras/donuts)

4. Verificar: guardar 3+ registros mensuales → confirmar que el gráfico de líneas se renderiza con tendencia

---

### Tarea 3.3: Multi-Proyecto y Comparación entre Sedes

1. Crear `src/hooks/useProjects.js`:
   ```javascript
   // Gestión de múltiples proyectos
   // Cada proyecto = { id, name, createdAt, data: { equipos, tarifa, baseline, goals, history, normalization } }
   // Persistir array de proyectos en localStorage con key 'iso50001_projects'
   // Funciones: createProject, deleteProject, renameProject, duplicateProject, switchProject, getActiveProject
   ```

2. Crear `src/components/ProjectSelector.jsx`:
   - Dropdown en el Header que muestra el proyecto activo
   - Al expandir: lista de proyectos con opciones (renombrar, duplicar, eliminar)
   - Botón "+ Nuevo Proyecto" al final de la lista
   - Al cambiar de proyecto: cargar los datos correspondientes en useEnergyData
   - Indicador visual del proyecto activo (badge o highlight)

3. Modificar `src/components/Header.jsx`:
   - Insertar `<ProjectSelector />` a la izquierda del botón de Settings
   - Pasar props necesarias desde App.jsx

4. Modificar `src/App.jsx`:
   - Importar y usar `useProjects` hook
   - Pasar el proyecto activo a `useEnergyData` para que cargue los datos del proyecto correcto
   - Conectar el cambio de proyecto con la recarga de datos

5. Verificar: crear 2 proyectos → ingresar datos diferentes → cambiar entre proyectos → confirmar que los datos se cargan correctamente

---

### Tarea 3.4: Exportar Informe a PDF

// turbo
1. Instalar dependencias:
```bash
npm install html2canvas jspdf
```

2. Crear `src/services/pdfService.js`:
   - Función `generatePDF(reportText, stats, chartElements)`:
     - Crear documento jsPDF (A4, orientación vertical)
     - **Portada:** Logo/título "Informe de Autodiagnóstico Energético ISO 50001", fecha, nombre del proyecto
     - **Página 2:** Resumen KPIs (Consumo Total, Costo, Equipos) en formato tabla
     - **Página 3:** Capturar los gráficos del DOM con html2canvas (Sankey, barras, donuts) e insertarlos como imágenes
     - **Páginas siguientes:** Texto del informe IA (separar por secciones)
     - **Última página:** Disclaimer y notas metodológicas
   - Descargar automáticamente como `Informe_ISO50001_{fecha}.pdf`

3. Modificar `src/components/AIReportModal.jsx`:
   - Agregar botón "Descargar PDF" (icono `FileDown` de lucide-react) al header del modal
   - Al hacer click: mostrar spinner → llamar a `generatePDF()` → descargar
   - Pasar referencia a los elementos gráficos del Dashboard para capturalos

4. Verificar: generar informe IA → descargar PDF → abrir y confirmar que incluye portada, KPIs, gráficos y texto del informe

---

## Verificación Final

1. Ejecutar `npm run dev` sin errores
2. Probar flujo completo multi-proyecto: crear proyecto → ingresar datos → guardar registros mensuales → ver EnPIs → generar informe → exportar PDF
3. Cambiar de proyecto y repetir verificación
4. Confirmar que todas las funcionalidades de los Agentes 1 y 2 siguen operativas
