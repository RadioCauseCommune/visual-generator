
import { ProjectExport } from '../types';

const STORAGE_KEY = 'cause_commune_projects';

export interface SavedProject extends ProjectExport {
    id: string;
    thumbnail?: string;
    updatedAt: number;
    name: string;
}

export const storageService = {
    getProjects: (): SavedProject[] => {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error('Failed to parse projects from localStorage', e);
            return [];
        }
    },

    saveProject: (project: Omit<SavedProject, 'id' | 'updatedAt'>, id?: string): string => {
        const projects = storageService.getProjects();
        const now = Date.now();
        const projectId = id || Math.random().toString(36).substr(2, 9);

        const newProject: SavedProject = {
            ...project,
            id: projectId,
            updatedAt: now
        };

        const existingIndex = projects.findIndex(p => p.id === projectId);
        if (existingIndex >= 0) {
            projects[existingIndex] = newProject;
        } else {
            projects.unshift(newProject);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
        return projectId;
    },

    deleteProject: (id: string): void => {
        const projects = storageService.getProjects();
        const filtered = projects.filter(p => p.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    },

    getProjectById: (id: string): SavedProject | undefined => {
        const projects = storageService.getProjects();
        return projects.find(p => p.id === id);
    }
};
