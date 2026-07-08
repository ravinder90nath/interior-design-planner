import React from 'react';
import { Box, Tooltip, IconButton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';

import { useApp } from '../../context/AppContext';
import { useLayers } from '../../context/LayersContext';

const LayerTabs = () => {
  const { tk } = useApp();
  const { layers, activeLayerId, switchLayer, addBlankLayer, duplicateLayer, deleteLayer, renameLayer } = useLayers();

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, flexWrap: 'wrap' }}>
      {layers.map(layer => {
        const isActive = layer.id === activeLayerId;
        return (
          <Box key={layer.id} onClick={() => switchLayer(layer.id)}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.75,
              px: 1.5, py: 0.6,
              borderRadius: '6px 6px 0 0',
              cursor: 'pointer',
              border: `1px solid ${isActive ? tk.tabBorder : tk.divider}`,
              borderBottom: `1px solid ${isActive ? tk.tabActiveBg : tk.divider}`,
              background: isActive ? tk.tabActiveBg : tk.tabInactiveBg,
              transition: 'all 0.15s',
              '&:hover': { background: tk.tabActiveBg, opacity: 0.85 },
            }}>
            <Typography
              contentEditable suppressContentEditableWarning
              onBlur={(e) => renameLayer(layer.id, e.target.textContent || layer.name)}
              onClick={(e) => e.stopPropagation()}
              variant="caption"
              sx={{ color: isActive ? tk.accent : tk.textMuted,
                fontFamily: 'monospace', fontWeight: isActive ? 700 : 400,
                fontSize: '0.72rem', outline: 'none',
                minWidth: 44, cursor: 'text', letterSpacing: 0.5 }}>
              {layer.name}
            </Typography>
            {layers.length > 1 && (
              <CloseIcon
                sx={{ fontSize: 11, color: tk.textMuted, cursor: 'pointer',
                  '&:hover': { color: '#F87171' }, transition: 'color 0.15s' }}
                onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }} />
            )}
          </Box>
        );
      })}

      <Tooltip title="Add blank layer">
        <IconButton size="small" onClick={addBlankLayer}
          sx={{ color: tk.textMuted, border: `1px solid ${tk.divider}`,
            borderRadius: '6px 6px 0 0',
            '&:hover': { color: tk.accent, borderColor: tk.accent + '55' }, p: 0.5 }}>
          <AddIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Duplicate current layer">
        <IconButton size="small" onClick={duplicateLayer}
          sx={{ color: tk.textMuted, border: `1px solid ${tk.divider}`,
            borderRadius: '6px 6px 0 0',
            '&:hover': { color: '#A78BFA', borderColor: '#A78BFA55' }, p: 0.5 }}>
          <ContentCopyIcon sx={{ fontSize: 13 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default LayerTabs;
