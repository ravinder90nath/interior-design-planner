import React from 'react';
import { Box, Typography } from '@mui/material';
import { useApp } from '../../context/AppContext';
import { useLayers } from '../../context/LayersContext';
import { DEVICE_CATALOG } from '../../constants';

const PlacementSummary = () => {
  const { tk } = useApp();
  const { counts, items } = useLayers();

  return (
    <Box sx={{ p: 1.5 }}>
      <Typography variant="caption" sx={{ color: tk.textDim, fontFamily: 'monospace',
        letterSpacing: 2, fontSize: '0.58rem', display: 'block', mb: 1 }}>
        PLACEMENT SUMMARY
      </Typography>

      {Object.keys(counts).length === 0 ? (
        <Typography variant="caption"
          sx={{ color: tk.textFaint, fontFamily: 'monospace', fontSize: '0.7rem' }}>
          No devices placed yet
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {Object.entries(counts).map(([type, count]) => {
            const device = DEVICE_CATALOG.find(d => d.id === type);
            return (
              <Box key={type} sx={{ display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', py: 0.2 }}>
                <Typography variant="caption" sx={{ color: tk.textSub, fontSize: '0.72rem' }}>
                  {device.label}
                </Typography>
                <Typography variant="caption"
                  sx={{ color: device.color, fontFamily: 'monospace', fontWeight: 700, fontSize: '0.72rem' }}>
                  ×{count}
                </Typography>
              </Box>
            );
          })}
          <Box sx={{ display: 'flex', justifyContent: 'space-between',
            mt: 0.5, pt: 0.5, borderTop: `1px solid ${tk.divider}` }}>
            <Typography variant="caption"
              sx={{ color: tk.textLabel, fontSize: '0.72rem', fontWeight: 600 }}>
              Total
            </Typography>
            <Typography variant="caption"
              sx={{ color: tk.accent, fontFamily: 'monospace', fontWeight: 800, fontSize: '0.72rem' }}>
              ×{items.length}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default PlacementSummary;
