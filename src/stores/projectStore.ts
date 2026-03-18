import { create } from 'zustand';
import type { Project, ProjectFile } from '@/types/project';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  isGenerating: boolean;
  
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setGenerating: (generating: boolean) => void;
  
  updateFile: (projectId: string, file: ProjectFile) => void;
  addFile: (projectId: string, file: ProjectFile) => void;
  deleteFile: (projectId: string, fileId: string) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  isGenerating: false,
  
  setProjects: (projects) => set({ projects }),
  
  setCurrentProject: (project) => set({ currentProject: project }),
  
  addProject: (project) =>
    set((state) => ({
      projects: [project, ...state.projects],
    })),
  
  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
      currentProject:
        state.currentProject?.id === id
          ? { ...state.currentProject, ...updates }
          : state.currentProject,
    })),
  
  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      currentProject:
        state.currentProject?.id === id ? null : state.currentProject,
    })),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setGenerating: (isGenerating) => set({ isGenerating }),
  
  updateFile: (projectId, file) =>
    set((state) => {
      const project = state.projects.find((p) => p.id === projectId);
      if (!project) return state;
      
      const updatedFiles = project.files.map((f) =>
        f.id === file.id ? file : f
      );
      
      return {
        projects: state.projects.map((p) =>
          p.id === projectId ? { ...p, files: updatedFiles } : p
        ),
        currentProject:
          state.currentProject?.id === projectId
            ? { ...state.currentProject, files: updatedFiles }
            : state.currentProject,
      };
    }),
  
  addFile: (projectId, file) =>
    set((state) => {
      const project = state.projects.find((p) => p.id === projectId);
      if (!project) return state;
      
      const updatedFiles = [...project.files, file];
      
      return {
        projects: state.projects.map((p) =>
          p.id === projectId ? { ...p, files: updatedFiles } : p
        ),
        currentProject:
          state.currentProject?.id === projectId
            ? { ...state.currentProject, files: updatedFiles }
            : state.currentProject,
      };
    }),
  
  deleteFile: (projectId, fileId) =>
    set((state) => {
      const project = state.projects.find((p) => p.id === projectId);
      if (!project) return state;
      
      const updatedFiles = project.files.filter((f) => f.id !== fileId);
      
      return {
        projects: state.projects.map((p) =>
          p.id === projectId ? { ...p, files: updatedFiles } : p
        ),
        currentProject:
          state.currentProject?.id === projectId
            ? { ...state.currentProject, files: updatedFiles }
            : state.currentProject,
      };
    }),
}));
