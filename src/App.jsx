import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProjectsProvider } from './context/ProjectsContext';
import LandingPage from './pages/LandingPage.jsx';
import EditorPage  from './pages/EditorPage.jsx';

export default function App() {
  return (
    <ProjectsProvider>
      <Routes>
        <Route path="/"                element={<LandingPage />} />
        <Route path="/editor/:projectId" element={<EditorPage />} />
        <Route path="*"                element={<Navigate to="/" replace />} />
      </Routes>
    </ProjectsProvider>
  );
}
