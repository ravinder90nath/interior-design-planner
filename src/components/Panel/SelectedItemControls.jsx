import React from 'react';
import { Box, Button, Typography, Divider } from '@mui/material';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import DeleteIcon from '@mui/icons-material/Delete';
import { useApp } from '../../context/AppContext';
import { useLayers } from '../../context/LayersContext';
import { DEVICE_CATALOG } from '../../constants';

const SelectedItemControls = () => {
  const { tk } = useApp();
  const { items, selectedId, rotateItem, deleteItem } = useLayers();

  const sel       = items.find(i => i.id === selectedId);
  const selDevice = sel ? DEVICE_CATALOG.find(d => d.id === sel.type) : null;

  if (!sel || !selDevice) return null;

  return (
    <>
      <Divider sx={{ borderColor: tk.divider, mx: 1.5 }} />
      <Box sx={{ p: 1.5 }}>
        <Typography variant="caption" sx={{ color: tk.textDim, fontFamily: 'monospace',
          letterSpacing: 2, fontSize: '0.58rem', display: 'block', mb: 1 }}>
          SELECTED: {selDevice.label.toUpperCase()}
        </Typography>
        <Typography variant="caption"
          sx={{ color: tk.textSub, fontFamily: 'monospace', fontSize: '0.65rem', display: 'block', mb: 1 }}>
          rotation: {sel.rotation}°
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.75 }}>
          <Button size="small" onClick={() => rotateItem(selectedId)}
            sx={{ flex: 1, fontSize: '0.68rem', py: 0.6, color: '#A78BFA',
              border: '1px solid #A78BFA33', '&:hover': { bgcolor: '#A78BFA11' }, minWidth: 0 }}>
            <RotateRightIcon sx={{ fontSize: 14, mr: 0.5 }} /> Rotate
          </Button>
          <Button size="small" onClick={() => deleteItem(selectedId)}
            sx={{ flex: 1, fontSize: '0.68rem', py: 0.6, color: '#F87171',
              border: '1px solid #F8717133', '&:hover': { bgcolor: '#F8717111' }, minWidth: 0 }}>
            <DeleteIcon sx={{ fontSize: 14, mr: 0.5 }} /> Delete
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default SelectedItemControls;
