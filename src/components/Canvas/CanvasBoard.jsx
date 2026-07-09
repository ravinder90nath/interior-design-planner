import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import { useApp }    from '../../context/AppContext';
import { useLayers } from '../../context/LayersContext';
import { GRID_SIZE, ICON_SIZE } from '../../constants';
import useDrag       from '../../hooks/useDrag';
import useViewport   from '../../hooks/useViewport';
import CanvasIcon    from './CanvasIcon';
import ZoomControls  from './ZoomControls';

const CanvasBoard = ({ canvasRef }) => {
  const { mode, showGrid, tk } = useApp();
  const { items, blueprintImg, selectedId, setSelectedId, moveItem } = useLayers();
  const [ctrlHeld, setCtrlHeld] = useState(false);

  const {
    zoom, pan,
    transform, transformOrigin,
    panHandlers,
    resetView, zoomTo,
    isPanning,
  } = useViewport(canvasRef);

  // Stable refs so drag callbacks always read latest zoom/pan
  const zoomRef = useRef(zoom);
  const panRef  = useRef(pan);
  zoomRef.current = zoom;
  panRef.current  = pan;

  const getItem = useCallback((id) => items.find(i => i.id === id) || { x: 0, y: 0 }, [items]);
  const getZoom = useCallback(() => zoomRef.current, []);
  const getPan  = useCallback(() => panRef.current,  []);

  const drag = useDrag({
    containerRef: canvasRef,
    getItem, onMove: moveItem,
    onSelect: setSelectedId,
    iconSize: ICON_SIZE,
    getZoom, getPan,
  });

  // Merged handlers: pan (ctrl) + drag (normal)
  const handleMouseDown = useCallback((e) => {
    if (isPanning(e)) panHandlers.onMouseDown(e);
  }, [isPanning, panHandlers]);

  const handleMouseMove = useCallback((e) => {
    panHandlers.onMouseMove(e);
    drag.onMouseMove(e);
  }, [panHandlers, drag]);

  const handleMouseUp = useCallback((e) => {
    panHandlers.onMouseUp(e);
    drag.onMouseUp(e);
  }, [panHandlers, drag]);

  const handleMouseLeave = useCallback((e) => {
    panHandlers.onMouseLeave(e);
    drag.onMouseLeave(e);
  }, [panHandlers, drag]);

  // Track Ctrl key for cursor feedback
  useEffect(() => {
    const down = (e) => { if (e.key === 'Control' || e.key === 'Meta') setCtrlHeld(true);  };
    const up   = (e) => { if (e.key === 'Control' || e.key === 'Meta') setCtrlHeld(false); };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup',   up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  // Button-driven zoom toward canvas center
  const handleButtonZoom = useCallback((nextZoom) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    zoomTo(nextZoom, rect.width / 2, rect.height / 2);
  }, [canvasRef, zoomTo]);

  // Grid shifts with pan so it feels anchored
  const gridBgSize   = `${GRID_SIZE * zoom}px ${GRID_SIZE * zoom}px`;
  const gridBgOffset = `${pan.x % (GRID_SIZE * zoom)}px ${pan.y % (GRID_SIZE * zoom)}px`;

  return (
    <Box
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchMove={drag.onTouchMove}
      onTouchEnd={drag.onTouchEnd}
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
        backgroundSize:     showGrid ? gridBgSize   : 'unset',
        backgroundPosition: showGrid ? gridBgOffset : 'unset',
        cursor: ctrlHeld ? 'grab' : 'default',
        userSelect: 'none',
        transition: 'background-color 0.25s',
      }}
    >
      {/* ── Transformed content layer (zoom + pan applied here) ── */}
      <Box sx={{
        position: 'absolute', inset: 0,
        transform,
        transformOrigin,
        willChange: 'transform',
      }}>
        {blueprintImg && (
          <img
            src={blueprintImg}
            alt="Blueprint"
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'contain',
              opacity: mode === 'dark' ? 0.5 : 0.6,
              pointerEvents: 'none', userSelect: 'none',
            }}
          />
        )}

        {items.map(item => (
          <CanvasIcon
            key={item.id}
            item={item}
            isSelected={selectedId === item.id}
            onMouseDown={drag.onMouseDown}
            onTouchStart={drag.onTouchStart}
            onClick={setSelectedId}
          />
        ))}
      </Box>

      {/* ── Empty state (outside transform — always centered) ── */}
      {!blueprintImg && items.length === 0 && (
        <Box sx={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 2, pointerEvents: 'none', zIndex: 5,
        }}>
          <Box sx={{
            width: 88, height: 88, borderRadius: '50%',
            background: tk.accent + '10', border: `2px dashed ${tk.accent}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
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

      {/* ── Zoom HUD (bottom-left) ── */}
      <ZoomControls zoom={zoom} onZoomChange={handleButtonZoom} onReset={resetView} />

      {/* ── Ctrl pan hint ── */}
      {ctrlHeld && (
        <Box sx={{
          position: 'absolute', top: 10, left: '50%',
          transform: 'translateX(-50%)',
          bgcolor: tk.accent + '22',
          border: `1px solid ${tk.accent}55`,
          borderRadius: 1, px: 1.5, py: 0.4,
          pointerEvents: 'none', zIndex: 300,
        }}>
          <Typography variant="caption"
            sx={{ color: tk.accent, fontFamily: 'monospace', fontSize: '0.65rem' }}>
            CTRL + DRAG TO PAN
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default CanvasBoard;
