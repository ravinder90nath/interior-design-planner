import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, IconButton, Tooltip,
  Menu, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, InputAdornment,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import GridViewIcon from '@mui/icons-material/GridView';
import TableRowsIcon from '@mui/icons-material/TableRows';
import LayersIcon from '@mui/icons-material/Layers';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useProjects } from '../context/ProjectsContext';
import { APP_NAME, APP_VERSION } from '../constants';

const buildLandingTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: { main: mode === 'dark' ? '#00D4FF' : '#0099BB' },
      background: {
        default: mode === 'dark' ? '#0B0D14' : '#F4F6FB',
        paper:   mode === 'dark' ? '#13161F' : '#FFFFFF',
      },
    },
    typography: { fontFamily: "'Inter', 'Segoe UI', sans-serif" },
  });

const formatDate = (iso) => {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60)    return 'Just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800)return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ── Project card (grid view) ────────────────────────────────────────────────
const ProjectCard = ({ project, mode, onOpen, onRename, onDelete }) => {
  const [anchor, setAnchor] = useState(null);
  const [hovering, setHovering] = useState(false);

  const tk = mode === 'dark'
    ? { bg: '#1A1D2A', border: '#2A2D3E', text: '#CDD6E8', sub: '#4A5568', accent: '#00D4FF' }
    : { bg: '#FFFFFF', border: '#E2E8F0', text: '#1E293B', sub: '#64748B', accent: '#0099BB' };

  return (
    <Box
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      sx={{
        borderRadius: 2,
        border: `1px solid ${hovering ? tk.accent + '66' : tk.border}`,
        bgcolor: tk.bg,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.18s ease',
        transform: hovering ? 'translateY(-3px)' : 'none',
        boxShadow: hovering
          ? `0 8px 24px ${tk.accent}22`
          : mode === 'dark' ? '0 2px 8px #00000044' : '0 2px 8px #0000000D',
      }}
    >
      {/* Thumbnail area */}
      <Box
        onClick={onOpen}
        sx={{
          height: 160,
          bgcolor: mode === 'dark' ? '#0F1220' : '#EEF2F7',
          backgroundImage: mode === 'dark'
            ? 'linear-gradient(#1A1D2A 1px, transparent 1px), linear-gradient(90deg, #1A1D2A 1px, transparent 1px)'
            : 'linear-gradient(#E2E8F0 1px, transparent 1px), linear-gradient(90deg, #E2E8F0 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Decorative preview art */}
        <Box sx={{ opacity: 0.4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <LayersIcon sx={{ fontSize: 40, color: tk.accent }} />
        </Box>

        {/* Open button on hover */}
        {hovering && (
          <Box sx={{
            position: 'absolute', inset: 0,
            bgcolor: tk.accent + '18',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(2px)',
          }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<OpenInNewIcon />}
              onClick={onOpen}
              sx={{
                bgcolor: tk.accent, color: '#fff',
                '&:hover': { bgcolor: tk.accent, opacity: 0.9 },
                fontWeight: 600, fontSize: '0.75rem',
                boxShadow: `0 4px 14px ${tk.accent}55`,
              }}
            >
              Open
            </Button>
          </Box>
        )}
      </Box>

      {/* Card footer */}
      <Box sx={{ px: 1.5, py: 1.2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{
            color: tk.text, fontWeight: 600, fontSize: '0.82rem',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {project.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
            <AccessTimeIcon sx={{ fontSize: 11, color: tk.sub }} />
            <Typography variant="caption" sx={{ color: tk.sub, fontSize: '0.67rem' }}>
              {formatDate(project.updatedAt)}
            </Typography>
          </Box>
        </Box>

        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); setAnchor(e.currentTarget); }}
          sx={{ color: tk.sub, '&:hover': { color: tk.accent }, p: 0.4 }}
        >
          <MoreVertIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        PaperProps={{ sx: { bgcolor: mode === 'dark' ? '#1A1D2A' : '#fff', border: `1px solid ${tk.border}`, minWidth: 140 } }}
      >
        <MenuItem onClick={() => { setAnchor(null); onOpen(); }} sx={{ fontSize: '0.8rem', gap: 1.5 }}>
          <OpenInNewIcon sx={{ fontSize: 16 }} /> Open
        </MenuItem>
        <MenuItem onClick={() => { setAnchor(null); onRename(); }} sx={{ fontSize: '0.8rem', gap: 1.5 }}>
          <DriveFileRenameOutlineIcon sx={{ fontSize: 16 }} /> Rename
        </MenuItem>
        <MenuItem onClick={() => { setAnchor(null); onDelete(); }} sx={{ fontSize: '0.8rem', gap: 1.5, color: '#F87171' }}>
          <DeleteOutlineIcon sx={{ fontSize: 16 }} /> Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

// ── Project row (list view) ────────────────────────────────────────────────
const ProjectRow = ({ project, mode, onOpen, onRename, onDelete }) => {
  const [anchor, setAnchor] = useState(null);
  const tk = mode === 'dark'
    ? { bg: '#1A1D2A', border: '#2A2D3E', text: '#CDD6E8', sub: '#4A5568', accent: '#00D4FF' }
    : { bg: '#FFFFFF', border: '#E2E8F0', text: '#1E293B', sub: '#64748B', accent: '#0099BB' };

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 2,
      px: 2, py: 1.2,
      borderRadius: 1.5,
      border: `1px solid ${tk.border}`,
      bgcolor: tk.bg,
      cursor: 'pointer',
      transition: 'all 0.15s',
      '&:hover': { border: `1px solid ${tk.accent}55`, bgcolor: tk.accent + '08' },
    }}>
      <Box sx={{
        width: 44, height: 44, borderRadius: 1.5,
        bgcolor: mode === 'dark' ? '#0F1220' : '#EEF2F7',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <LayersIcon sx={{ fontSize: 22, color: tk.accent, opacity: 0.7 }} />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }} onClick={onOpen}>
        <Typography variant="body2" sx={{ color: tk.text, fontWeight: 600, fontSize: '0.85rem' }}>
          {project.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <AccessTimeIcon sx={{ fontSize: 11, color: tk.sub }} />
          <Typography variant="caption" sx={{ color: tk.sub, fontSize: '0.68rem' }}>
            Edited {formatDate(project.updatedAt)}
          </Typography>
        </Box>
      </Box>

      <Typography variant="caption" sx={{ color: tk.sub, fontSize: '0.68rem', whiteSpace: 'nowrap' }}>
        {new Date(project.createdAt).toLocaleDateString()}
      </Typography>

      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setAnchor(e.currentTarget); }}
        sx={{ color: tk.sub, '&:hover': { color: tk.accent } }}>
        <MoreVertIcon sx={{ fontSize: 16 }} />
      </IconButton>

      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}
        PaperProps={{ sx: { bgcolor: mode === 'dark' ? '#1A1D2A' : '#fff', border: `1px solid ${tk.border}`, minWidth: 140 } }}>
        <MenuItem onClick={() => { setAnchor(null); onOpen(); }} sx={{ fontSize: '0.8rem', gap: 1.5 }}>
          <OpenInNewIcon sx={{ fontSize: 16 }} /> Open
        </MenuItem>
        <MenuItem onClick={() => { setAnchor(null); onRename(); }} sx={{ fontSize: '0.8rem', gap: 1.5 }}>
          <DriveFileRenameOutlineIcon sx={{ fontSize: 16 }} /> Rename
        </MenuItem>
        <MenuItem onClick={() => { setAnchor(null); onDelete(); }} sx={{ fontSize: '0.8rem', gap: 1.5, color: '#F87171' }}>
          <DeleteOutlineIcon sx={{ fontSize: 16 }} /> Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

// ── Main Landing Page ──────────────────────────────────────────────────────
const LandingPage = () => {
  const navigate = useNavigate();
  const { projects, createProject, deleteProject, renameProject } = useProjects();
  const [mode, setMode]           = useState('light');
  const [viewMode, setViewMode]   = useState('grid');  // 'grid' | 'list'
  const [search, setSearch]       = useState('');
  const [renameDialog, setRenameDialog] = useState(null); // { id, name }
  const [deleteDialog, setDeleteDialog] = useState(null); // id
  const [newName, setNewName]     = useState('');
  const [createDialog, setCreateDialog] = useState(false);
  const [createName, setCreateName]     = useState('');

  const theme = React.useMemo(() => buildLandingTheme(mode), [mode]);

  const tk = mode === 'dark'
    ? {
        appBg:    '#0B0D14', navBg:  '#13161F', panelBg: '#13161F',
        border:   '#1E2233', text:   '#E0E6F0', sub:     '#4A5568',
        accent:   '#00D4FF', muted:  '#2E3347', heroText: '#FFFFFF',
      }
    : {
        appBg:    '#F4F6FB', navBg:  '#FFFFFF', panelBg: '#FFFFFF',
        border:   '#E2E8F0', text:   '#1E293B', sub:     '#64748B',
        accent:   '#0099BB', muted:  '#CBD5E1', heroText: '#0F172A',
      };

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    const name = createName.trim() || `Project ${projects.length + 1}`;
    const project = createProject(name);
    setCreateDialog(false);
    setCreateName('');
    navigate(`/editor/${project.id}`);
  };

  const handleOpen = (id) => navigate(`/editor/${id}`);

  const handleRenameConfirm = () => {
    if (renameDialog && newName.trim()) {
      renameProject(renameDialog.id, newName.trim());
    }
    setRenameDialog(null);
    setNewName('');
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', bgcolor: tk.appBg, transition: 'background 0.2s' }}>

        {/* ── Navbar ── */}
        <Box sx={{
          height: 60, bgcolor: tk.navBg,
          borderBottom: `1px solid ${tk.border}`,
          display: 'flex', alignItems: 'center',
          px: 3, gap: 2, position: 'sticky', top: 0, zIndex: 100,
          boxShadow: mode === 'dark' ? '0 1px 8px #00000044' : '0 1px 8px #0000000D',
        }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 34, height: 34, borderRadius: 1.5,
              background: `linear-gradient(135deg, ${tk.accent}, ${tk.accent}88)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 12px ${tk.accent}44`,
            }}>
              <DesignServicesIcon sx={{ fontSize: 20, color: '#fff' }} />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: tk.text, lineHeight: 1.1, fontSize: '0.9rem' }}>
                {APP_NAME}
              </Typography>
              <Typography variant="caption" sx={{ color: tk.sub, fontSize: '0.6rem', letterSpacing: 0.5 }}>
                v{APP_VERSION}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flex: 1 }} />

          {/* Search */}
          <TextField
            size="small"
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: tk.sub }} />
                </InputAdornment>
              ),
              sx: {
                bgcolor: mode === 'dark' ? '#1A1D2A' : '#F8FAFC',
                borderRadius: 2, fontSize: '0.82rem',
                '& fieldset': { borderColor: tk.border },
                '&:hover fieldset': { borderColor: tk.accent + '88' },
              }
            }}
            sx={{ width: 220 }}
          />

          {/* Theme toggle */}
          <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
            <IconButton onClick={() => setMode(m => m === 'dark' ? 'light' : 'dark')}
              sx={{ color: mode === 'dark' ? '#FCD34D' : '#6366F1' }}>
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          {/* New project */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialog(true)}
            sx={{
              bgcolor: tk.accent, color: '#fff',
              '&:hover': { bgcolor: tk.accent, opacity: 0.88 },
              fontWeight: 600, borderRadius: 2,
              boxShadow: `0 4px 14px ${tk.accent}44`,
              px: 2,
            }}
          >
            New Project
          </Button>
        </Box>

        {/* ── Hero (only when no projects) ── */}
        {projects.length === 0 && (
          <Box sx={{
            textAlign: 'center', py: 10, px: 4,
          }}>
            <Box sx={{
              width: 96, height: 96, borderRadius: '50%',
              background: `linear-gradient(135deg, ${tk.accent}22, ${tk.accent}44)`,
              border: `2px dashed ${tk.accent}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 'auto', mb: 3,
            }}>
              <DesignServicesIcon sx={{ fontSize: 44, color: tk.accent }} />
            </Box>
            <Typography variant="h5" sx={{ color: tk.heroText, fontWeight: 700, mb: 1 }}>
              Start designing your first project
            </Typography>
            <Typography variant="body2" sx={{ color: tk.sub, mb: 4, maxWidth: 400, mx: 'auto' }}>
              Upload floor plans, place AV & smart devices, draw zones and export professional PDF layouts.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialog(true)}
              sx={{
                bgcolor: tk.accent, color: '#fff',
                '&:hover': { bgcolor: tk.accent, opacity: 0.88 },
                fontWeight: 700, borderRadius: 2, px: 4, py: 1.4,
                boxShadow: `0 6px 20px ${tk.accent}44`,
              }}
            >
              Create your first project
            </Button>
          </Box>
        )}

        {/* ── Projects section ── */}
        {projects.length > 0 && (
          <Box sx={{ px: { xs: 2, sm: 4, md: 6 }, py: 4, maxWidth: 1400, mx: 'auto' }}>

            {/* Section header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
              <Typography variant="h6" sx={{ color: tk.text, fontWeight: 700, fontSize: '1rem', flex: 1 }}>
                {search ? `Results for "${search}"` : 'Recent Projects'}
                <Typography component="span" sx={{ color: tk.sub, fontWeight: 400, ml: 1, fontSize: '0.82rem' }}>
                  ({filtered.length})
                </Typography>
              </Typography>

              {/* View toggle */}
              <Box sx={{ display: 'flex', border: `1px solid ${tk.border}`, borderRadius: 1.5, overflow: 'hidden' }}>
                <IconButton size="small" onClick={() => setViewMode('grid')}
                  sx={{ borderRadius: 0, bgcolor: viewMode === 'grid' ? tk.accent + '22' : 'transparent',
                    color: viewMode === 'grid' ? tk.accent : tk.sub, p: 0.75 }}>
                  <GridViewIcon sx={{ fontSize: 18 }} />
                </IconButton>
                <IconButton size="small" onClick={() => setViewMode('list')}
                  sx={{ borderRadius: 0, bgcolor: viewMode === 'list' ? tk.accent + '22' : 'transparent',
                    color: viewMode === 'list' ? tk.accent : tk.sub, p: 0.75 }}>
                  <TableRowsIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            </Box>

            {/* Create new — first card in grid */}
            {viewMode === 'grid' ? (
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 2.5,
              }}>
                {/* New project card */}
                <Box
                  onClick={() => setCreateDialog(true)}
                  sx={{
                    height: 222, borderRadius: 2,
                    border: `2px dashed ${tk.accent}55`,
                    bgcolor: tk.accent + '08',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 1,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    '&:hover': { bgcolor: tk.accent + '14', border: `2px dashed ${tk.accent}99` },
                  }}
                >
                  <Box sx={{
                    width: 44, height: 44, borderRadius: '50%',
                    bgcolor: tk.accent + '22',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <AddIcon sx={{ fontSize: 26, color: tk.accent }} />
                  </Box>
                  <Typography variant="body2" sx={{ color: tk.accent, fontWeight: 600, fontSize: '0.82rem' }}>
                    New Project
                  </Typography>
                </Box>

                {filtered.map(project => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    mode={mode}
                    onOpen={() => handleOpen(project.id)}
                    onRename={() => { setRenameDialog({ id: project.id, name: project.name }); setNewName(project.name); }}
                    onDelete={() => setDeleteDialog(project.id)}
                  />
                ))}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {filtered.map(project => (
                  <ProjectRow
                    key={project.id}
                    project={project}
                    mode={mode}
                    onOpen={() => handleOpen(project.id)}
                    onRename={() => { setRenameDialog({ id: project.id, name: project.name }); setNewName(project.name); }}
                    onDelete={() => setDeleteDialog(project.id)}
                  />
                ))}
              </Box>
            )}

            {filtered.length === 0 && search && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography sx={{ color: tk.sub }}>No projects match "{search}"</Typography>
              </Box>
            )}
          </Box>
        )}

        {/* ── Create project dialog ── */}
        <Dialog open={createDialog} onClose={() => { setCreateDialog(false); setCreateName(''); }}
          PaperProps={{ sx: { bgcolor: tk.panelBg, border: `1px solid ${tk.border}`, borderRadius: 2, minWidth: 360 } }}>
          <DialogTitle sx={{ color: tk.text, fontWeight: 700, pb: 1 }}>New Project</DialogTitle>
          <DialogContent sx={{ pb: 1 }}>
            <TextField
              autoFocus fullWidth
              placeholder={`Project ${projects.length + 1}`}
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
              size="small"
              sx={{ mt: 1 }}
              InputProps={{ sx: { bgcolor: mode === 'dark' ? '#1A1D2A' : '#F8FAFC', borderRadius: 1.5 } }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <Button onClick={() => { setCreateDialog(false); setCreateName(''); }} sx={{ color: tk.sub }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleCreate}
              sx={{ bgcolor: tk.accent, '&:hover': { bgcolor: tk.accent, opacity: 0.88 }, fontWeight: 600 }}>
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── Rename dialog ── */}
        <Dialog open={Boolean(renameDialog)} onClose={() => setRenameDialog(null)}
          PaperProps={{ sx: { bgcolor: tk.panelBg, border: `1px solid ${tk.border}`, borderRadius: 2, minWidth: 360 } }}>
          <DialogTitle sx={{ color: tk.text, fontWeight: 700, pb: 1 }}>Rename Project</DialogTitle>
          <DialogContent sx={{ pb: 1 }}>
            <TextField
              autoFocus fullWidth value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleRenameConfirm(); }}
              size="small" sx={{ mt: 1 }}
              InputProps={{ sx: { bgcolor: mode === 'dark' ? '#1A1D2A' : '#F8FAFC', borderRadius: 1.5 } }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <Button onClick={() => setRenameDialog(null)} sx={{ color: tk.sub }}>Cancel</Button>
            <Button variant="contained" onClick={handleRenameConfirm}
              sx={{ bgcolor: tk.accent, '&:hover': { bgcolor: tk.accent, opacity: 0.88 }, fontWeight: 600 }}>
              Rename
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── Delete confirm dialog ── */}
        <Dialog open={Boolean(deleteDialog)} onClose={() => setDeleteDialog(null)}
          PaperProps={{ sx: { bgcolor: tk.panelBg, border: `1px solid ${tk.border}`, borderRadius: 2, minWidth: 320 } }}>
          <DialogTitle sx={{ color: tk.text, fontWeight: 700, pb: 1 }}>Delete Project?</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ color: tk.sub }}>
              This will permanently delete the project and all its data. This cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <Button onClick={() => setDeleteDialog(null)} sx={{ color: tk.sub }}>Cancel</Button>
            <Button variant="contained"
              onClick={() => { deleteProject(deleteDialog); setDeleteDialog(null); }}
              sx={{ bgcolor: '#EF4444', '&:hover': { bgcolor: '#DC2626' }, fontWeight: 600 }}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

      </Box>
    </ThemeProvider>
  );
};

export default LandingPage;
