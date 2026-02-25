import React, { useState } from 'react';
import { Ruler, Users, PackageCheck, Zap } from 'lucide-react';

export default function EnPIPanel({ stats, normalization, saveNormalization }) {
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        areaMt2: normalization.areaMt2 || '',
        empleados: normalization.empleados || '',
        produccion: normalization.produccion || ''
    });

    const handleSave = () => {
        saveNormalization({
            areaMt2: Number(formData.areaMt2) || 0,
            empleados: Number(formData.empleados) || 0,
            produccion: Number(formData.produccion) || 0
        });
        setEditMode(false);
    };

    const renderEnPI = (title, value, unit, icon) => (
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center text-center">
            <div className="p-2 bg-slate-800/80 rounded-full mb-3 text-sky-400">
                {icon}
            </div>
            <p className="text-sm text-slate-400 font-medium mb-1">{title}</p>
            {value !== null ? (
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold bg-gradient-to-r from-sky-300 to-sky-100 bg-clip-text text-transparent">
                        {value.toLocaleString('es-CO', { maximumFractionDigits: 1 })}
                    </span>
                    <span className="text-xs text-sky-500 font-semibold">{unit}</span>
                </div>
            ) : (
                <span className="text-lg font-medium text-slate-600 italic">Sin datos</span>
            )}
        </div>
    );

    return (
        <div className="glass-panel p-6 border border-slate-700/50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Zap className="text-sky-400" />
                        Indicadores de Desempeño Energético (IDEn)
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">Normalización del consumo (EnPIs) según factores operativos.</p>
                </div>
                {!editMode ? (
                    <button
                        onClick={() => setEditMode(true)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors border border-slate-700"
                    >
                        Configurar Factores
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm rounded-lg transition-colors font-medium"
                        >
                            Guardar
                        </button>
                        <button
                            onClick={() => {
                                setFormData({
                                    areaMt2: normalization.areaMt2 || '',
                                    empleados: normalization.empleados || '',
                                    produccion: normalization.produccion || ''
                                });
                                setEditMode(false);
                            }}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors border border-slate-700"
                        >
                            Cancelar
                        </button>
                    </div>
                )}
            </div>

            {editMode && (
                <div className="bg-slate-900/80 p-5 rounded-xl border border-sky-500/30 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 transition-all">
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Área Total (m²)</label>
                        <div className="relative">
                            <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
                            <input
                                type="number" min="0"
                                value={formData.areaMt2}
                                onChange={(e) => setFormData({ ...formData, areaMt2: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white outline-none focus:border-sky-500"
                                placeholder="Ej: 500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Empleados (Personas)</label>
                        <div className="relative">
                            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
                            <input
                                type="number" min="0"
                                value={formData.empleados}
                                onChange={(e) => setFormData({ ...formData, empleados: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white outline-none focus:border-sky-500"
                                placeholder="Ej: 15"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Producción (Unidades/mes)</label>
                        <div className="relative">
                            <PackageCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
                            <input
                                type="number" min="0"
                                value={formData.produccion}
                                onChange={(e) => setFormData({ ...formData, produccion: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white outline-none focus:border-sky-500"
                                placeholder="Ej: 10000"
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderEnPI('Intensidad Energética', stats.kwhPorMt2, 'kWh/m²', <Ruler size={24} />)}
                {renderEnPI('Consumo Per Cápita', stats.kwhPorEmpleado, 'kWh/pers', <Users size={24} />)}
                {renderEnPI('Eficiencia Productiva', stats.kwhPorProduccion, 'kWh/und', <PackageCheck size={24} />)}
            </div>
        </div>
    );
}
