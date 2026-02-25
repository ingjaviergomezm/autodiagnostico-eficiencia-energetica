import { X } from 'lucide-react';

export default function SettingsModal({ onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="glass-panel w-full max-w-lg p-8 relative animate-in fade-in zoom-in duration-200">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold mb-2">Configuración</h2>
                <p className="text-slate-400 mb-6 text-sm">Ingrese sus credenciales para habilitar las funciones de IA.</p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Nombre de Usuario:</label>
                        <input
                            type="text"
                            placeholder="Ej. Juan Pérez"
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Proveedor de IA:</label>
                        <select className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all text-white appearance-none">
                            <option value="gemini">Google Gemini</option>
                            <option value="openai">OpenAI (ChatGPT)</option>
                            <option value="anthropic">Anthropic (Claude)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">API Key:</label>
                        <input
                            type="password"
                            placeholder="Pegue su API Key aquí"
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all text-white"
                        />
                        <p className="text-xs text-slate-500 mt-1">Su clave se almacena localmente en este navegador.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Prompt Personalizado (Opcional):</label>
                        <textarea
                            rows={3}
                            placeholder="Ej. Escribe un informe detallado para {name}. Datos: {data}"
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all text-white resize-y"
                        ></textarea>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onClose}
                        className="btn-primary py-2.5 text-sm"
                    >
                        Guardar Configuración
                    </button>
                </div>

            </div>
        </div>
    );
}
