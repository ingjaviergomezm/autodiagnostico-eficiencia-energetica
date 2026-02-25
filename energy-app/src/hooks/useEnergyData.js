import { useState, useMemo, useEffect } from 'react';

const CONFIG_KEY = 'iso50001_app_config';

const DEFAULT_EQUIPOS = [
    { id: 1, tipo: 'Eléctrica', localizacion: 'Barra', area: 'Preparación', equipo: 'Máquina de Café Espresso', cantidad: 1, potencia: 3500, horas: 12, diasMes: 30, fCarga: 0.8, fSimult: 1 },
    { id: 2, tipo: 'Eléctrica', localizacion: 'Barra', area: 'Preparación', equipo: 'Molino de Café', cantidad: 2, potencia: 350, horas: 4, diasMes: 30, fCarga: 0.5, fSimult: 0.5 },
    { id: 3, tipo: 'Eléctrica', localizacion: 'Salón', area: 'Exhibición', equipo: 'Vitrina Refrigerada', cantidad: 1, potencia: 600, horas: 24, diasMes: 30, fCarga: 0.6, fSimult: 1 },
    { id: 4, tipo: 'Eléctrica', localizacion: 'Cocina', area: 'Almacenamiento', equipo: 'Refrigerador Vertical', cantidad: 2, potencia: 800, horas: 24, diasMes: 30, fCarga: 0.6, fSimult: 1 },
    { id: 5, tipo: 'Eléctrica', localizacion: 'Cocina', area: 'Preparación', equipo: 'Horno Microondas', cantidad: 1, potencia: 1200, horas: 2, diasMes: 30, fCarga: 1, fSimult: 1 },
    { id: 6, tipo: 'Eléctrica', localizacion: 'Barra', area: 'Preparación', equipo: 'Licuadora Comercial', cantidad: 2, potencia: 1500, horas: 3, diasMes: 30, fCarga: 0.7, fSimult: 0.5 },
    { id: 7, tipo: 'Eléctrica', localizacion: 'Salón', area: 'Iluminación', equipo: 'Lámparas LED (Techo)', cantidad: 15, potencia: 18, horas: 14, diasMes: 30, fCarga: 1, fSimult: 1 },
    { id: 8, tipo: 'Eléctrica', localizacion: 'Cocina', area: 'Iluminación', equipo: 'Paneles LED (Cocina)', cantidad: 4, potencia: 36, horas: 14, diasMes: 30, fCarga: 1, fSimult: 1 },
    { id: 9, tipo: 'Eléctrica', localizacion: 'Salón', area: 'Climatización', equipo: 'Aire Acondicionado', cantidad: 2, potencia: 2500, horas: 12, diasMes: 30, fCarga: 0.8, fSimult: 1 },
    { id: 10, tipo: 'Eléctrica', localizacion: 'Caja', area: 'Administración', equipo: 'Punto de Venta / Caja', cantidad: 1, potencia: 150, horas: 14, diasMes: 30, fCarga: 0.5, fSimult: 1 },
];
const DEFAULT_TARIFA = 858.43;

export function useEnergyData(projectId = 'default') {
    const DATA_KEY = projectId === 'default' ? 'iso50001_app_data' : `iso50001_app_data_${projectId}`;
    const BASELINE_KEY = projectId === 'default' ? 'iso50001_baseline' : `iso50001_baseline_${projectId}`;
    const GOALS_KEY = projectId === 'default' ? 'iso50001_goals' : `iso50001_goals_${projectId}`;
    const NORMALIZATION_KEY = projectId === 'default' ? 'iso50001_normalization' : `iso50001_normalization_${projectId}`;
    const HISTORY_KEY = projectId === 'default' ? 'iso50001_history' : `iso50001_history_${projectId}`;

    // Inline loadSavedData for dynamic key
    const savedData = useMemo(() => {
        try {
            const stored = localStorage.getItem(DATA_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                return {
                    equipos: parsed.equipos || DEFAULT_EQUIPOS,
                    tarifa: parsed.tarifa ?? DEFAULT_TARIFA
                };
            }
        } catch (e) {
            console.error('Error loading saved data:', e);
        }
        return { equipos: DEFAULT_EQUIPOS, tarifa: DEFAULT_TARIFA };
    }, [DATA_KEY]);
    const [tarifa, setTarifa] = useState(savedData.tarifa);
    const [equipos, setEquipos] = useState(savedData.equipos);

    const [filters, setFilters] = useState({
        energia: 'all',
        localizacion: 'all',
        area: 'all',
        consumo: 'all'
    });

    const [baseline, setBaseline] = useState(() => {
        try {
            const stored = localStorage.getItem(BASELINE_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            return null;
        }
    });

    const [goals, setGoals] = useState(() => {
        try {
            const stored = localStorage.getItem(GOALS_KEY);
            return stored ? JSON.parse(stored) : { targetReduction: 10, unit: 'percent' };
        } catch (e) {
            return { targetReduction: 10, unit: 'percent' };
        }
    });

    const [normalization, setNormalization] = useState(() => {
        try {
            const stored = localStorage.getItem(NORMALIZATION_KEY);
            return stored ? JSON.parse(stored) : { areaMt2: 0, empleados: 0, produccion: 0 };
        } catch (e) {
            return { areaMt2: 0, empleados: 0, produccion: 0 };
        }
    });

    const [history, setHistory] = useState(() => {
        try {
            const stored = localStorage.getItem(HISTORY_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    });

    const [config, setConfig] = useState({
        name: '',
        apiProvider: 'gemini',
        apiModel: '',
        apiKey: '',
        customPrompt: ''
    });

    // Load config from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(CONFIG_KEY);
        if (stored) {
            try {
                setConfig(JSON.parse(stored));
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    // Auto-save equipos and tarifa to localStorage
    useEffect(() => {
        localStorage.setItem(DATA_KEY, JSON.stringify({ equipos, tarifa, version: 1 }));
    }, [equipos, tarifa, DATA_KEY]);

    const saveConfig = (newConfig) => {
        setConfig(newConfig);
        localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));
    };

    const addEquipo = () => {
        setEquipos([
            ...equipos,
            {
                id: Date.now(),
                tipo: 'Eléctrica',
                localizacion: '',
                area: '',
                equipo: '',
                cantidad: 1,
                potencia: 0,
                horas: 0,
                diasMes: 30,
                fCarga: 1,
                fSimult: 1
            }
        ]);
    };

    const updateEquipo = (id, field, value) => {
        setEquipos(equipos.map(eq => eq.id === id ? { ...eq, [field]: value } : eq));
    };

    const deleteEquipo = (id) => {
        if (equipos.length > 1) {
            setEquipos(equipos.filter(eq => eq.id !== id));
        }
    };

    // Calculate rawData
    const rawData = useMemo(() => {
        return equipos.map(eq => {
            const cantidad = parseFloat(eq.cantidad) || 0;
            const potencia = parseFloat(eq.potencia) || 0;
            const horas = parseFloat(eq.horas) || 0;
            const diasMes = parseFloat(eq.diasMes) || 30;
            const fCarga = parseFloat(eq.fCarga) || 1;
            const fSimult = parseFloat(eq.fSimult) || 1;

            const consumoDia = cantidad * potencia * horas * fCarga * fSimult;
            const consumoMesWh = consumoDia * diasMes;
            const consumoMesKWh = consumoMesWh / 1000;
            const costoMes = consumoMesKWh * tarifa;

            return {
                ...eq,
                consumoDia,
                consumo_wh: consumoMesWh,
                costo: costoMes,
                localizacion: eq.localizacion.trim() || 'Sin Localización',
                area: eq.area.trim() || 'Sin Área',
                equipoName: eq.equipo.trim() || 'Equipo Genérico'
            };
        }).filter(eq => eq.consumo_wh > 0);
    }, [equipos, tarifa]);

    // Apply filters
    const filteredData = useMemo(() => {
        return rawData.filter(d => {
            if (filters.energia !== 'all' && d.tipo !== filters.energia) return false;
            if (filters.localizacion !== 'all' && d.localizacion !== filters.localizacion) return false;
            if (filters.area !== 'all' && d.area !== filters.area) return false;

            if (filters.consumo === 'bajo' && d.consumo_wh >= 10000) return false;
            if (filters.consumo === 'medio' && (d.consumo_wh < 10000 || d.consumo_wh > 50000)) return false;
            if (filters.consumo === 'alto' && d.consumo_wh <= 50000) return false;

            return true;
        });
    }, [rawData, filters]);

    // Stats
    const stats = useMemo(() => {
        const totalConsumo = filteredData.reduce((acc, curr) => acc + curr.consumo_wh, 0);
        const totalCosto = filteredData.reduce((acc, curr) => acc + curr.costo, 0);

        return {
            totalConsumo,
            totalCosto,
            equiposActivos: filteredData.length,
            kwhPorMt2: normalization.areaMt2 > 0 ? (totalConsumo / 1000) / normalization.areaMt2 : null,
            kwhPorEmpleado: normalization.empleados > 0 ? (totalConsumo / 1000) / normalization.empleados : null,
            kwhPorProduccion: normalization.produccion > 0 ? (totalConsumo / 1000) / normalization.produccion : null
        };
    }, [filteredData, normalization]);

    // Unique options for filters
    const filterOptions = useMemo(() => {
        return {
            energias: [...new Set(rawData.map(d => d.tipo))],
            localizaciones: [...new Set(rawData.map(d => d.localizacion))],
            areas: [...new Set(rawData.map(d => d.area))]
        };
    }, [rawData]);

    const resetData = () => {
        setEquipos(DEFAULT_EQUIPOS);
        setTarifa(DEFAULT_TARIFA);
        localStorage.removeItem(DATA_KEY);
    };

    const importEquipos = (newEquipos, mode = 'replace') => {
        if (mode === 'replace') {
            setEquipos(newEquipos);
        } else {
            const maxId = equipos.length > 0 ? Math.max(...equipos.map(e => e.id)) : 0;
            const withIds = newEquipos.map((eq, i) => ({ ...eq, id: maxId + i + 1 }));
            setEquipos([...equipos, ...withIds]);
        }
    };

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
        localStorage.setItem(BASELINE_KEY, JSON.stringify(bl));
    };

    const clearBaseline = () => {
        setBaseline(null);
        localStorage.removeItem(BASELINE_KEY);
    };

    const saveGoals = (newGoals) => {
        setGoals(newGoals);
        localStorage.setItem(GOALS_KEY, JSON.stringify(newGoals));
    };

    const saveNormalization = (newNorm) => {
        setNormalization(newNorm);
        localStorage.setItem(NORMALIZATION_KEY, JSON.stringify(newNorm));
    };

    const saveMonthlyRecord = () => {
        const record = {
            id: Date.now(),
            date: new Date().toISOString(),
            month: new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'short' }),
            totalConsumo: stats.totalConsumo,
            totalCosto: stats.totalCosto,
            equiposActivos: stats.equiposActivos
        };
        const updated = [...history, record];
        setHistory(updated);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem(HISTORY_KEY);
    };

    return {
        equipos, tarifa, setTarifa, addEquipo, updateEquipo, deleteEquipo,
        filters, setFilters, filterOptions,
        filteredData, stats,
        config, saveConfig,
        baseline, saveBaseline, clearBaseline,
        goals, saveGoals,
        normalization, saveNormalization,
        history, saveMonthlyRecord, clearHistory,
        resetData, importEquipos
    };
}
