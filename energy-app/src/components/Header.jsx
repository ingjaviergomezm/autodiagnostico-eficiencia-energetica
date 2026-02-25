import { Settings, Bell, Menu, Zap } from 'lucide-react';
import ProjectSelector from './ProjectSelector';

export default function Header({ onOpenSettings, projectsState }) {
    return (
        <header
            className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between"
            style={{
                background: 'rgba(6, 12, 8, 0.90)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(16, 185, 129, 0.12)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
            }}
        >
            {/* Izquierda */}
            <div className="flex items-center gap-4">
                {/* Botón hamburguesa móvil */}
                <button
                    className="md:hidden"
                    style={{ color: 'rgba(110, 231, 183, 0.55)' }}
                >
                    <Menu size={22} />
                </button>

                {/* Títulos */}
                <div>
                    <h1 className="text-lg md:text-xl font-semibold tracking-tight"
                        style={{ color: '#ecfdf5', letterSpacing: '-0.01em' }}
                    >
                        Autodiagnóstico Energético
                    </h1>
                    <div className="flex items-center gap-2 hidden sm:flex mt-0.5">
                        <span className="mono text-xs" style={{ color: 'rgba(110, 231, 183, 0.45)' }}>
                            ISO&nbsp;50001
                        </span>
                        <span style={{ color: 'rgba(16, 185, 129, 0.3)', fontSize: '10px' }}>◆</span>
                        <span className="text-xs" style={{ color: 'rgba(110, 231, 183, 0.45)' }}>
                            KPIs &amp; Optimización Energética
                        </span>
                    </div>
                </div>
            </div>

            {/* Derecha */}
            <div className="flex items-center gap-3">
                {/* Selector de proyecto */}
                {projectsState && <ProjectSelector projectsState={projectsState} />}

                {/* Notificaciones */}
                <button
                    className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
                    style={{
                        background: 'rgba(16, 185, 129, 0.06)',
                        border: '1px solid rgba(16, 185, 129, 0.12)',
                        color: 'rgba(110, 231, 183, 0.65)',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.35)';
                        e.currentTarget.style.color = '#34d399';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.12)';
                        e.currentTarget.style.color = 'rgba(110, 231, 183, 0.65)';
                    }}
                >
                    <Bell size={17} />
                    <span
                        className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2"
                        style={{
                            background: '#f59e0b',
                            borderColor: '#080d0a',
                            boxShadow: '0 0 6px rgba(245, 158, 11, 0.7)',
                        }}
                    />
                </button>

                {/* Configuración */}
                <button
                    onClick={onOpenSettings}
                    className="flex items-center gap-2 transition-all duration-200"
                    title="Configuración de IA y Proveedor"
                    style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '0.625rem',
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.20)',
                        color: '#6ee7b7',
                        fontSize: '0.8125rem',
                        fontWeight: '500',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)';
                        e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.40)';
                        e.currentTarget.style.color = '#34d399';
                        e.currentTarget.style.boxShadow = '0 0 12px rgba(16, 185, 129, 0.12)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(16, 185, 129, 0.08)';
                        e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.20)';
                        e.currentTarget.style.color = '#6ee7b7';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    <Settings size={15} />
                    <span className="hidden sm:inline">Configuración</span>
                </button>
            </div>
        </header>
    );
}
