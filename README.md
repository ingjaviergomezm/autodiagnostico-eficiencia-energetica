<div align="center">

# Web APP de Autodiagnóstico Energético Interactivo (ISO 50001)
### Herramienta de Gestión y Optimización para la Eficiencia Energética

![Estado del Proyecto](https://img.shields.io/badge/Estado-Finalizado-success?style=for-the-badge)
![Licencia](https://img.shields.io/badge/Licencia-GPLv3-blue?style=for-the-badge)
![Versión](https://img.shields.io/badge/Versión-1.0.0-orange?style=for-the-badge)

</div>

---

## Descripción del Proyecto

Este aplicativo web es una herramienta profesional de **Nivel 1** para el autodiagnóstico energético. Diseñada bajo los principios de la **Norma Internacional ISO 50001**, permite a usuarios y organizaciones identificar, cuantificar y analizar sus flujos de energía sin necesidad de hardware de medición complejo.

A través de una interfaz interactiva y el uso de **Inteligencia Artificial (Google Gemini)**, el sistema transforma datos operativos básicos (inventario de equipos, potencia, horas de uso) en visualizaciones estratégicas y recomendaciones prácticas de ahorro.

## Características Principales

*   **Visualización Avanzada**:
    *   **Diagrama de Sankey**: Mapa flujo de energía desde la fuente hasta el uso final.
    *   **Análisis por Localización**: Gráficos de barras comparativos (Costo vs. Consumo).
    *   **Dispersión Estratégica**: Identificación de ineficiencias (Alta Potencia vs. Alto Uso).
*   **Inteligencia Artificial Integrada**:
    *   Interpretación automática de gráficos.
    *   Generación de **Informes Ejecutivos** con recomendaciones personalizadas.
*   **Privacidad y Seguridad**:
    *   Arquitectura *Client-Side* (lado del cliente).
    *   Las credenciales (API Key) y datos persisten solo en el navegador del usuario (`localStorage`).
*   **Interfaz Corporativa**: Diseño limpio, profesional y adaptativo (Responsive).

## Tecnologías Utilizadas

*   **Core**: HTML5, CSS3 (Variables CSS), JavaScript (ES6+).
*   **Visualización de Datos**: [D3.js](https://d3js.org/) (Data-Driven Documents).
*   **IA / LLM**: [Google Gemini API](https://ai.google.dev/).

## Guía de Uso

### 1. Configuración Inicial
Para habilitar las funciones de Inteligencia Artificial:
1.  Haga clic en el botón **"Configuración"** en la esquina superior derecha.
2.  Ingrese su nombre y su **API Key de Google Gemini**.
3.  Guarde los cambios. (Sus datos permanecen en su dispositivo).

### 2. Ingreso de Datos
1.  Diríjase a la sección **"Inventario de Equipos y Consumo"**.
2.  Utilice el botón **"Agregar Fila"** para inventariar sus equipos.
3.  Ingrese los parámetros técnicos: *Potencia (W), Horas de uso, Factores de carga*.
4.  Haga clic en **"Recalcular y Actualizar"** para procesar los datos.

### 3. Análisis e Informes
1.  Explore las pestañas de gráficos para visualizar su perfil energético.
2.  Utilice los botones **"Analizar con IA"** en cada gráfico para obtener insights instantáneos.
3.  En la sección inferior, genere un **Informe Ejecutivo** completo para la toma de decisiones.

## Licencia y Créditos

**Iniciativa de Código Abierto** bajo la licencia **GNU General Public License v3 (GPLv3)**.

*   **Autor**: Javier Orlando Gómez Martínez
*   **Institución**: Universidad Autónoma de Manizales
*   **Programa**: Especialización en Energías Renovables y Eficiencia Energética
*   **Fecha**: Mayo de 2025

---
<div align="center">
    <sub>Desarrollado con fines educativos y de sostenibilidad energética.</sub>
</div>
