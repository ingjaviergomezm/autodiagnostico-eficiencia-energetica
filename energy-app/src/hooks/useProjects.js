import { useState, useEffect } from 'react';

const PROJECTS_LIST_KEY = 'iso50001_projects_list';
const ACTIVE_PROJECT_KEY = 'iso50001_active_project';

const DEFAULT_PROJECT = {
    id: 'default',
    name: 'Proyecto Principal',
    createdAt: new Date().toISOString()
};

export function useProjects() {
    const [projects, setProjects] = useState(() => {
        try {
            const stored = localStorage.getItem(PROJECTS_LIST_KEY);
            return stored ? JSON.parse(stored) : [DEFAULT_PROJECT];
        } catch (e) {
            return [DEFAULT_PROJECT];
        }
    });

    const [activeProjectId, setActiveProjectId] = useState(() => {
        try {
            const stored = localStorage.getItem(ACTIVE_PROJECT_KEY);
            // Verify the stored ID still exists in the projects list
            if (stored && projects.some(p => p.id === stored)) {
                return stored;
            }
            return DEFAULT_PROJECT.id;
        } catch (e) {
            return DEFAULT_PROJECT.id;
        }
    });

    useEffect(() => {
        localStorage.setItem(PROJECTS_LIST_KEY, JSON.stringify(projects));
    }, [projects]);

    useEffect(() => {
        localStorage.setItem(ACTIVE_PROJECT_KEY, activeProjectId);
    }, [activeProjectId]);

    const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

    const createProject = (name) => {
        const newProject = {
            id: `proj_${Date.now()}`,
            name,
            createdAt: new Date().toISOString()
        };
        setProjects([...projects, newProject]);
        setActiveProjectId(newProject.id);
        return newProject.id;
    };

    const renameProject = (id, newName) => {
        setProjects(projects.map(p => p.id === id ? { ...p, name: newName } : p));
    };

    const deleteProject = (id) => {
        if (projects.length <= 1) return; // Cannot delete the last project

        // Delete associated data from localStorage manually to prevent orphan data
        const keysToRemove = [
            `iso50001_app_data_${id}`,
            `iso50001_baseline_${id}`,
            `iso50001_goals_${id}`,
            `iso50001_normalization_${id}`,
            `iso50001_history_${id}`
        ];
        keysToRemove.forEach(key => localStorage.removeItem(key));

        const updatedProjects = projects.filter(p => p.id !== id);
        setProjects(updatedProjects);

        if (activeProjectId === id) {
            setActiveProjectId(updatedProjects[0].id);
        }
    };

    const switchProject = (id) => {
        if (projects.some(p => p.id === id)) {
            setActiveProjectId(id);
        }
    };

    // Helper to completely erase a project's data (used for duplicating)
    const duplicateProject = (idToCopy, newName) => {
        const newId = createProject(newName);

        // Copy localStorage data
        const dataKeys = [
            { old: `iso50001_app_data_${idToCopy}`, new: `iso50001_app_data_${newId}` },
            { old: `iso50001_baseline_${idToCopy}`, new: `iso50001_baseline_${newId}` },
            { old: `iso50001_goals_${idToCopy}`, new: `iso50001_goals_${newId}` },
            { old: `iso50001_normalization_${idToCopy}`, new: `iso50001_normalization_${newId}` },
            { old: `iso50001_history_${idToCopy}`, new: `iso50001_history_${newId}` }
        ];

        dataKeys.forEach(keys => {
            const data = localStorage.getItem(keys.old);
            if (data) {
                localStorage.setItem(keys.new, data);
            }
        });

        // For default project that doesn't use suffixes yet
        if (idToCopy === 'default') {
            const legacyKeys = [
                { old: 'iso50001_app_data', new: `iso50001_app_data_${newId}` },
                { old: 'iso50001_baseline', new: `iso50001_baseline_${newId}` },
                { old: 'iso50001_goals', new: `iso50001_goals_${newId}` },
                { old: 'iso50001_normalization', new: `iso50001_normalization_${newId}` },
                { old: 'iso50001_history', new: `iso50001_history_${newId}` }
            ];
            legacyKeys.forEach(keys => {
                const data = localStorage.getItem(keys.old);
                if (data) {
                    localStorage.setItem(keys.new, data);
                }
            });
        }

        return newId;
    };

    return {
        projects,
        activeProject,
        activeProjectId,
        createProject,
        renameProject,
        deleteProject,
        switchProject,
        duplicateProject
    };
}
