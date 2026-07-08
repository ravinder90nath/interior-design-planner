import React, { useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { useApp } from '../../context/AppContext';
import { useLayers } from '../../context/LayersContext';
import { DEVICE_CATALOG } from '../../constants';

// We need a ref to the canvas to get its rect when adding items.
// It's passed in as a prop from the parent layout.
const DeviceList = ({ canvasRef }) => {
  const { tk } = useApp();
  const { counts, addItem } = useLayers();

  const handleAdd = useCallback((deviceId) => {
    if (!canvasRef?.current) return;
    addItem(deviceId, canvasRef.current.getBoundingClientRect());
  }, [addItem, canvasRef]);

  return (
    <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      {DEVICE_CATALOG.map(device => {
        const IconComp = device.icon;
        const count    = counts[device.id] || 0;
        return (
          <Box key={device.id} onClick={() => handleAdd(device.id)}
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5,
              px: 1.5, py: 0.9, borderRadius: 1.5, cursor: 'pointer',
              border: `1px solid ${count > 0 ? device.color + '55' : tk.divider}`,
              background: count > 0 ? device.color + '0D' : 'transparent',
              transition: 'all 0.15s ease',
              '&:hover': { background: device.color + '1A',
                border: `1px solid ${device.color}77`, transform: 'translateX(3px)' },
            }}>
            <IconComp sx={{ fontSize: 18,
              color: count > 0 ? device.color : device.color + '88', flexShrink: 0 }} />
            <Typography variant="body2"
              sx={{ color: count > 0 ? tk.textLabel : tk.textMuted,
                fontWeight: count > 0 ? 600 : 400, fontSize: '0.78rem', flex: 1 }}>
              {device.label}
            </Typography>
            {count > 0 && (
              <Box sx={{ minWidth: 20, height: 20, borderRadius: '50%',
                background: device.color, display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0 }}>
                <Typography sx={{ fontSize: '0.6rem', fontWeight: 800,
                  fontFamily: 'monospace', color: '#0A0C12', lineHeight: 1 }}>
                  {count}
                </Typography>
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default DeviceList;
