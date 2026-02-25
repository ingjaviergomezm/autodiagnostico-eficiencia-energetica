export default function Metodologia() {
    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Metodología y Conceptos</h2>
                <p className="text-slate-400 mt-2">Guía sobre el Sistema de Gestión de la Energía (SGE) y cálculos.</p>
            </div>

            <div className="glass-panel p-8">
                <h3 className="text-xl font-bold mb-4 text-sky-400">¿Qué es un SGE?</h3>
                <p className="text-slate-300 mb-4 leading-relaxed">
                    Imagina un SGE como un plan de acción personalizado para tu consumo energético. Es un conjunto de procesos y herramientas que te permiten:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-300">
                    <li>Medir y monitorear dónde se va la energía.</li>
                    <li>Identificar oportunidades de ahorro y eficiencia.</li>
                    <li>Establecer metas y seguirlas.</li>
                    <li>Mejorar continuamente tu desempeño energético.</li>
                </ul>
            </div>

            <div className="glass-panel p-8">
                <h3 className="text-xl font-bold mb-4 text-sky-400">Nuestra Metodología de Cálculo</h3>
                <p className="text-slate-300 mb-4 leading-relaxed">
                    Para ayudarte a visualizar tu consumo, esta herramienta se basa en los siguientes parámetros fundamentales:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700">
                        <h4 className="font-semibold text-white mb-1">Potencia Nominal (W)</h4>
                        <p className="text-sm text-slate-400">Potencia eléctrica que consume un equipo en funcionamiento.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700">
                        <h4 className="font-semibold text-white mb-1">Horas de Uso al Día</h4>
                        <p className="text-sm text-slate-400">Tiempo promedio de encendido diario.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700">
                        <h4 className="font-semibold text-white mb-1">Factor de Carga (%)</h4>
                        <p className="text-sm text-slate-400">Porcentaje de la potencia nominal usada en promedio.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700">
                        <h4 className="font-semibold text-white mb-1">Factor de Simultaneidad (%)</h4>
                        <p className="text-sm text-slate-400">Ajuste si no todos los equipos idénticos funcionan a la vez.</p>
                    </div>
                </div>

                <div className="p-6 rounded-xl bg-indigo-900/20 border border-indigo-500/30">
                    <h4 className="text-indigo-300 font-semibold mb-2">Fórmula de estimación mensual</h4>
                    <p className="font-mono text-lg text-slate-100 break-words">
                        Consumo (Wh/mes) = <span className="text-sky-400">Cantidad</span> × <span className="text-green-400">Potencia (W)</span> × <span className="text-purple-400">Horas/Día</span> × 30 × F.Carga × F.Simultaneidad
                    </p>
                </div>
            </div>
        </div>
    );
}
