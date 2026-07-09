import React, { useRef } from 'react';
import { Box, Button, Tooltip, IconButton, Typography, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import GridOnIcon from '@mui/icons-material/GridOn';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

import { useApp } from '../../context/AppContext';
import ToolStrip from './ToolStrip';
import { useLayers } from '../../context/LayersContext';
import { fileToDataURL } from '../../utils/fileToDataURL';

const Toolbar = ({ onExportPDF, exporting }) => {
  const { mode, toggleMode, showGrid, toggleGrid, tk } = useApp();
  const { items, selectedId, setBlueprintImg, deleteItem, rotateItem, clearItems } = useLayers();
  const fileRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      // Convert to base64 so it persists in localStorage across reloads
      const dataUrl = await fileToDataURL(file);
      setBlueprintImg(dataUrl);
    } catch (err) {
      console.error('Failed to read blueprint image:', err);
    }
    e.target.value = '';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
      {/* Upload */}
      <Button variant="outlined" size="small" startIcon={<CloudUploadIcon />}
        onClick={() => fileRef.current.click()}
        sx={{ borderColor: tk.accent + '55', color: tk.accent, bgcolor: tk.accent + '11',
          '&:hover': { borderColor: tk.accent, bgcolor: tk.accent + '22' },
          fontWeight: 600, fontSize: '0.73rem', letterSpacing: 0.5 }}>
        Upload Blueprint
      </Button>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleUpload} />

      {/* Grid */}
      <Tooltip title={showGrid ? 'Hide grid' : 'Show grid'}>
        <IconButton size="small" onClick={toggleGrid}
          sx={{ color: showGrid ? tk.accent : tk.textMuted,
            border: `1px solid ${showGrid ? tk.accent + '55' : tk.divider}` }}>
          <GridOnIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Theme */}
      <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
        <IconButton size="small" onClick={toggleMode}
          sx={{ color: mode === 'dark' ? '#FCD34D' : '#6366F1',
            border: `1px solid ${mode === 'dark' ? '#FCD34D55' : '#6366F155'}`,
            transition: 'all 0.2s' }}>
          {mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
        </IconButton>
      </Tooltip>

      {/* Selected item actions */}
      {selectedId && (<>
        <Tooltip title="Rotate 45°">
          <IconButton size="small" onClick={() => rotateItem(selectedId)}
            sx={{ color: '#A78BFA', border: '1px solid #A78BFA44' }}>
            <RotateRightIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete selected">
          <IconButton size="small" onClick={() => deleteItem(selectedId)}
            sx={{ color: '#F87171', border: '1px solid #F8717144' }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </>)}

      {/* Right side */}
      <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
        {items.length > 0 && (
          <Tooltip title="Clear all items on this layer">
            <IconButton size="small" onClick={clearItems}
              sx={{ color: tk.textMuted, border: `1px solid ${tk.divider}` }}>
              <ClearAllIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        <Button variant="outlined" size="small"
          startIcon={exporting ? <CircularProgress size={12} color="inherit" /> : <PictureAsPdfIcon />}
          onClick={onExportPDF} disabled={exporting}
          sx={{ borderColor: '#F472B655', color: '#F472B6', bgcolor: '#F472B60D',
            '&:hover': { borderColor: '#F472B6', bgcolor: '#F472B61A' },
            fontWeight: 600, fontSize: '0.73rem' }}>
          {exporting ? 'Exporting…' : 'Export to PDF'}
        </Button>

        <Typography variant="caption" sx={{ color: tk.textMuted, fontFamily: 'monospace' }}>
          {items.length} item{items.length !== 1 ? 's' : ''}
        </Typography>
      </Box>
    </Box>
    <ToolStrip />
    </Box>
  );
};

export default Toolbar;
