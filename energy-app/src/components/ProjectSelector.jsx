import React, { useState, useRef, useEffect } from 'react';
import { FolderGit2, ChevronDown, Plus, Edit2, Copy, Trash2, Check, X } from 'lucide-react';

export default function ProjectSelector({ projectsState }) {
    const { projects, activeProject, createProject, renameProject, deleteProject, switchProject, duplicateProject } = projectsState;
    const [isOpen, setIsOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setEditingId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCreate = () => {
        const name = prompt('Nombre del nuevo proyecto:', `Proyecto ${projects.length + 1}`);
        if (name) {
            createProject(name);
            setIsOpen(false);
        }
    };

    const handleRenameStart = (e, proj) => {
        e.stopPropagation();
        setEditingId(proj.id);
        setEditName(proj.name);
    };

    const handleRenameSave = (e, id) => {
        e.stopPropagation();
        if (editName.trim()) {
            renameProject(id, editName.trim());
        }
        setEditingId(null);
    };

    const handleDuplicate = (e, proj) => {
        e.stopPropagation();
        const name = prompt('Nombre para la copia:', `${proj.name} (Copia)`);
        if (name) {
            duplicateProject(proj.id, name);
        }
    };

    const handleDelete = (e, id) => {
        e.stopPropagation();
        if (projects.length <= 1) {
            alert('No puedes eliminar el único proyecto existente.');
            return;
        }
        if (window.confirm('¿Estás seguro de eliminar este proyecto y todos sus datos? Esta acción no se puede deshacer.')) {
            deleteProject(id);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Active Project Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600 transition-colors"
                title="Cambiar u organizar proyectos"
            >
                <FolderGit2 className="text-sky-400" size={18} />
                <span className="text-sm font-medium text-slate-200 hidden sm:inline-block max-w-[150px] truncate">
                    {activeProject?.name || 'Cargando...'}
                </span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="px-3 py-2 border-b border-slate-700 bg-slate-900/50">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tus Proyectos</p>
                    </div>

                    <div className="max-h-60 overflow-y-auto custom-scrollbar p-2 space-y-1">
                        {projects.map(proj => (
                            <div
                                key={proj.id}
                                onClick={() => {
                                    if (editingId !== proj.id) {
                                        switchProject(proj.id);
                                        setIsOpen(false);
                                    }
                                }}
                                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer group transition-colors ${activeProject?.id === proj.id ? 'bg-sky-500/10 border border-sky-500/30' : 'hover:bg-slate-700 border border-transparent'
                                    }`}
                            >
                                {editingId === proj.id ? (
                                    <div className="flex items-center gap-2 w-full" onClick={e => e.stopPropagation()}>
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleRenameSave(e, proj.id)}
                                            className="w-full bg-slate-950 border border-sky-500 rounded px-2 py-1 text-sm text-white outline-none"
                                            autoFocus
                                        />
                                        <button onClick={(e) => handleRenameSave(e, proj.id)} className="text-green-400 hover:text-green-300">
                                            <Check size={16} />
                                        </button>
                                        <button onClick={() => setEditingId(null)} className="text-red-400 hover:text-red-300">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <div className={`w-2 h-2 rounded-full ${activeProject?.id === proj.id ? 'bg-sky-400' : 'bg-slate-600'}`}></div>
                                            <span className={`text-sm truncate ${activeProject?.id === proj.id ? 'text-sky-100 font-medium' : 'text-slate-300'}`}>
                                                {proj.name}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => handleRenameStart(e, proj)} className="p-1 text-slate-400 hover:text-sky-300" title="Renombrar">
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={(e) => handleDuplicate(e, proj)} className="p-1 text-slate-400 hover:text-purple-300" title="Duplicar proyecto">
                                                <Copy size={14} />
                                            </button>
                                            {projects.length > 1 && (
                                                <button onClick={(e) => handleDelete(e, proj.id)} className="p-1 text-slate-400 hover:text-red-400" title="Eliminar">
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="p-2 border-t border-slate-700 bg-slate-900/30">
                        <button
                            onClick={handleCreate}
                            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 rounded-lg transition-colors font-medium border border-dashed border-sky-500/30"
                        >
                            <Plus size={16} /> Nuevo Proyecto
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
