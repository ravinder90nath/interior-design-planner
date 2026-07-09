import React from 'react';
import { Box, IconButton, Typography, Tooltip } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import { useApp } from '../../context/AppContext';

const STEP = 0.25;
const MIN  = 0.2;
const MAX  = 4;

const ZoomControls = ({ zoom, onZoomChange, onReset }) => {
  const { tk } = useApp();

  const zoomIn  = () => onZoomChange(Math.min(MAX, parseFloat((zoom + STEP).toFixed(2))));
  const zoomOut = () => onZoomChange(Math.max(MIN, parseFloat((zoom - STEP).toFixed(2))));

  const btnSx = {
    color: tk.textMuted,
    border: `1px solid ${tk.divider}`,
    borderRadius: 1,
    p: 0.4,
    '&:hover': { color: tk.accent, borderColor: tk.accent + '66', bgcolor: tk.accent + '11' },
    transition: 'all 0.15s',
  };

  return (
    <Box sx={{
      position: 'absolute', bottom: 14, left: 14,
      display: 'flex', alignItems: 'center', gap: 0.5,
      bgcolor: tk.panelBg + 'EE',
      border: `1px solid ${tk.divider}`,
      borderRadius: 1.5,
      px: 1, py: 0.5,
      backdropFilter: 'blur(8px)',
      boxShadow: '0 2px 12px #00000022',
      zIndex: 200,
      userSelect: 'none',
    }}>
      <Tooltip title="Zoom out (scroll down)">
        <IconButton size="small" onClick={zoomOut} sx={btnSx}>
          <ZoomOutIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>

      <Typography
        variant="caption"
        sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.72rem',
          color: tk.accent, minWidth: 38, textAlign: 'center', cursor: 'default' }}>
        {Math.round(zoom * 100)}%
      </Typography>

      <Tooltip title="Zoom in (scroll up)">
        <IconButton size="small" onClick={zoomIn} sx={btnSx}>
          <ZoomInIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>

      <Box sx={{ width: '1px', height: 16, bgcolor: tk.divider, mx: 0.25 }} />

      <Tooltip title="Reset view (100%, center)">
        <IconButton size="small" onClick={onReset} sx={btnSx}>
          <CenterFocusStrongIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default ZoomControls;
