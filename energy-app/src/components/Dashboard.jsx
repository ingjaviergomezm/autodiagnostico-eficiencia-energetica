import { useState } from 'react';
import { Zap, DollarSign, Activity, TrendingDown, TrendingUp, Sparkles, Plus, Trash2, BarChart3, PieChart as PieChartIcon, Download, Upload } from 'lucide-react';
import EnergySankey from './EnergySankey';
import BarChart from './BarChart';
import PieChart from './PieChart';
import AIReportModal from './AIReportModal';
import ImportModal from './ImportModal';
import FilterBar from './FilterBar';
import BaselineComparison from './BaselineComparison';
import GoalTracker from './GoalTracker';
import EnPIPanel from './EnPIPanel';
import TimelineChart from './TimelineChart';
import { exportToExcel } from '../services/exportService';
import * as d3 from 'd3';

export default function Dashboard({ dataState }) {
    const { equipos, tarifa, setTarifa, addEquipo, updateEquipo, deleteEquipo, filteredData, stats, config, importEquipos } = dataState;
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);

    return (
        <div className="space-y-6">

            {/* Top action bar */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold" style={{ color: '#ecfdf5' }}>Vista General</h2>
                    <p className="text-sm" style={{ color: 'rgba(110, 231, 183, 0.55)' }}>Análisis y optimización de su consumo energético</p>
                </div>
                <button onClick={() => setIsReportOpen(true)} className="btn-primary">
                    <Sparkles size={16} />
                    <span>Generar Informe IA</span>
                </button>
            </div>

            {/* KPIs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Consumption */}
                <div className="kpi-card group">
                    <div className="absolute -right-4 -top-4 w-28 h-28 rounded-full blur-2xl transition-all"
                        style={{ background: 'rgba(16, 185, 129, 0.12)' }}></div>
                    <div className="flex items-start justify-between relative">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(110, 231, 183, 0.50)' }}>Consumo Total</p>
                            <h3 className="text-3xl font-bold neon-text-green mono">{Math.round(stats.totalConsumo / 1000).toLocaleString('es-CO')} <span className="text-base font-normal" style={{ color: 'rgba(110, 231, 183, 0.60)' }}>kWh</span></h3>
                        </div>
                        <div className="p-2.5 rounded-xl" style={{ background: 'rgba(16, 185, 129, 0.10)', border: '1px solid rgba(16, 185, 129, 0.20)' }}>
                            <Zap style={{ color: '#34d399' }} size={22} />
                        </div>
                    </div>
                </div>

                {/* Estimated Cost */}
                <div className="kpi-card group">
                    <div className="absolute -right-4 -top-4 w-28 h-28 rounded-full blur-2xl transition-all"
                        style={{ background: 'rgba(245, 158, 11, 0.10)' }}></div>
                    <div className="flex items-start justify-between relative">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(110, 231, 183, 0.50)' }}>Costo Estimado</p>
                            <h3 className="text-3xl font-bold neon-text-amber mono">${Math.round(stats.totalCosto).toLocaleString('es-CO')} <span className="text-base font-normal" style={{ color: 'rgba(110, 231, 183, 0.60)' }}>COP</span></h3>
                        </div>
                        <div className="p-2.5 rounded-xl" style={{ background: 'rgba(245, 158, 11, 0.10)', border: '1px solid rgba(245, 158, 11, 0.20)' }}>
                            <DollarSign style={{ color: '#fbbf24' }} size={22} />
                        </div>
                    </div>
                </div>

                {/* Active Equipment */}
                <div className="kpi-card group">
                    <div className="absolute -right-4 -top-4 w-28 h-28 rounded-full blur-2xl transition-all"
                        style={{ background: 'rgba(16, 185, 129, 0.08)' }}></div>
                    <div className="flex items-start justify-between relative">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(110, 231, 183, 0.50)' }}>Equipos Activos</p>
                            <h3 className="text-3xl font-bold neon-text-green mono">{stats.equiposActivos} <span className="text-base font-normal" style={{ color: 'rgba(110, 231, 183, 0.60)' }}>Unidades</span></h3>
                        </div>
                        <div className="p-2.5 rounded-xl" style={{ background: 'rgba(16, 185, 129, 0.10)', border: '1px solid rgba(16, 185, 129, 0.20)' }}>
                            <Activity style={{ color: '#34d399' }} size={22} />
                        </div>
                    </div>
                </div>
            </div>

            {/* EnPIs (Indicadores de Desempeño Energético) */}
            <EnPIPanel
                stats={stats}
                normalization={dataState.normalization}
                saveNormalization={dataState.saveNormalization}
            />

            {/* Filter Bar */}
            <FilterBar
                filters={dataState.filters}
                setFilters={dataState.setFilters}
                filterOptions={dataState.filterOptions}
            />

            {/* Inventory Table */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="glass-panel p-6 xl:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold" style={{ color: '#ecfdf5' }}>Inventario de Equipos</h3>
                        <div className="flex items-center gap-2.5">
                            <button
                                onClick={() => setIsImportOpen(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                                style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.18)', color: '#6ee7b7' }}
                                title="Importar desde Excel"
                            >
                                <Upload size={13} /> Importar
                            </button>
                            <button
                                onClick={() => exportToExcel(equipos, filteredData, stats, tarifa)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                                style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.18)', color: '#fcd34d' }}
                                title="Exportar a Excel"
                            >
                                <Download size={13} /> Exportar
                            </button>
                            <label className="text-xs" style={{ color: 'rgba(110, 231, 183, 0.50)' }}>Tarifa (COP/kWh):</label>
                            <div className="flex items-center rounded-lg px-3 py-1.5 transition-all"
                                style={{ background: 'rgba(6,12,8,0.8)', border: '1px solid rgba(16,185,129,0.18)' }}>
                                <span className="mr-2 text-xs" style={{ color: 'rgba(110,231,183,0.40)' }}>$</span>
                                <input
                                    type="number"
                                    value={tarifa}
                                    onChange={e => setTarifa(e.target.value)}
                                    step={0.0001}
                                    className="bg-transparent border-none outline-none w-20 text-sm mono"
                                    style={{ color: '#34d399' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="text-xs uppercase tracking-wider" style={{ borderBottom: '1px solid rgba(16,185,129,0.15)', color: 'rgba(110,231,183,0.50)' }}>
                                    <th className="py-3 px-2 font-semibold">Tipo</th>
                                    <th className="py-3 px-2 font-semibold">Localización</th>
                                    <th className="py-3 px-2 font-semibold">Área</th>
                                    <th className="py-3 px-2 font-semibold">Equipo</th>
                                    <th className="py-3 px-2 font-semibold w-16">Cant.</th>
                                    <th className="py-3 px-2 font-semibold w-20">Pot.(W)</th>
                                    <th className="py-3 px-2 font-semibold w-16">Hrs/Día</th>
                                    <th className="py-3 px-2 font-semibold w-16 text-right">Wh/Mes</th>
                                    <th className="py-3 px-2 font-semibold w-24 text-right">Costo (COP)</th>
                                    <th className="py-3 px-2 font-semibold w-10 text-center">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm" style={{ borderColor: 'rgba(16,185,129,0.08)' }}>
                                {equipos.map((eq) => {
                                    const eqData = filteredData.find(d => d.id === eq.id);
                                    const whMes = eqData ? eqData.consumo_wh : 0;
                                    const costoMes = eqData ? eqData.costo : 0;

                                    return (
                                        <tr key={eq.id} className="transition-colors" style={{ borderBottom: '1px solid rgba(16,185,129,0.07)' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.04)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <td className="py-2 px-2">
                                                <select
                                                    value={eq.tipo}
                                                    onChange={(e) => updateEquipo(eq.id, 'tipo', e.target.value)}
                                                    className="rounded p-1 text-xs outline-none w-24"
                                                    style={{ background: 'rgba(6,12,8,0.8)', border: '1px solid rgba(16,185,129,0.18)', color: '#a7f3d0' }}
                                                >
                                                    <option value="Eléctrica">Eléctrica</option>
                                                    <option value="Gas">Gas</option>
                                                    <option value="Otro">Otro</option>
                                                </select>
                                            </td>
                                            <td className="py-2 px-2">
                                                <input type="text" value={eq.localizacion} onChange={e => updateEquipo(eq.id, 'localizacion', e.target.value)} className="rounded p-1 text-xs w-full outline-none" style={{ background: 'rgba(6,12,8,0.8)', border: '1px solid rgba(16,185,129,0.14)', color: '#a7f3d0' }} placeholder="Localización" />
                                            </td>
                                            <td className="py-2 px-2">
                                                <input type="text" value={eq.area} onChange={e => updateEquipo(eq.id, 'area', e.target.value)} className="rounded p-1 text-xs w-full outline-none" style={{ background: 'rgba(6,12,8,0.8)', border: '1px solid rgba(16,185,129,0.14)', color: '#a7f3d0' }} placeholder="Área" />
                                            </td>
                                            <td className="py-2 px-2">
                                                <input type="text" value={eq.equipo} onChange={e => updateEquipo(eq.id, 'equipo', e.target.value)} className="rounded p-1 text-xs w-full outline-none" style={{ background: 'rgba(6,12,8,0.8)', border: '1px solid rgba(16,185,129,0.14)', color: '#ecfdf5' }} placeholder="Nombre de Equipo" />
                                            </td>
                                            <td className="py-2 px-2">
                                                <input type="number" min="0" value={eq.cantidad} onChange={e => updateEquipo(eq.id, 'cantidad', e.target.value)} className="rounded p-1 text-xs w-full outline-none text-center mono" style={{ background: 'rgba(6,12,8,0.8)', border: '1px solid rgba(16,185,129,0.14)', color: '#a7f3d0' }} />
                                            </td>
                                            <td className="py-2 px-2">
                                                <input type="number" min="0" value={eq.potencia} onChange={e => updateEquipo(eq.id, 'potencia', e.target.value)} className="rounded p-1 text-xs w-full outline-none text-right mono" style={{ background: 'rgba(6,12,8,0.8)', border: '1px solid rgba(16,185,129,0.14)', color: '#a7f3d0' }} />
                                            </td>
                                            <td className="py-2 px-2">
                                                <input type="number" min="0" max="24" step="0.5" value={eq.horas} onChange={e => updateEquipo(eq.id, 'horas', e.target.value)} className="rounded p-1 text-xs w-full outline-none text-center mono" style={{ background: 'rgba(6,12,8,0.8)', border: '1px solid rgba(16,185,129,0.14)', color: '#a7f3d0' }} />
                                            </td>
                                            <td className="py-2 px-2 text-right mono text-xs" style={{ color: '#34d399' }}>
                                                {Math.round(whMes).toLocaleString('es-CO')}
                                            </td>
                                            <td className="py-2 px-2 text-right mono text-xs" style={{ color: '#fbbf24' }}>
                                                ${Math.round(costoMes).toLocaleString('es-CO')}
                                            </td>
                                            <td className="py-2 px-2 text-center">
                                                <button onClick={() => deleteEquipo(eq.id)} className="p-1 transition-colors" title="Eliminar equipo" disabled={equipos.length <= 1} style={{ color: 'rgba(110,231,183,0.30)' }}
                                                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(110,231,183,0.30)'}>
                                                    <Trash2 size={15} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                <tr>
                                    <td colSpan={10} className="py-4 text-center">
                                        <button onClick={addEquipo} className="flex items-center gap-1.5 mx-auto text-xs font-medium transition-colors"
                                            style={{ color: 'rgba(52,211,153,0.70)' }}
                                            onMouseEnter={e => e.currentTarget.style.color = '#34d399'}
                                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(52,211,153,0.70)'}>
                                            <Plus size={14} /> Agregar nuevo equipo
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Sankey Chart Section */}
            <div id="chart-sankey" className="glass-panel p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#ecfdf5' }}>
                    <span>Flujo Energético</span>
                    <span className="text-xs px-2 py-0.5 rounded-md badge badge-green">Interactivo</span>
                </h3>
                <p className="text-sm mb-6" style={{ color: 'rgba(110, 231, 183, 0.50)' }}>Visualización de la distribución de energía desde la fuente hasta el uso final.</p>

                <div className="w-full h-96 rounded-xl flex items-center justify-center p-4" style={{ background: 'rgba(6,12,8,0.60)', border: '1px solid rgba(16,185,129,0.12)' }}>
                    <EnergySankey data={filteredData} tarifa={tarifa} />
                </div>
            </div>

            {/* Baseline Comparison */}
            <BaselineComparison
                baseline={dataState.baseline}
                saveBaseline={dataState.saveBaseline}
                clearBaseline={dataState.clearBaseline}
                stats={stats}
                filteredData={filteredData}
            />

            {/* Goal Tracker */}
            <GoalTracker
                baseline={dataState.baseline}
                stats={stats}
                goals={dataState.goals}
                saveGoals={dataState.saveGoals}
            />

            {/* Additional Analytics Charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Consumo por Localización */}
                <div id="chart-bar-location" className="glass-panel p-6">
                    <h3 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: '#ecfdf5' }}>
                        <BarChart3 size={16} style={{ color: '#34d399' }} />
                        <span>Consumo por Localización</span>
                    </h3>
                    <BarChart data={filteredData} mode="consumo" />
                </div>

                {/* Consumo por Área */}
                <div id="chart-pie-area" className="glass-panel p-6">
                    <h3 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: '#ecfdf5' }}>
                        <PieChartIcon size={16} style={{ color: '#fbbf24' }} />
                        <span>Consumo por Área</span>
                    </h3>
                    <PieChart data={filteredData} categoryKey="area" valueKey="consumo_wh" colors={d3.schemeSet3} />
                </div>

                {/* Costo por Fuente */}
                <div className="glass-panel p-6">
                    <h3 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: '#ecfdf5' }}>
                        <PieChartIcon size={16} style={{ color: '#34d399' }} />
                        <span>Costo por Tipo</span>
                    </h3>
                    <PieChart data={filteredData} categoryKey="tipo" valueKey="costo" colors={d3.schemePaired} />
                </div>
            </div>

            {/* Timeline History */}
            <div id="chart-timeline">
                <TimelineChart
                    history={dataState.history}
                    saveMonthlyRecord={dataState.saveMonthlyRecord}
                    clearHistory={dataState.clearHistory}
                />
            </div>

            {/* Modals */}
            {
                isReportOpen && (
                    <AIReportModal
                        onClose={() => setIsReportOpen(false)}
                        config={config}
                        stats={stats}
                        filteredData={filteredData}
                    />
                )
            }
            {
                isImportOpen && (
                    <ImportModal
                        onClose={() => setIsImportOpen(false)}
                        onImport={importEquipos}
                    />
                )
            }

        </div >
    );
}
