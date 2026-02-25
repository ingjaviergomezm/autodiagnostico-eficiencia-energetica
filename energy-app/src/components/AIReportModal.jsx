import { useState } from 'react';
import { X, Copy, CheckCheck, Sparkles, AlertTriangle, Loader2, FileDown } from 'lucide-react';
import { generateReport } from '../services/aiService';
import { generatePDF } from '../services/pdfService';

export default function AIReportModal({ onClose, config, stats, filteredData }) {
    const [report, setReport] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [generated, setGenerated] = useState(false);
    const [downloadingPDF, setDownloadingPDF] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        setError('');
        setReport('');
        setCopied(false);
        try {
            const result = await generateReport(config, stats, filteredData);
            setReport(result);
            setGenerated(true);
        } catch (err) {
            setError(err.message || 'Error desconocido al generar el informe.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(report);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = report;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownloadPDF = async () => {
        setDownloadingPDF(true);
        try {
            const chartIds = ['chart-sankey', 'chart-bar-location', 'chart-pie-area', 'chart-timeline'];
            await generatePDF(report, stats, chartIds);
        } catch (err) {
            console.error(err);
            alert('Hubo un error al generar el PDF.');
        } finally {
            setDownloadingPDF(false);
        }
    };

    // Simple markdown-ish renderer: bold, headers, lists
    const renderMarkdown = (text) => {
        return text.split('\n').map((line, i) => {
            // Headers
            if (line.startsWith('### ')) return <h4 key={i} className="text-md font-semibold text-sky-300 mt-4 mb-1">{line.slice(4)}</h4>;
            if (line.startsWith('## ')) return <h3 key={i} className="text-lg font-bold text-sky-400 mt-5 mb-2">{line.slice(3)}</h3>;
            if (line.startsWith('# ')) return <h2 key={i} className="text-xl font-bold text-white mt-6 mb-2">{line.slice(2)}</h2>;
            // Bold
            const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
            // List items
            if (line.startsWith('- ') || line.startsWith('* ')) {
                return <li key={i} className="ml-4 text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted.slice(2) }} />;
            }
            if (/^\d+\.\s/.test(line)) {
                return <li key={i} className="ml-4 text-slate-300 leading-relaxed list-decimal" dangerouslySetInnerHTML={{ __html: formatted.replace(/^\d+\.\s/, '') }} />;
            }
            // Empty line
            if (line.trim() === '') return <br key={i} />;
            // Normal paragraph
            return <p key={i} className="text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />;
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="glass-panel w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl shadow-sky-500/10">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-sky-500/20 rounded-lg">
                            <Sparkles className="text-sky-400" size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Informe de Autodiagnóstico IA</h2>
                            <p className="text-sm text-slate-400">Análisis ISO 50001 generado por {config.apiProvider?.toUpperCase() || 'IA'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {generated && report && (
                            <>
                                <button
                                    onClick={handleDownloadPDF}
                                    disabled={downloadingPDF}
                                    className="flex items-center gap-2 px-4 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 rounded-lg text-sm transition-colors border border-sky-500/30 disabled:opacity-50"
                                >
                                    {downloadingPDF ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
                                    <span className="hidden sm:inline">PDF</span>
                                </button>
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors border border-slate-600"
                                >
                                    {copied ? <CheckCheck size={16} className="text-green-400" /> : <Copy size={16} />}
                                    <span className="hidden sm:inline">{copied ? 'Copiado' : 'Copiar'}</span>
                                </button>
                            </>
                        )}
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800">
                            <X size={22} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    {!generated && !loading && !error && (
                        <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center space-y-6">
                            <div className="w-20 h-20 bg-sky-500/10 rounded-full flex items-center justify-center">
                                <Sparkles className="text-sky-400" size={36} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">Generar Informe de Diagnóstico</h3>
                                <p className="text-slate-400 max-w-md">
                                    La IA analizará tus {stats.equiposActivos} equipos activos con un consumo total de{' '}
                                    {Math.round(stats.totalConsumo / 1000).toLocaleString('es-CO')} kWh/mes y generará
                                    un informe profesional con recomendaciones según ISO 50001.
                                </p>
                            </div>
                            <button
                                onClick={handleGenerate}
                                className="btn-primary px-6 py-3 text-base shadow-lg shadow-sky-500/30 flex items-center gap-2"
                            >
                                <Sparkles size={18} />
                                Generar Informe Ahora
                            </button>
                        </div>
                    )}

                    {loading && (
                        <div className="flex flex-col items-center justify-center h-full min-h-[300px] space-y-6">
                            <Loader2 className="text-sky-400 animate-spin" size={48} />
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-white mb-2">Generando Informe...</h3>
                                <p className="text-slate-400">La IA está analizando los datos del inventario energético.</p>
                            </div>
                            {/* Skeleton */}
                            <div className="w-full max-w-2xl space-y-3">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="h-4 bg-slate-700/50 rounded animate-pulse" style={{ width: `${85 - i * 8}%` }} />
                                ))}
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex flex-col items-center justify-center h-full min-h-[300px] space-y-6">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                                <AlertTriangle className="text-red-400" size={32} />
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-red-400 mb-2">Error al Generar</h3>
                                <p className="text-slate-400 max-w-md">{error}</p>
                            </div>
                            <button
                                onClick={handleGenerate}
                                className="btn-primary px-6 py-3 flex items-center gap-2"
                            >
                                <Sparkles size={18} />
                                Reintentar
                            </button>
                        </div>
                    )}

                    {generated && report && (
                        <div className="prose prose-invert max-w-none">
                            {renderMarkdown(report)}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {generated && report && (
                    <div className="p-4 border-t border-white/10 flex items-center justify-between">
                        <p className="text-xs text-slate-500">
                            Generado con {config.apiProvider?.toUpperCase()} • {new Date().toLocaleDateString('es-CO')}
                        </p>
                        <button
                            onClick={handleGenerate}
                            className="text-sm text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1"
                        >
                            <Sparkles size={14} /> Re-generar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
