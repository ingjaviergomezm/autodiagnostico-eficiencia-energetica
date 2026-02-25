import { LayoutDashboard, BookOpen, FlaskConical, Zap } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'info', label: 'Metodología', icon: BookOpen },
        { id: 'simulator', label: 'Simulador', icon: FlaskConical },
    ];

    return (
        <aside className="w-64 hidden md:flex flex-col z-20 relative"
            style={{
                background: 'rgba(6, 12, 8, 0.95)',
                borderRight: '1px solid rgba(16, 185, 129, 0.12)',
                backdropFilter: 'blur(20px)',
            }}
        >
            {/* Logo / Marca */}
            <div className="px-6 py-7 border-b" style={{ borderColor: 'rgba(16, 185, 129, 0.10)' }}>
                <div className="flex items-center gap-3 mb-1">
                    {/* Ícono de rayo */}
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            boxShadow: '0 0 16px rgba(16, 185, 129, 0.50)',
                        }}
                    >
                        <Zap size={16} color="#fff" fill="#fff" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold tracking-wide"
                            style={{
                                background: 'linear-gradient(90deg, #34d399, #fbbf24)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            ISO 50001
                        </h2>
                        <p className="text-xs font-medium" style={{ color: 'rgba(110, 231, 183, 0.55)' }}>
                            Energy SaaS
                        </p>
                    </div>
                </div>
            </div>

            {/* Navegación */}
            <nav className="flex-1 px-3 py-5 space-y-1">
                {menuItems.map((item, i) => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium"
                            style={{
                                animationDelay: `${i * 60}ms`,
                                background: isActive
                                    ? 'rgba(16, 185, 129, 0.12)'
                                    : 'transparent',
                                color: isActive
                                    ? '#34d399'
                                    : 'rgba(110, 231, 183, 0.55)',
                                border: isActive
                                    ? '1px solid rgba(16, 185, 129, 0.25)'
                                    : '1px solid transparent',
                                boxShadow: isActive
                                    ? '0 0 16px rgba(16, 185, 129, 0.08), inset 3px 0 0 #10b981'
                                    : 'none',
                            }}
                        >
                            <item.icon
                                size={18}
                                style={{ color: isActive ? '#34d399' : 'rgba(110, 231, 183, 0.45)' }}
                            />
                            {item.label}

                            {isActive && (
                                <span className="ml-auto w-1.5 h-1.5 rounded-full"
                                    style={{
                                        background: '#34d399',
                                        boxShadow: '0 0 8px rgba(52, 211, 153, 0.8)',
                                    }}
                                />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Footer del sidebar */}
            <div className="p-4" style={{ borderTop: '1px solid rgba(16, 185, 129, 0.10)' }}>
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs"
                    style={{
                        background: 'rgba(16, 185, 129, 0.06)',
                        border: '1px solid rgba(16, 185, 129, 0.12)',
                        color: 'rgba(110, 231, 183, 0.65)',
                    }}
                >
                    <span className="status-dot" />
                    <span>Sistema Operativo</span>
                    <span className="ml-auto font-mono text-xs" style={{ color: 'rgba(110, 231, 183, 0.40)' }}>
                        v2.0
                    </span>
                </div>
            </div>
        </aside>
    );
}
