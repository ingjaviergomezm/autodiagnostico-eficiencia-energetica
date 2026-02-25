import React, { useState, useEffect, useMemo } from 'react';
import { FlaskConical, RotateCcw, TrendingDown, TrendingUp, Zap, DollarSign, Trash2 } from 'lucide-react';

export default function Simulator({ dataState }) {
    const { filteredData, tarifa, stats } = dataState;
    const [escenario, setEscenario] = useState([]);

    // Initialize scenario with current filtered data
    useEffect(() => {
        resetSimulator();
    }, [filteredData]); // Re-sync if original data changes significantly

    const resetSimulator = () => {
        setEscenario(JSON.parse(JSON.stringify(filteredData)));
    };

    const updateEscenarioEquipo = (id, field, value) => {
        setEscenario(prev => prev.map(eq => {
            if (eq.id === id) {
                const updated = { ...eq, [field]: Number(value) || 0 };
                // Recalculate consumption and cost for this equipment
                const consumoDia = (updated.potencia * updated.cantidad * updated.horas) * updated.fCarga * updated.fSimult;
                const consumoMesWh = consumoDia * updated.diasMes;
                const consumoMesKWh = consumoMesWh / 1000;

                updated.consumo_wh = consumoMesWh;
                updated.costo = consumoMesKWh * tarifa;
                return updated;
            }
            return eq;
        }));
    };

    const deleteFromEscenario = (id) => {
        setEscenario(prev => prev.filter(eq => eq.id !== id));
    };

    // Calculate Scenario Stats
    const simStats = useMemo(() => {
        const totalConsumo = escenario.reduce((acc, eq) => acc + eq.consumo_wh, 0);
        const totalCosto = escenario.reduce((acc, eq) => acc + Math.max(0, eq.costo), 0);
        return { totalConsumo, totalCosto, equiposActivos: escenario.length };
    }, [escenario]);

    // Calculate Savings
    const savings = useMemo(() => {
        const diffConsumo = stats.totalConsumo - simStats.totalConsumo;
        const diffCosto = stats.totalCosto - simStats.totalCosto;
        const pctConsumo = stats.totalConsumo > 0 ? (diffConsumo / stats.totalConsumo) * 100 : 0;

        return {
            consumo: diffConsumo,
            costo: diffCosto,
            pct: pctConsumo,
            isSaving: diffConsumo >= 0
        };
    }, [stats, simStats]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <FlaskConical className="text-sky-400" />
                        Simulador de Escenarios
                    </h2>
                    <p className="text-slate-400">Evalúe el impacto de cambios operativos en el consumo y costo energético.</p>
                </div>
                <button
                    onClick={resetSimulator}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors border border-slate-600"
                >
                    <RotateCcw size={16} />
                    Restaurar Original
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Results Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Actual vs Sim */}
                    <div className="glass-panel p-6 border-slate-700/50">
                        <h3 className="text-lg font-semibold mb-6 border-b border-slate-800 pb-2">Impacto del Escenario</h3>

                        <div className="space-y-6">
                            {/* Consumo */}
                            <div>
                                <p className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2"><Zap size={14} className="text-sky-400" /> Consumo (kWh/mes)</p>
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-xl font-bold text-white">{Math.round(simStats.totalConsumo / 1000).toLocaleString('es-CO')}</span>
                                    <span className="text-sm text-slate-500 line-through">{Math.round(stats.totalConsumo / 1000).toLocaleString('es-CO')}</span>
                                </div>
                                <div className={`text-sm font-semibold flex items-center gap-1 ${savings.isSaving ? 'text-green-400' : 'text-red-400'}`}>
                                    {savings.isSaving ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                                    {Math.abs(savings.consumo / 1000).toLocaleString('es-CO', { maximumFractionDigits: 1 })} kWh ({Math.abs(savings.pct).toFixed(1)}%)
                                </div>
                            </div>

                            {/* Costo */}
                            <div>
                                <p className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2"><DollarSign size={14} className="text-green-400" /> Costo Estimado (COP)</p>
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-xl font-bold text-white">${Math.round(simStats.totalCosto).toLocaleString('es-CO')}</span>
                                    <span className="text-sm text-slate-500 line-through">${Math.round(stats.totalCosto).toLocaleString('es-CO')}</span>
                                </div>
                                <div className={`text-sm font-semibold flex items-center gap-1 ${savings.isSaving ? 'text-green-400' : 'text-red-400'}`}>
                                    {savings.isSaving ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                                    ${Math.abs(savings.costo).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                                </div>
                            </div>
                        </div>

                        {/* Summary Widget */}
                        <div className={`mt-6 p-4 rounded-xl border ${savings.isSaving ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                            <p className="text-sm font-medium mb-1 text-slate-300">
                                {savings.isSaving ? 'Ahorro Potencial' : 'Incremento Proyectado'}
                            </p>
                            <h4 className={`text-2xl font-bold ${savings.isSaving ? 'text-green-400' : 'text-red-400'}`}>
                                ${Math.abs(savings.costo).toLocaleString('es-CO')} <span className="text-sm font-normal">/mes</span>
                            </h4>
                            {savings.isSaving && savings.costo > 0 && (
                                <p className="text-xs text-green-300/70 mt-2">
                                    ~${(savings.costo * 12).toLocaleString('es-CO')} al año
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Editable Table */}
                <div className="lg:col-span-3 glass-panel p-6 border-slate-700/50 overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Editar Variables Operativas</h3>
                        <p className="text-xs text-sky-400 bg-sky-500/10 px-2 py-1 rounded border border-sky-500/20">Modificaciones sólo afectan la simulación</p>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar flex-1">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className="border-b border-slate-700/60 text-sm text-slate-400">
                                    <th className="py-3 px-2 font-medium">Equipo / Área</th>
                                    <th className="py-3 px-2 font-medium w-20">Cant.</th>
                                    <th className="py-3 px-2 font-medium w-24">Pot.(W)</th>
                                    <th className="py-3 px-2 font-medium w-20">Hrs/Día</th>
                                    <th className="py-3 px-2 font-medium w-20">Días/Mes</th>
                                    <th className="py-3 px-2 font-medium text-right w-24">Wh/Mes</th>
                                    <th className="py-3 px-2 font-medium text-center w-12"></th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-slate-800/60">
                                {escenario.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-slate-500">
                                            No hay equipos en la simulación. Considere restablecer el escenario.
                                        </td>
                                    </tr>
                                ) : escenario.map((eq) => {
                                    const originalEq = stats.equiposActivos > 0 ? filteredData.find(d => d.id === eq.id) : null;
                                    const changed = originalEq && (
                                        eq.cantidad !== originalEq.cantidad ||
                                        eq.potencia !== originalEq.potencia ||
                                        eq.horas !== originalEq.horas ||
                                        eq.diasMes !== originalEq.diasMes
                                    );

                                    return (
                                        <tr key={eq.id} className={`transition-colors ${changed ? 'bg-sky-500/5' : 'hover:bg-slate-800/40'}`}>
                                            <td className="py-2 px-2">
                                                <div className="font-medium text-slate-200">{eq.equipoName}</div>
                                                <div className="text-xs text-slate-500">{eq.localizacion} - {eq.area}</div>
                                            </td>
                                            <td className="py-2 px-2">
                                                <input
                                                    type="number" min="1"
                                                    value={eq.cantidad}
                                                    onChange={e => updateEscenarioEquipo(eq.id, 'cantidad', e.target.value)}
                                                    className={`bg-slate-900 border rounded p-1.5 w-full text-white outline-none focus:border-sky-500 transition-colors ${changed && eq.cantidad !== originalEq?.cantidad ? 'border-sky-500/50 text-sky-300' : 'border-slate-700'}`}
                                                />
                                            </td>
                                            <td className="py-2 px-2">
                                                <input
                                                    type="number" min="0"
                                                    value={eq.potencia}
                                                    onChange={e => updateEscenarioEquipo(eq.id, 'potencia', e.target.value)}
                                                    className={`bg-slate-900 border rounded p-1.5 w-full text-white outline-none focus:border-sky-500 transition-colors ${changed && eq.potencia !== originalEq?.potencia ? 'border-sky-500/50 text-sky-300' : 'border-slate-700'}`}
                                                />
                                            </td>
                                            <td className="py-2 px-2">
                                                <input
                                                    type="number" min="0" max="24" step="0.5"
                                                    value={eq.horas}
                                                    onChange={e => updateEscenarioEquipo(eq.id, 'horas', e.target.value)}
                                                    className={`bg-slate-900 border rounded p-1.5 w-full text-white outline-none focus:border-sky-500 transition-colors ${changed && eq.horas !== originalEq?.horas ? 'border-sky-500/50 text-sky-300' : 'border-slate-700'}`}
                                                />
                                            </td>
                                            <td className="py-2 px-2">
                                                <input
                                                    type="number" min="0" max="31"
                                                    value={eq.diasMes}
                                                    onChange={e => updateEscenarioEquipo(eq.id, 'diasMes', e.target.value)}
                                                    className={`bg-slate-900 border rounded p-1.5 w-full text-white outline-none focus:border-sky-500 transition-colors ${changed && eq.diasMes !== originalEq?.diasMes ? 'border-sky-500/50 text-sky-300' : 'border-slate-700'}`}
                                                />
                                            </td>
                                            <td className="py-2 px-2 text-right">
                                                <div className={`font-medium ${changed ? 'text-sky-400' : 'text-slate-300'}`}>
                                                    {Math.round(eq.consumo_wh).toLocaleString('es-CO')}
                                                </div>
                                            </td>
                                            <td className="py-2 px-2 text-center">
                                                <button
                                                    onClick={() => deleteFromEscenario(eq.id)}
                                                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                                    title="Eliminar del escenario"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
