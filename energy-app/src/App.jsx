import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Metodologia from './components/Metodologia';
import Simulator from './components/Simulator';
import SettingsModal from './components/SettingsModal';
import { useEnergyData } from './hooks/useEnergyData';
import { useProjects } from './hooks/useProjects';

function AppContent({ projectId, projectsState }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const dataState = useEnergyData(projectId);

  return (
    <div className="flex h-screen overflow-hidden font-sans" style={{ background: 'var(--bg-base)', color: 'var(--text-main)' }}>

      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative w-full">

        {/* Top Header */}
        <Header
          onOpenSettings={() => setIsSettingsOpen(true)}
          projectsState={projectsState}
        />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10">
          <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {activeTab === 'dashboard' ? (
              <Dashboard dataState={dataState} />
            ) : activeTab === 'simulator' ? (
              <Simulator dataState={dataState} />
            ) : (
              <Metodologia />
            )}
          </div>
        </main>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          onClose={() => setIsSettingsOpen(false)}
          config={dataState.config}
          saveConfig={dataState.saveConfig}
        />
      )}
    </div>
  );
}

export default function App() {
  const projectsState = useProjects();

  return (
    <AppContent
      key={projectsState.activeProjectId}
      projectId={projectsState.activeProjectId}
      projectsState={projectsState}
    />
  );
}
