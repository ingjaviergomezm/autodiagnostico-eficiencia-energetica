import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export function exportToExcel(equipos, filteredData, stats, tarifa) {
    // Sheet 1: Equipment Inventory with calculated data
    const inventoryData = filteredData.map(d => ({
        'Tipo': d.tipo,
        'Localización': d.localizacion,
        'Área': d.area,
        'Equipo': d.equipo || d.equipoName,
        'Cantidad': d.cantidad,
        'Potencia (W)': d.potencia,
        'Horas/Día': d.horas,
        'Días/Mes': d.diasMes,
        'F. Carga': d.fCarga,
        'F. Simultaneidad': d.fSimult,
        'Consumo (Wh/mes)': Math.round(d.consumo_wh),
        'Consumo (kWh/mes)': Math.round(d.consumo_wh / 1000 * 100) / 100,
        'Costo (COP/mes)': Math.round(d.costo)
    }));

    const wsInventory = XLSX.utils.json_to_sheet(inventoryData);

    // Set column widths
    wsInventory['!cols'] = [
        { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 30 },
        { wch: 10 }, { wch: 14 }, { wch: 12 }, { wch: 12 },
        { wch: 10 }, { wch: 16 }, { wch: 18 }, { wch: 18 }, { wch: 16 }
    ];

    // Sheet 2: Summary / KPIs
    const summaryData = [
        { 'Indicador': 'Consumo Total (Wh/mes)', 'Valor': Math.round(stats.totalConsumo) },
        { 'Indicador': 'Consumo Total (kWh/mes)', 'Valor': Math.round(stats.totalConsumo / 1000 * 100) / 100 },
        { 'Indicador': 'Costo Total Estimado (COP/mes)', 'Valor': Math.round(stats.totalCosto) },
        { 'Indicador': 'Equipos Activos', 'Valor': stats.equiposActivos },
        { 'Indicador': 'Tarifa (COP/kWh)', 'Valor': tarifa },
        { 'Indicador': 'Fecha de Exportación', 'Valor': new Date().toLocaleDateString('es-CO') },
    ];

    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    wsSummary['!cols'] = [{ wch: 35 }, { wch: 25 }];

    // Sheet 3: Consumption by Location
    const byLocation = {};
    filteredData.forEach(d => {
        if (!byLocation[d.localizacion]) byLocation[d.localizacion] = { consumo: 0, costo: 0, equipos: 0 };
        byLocation[d.localizacion].consumo += d.consumo_wh;
        byLocation[d.localizacion].costo += d.costo;
        byLocation[d.localizacion].equipos += 1;
    });

    const locationData = Object.entries(byLocation).map(([loc, data]) => ({
        'Localización': loc,
        'Equipos': data.equipos,
        'Consumo (kWh/mes)': Math.round(data.consumo / 1000 * 100) / 100,
        'Costo (COP/mes)': Math.round(data.costo),
        '% del Total': ((data.consumo / stats.totalConsumo) * 100).toFixed(1) + '%'
    }));

    const wsLocation = XLSX.utils.json_to_sheet(locationData);
    wsLocation['!cols'] = [{ wch: 20 }, { wch: 10 }, { wch: 20 }, { wch: 18 }, { wch: 14 }];

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsInventory, 'Inventario');
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen');
    XLSX.utils.book_append_sheet(wb, wsLocation, 'Por Localización');

    // Download using Base64 Data URI to avoid Blob interception issues
    const fileName = `Diagnostico_Energetico_ISO50001_${new Date().toISOString().split('T')[0]}.xlsx`;
    const b64 = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
    const dataUri = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + b64;

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = dataUri;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();

    // Cleanup
    setTimeout(() => {
        document.body.removeChild(a);
    }, 100);
}
