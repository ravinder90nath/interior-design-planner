import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import { useApp }      from '../../context/AppContext';
import { useLayers }   from '../../context/LayersContext';
import { useZones }    from '../../context/ZonesContext';
import { useTool, TOOLS } from '../../context/ToolContext';
import { GRID_SIZE, ICON_SIZE } from '../../constants';
import useDrag         from '../../hooks/useDrag';
import useViewport     from '../../hooks/useViewport';
import useZoneDraw     from '../../hooks/useZoneDraw';
import CanvasIcon      from './CanvasIcon';
import ZoneRect        from './ZoneRect';
import ZoomControls    from './ZoomControls';

const CanvasBoard = ({ canvasRef }) => {
  const { mode, showGrid, tk } = useApp();
  const { items, blueprintImg, selectedId, setSelectedId, moveItem } = useLayers();
  const { zones, setSelectedZoneId } = useZones();
  const { activeTool } = useTool();
  const [ctrlHeld, setCtrlHeld] = useState(false);

  const {
    zoom, pan, transform, transformOrigin,
    panHandlers, resetView, zoomTo, isPanning,
  } = useViewport(canvasRef);

  const zoomRef = useRef(zoom);
  const panRef  = useRef(pan);
  zoomRef.current = zoom;
  panRef.current  = pan;

  const getZoom = useCallback(() => zoomRef.current, []);
  const getPan  = useCallback(() => panRef.current,  []);
  const getItem = useCallback((id) => items.find(i => i.id === id) || { xPct: 0, yPct: 0 }, [items]);

  // Drag for icons (only active in SELECT tool)
  const drag = useDrag({
    containerRef: canvasRef,
    getItem, onMove: moveItem,
    onSelect: setSelectedId,
    getZoom, getPan,
  });

  // Zone draw (only active in ZONE tool)
  const zoneDraw = useZoneDraw(canvasRef, getZoom, getPan);

  // ── Merged mouse handlers depending on active tool ──────────────────────
  const handleMouseDown = useCallback((e) => {
    if (activeTool === TOOLS.ZONE) {
      zoneDraw.onMouseDown(e);
    } else if (activeTool === TOOLS.PAN || isPanning(e)) {
      panHandlers.onMouseDown(e);
    }
    // SELECT: icon drag is handled inside CanvasIcon's own onMouseDown
  }, [activeTool, zoneDraw, panHandlers, isPanning]);

  const handleMouseMove = useCallback((e) => {
    panHandlers.onMouseMove(e);   // pan always tracks (harmless when not dragging)
    drag.onMouseMove(e);
    if (activeTool === TOOLS.ZONE) zoneDraw.onMouseMove(e);
  }, [panHandlers, drag, activeTool, zoneDraw]);

  const handleMouseUp = useCallback((e) => {
    panHandlers.onMouseUp(e);
    drag.onMouseUp(e);
    if (activeTool === TOOLS.ZONE) zoneDraw.onMouseUp(e);
  }, [panHandlers, drag, activeTool, zoneDraw]);

  const handleMouseLeave = useCallback((e) => {
    panHandlers.onMouseLeave(e);
    drag.onMouseLeave(e);
    if (activeTool === TOOLS.ZONE) zoneDraw.onMouseLeave(e);
  }, [panHandlers, drag, activeTool, zoneDraw]);

  const handleCanvasClick = useCallback(() => {
    setSelectedId(null);
    setSelectedZoneId(null);
  }, [setSelectedId, setSelectedZoneId]);

  // Ctrl key hint (still works as shorthand pan even in SELECT mode)
  useEffect(() => {
    const down = (e) => { if (e.key === 'Control' || e.key === 'Meta') setCtrlHeld(true); };
    const up   = (e) => { if (e.key === 'Control' || e.key === 'Meta') setCtrlHeld(false); };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  const handleButtonZoom = useCallback((nextZoom) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    zoomTo(nextZoom, rect.width / 2, rect.height / 2);
  }, [canvasRef, zoomTo]);

  const gridBgSize   = `${GRID_SIZE * zoom}px ${GRID_SIZE * zoom}px`;
  const gridBgOffset = `${pan.x % (GRID_SIZE * zoom)}px ${pan.y % (GRID_SIZE * zoom)}px`;

  // Cursor based on tool
  const cursor = activeTool === TOOLS.ZONE
    ? 'crosshair'
    : activeTool === TOOLS.PAN || ctrlHeld
      ? 'grab'
      : 'default';

  return (
    <Box
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchMove={drag.onTouchMove}
      onTouchEnd={drag.onTouchEnd}
      onClick={handleCanvasClick}
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
        cursor,
        userSelect: 'none',
        transition: 'background-color 0.25s',
      }}
    >
      {/* ── Transformed layer: blueprint + zones + icons ── */}
      <Box sx={{
        position: 'absolute', inset: 0,
        transform, transformOrigin,
        willChange: 'transform',
      }}>
        {/* Blueprint */}
        {blueprintImg && (
          <img src={blueprintImg} alt="Blueprint"
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'contain',
              opacity: mode === 'dark' ? 0.5 : 0.6,
              pointerEvents: 'none', userSelect: 'none',
            }}
          />
        )}

        {/* Zones (below icons) */}
        {zones.map(zone => (
          <ZoneRect key={zone.id} zone={zone} canvasRef={canvasRef} />
        ))}

        {/* Icons */}
        {items.map(item => (
          <CanvasIcon
            key={item.id}
            item={item}
            isSelected={selectedId === item.id}
            onMouseDown={activeTool === TOOLS.SELECT ? drag.onMouseDown : (e) => e.stopPropagation()}
            onTouchStart={drag.onTouchStart}
            onClick={setSelectedId}
          />
        ))}

        {/* Zone draw preview */}
        {zoneDraw.preview && (() => {
          const p = zoneDraw.preview;
          const x1 = Math.min(p.x1Pct, p.x2Pct);
          const y1 = Math.min(p.y1Pct, p.y2Pct);
          const w  = Math.abs(p.x2Pct - p.x1Pct) * 100;
          const h  = Math.abs(p.y2Pct - p.y1Pct) * 100;
          return (
            <Box sx={{
              position: 'absolute',
              left:   `${x1 * 100}%`,
              top:    `${y1 * 100}%`,
              width:  `${w}%`,
              height: `${h}%`,
              border: `2px dashed ${tk.accent}`,
              bgcolor: tk.accent + '18',
              borderRadius: '4px',
              pointerEvents: 'none',
              zIndex: 200,
              boxSizing: 'border-box',
            }} />
          );
        })()}
      </Box>

      {/* ── Empty state ── */}
      {!blueprintImg && items.length === 0 && zones.length === 0 && (
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
          <Typography variant="body2" sx={{ color: tk.textDim, fontFamily: 'monospace', letterSpacing: 2, fontSize: '0.7rem' }}>
            UPLOAD A BLUEPRINT TO BEGIN
          </Typography>
          <Typography variant="caption" sx={{ color: tk.textFaint }}>
            or click any device in the panel to place it
          </Typography>
        </Box>
      )}

      {/* ── Active tool hint ── */}
      {activeTool === TOOLS.ZONE && (
        <Box sx={{
          position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
          bgcolor: tk.accent + '22', border: `1px solid ${tk.accent}55`,
          borderRadius: 1, px: 1.5, py: 0.4, pointerEvents: 'none', zIndex: 300,
        }}>
          <Typography variant="caption" sx={{ color: tk.accent, fontFamily: 'monospace', fontSize: '0.65rem' }}>
            DRAG TO DRAW A ZONE · DOUBLE-CLICK ZONE TO RENAME
          </Typography>
        </Box>
      )}
      {activeTool === TOOLS.PAN && (
        <Box sx={{
          position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
          bgcolor: '#A78BFA22', border: '1px solid #A78BFA55',
          borderRadius: 1, px: 1.5, py: 0.4, pointerEvents: 'none', zIndex: 300,
        }}>
          <Typography variant="caption" sx={{ color: '#A78BFA', fontFamily: 'monospace', fontSize: '0.65rem' }}>
            DRAG TO PAN CANVAS
          </Typography>
        </Box>
      )}

      <ZoomControls zoom={zoom} onZoomChange={handleButtonZoom} onReset={resetView} />
    </Box>
  );
};

export default CanvasBoard;
