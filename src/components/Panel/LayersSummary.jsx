import React from 'react';
import { Box, Typography } from '@mui/material';
import { useApp } from '../../context/AppContext';
import { useLayers } from '../../context/LayersContext';

const LayersSummary = () => {
  const { tk } = useApp();
  const { layers, activeLayerId } = useLayers();

  return (
    <Box sx={{ p: 1.5 }}>
      <Typography variant="caption" sx={{ color: tk.textDim, fontFamily: 'monospace',
        letterSpacing: 2, fontSize: '0.58rem', display: 'block', mb: 1 }}>
        ALL LAYERS
      </Typography>
      {layers.map(layer => (
        <Box key={layer.id} sx={{ display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', py: 0.3 }}>
          <Typography variant="caption"
            sx={{ color: layer.id === activeLayerId ? tk.accent : tk.textMuted,
              fontSize: '0.72rem', fontFamily: 'monospace' }}>
            {layer.name}
          </Typography>
          <Typography variant="caption"
            sx={{ color: tk.textSub, fontFamily: 'monospace', fontSize: '0.68rem' }}>
            {layer.items.length} items
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default LayersSummary;
