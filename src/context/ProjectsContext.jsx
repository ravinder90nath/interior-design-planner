import React, { createContext, useContext, useState, useCallback } from 'react';

const ProjectsContext = createContext(null);

export const useProjects = () => {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error('useProjects must be inside <ProjectsProvider>');
  return ctx;
};

let projectIdCounter = Date.now();

const loadProjects = () => {
  try {
    const saved = localStorage.getItem('idt_projects');
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
};

const saveProjects = (projects) => {
  try { localStorage.setItem('idt_projects', JSON.stringify(projects)); } catch {}
};

export const ProjectsProvider = ({ children }) => {
  const [projects, setProjects] = useState(loadProjects);

  const persist = useCallback((updated) => {
    setProjects(updated);
    saveProjects(updated);
  }, []);

  const createProject = useCallback((name = 'Untitled Project') => {
    const id = String(projectIdCounter++);
    const project = {
      id,
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      thumbnail: null,   // future: base64 snapshot
      itemCount: 0,
      layerCount: 1,
    };
    const updated = [project, ...projects];
    persist(updated);
    return project;
  }, [projects, persist]);

  const updateProject = useCallback((id, changes) => {
    const updated = projects.map(p =>
      p.id === id ? { ...p, ...changes, updatedAt: new Date().toISOString() } : p
    );
    persist(updated);
  }, [projects, persist]);

  const deleteProject = useCallback((id) => {
    const updated = projects.filter(p => p.id !== id);
    persist(updated);
    // Also remove saved board state
    try { localStorage.removeItem(`idt_board_${id}`); } catch {}
  }, [projects, persist]);

  const renameProject = useCallback((id, name) => {
    updateProject(id, { name });
  }, [updateProject]);

  return (
    <ProjectsContext.Provider value={{
      projects, createProject, updateProject, deleteProject, renameProject,
    }}>
      {children}
    </ProjectsContext.Provider>
  );
};
