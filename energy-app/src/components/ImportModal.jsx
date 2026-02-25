import { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, AlertTriangle, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';

const COLUMN_MAP = {
    'tipo': ['tipo', 'type', 'fuente', 'energia'],
    'localizacion': ['localizacion', 'localización', 'ubicacion', 'ubicación', 'location', 'sede'],
    'area': ['area', 'área', 'zone', 'zona'],
    'equipo': ['equipo', 'nombre', 'name', 'equipment', 'dispositivo'],
    'cantidad': ['cantidad', 'cant', 'qty', 'quantity', 'unidades'],
    'potencia': ['potencia', 'potencia (w)', 'pot.(w)', 'watts', 'w', 'power'],
    'horas': ['horas', 'hrs', 'horas/dia', 'hrs/día', 'horas/día', 'hours'],
    'diasMes': ['dias', 'días', 'diasmes', 'días/mes', 'dias/mes', 'days'],
    'fCarga': ['fcarga', 'f.carga', 'f. carga', 'factor de carga', 'carga', 'load factor'],
    'fSimult': ['fsimult', 'f.simult', 'f. simultaneidad', 'simultaneidad', 'simultaneous']
};

function mapColumns(headers) {
    const mapping = {};
    headers.forEach((header, index) => {
        const normalized = header.toString().toLowerCase().trim();
        for (const [field, aliases] of Object.entries(COLUMN_MAP)) {
            if (aliases.some(alias => normalized.includes(alias))) {
                mapping[field] = index;
                break;
            }
        }
    });
    return mapping;
}

function parseValue(val, isNumeric = false) {
    if (val === null || val === undefined || val === '') return isNumeric ? 0 : '';
    if (isNumeric) {
        const num = parseFloat(String(val).replace(/[,$]/g, ''));
        return isNaN(num) ? 0 : num;
    }
    return String(val).trim();
}

export default function ImportModal({ onClose, onImport }) {
    const [preview, setPreview] = useState(null);
    const [fileName, setFileName] = useState('');
    const [error, setError] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const fileRef = useRef(null);

    const processFile = (file) => {
        setError('');
        setFileName(file.name);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

                if (jsonData.length < 2) {
                    setError('El archivo no contiene datos suficientes (se necesita al menos un encabezado y una fila de datos).');
                    return;
                }

                const headers = jsonData[0];
                const colMap = mapColumns(headers);

                if (!colMap.equipo && !colMap.potencia) {
                    setError('No se pudieron identificar las columnas del archivo. Asegúrese de que tenga columnas como: Equipo, Potencia, Horas, etc.');
                    return;
                }

                const numericFields = ['cantidad', 'potencia', 'horas', 'diasMes', 'fCarga', 'fSimult'];
                const equipos = jsonData.slice(1).filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== '')).map((row, i) => ({
                    id: Date.now() + i,
                    tipo: colMap.tipo !== undefined ? parseValue(row[colMap.tipo]) || 'Eléctrica' : 'Eléctrica',
                    localizacion: colMap.localizacion !== undefined ? parseValue(row[colMap.localizacion]) : '',
                    area: colMap.area !== undefined ? parseValue(row[colMap.area]) : '',
                    equipo: colMap.equipo !== undefined ? parseValue(row[colMap.equipo]) : `Equipo ${i + 1}`,
                    cantidad: colMap.cantidad !== undefined ? parseValue(row[colMap.cantidad], true) || 1 : 1,
                    potencia: colMap.potencia !== undefined ? parseValue(row[colMap.potencia], true) : 0,
                    horas: colMap.horas !== undefined ? parseValue(row[colMap.horas], true) : 0,
                    diasMes: colMap.diasMes !== undefined ? parseValue(row[colMap.diasMes], true) || 30 : 30,
                    fCarga: colMap.fCarga !== undefined ? parseValue(row[colMap.fCarga], true) || 1 : 1,
                    fSimult: colMap.fSimult !== undefined ? parseValue(row[colMap.fSimult], true) || 1 : 1,
                }));

                setPreview(equipos);
            } catch (err) {
                setError('Error al leer el archivo: ' + err.message);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="glass-panel w-full max-w-4xl max-h-[85vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <Upload className="text-green-400" size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Importar Equipos</h2>
                            <p className="text-sm text-slate-400">Importar datos desde archivo Excel o CSV</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800">
                        <X size={22} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    {!preview && !error && (
                        <div
                            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${dragOver ? 'border-sky-400 bg-sky-500/10' : 'border-slate-600 hover:border-slate-500'}`}
                            onDrop={handleDrop}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onClick={() => fileRef.current?.click()}
                        >
                            <FileSpreadsheet className="text-slate-400 mx-auto mb-4" size={48} />
                            <h3 className="text-lg font-semibold text-white mb-2">Arrastra un archivo aquí</h3>
                            <p className="text-slate-400 mb-4">o haz clic para seleccionar un archivo .xlsx o .csv</p>
                            <p className="text-xs text-slate-500">Columnas esperadas: Tipo, Localización, Área, Equipo, Cantidad, Potencia(W), Horas/Día</p>
                            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileSelect} className="hidden" />
                        </div>
                    )}

                    {error && (
                        <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
                            <AlertTriangle className="text-red-400" size={40} />
                            <p className="text-red-400 text-center max-w-md">{error}</p>
                            <button onClick={() => { setError(''); setPreview(null); }} className="btn-primary px-4 py-2">
                                Intentar de nuevo
                            </button>
                        </div>
                    )}

                    {preview && (
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle2 className="text-green-400" size={20} />
                                <span className="text-green-400 font-medium">{fileName}</span>
                                <span className="text-slate-400">— {preview.length} equipos encontrados</span>
                            </div>

                            <div className="overflow-x-auto custom-scrollbar mb-6">
                                <table className="w-full text-left border-collapse min-w-[600px]">
                                    <thead>
                                        <tr className="border-b border-slate-700/60 text-xs text-slate-400">
                                            <th className="py-2 px-2">Tipo</th>
                                            <th className="py-2 px-2">Localización</th>
                                            <th className="py-2 px-2">Área</th>
                                            <th className="py-2 px-2">Equipo</th>
                                            <th className="py-2 px-2">Cant.</th>
                                            <th className="py-2 px-2">Pot.(W)</th>
                                            <th className="py-2 px-2">Hrs/Día</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm divide-y divide-slate-800/60">
                                        {preview.slice(0, 20).map((eq, i) => (
                                            <tr key={i} className="text-slate-300">
                                                <td className="py-1.5 px-2">{eq.tipo}</td>
                                                <td className="py-1.5 px-2">{eq.localizacion || '—'}</td>
                                                <td className="py-1.5 px-2">{eq.area || '—'}</td>
                                                <td className="py-1.5 px-2">{eq.equipo}</td>
                                                <td className="py-1.5 px-2">{eq.cantidad}</td>
                                                <td className="py-1.5 px-2">{eq.potencia}</td>
                                                <td className="py-1.5 px-2">{eq.horas}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {preview.length > 20 && <p className="text-xs text-slate-500 mt-2">Mostrando los primeros 20 de {preview.length} equipos.</p>}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {preview && (
                    <div className="p-4 border-t border-white/10 flex items-center justify-end gap-3">
                        <button onClick={() => { setPreview(null); setFileName(''); }} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">
                            Cancelar
                        </button>
                        <button
                            onClick={() => { onImport(preview, 'append'); onClose(); }}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm transition-colors border border-slate-600"
                        >
                            Agregar a datos existentes
                        </button>
                        <button
                            onClick={() => { onImport(preview, 'replace'); onClose(); }}
                            className="btn-primary px-4 py-2"
                        >
                            Reemplazar datos actuales
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
