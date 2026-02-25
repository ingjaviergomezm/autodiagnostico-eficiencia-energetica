# ⚡ ISO 50001 — Autodiagnóstico Energético Interactivo

Aplicación web profesional para el autodiagnóstico energético de instalaciones, basada en la norma **ISO 50001** (Sistemas de Gestión de la Energía). Permite registrar equipos, visualizar consumos y costos, generar informes con inteligencia artificial, y exportar/importar datos desde Excel.

---

## 🚀 Stack Tecnológico

| Tecnología | Uso |
|-----------|-----|
| **Vite** | Build tool y servidor de desarrollo |
| **React 19** | Interfaz de usuario reactiva |
| **Tailwind CSS v4** | Estilos con tema oscuro premium |
| **D3.js** | Gráficos interactivos (Sankey, Barras, Donuts) |
| **SheetJS (xlsx)** | Exportar / Importar archivos Excel |
| **APIs de IA** | Gemini, OpenAI, Anthropic |

---

## 📦 Instalación

```bash
cd energy-app
npm install
npm run dev
```

La aplicación se abrirá en `http://localhost:5173/`

---

## 🧩 Funcionalidades

### Dashboard Principal
- **KPIs en tiempo real:** Consumo Total (kWh), Costo Estimado (COP), Equipos Activos
- **Inventario de Equipos:** Tabla editable con tipo de energía, localización, área, potencia, horas de uso, factores de carga/simultaneidad
- **Tarifa personalizable:** COP/kWh configurable desde el dashboard
- **Panel de Filtros Interactivo:** Filtrado global cruzado por tipo de energía, localización, área y rango de consumo
- **Línea Base Energética (EnB):** Establecimiento de puntos de referencia de consumo para comparar variaciones y ahorros
- **Metas Energéticas:** Fijación de objetivos de reducción de consumo (porcentual o absoluto) con widget visual de progreso

### Visualizaciones Interactivas (D3.js)
- **Diagrama Sankey:** Flujo energético desde fuente → localización → área, con gradientes de color, tooltips con consumo y costo, y resaltado de rutas al hover
- **Gráfico de Barras (Dual):** Consumo por localización y comparación contra Línea Base
- **Gráficos de Donuts:** Consumo por área y Costo por tipo de energía, con etiquetas de valores

### Simulador de Escenarios ("¿Qué pasa si...?")
- Panel aislado del Dashboard para simular cambios operativos sin afectar el inventario real.
- Permite modificar horas de uso, cantidad de equipos o potencia para evaluar instantáneamente el impacto.
- Panel de resultados para visualizar Ahorro/Incremento en kWh y COP generados por el escenario simulado.

### Generación de Informe con IA
- Soporta **3 proveedores de IA:** Google Gemini, OpenAI (GPT), Anthropic (Claude)
- Prompt profesional ISO 50001 que incluye: diagnóstico, USEs, recomendaciones y plan de acción
- Modal con estados de carga, renderizado markdown, y botón de copiar al portapapeles
- Configuración de API Key, modelo y prompt personalizado desde el panel de Settings (⚙️)

### Exportar a Excel
- Genera archivo `.xlsx` con **3 hojas:**
  - **Inventario:** Todos los equipos con datos calculados (consumo, costo)
  - **Resumen:** KPIs principales, tarifa y fecha de exportación
  - **Por Localización:** Distribución del consumo por zona con porcentaje del total

### Importar desde Excel/CSV
- Zona de drag & drop para archivos `.xlsx` / `.csv`
- **Mapeo inteligente de columnas:** detecta automáticamente los campos por nombre
- Preview de los datos antes de importar
- Dos modos: **Reemplazar** datos actuales o **Agregar** a los existentes

### Persistencia de Datos
- Los equipos, tarifa y configuración se guardan automáticamente en **localStorage**
- Los datos persisten al recargar la página
- Función de reseteo a datos por defecto disponible

### Página de Metodología
- Explicación del Sistema de Gestión Energética (SGE)
- Fórmulas de cálculo de consumo y factores aplicados

---

## 📁 Estructura del Proyecto

```
energy-app/
├── src/
│   ├── App.jsx                    # Layout principal y routing
│   ├── main.jsx                   # Entry point
│   ├── index.css                  # Estilos globales (glassmorphism, neon)
│   ├── components/
│   │   ├── Dashboard.jsx          # Vista principal con KPIs, tabla, gráficos
│   │   ├── Header.jsx             # Barra superior
│   │   ├── Sidebar.jsx            # Navegación lateral
│   │   ├── Metodologia.jsx        # Página informativa ISO 50001
│   │   ├── SettingsModal.jsx      # Configuración de API de IA
│   │   ├── AIReportModal.jsx      # Modal del informe generado por IA
│   │   ├── ImportModal.jsx        # Importar datos desde Excel/CSV
│   │   ├── EnergySankey.jsx       # Diagrama Sankey (D3.js)
│   │   ├── BarChart.jsx           # Gráfico de barras (D3.js)
│   │   └── PieChart.jsx           # Gráfico donut (D3.js)
│   ├── hooks/
│   │   └── useEnergyData.js       # Hook central de estado y lógica
│   └── services/
│       ├── aiService.js           # Llamadas a APIs de IA
│       └── exportService.js       # Exportación a Excel
├── .agents/workflows/             # Workflows de agentes de desarrollo
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## ⚙️ Configuración de IA

1. Abre el panel de configuración (icono ⚙️ en el header)
2. Selecciona tu proveedor: **Gemini**, **OpenAI** o **Anthropic**
3. Ingresa tu **API Key** y el **modelo** deseado
4. Opcionalmente, agrega un **prompt personalizado** para guiar el análisis
5. Click en "Generar Informe IA" desde el Dashboard

---

## 🗺️ Roadmap (Próximas funcionalidades)

| Prioridad | Feature | Estado |
|-----------|---------|--------|
| 🟡 Media | Panel de Filtros Interactivo | ✅ Completado |
| 🟡 Media | Línea Base Energética (EnB) | ✅ Completado |
| 🟡 Media | Simulador de Escenarios | ✅ Completado |
| 🟡 Media | Metas y Objetivos Energéticos | ✅ Completado |
| 🟢 Baja | Indicadores EnPI (kWh/m², kWh/empleado) | Pendiente |
| 🟢 Baja | Historial y Seguimiento Temporal | Pendiente |
| 🟢 Baja | Multi-Proyecto y Comparación | Pendiente |
| 🟢 Baja | Exportar Informe a PDF | Pendiente |

---

## 📝 Licencia

Proyecto de uso interno. Todos los derechos reservados.
