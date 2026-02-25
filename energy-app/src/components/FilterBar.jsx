import { FilterX } from 'lucide-react';

export default function FilterBar({ filters, setFilters, filterOptions }) {
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({ energia: 'all', localizacion: 'all', area: 'all', consumo: 'all' });
    };

    const activeFiltersCount = Object.values(filters).filter(v => v !== 'all').length;

    return (
        <div className="glass-panel p-4 flex flex-col md:flex-row items-center gap-4 justify-between border border-slate-700/50 relative overflow-hidden">
            {/* Background accent */}
            <div className="absolute -left-10 -top-10 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex flex-wrap items-center gap-4 flex-1">
                <span className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    Filtros
                    {activeFiltersCount > 0 && (
                        <span className="bg-sky-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                            {activeFiltersCount}
                        </span>
                    )}
                </span>

                {/* Tipo de Energía */}
                <select
                    value={filters.energia}
                    onChange={(e) => handleFilterChange('energia', e.target.value)}
                    className="bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300 outline-none focus:border-sky-500 transition-colors cursor-pointer hover:bg-slate-800/50"
                >
                    <option value="all">Todas las Energías</option>
                    {filterOptions.energias.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>

                {/* Localización */}
                <select
                    value={filters.localizacion}
                    onChange={(e) => handleFilterChange('localizacion', e.target.value)}
                    className="bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300 outline-none focus:border-sky-500 transition-colors cursor-pointer hover:bg-slate-800/50"
                >
                    <option value="all">Todas las Localizaciones</option>
                    {filterOptions.localizaciones.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>

                {/* Área */}
                <select
                    value={filters.area}
                    onChange={(e) => handleFilterChange('area', e.target.value)}
                    className="bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300 outline-none focus:border-sky-500 transition-colors cursor-pointer hover:bg-slate-800/50"
                >
                    <option value="all">Todas las Áreas</option>
                    {filterOptions.areas.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>

                {/* Consumo */}
                <select
                    value={filters.consumo}
                    onChange={(e) => handleFilterChange('consumo', e.target.value)}
                    className="bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300 outline-none focus:border-sky-500 transition-colors cursor-pointer hover:bg-slate-800/50"
                >
                    <option value="all">Cualquier Consumo</option>
                    <option value="bajo">Bajo (≤ 50,000 Wh)</option>
                    <option value="medio">Medio (50k - 200k Wh)</option>
                    <option value="alto">Alto (&gt; 200,000 Wh)</option>
                </select>
            </div>

            {/* Clear Filters Button */}
            {activeFiltersCount > 0 && (
                <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm transition-colors border border-red-500/20"
                    title="Limpiar filtros"
                >
                    <FilterX size={16} />
                    <span className="hidden sm:inline">Limpiar</span>
                </button>
            )}
        </div>
    );
}
