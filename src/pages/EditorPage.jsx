import React, { useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { AppProvider, useApp }   from '../context/AppContext';
import { LayersProvider }         from '../context/LayersContext';
import { ZonesProvider }          from '../context/ZonesContext';
import { ToolProvider }           from '../context/ToolContext';
import { useProjects }            from '../context/ProjectsContext';
import Toolbar                    from '../components/Toolbar/Toolbar';
import LayerTabs                  from '../components/Layers/LayerTabs';
import CanvasBoard                from '../components/Canvas/CanvasBoard';
import RightPanel                 from '../components/Panel/RightPanel';
import useExportPDF               from '../hooks/useExportPDF';

// Inner layout with back button
const EditorLayout = ({ project }) => {
  const { tk } = useApp();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const { exporting, exportPDF } = useExportPDF(canvasRef);
  const { updateProject } = useProjects();

  // Update project's updatedAt when editor is used
  useEffect(() => {
    if (project) {
      updateProject(project.id, { updatedAt: new Date().toISOString() });
    }
  }, []);

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100vw',
      overflow: 'hidden', bgcolor: tk.appBg, flexDirection: 'column',
      transition: 'background 0.25s' }}>

      {/* Project header bar */}
      <Box sx={{
        height: 42, flexShrink: 0,
        bgcolor: tk.panelBg,
        borderBottom: `1px solid ${tk.divider}`,
        display: 'flex', alignItems: 'center', px: 2, gap: 1.5,
      }}>
        <Tooltip title="Back to projects">
          <IconButton size="small" onClick={() => navigate('/')}
            sx={{ color: tk.textMuted, border: `1px solid ${tk.divider}`,
              '&:hover': { color: tk.accent, borderColor: tk.accent + '55' } }}>
            <ArrowBackIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>

        <Typography variant="body2" sx={{
          color: tk.textMuted, fontSize: '0.7rem', fontFamily: 'monospace',
        }}>
          Projects /
        </Typography>
        <Typography variant="body2" sx={{
          color: tk.textLabel, fontWeight: 600, fontSize: '0.8rem',
        }}>
          {project?.name || 'Untitled'}
        </Typography>
      </Box>

      {/* Main editor area */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2, gap: 1, minWidth: 0 }}>
          <Toolbar onExportPDF={exportPDF} exporting={exporting} />
          <LayerTabs />
          <CanvasBoard canvasRef={canvasRef} />
          <Typography variant="caption" sx={{
            color: tk.textFaint, fontFamily: 'monospace', textAlign: 'center', letterSpacing: 1,
          }}>
            V — Select · Z — Zone · H — Pan · Double-click zone label to rename
          </Typography>
        </Box>
        <RightPanel canvasRef={canvasRef} />
      </Box>
    </Box>
  );
};

// Outer page: validates project ID then renders editor
const EditorPage = () => {
  const { projectId } = useParams();
  const navigate      = useNavigate();
  const { projects }  = useProjects();

  const project = projects.find(p => p.id === projectId);

  // If project doesn't exist, redirect home
  useEffect(() => {
    if (!project) navigate('/', { replace: true });
  }, [project, navigate]);

  if (!project) return null;

  return (
    <AppProvider>
      <LayersProvider projectId={projectId}>
        <ZonesProvider projectId={projectId}>
          <ToolProvider>
            <EditorLayout project={project} />
          </ToolProvider>
        </ZonesProvider>
      </LayersProvider>
    </AppProvider>
  );
};

export default EditorPage;
