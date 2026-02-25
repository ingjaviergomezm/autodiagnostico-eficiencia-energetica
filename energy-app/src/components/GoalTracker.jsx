import React, { useState } from 'react';
import { Target, AlertCircle, Edit2, Check, X, TrendingDown, TrendingUp } from 'lucide-react';

export default function GoalTracker({ baseline, stats, goals, saveGoals }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(goals.targetReduction);
    const [editUnit, setEditUnit] = useState(goals.unit);

    if (!baseline) {
        return (
            <div className="glass-panel p-6 border border-slate-700/50">
                <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
                    <Target className="text-purple-400" />
                    Metas Energéticas
                </h3>
                <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg text-slate-400">
                    <AlertCircle className="text-sky-400" size={20} />
                    <p className="text-sm">Para establecer metas de reducción, primero debe definir una Línea Base Energética (EnB).</p>
                </div>
            </div>
        );
    }

    const baseKWh = baseline.totalConsumo / 1000;
    const currentKWh = stats.totalConsumo / 1000;

    // Calculate Target
    let targetReductionKWh = 0;
    if (goals.unit === 'percent') {
        targetReductionKWh = baseKWh * (goals.targetReduction / 100);
    } else {
        targetReductionKWh = goals.targetReduction; // Already in kWh
    }

    const targetEnergyKWh = baseKWh - targetReductionKWh;

    // Calculate Progress (0 to 100)
    // 0 = at baseline or worse, 100 = at target or better
    const achievedReduction = baseKWh - currentKWh;

    let progressPct = 0;
    if (targetReductionKWh > 0) {
        progressPct = (achievedReduction / targetReductionKWh) * 100;
        if (progressPct < 0) progressPct = 0;
        if (progressPct > 100) progressPct = 100;
    }

    const handleSave = () => {
        saveGoals({ targetReduction: Number(editValue) || 0, unit: editUnit });
        setIsEditing(false);
    };

    return (
        <div className="glass-panel p-6 border border-slate-700/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Target className="text-purple-400" />
                        Objetivo de Reducción
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                        Meta ISO 50001 respecto a la Línea Base
                    </p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors border border-slate-700"
                        title="Editar Meta"
                    >
                        <Edit2 size={16} />
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="bg-slate-900/80 p-4 rounded-xl border border-purple-500/30 mb-6 relative z-10">
                    <h4 className="text-sm font-medium mb-3 text-slate-300">Configurar Meta</h4>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                            <label className="text-xs text-slate-500 block mb-1">Reducción Esperada</label>
                            <input
                                type="number"
                                min="0" step="0.1"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs text-slate-500 block mb-1">Unidad</label>
                            <select
                                value={editUnit}
                                onChange={(e) => setEditUnit(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500"
                            >
                                <option value="percent">Porcentaje (%)</option>
                                <option value="kwh">Absoluto (kWh)</option>
                            </select>
                        </div>
                        <div className="flex items-end gap-2 pb-0.5">
                            <button onClick={handleSave} className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors" title="Guardar">
                                <Check size={20} />
                            </button>
                            <button onClick={() => setIsEditing(false)} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700" title="Cancelar">
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
                {/* Progress Visualizer */}
                <div className="flex flex-col items-center justify-center">
                    <div className="relative w-48 h-48 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            {/* Track */}
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="8" />
                            {/* Progress */}
                            <circle
                                cx="50" cy="50" r="45" fill="none"
                                stroke={progressPct >= 100 ? "#22c55e" : "#a855f7"}
                                strokeWidth="8" strokeLinecap="round"
                                strokeDasharray="283"
                                strokeDashoffset={283 - (283 * progressPct) / 100}
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
                                {Math.round(progressPct)}%
                            </span>
                            <span className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Completado</span>
                        </div>
                    </div>
                    {progressPct >= 100 && (
                        <div className="mt-4 px-3 py-1 bg-green-500/10 text-green-400 text-sm font-semibold rounded-full border border-green-500/20">
                            ¡Meta Alcanzada! 🎉
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="space-y-5">
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                        <p className="text-sm font-medium text-slate-400 mb-1">Meta Configurada</p>
                        <p className="text-xl font-bold text-white">
                            Reducir {goals.targetReduction} {goals.unit === 'percent' ? '%' : 'kWh'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            Equivalente a {targetReductionKWh.toLocaleString('es-CO', { maximumFractionDigits: 1 })} kWh de ahorro esperado.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900/30 p-3 rounded-lg border border-slate-800 relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-500"></div>
                            <p className="text-xs text-slate-400 mb-1">Consumo Base</p>
                            <p className="font-semibold text-slate-200">{Math.round(baseKWh).toLocaleString('es-CO')} kWh</p>
                        </div>
                        <div className="bg-slate-900/30 p-3 rounded-lg border border-slate-800 relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>
                            <p className="text-xs text-slate-400 mb-1">Consumo Objetivo</p>
                            <p className="font-semibold text-white">{Math.round(targetEnergyKWh).toLocaleString('es-CO')} kWh</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                        <div className={`p-2 rounded-lg ${achievedReduction > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            {achievedReduction > 0 ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
                        </div>
                        <div>
                            <p className="text-sm font-medium">Estado Actual</p>
                            <p className="text-xs text-slate-400">
                                {achievedReduction > 0 ? 'Reducción de ' : 'Aumento de '}
                                {Math.abs(achievedReduction).toLocaleString('es-CO', { maximumFractionDigits: 1 })} kWh
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
