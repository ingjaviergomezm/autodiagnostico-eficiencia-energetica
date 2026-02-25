---
description: Agente 2 — Prioridad Media. Implementa funcionalidades ISO 50001 (Filtros, Línea Base, Simulador, Metas).
---

# Agente 2 — Prioridad Media (Valor Agregado ISO 50001)

## Contexto del Proyecto

Aplicación de Autodiagnóstico Energético basada en ISO 50001 ubicada en:
`c:\Users\Usuario\OneDrive\Documentos\App Autodiagnostico Energetico Interactivo ISO 50001\energy-app`

**Stack:** Vite + React + Tailwind CSS (v4 con `@tailwindcss/postcss`) + D3.js
**Prerequisito:** El Agente 1 ya completó la persistencia de datos en localStorage.

### Archivos clave existentes:
- `src/App.jsx` — Layout principal con routing por tabs (dashboard, info)
- `src/hooks/useEnergyData.js` — Hook central: equipos, tarifa, filters, setFilters, filterOptions, filteredData, stats, config, saveConfig, resetData
- `src/components/Dashboard.jsx` — KPIs, inventario, Sankey, barras, donuts
- `src/components/Sidebar.jsx` — Navegación lateral con tabs
- `src/components/EnergySankey.jsx`, `BarChart.jsx`, `PieChart.jsx` — Gráficos D3

### Estructura del hook filters:
```javascript
filters = { energia: 'all', localizacion: 'all', area: 'all', consumo: 'all' }
filterOptions = { energias: [...], localizaciones: [...], areas: [...] }
```

### Estilo CSS:
- Clases principales: `glass-panel`, `btn-primary`, `neon-text-blue/green/purple`, `custom-scrollbar`
- Tema oscuro con `bg-slate-900`, `text-slate-100/300/400`
- Iconos de `lucide-react`

---

## Tareas a ejecutar

### Tarea 2.1: Panel de Filtros Interactivo

1. Crear `src/components/FilterBar.jsx`:
   - Barra horizontal con 4 dropdowns (selects estilizados):
     - **Tipo de Energía:** opciones de `filterOptions.energias` + "Todos"
     - **Localización:** opciones de `filterOptions.localizaciones` + "Todos"  
     - **Área:** opciones de `filterOptions.areas` + "Todos"
     - **Rango de Consumo:** "Todos", "Bajo (<10,000 Wh)", "Medio", "Alto (>50,000 Wh)"
   - Botón "Limpiar filtros" (icono `FilterX` de lucide-react) que resetee todos a 'all'
   - Indicador de cuántos filtros están activos (badge numérico)
   - Estilo: usar clases `glass-panel`, fondo oscuro, bordes `border-slate-700`

2. Modificar `src/components/Dashboard.jsx`:
   - Importar `FilterBar`
   - Insertar `<FilterBar filters={dataState.filters} setFilters={dataState.setFilters} filterOptions={dataState.filterOptions} />` justo después de las tarjetas KPIs y antes del inventario
   - Pasar las props necesarias desde `dataState`

3. Verificar: cambiar filtros y confirmar que KPIs, tabla y TODOS los gráficos se actualizan en tiempo real

---

### Tarea 2.2: Línea Base Energética (EnB)

1. Modificar `src/hooks/useEnergyData.js`:
   - Agregar estado `baseline` con `useState(null)`
   - Cargar baseline de localStorage al init: `localStorage.getItem('iso50001_baseline')`
   - Crear función `saveBaseline()`:
     ```javascript
     const saveBaseline = () => {
         const bl = { 
             date: new Date().toISOString(),
             totalConsumo: stats.totalConsumo,
             totalCosto: stats.totalCosto,
             equiposActivos: stats.equiposActivos,
             dataSnapshot: filteredData.map(d => ({
                 localizacion: d.localizacion, area: d.area,
                 consumo_wh: d.consumo_wh, costo: d.costo
             }))
         };
         setBaseline(bl);
         localStorage.setItem('iso50001_baseline', JSON.stringify(bl));
     };
     ```
   - Crear función `clearBaseline()` que borre del state y localStorage
   - Exportar `baseline`, `saveBaseline`, `clearBaseline`

2. Crear `src/components/BaselineComparison.jsx`:
   - Si no hay baseline: mostrar botón "Establecer Línea Base Actual"
   - Si hay baseline: mostrar panel comparativo con:
     - Fecha de la línea base
     - Tabla/tarjetas comparativas: Línea Base vs Actual para cada KPI
     - Indicadores de variación con flechas y colores: verde si bajó, rojo si subió
     - Porcentaje de cambio: `((actual - base) / base * 100).toFixed(1)%`
     - Gráfico de barras agrupadas (D3): consumo por localización, comparando base vs actual
   - Botón "Actualizar Línea Base" con confirmación (dialog de alerta)

3. Modificar `src/components/Dashboard.jsx`:
   - Insertar `<BaselineComparison baseline={dataState.baseline} stats={dataState.stats} filteredData={dataState.filteredData} saveBaseline={dataState.saveBaseline} clearBaseline={dataState.clearBaseline} />` después del Sankey y antes de los gráficos analíticos

4. Verificar: guardar línea base → modificar equipos → confirmar que las variaciones se calculan correctamente

---

### Tarea 2.3: Simulador de Escenarios "¿Qué pasa si...?"

1. Crear `src/components/Simulator.jsx`:
   - Vista completa que recibe `dataState` como prop
   - Al entrar, copiar `filteredData` como "escenario base" (solo lectura)
   - Crear estado local `escenario` (copia editable de los equipos)
   - Tabla editable del escenario con las mismas columnas que el inventario
   - Permitir: cambiar potencia, horas, cantidad, eliminar equipos del escenario
   - Panel lateral de resultados mostrando:
     - **Actual:** consumo y costo totales
     - **Escenario:** consumo y costo calculados del escenario editado
     - **Ahorro:** diferencia en kWh y COP, con porcentaje
     - Indicadores con colores (verde = ahorro, rojo = incremento)
   - Botón "Resetear Escenario" para volver al estado actual

2. Modificar `src/components/Sidebar.jsx`:
   - Importar icono `FlaskConical` de lucide-react
   - Agregar al array `menuItems`: `{ id: 'simulator', label: 'Simulador', icon: FlaskConical }`

3. Modificar `src/App.jsx`:
   - Importar `Simulator`
   - Agregar caso en el renderizado condicional de tabs:
   ```jsx
   {activeTab === 'simulator' && <Simulator dataState={dataState} />}
   ```

4. Verificar: navegar al Simulador → modificar equipos del escenario → confirmar que el ahorro se calcula correctamente en tiempo real

---

### Tarea 2.4: Metas y Objetivos Energéticos

1. Modificar `src/hooks/useEnergyData.js`:
   - Agregar estado `goals` con `useState({ targetReduction: 0, unit: 'percent' })`
   - Cargar y persistir en localStorage con key `iso50001_goals`
   - Crear funciones `saveGoals(newGoals)` y exportarlas

2. Crear `src/components/GoalTracker.jsx`:
   - Si no hay meta definida: formulario compacto para definir:
     - Tipo: "Reducción porcentual" o "Valor absoluto (kWh)"
     - Valor objetivo
     - Botón "Establecer Meta"
   - Si hay meta: mostrar gauge visual (semicírculo SVG tipo velocímetro) con:
     - Valor actual de consumo
     - Meta definida
     - Porcentaje de progreso hacia la meta
     - Color: verde si va bien, amarillo si va justo, rojo si supera el umbral
   - Requiere que haya una línea base establecida (Tarea 2.2) para calcular el progreso
   - Botón para editar o eliminar la meta

3. Modificar `src/components/Dashboard.jsx`:
   - Insertar `<GoalTracker />` en la sección de KPIs o debajo de ellas
   - Pasar props: `stats`, `baseline`, `goals`, `saveGoals`

4. Verificar: establecer meta de 10% → modificar equipos → confirmar que el gauge refleja el progreso

---

## Verificación Final

1. Ejecutar `npm run dev` sin errores en consola
2. Probar flujo: Filtrar datos → Establecer línea base → Definir meta → Simular escenario → Verificar que todo interactúa correctamente
3. Confirmar que las vistas del Sidebar navegan correctamente entre Dashboard, Metodología y Simulador
