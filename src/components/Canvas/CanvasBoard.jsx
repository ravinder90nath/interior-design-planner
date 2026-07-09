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
import usePolygonDraw  from '../../hooks/usePolygonDraw';
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

  // Icon drag (SELECT tool)
  const drag = useDrag({
    containerRef: canvasRef,
    getItem, onMove: moveItem,
    onSelect: setSelectedId,
    getZoom, getPan,
  });

  // Rect zone draw (ZONE tool)
  const rectDraw = useZoneDraw(canvasRef, getZoom, getPan, 'rect');
  // Ellipse zone draw (CIRCLE tool)
  const circleDraw = useZoneDraw(canvasRef, getZoom, getPan, 'ellipse');
  // Polygon zone draw (POLYGON tool) — click-based, not drag-based
  const polyDraw = usePolygonDraw(canvasRef, getZoom, getPan);

  // ── Merged mouse handlers depending on active tool ──────────────────────
  const handleMouseDown = useCallback((e) => {
    if (activeTool === TOOLS.ZONE) {
      rectDraw.onMouseDown(e);
    } else if (activeTool === TOOLS.CIRCLE) {
      circleDraw.onMouseDown(e);
    } else if (activeTool === TOOLS.PAN || isPanning(e)) {
      panHandlers.onMouseDown(e);
    }
    // SELECT & POLYGON: handled via onClick / icon's own onMouseDown
  }, [activeTool, rectDraw, circleDraw, panHandlers, isPanning]);

  const handleMouseMove = useCallback((e) => {
    panHandlers.onMouseMove(e);
    drag.onMouseMove(e);
    if (activeTool === TOOLS.ZONE)    rectDraw.onMouseMove(e);
    if (activeTool === TOOLS.CIRCLE)  circleDraw.onMouseMove(e);
    if (activeTool === TOOLS.POLYGON) polyDraw.onMouseMove(e);
  }, [panHandlers, drag, activeTool, rectDraw, circleDraw, polyDraw]);

  const handleMouseUp = useCallback((e) => {
    panHandlers.onMouseUp(e);
    drag.onMouseUp(e);
    if (activeTool === TOOLS.ZONE)   rectDraw.onMouseUp(e);
    if (activeTool === TOOLS.CIRCLE) circleDraw.onMouseUp(e);
  }, [panHandlers, drag, activeTool, rectDraw, circleDraw]);

  const handleMouseLeave = useCallback((e) => {
    panHandlers.onMouseLeave(e);
    drag.onMouseLeave(e);
    if (activeTool === TOOLS.ZONE)   rectDraw.onMouseLeave(e);
    if (activeTool === TOOLS.CIRCLE) circleDraw.onMouseLeave(e);
  }, [panHandlers, drag, activeTool, rectDraw, circleDraw]);

  const handleCanvasClick = useCallback((e) => {
    if (activeTool === TOOLS.POLYGON) {
      polyDraw.onClick(e);
      return;
    }
    setSelectedId(null);
    setSelectedZoneId(null);
  }, [activeTool, polyDraw, setSelectedId, setSelectedZoneId]);

  const handleCanvasDoubleClick = useCallback((e) => {
    if (activeTool === TOOLS.POLYGON) polyDraw.onDoubleClick(e);
  }, [activeTool, polyDraw]);

  // Escape cancels in-progress polygon
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && activeTool === TOOLS.POLYGON) polyDraw.cancelPolygon();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeTool, polyDraw]);

  // Cancel any in-progress polygon when switching away from the tool
  useEffect(() => {
    if (activeTool !== TOOLS.POLYGON) polyDraw.cancelPolygon();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTool]);

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

  const cursor =
    activeTool === TOOLS.ZONE || activeTool === TOOLS.CIRCLE || activeTool === TOOLS.POLYGON
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
      onDoubleClick={handleCanvasDoubleClick}
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

        {/* Rect zone draw preview */}
        {rectDraw.preview && (() => {
          const p = rectDraw.preview;
          const x1 = Math.min(p.x1Pct, p.x2Pct);
          const y1 = Math.min(p.y1Pct, p.y2Pct);
          const w  = Math.abs(p.x2Pct - p.x1Pct) * 100;
          const h  = Math.abs(p.y2Pct - p.y1Pct) * 100;
          return (
            <Box sx={{
              position: 'absolute',
              left: `${x1 * 100}%`, top: `${y1 * 100}%`,
              width: `${w}%`, height: `${h}%`,
              border: `2px dashed ${tk.accent}`,
              bgcolor: tk.accent + '18',
              borderRadius: '4px',
              pointerEvents: 'none', zIndex: 200, boxSizing: 'border-box',
            }} />
          );
        })()}

        {/* Ellipse zone draw preview */}
        {circleDraw.preview && (() => {
          const p = circleDraw.preview;
          const x1 = Math.min(p.x1Pct, p.x2Pct);
          const y1 = Math.min(p.y1Pct, p.y2Pct);
          const w  = Math.abs(p.x2Pct - p.x1Pct) * 100;
          const h  = Math.abs(p.y2Pct - p.y1Pct) * 100;
          return (
            <Box sx={{
              position: 'absolute',
              left: `${x1 * 100}%`, top: `${y1 * 100}%`,
              width: `${w}%`, height: `${h}%`,
              border: `2px dashed ${tk.accent}`,
              bgcolor: tk.accent + '18',
              borderRadius: '50%',
              pointerEvents: 'none', zIndex: 200, boxSizing: 'border-box',
            }} />
          );
        })()}

        {/* Polygon draw preview — points + connecting lines */}
        {activeTool === TOOLS.POLYGON && polyDraw.points.length > 0 && (
          <svg
            width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none"
            style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none', zIndex: 200 }}
          >
            {/* Committed polygon edges */}
            <polyline
              points={polyDraw.points.map(p => `${p.x * 100},${p.y * 100}`).join(' ')}
              fill="none"
              stroke={tk.accent}
              strokeWidth={0.5}
              vectorEffect="non-scaling-stroke"
            />
            {/* Live line from last point to cursor */}
            {polyDraw.cursorPt && (
              <line
                x1={polyDraw.points[polyDraw.points.length - 1].x * 100}
                y1={polyDraw.points[polyDraw.points.length - 1].y * 100}
                x2={polyDraw.cursorPt.x * 100}
                y2={polyDraw.cursorPt.y * 100}
                stroke={tk.accent}
                strokeWidth={0.4}
                strokeDasharray="2,1.5"
                vectorEffect="non-scaling-stroke"
              />
            )}
            {/* Point markers */}
            {polyDraw.points.map((p, i) => (
              <circle
                key={i}
                cx={p.x * 100} cy={p.y * 100}
                r={i === 0 ? 1.4 : 1}
                fill={i === 0 ? '#fff' : tk.accent}
                stroke={tk.accent}
                strokeWidth={0.4}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>
        )}
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

      {/* ── Active tool hints ── */}
      {activeTool === TOOLS.ZONE && (
        <Box sx={{
          position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
          bgcolor: tk.accent + '22', border: `1px solid ${tk.accent}55`,
          borderRadius: 1, px: 1.5, py: 0.4, pointerEvents: 'none', zIndex: 300,
        }}>
          <Typography variant="caption" sx={{ color: tk.accent, fontFamily: 'monospace', fontSize: '0.65rem' }}>
            DRAG TO DRAW A RECTANGLE ZONE
          </Typography>
        </Box>
      )}
      {activeTool === TOOLS.CIRCLE && (
        <Box sx={{
          position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
          bgcolor: tk.accent + '22', border: `1px solid ${tk.accent}55`,
          borderRadius: 1, px: 1.5, py: 0.4, pointerEvents: 'none', zIndex: 300,
        }}>
          <Typography variant="caption" sx={{ color: tk.accent, fontFamily: 'monospace', fontSize: '0.65rem' }}>
            DRAG TO DRAW A CIRCLE / ELLIPSE ZONE
          </Typography>
        </Box>
      )}
      {activeTool === TOOLS.POLYGON && (
        <Box sx={{
          position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
          bgcolor: tk.accent + '22', border: `1px solid ${tk.accent}55`,
          borderRadius: 1, px: 1.5, py: 0.4, pointerEvents: 'none', zIndex: 300,
        }}>
          <Typography variant="caption" sx={{ color: tk.accent, fontFamily: 'monospace', fontSize: '0.65rem' }}>
            CLICK TO ADD POINTS · CLICK FIRST POINT OR DOUBLE-CLICK TO CLOSE · ESC TO CANCEL
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
