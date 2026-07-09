import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { useApp } from '../../context/AppContext';
import { APP_NAME } from '../../constants';
import DeviceList from './DeviceList';
import PlacementSummary from './PlacementSummary';
import LayersSummary from './LayersSummary';
import SelectedItemControls from './SelectedItemControls';
import ZonesList from './ZonesList';

const RightPanel = ({ canvasRef }) => {
  const { tk } = useApp();

  return (
    <Box sx={{ width: 210, bgcolor: tk.panelBg,
      borderLeft: `1px solid ${tk.divider}`,
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto', flexShrink: 0,
      transition: 'background 0.25s' }}>

      {/* Header */}
      <Box sx={{ p: 2, pb: 1.5, borderBottom: `1px solid ${tk.divider}` }}>
        <Typography variant="caption" sx={{ color: tk.accent, fontFamily: 'monospace',
          fontWeight: 700, letterSpacing: 2.5, fontSize: '0.6rem', display: 'block' }}>
          DEVICE LIBRARY
        </Typography>
        <Typography variant="caption" sx={{ color: tk.textDim, fontSize: '0.65rem' }}>
          Click to add to canvas
        </Typography>
      </Box>

      <DeviceList canvasRef={canvasRef} />

      <Divider sx={{ borderColor: tk.divider, mx: 1.5 }} />
      <PlacementSummary />

      <Divider sx={{ borderColor: tk.divider, mx: 1.5 }} />
      <LayersSummary />

      <Divider sx={{ borderColor: tk.divider, mx: 1.5 }} />
      <ZonesList />
      <SelectedItemControls />

      <Box sx={{ flex: 1 }} />

      {/* Footer */}
      <Box sx={{ p: 1.5, borderTop: `1px solid ${tk.divider}`, textAlign: 'center' }}>
        <Typography variant="caption"
          sx={{ color: tk.divider, fontFamily: 'monospace', fontSize: '0.58rem', letterSpacing: 1 }}>
          {APP_NAME.toUpperCase()}
        </Typography>
      </Box>
    </Box>
  );
};

export default RightPanel;
