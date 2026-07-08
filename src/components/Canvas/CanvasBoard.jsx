import React from 'react';
import { Box, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import { useApp } from '../../context/AppContext';
import { useLayers } from '../../context/LayersContext';
import { GRID_SIZE, ICON_SIZE } from '../../constants';
import useDrag from '../../hooks/useDrag';
import CanvasIcon from './CanvasIcon';

const CanvasBoard = ({ canvasRef }) => {
  const { mode, showGrid, tk } = useApp();
  const { items, blueprintImg, selectedId, setSelectedId, moveItem } = useLayers();

  const getItem = (id) => items.find(i => i.id === id) || { x: 0, y: 0 };

  const { onMouseDown, onMouseMove, onMouseUp, onMouseLeave,
          onTouchStart, onTouchMove, onTouchEnd } = useDrag({
    containerRef: canvasRef,
    getItem,
    onMove:   moveItem,
    onSelect: setSelectedId,
    iconSize: ICON_SIZE,
  });

  return (
    <Box
      ref={canvasRef}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={() => setSelectedId(null)}
      sx={{
        flex: 1,
        position: 'relative',
        borderRadius: '0 4px 4px 4px',
        overflow: 'hidden',
        border: `1px solid ${tk.canvasBorder}`,
        bgcolor: tk.canvasBg,
        backgroundImage: showGrid
          ? `linear-gradient(${tk.gridLine} 1px, transparent 1px),
             linear-gradient(90deg, ${tk.gridLine} 1px, transparent 1px)`
          : 'none',
        backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
        cursor: 'default',
        userSelect: 'none',
        transition: 'background 0.25s',
      }}
    >
      {/* Blueprint */}
      {blueprintImg && (
        <img src={blueprintImg} alt="Blueprint"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'contain', opacity: mode === 'dark' ? 0.5 : 0.6,
            pointerEvents: 'none', userSelect: 'none' }} />
      )}

      {/* Empty state */}
      {!blueprintImg && items.length === 0 && (
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 2, pointerEvents: 'none' }}>
          <Box sx={{ width: 88, height: 88, borderRadius: '50%',
            background: tk.accent + '10', border: `2px dashed ${tk.accent}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CloudUploadIcon sx={{ fontSize: 40, color: tk.accent + '44' }} />
          </Box>
          <Typography variant="body2" sx={{ color: tk.textDim, fontFamily: 'monospace',
            letterSpacing: 2, fontSize: '0.7rem' }}>
            UPLOAD A BLUEPRINT TO BEGIN
          </Typography>
          <Typography variant="caption" sx={{ color: tk.textFaint }}>
            or click any device in the panel to place it
          </Typography>
        </Box>
      )}

      {/* Icons */}
      {items.map(item => (
        <CanvasIcon
          key={item.id}
          item={item}
          isSelected={selectedId === item.id}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          onClick={setSelectedId}
        />
      ))}
    </Box>
  );
};

export default CanvasBoard;
