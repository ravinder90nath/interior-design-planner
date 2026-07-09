import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useZones, ZONE_SHAPES } from '../../context/ZonesContext';
import { useTool, TOOLS } from '../../context/ToolContext';

const MIN_FRAC = 0.02;

const HANDLES = [
  { id: 'nw', cursor: 'nw-resize', cx: 'left',   cy: 'top',    dx1: 1, dy1: 1, dx2: 0, dy2: 0 },
  { id: 'n',  cursor: 'n-resize',  cx: 'center', cy: 'top',    dx1: 0, dy1: 1, dx2: 0, dy2: 0 },
  { id: 'ne', cursor: 'ne-resize', cx: 'right',  cy: 'top',    dx1: 0, dy1: 1, dx2: 1, dy2: 0 },
  { id: 'e',  cursor: 'e-resize',  cx: 'right',  cy: 'center', dx1: 0, dy1: 0, dx2: 1, dy2: 0 },
  { id: 'se', cursor: 'se-resize', cx: 'right',  cy: 'bottom', dx1: 0, dy1: 0, dx2: 1, dy2: 1 },
  { id: 's',  cursor: 's-resize',  cx: 'center', cy: 'bottom', dx1: 0, dy1: 0, dx2: 0, dy2: 1 },
  { id: 'sw', cursor: 'sw-resize', cx: 'left',   cy: 'bottom', dx1: 1, dy1: 0, dx2: 0, dy2: 1 },
  { id: 'w',  cursor: 'w-resize',  cx: 'left',   cy: 'center', dx1: 1, dy1: 0, dx2: 0, dy2: 0 },
];

const handleStyle = ({ cx, cy }) => ({
  left:
    cx === 'left'   ? -5 :
    cx === 'right'  ? 'calc(100% - 5px)' :
                      'calc(50% - 5px)',
  top:
    cy === 'top'    ? -5 :
    cy === 'bottom' ? 'calc(100% - 5px)' :
                      'calc(50% - 5px)',
});

// ── Zone label, shared by all shapes ─────────────────────────────────────
const ZoneLabel = ({ zone, editing, setEditing, renameZone, top = 5, left = 6 }) => (
  <Box sx={{
    position: 'absolute', top, left,
    display: 'flex', alignItems: 'center', gap: 0.5,
    pointerEvents: editing ? 'all' : 'none',
  }}>
    <Box sx={{
      width: 18, height: 18, borderRadius: '50%', bgcolor: zone.color,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Typography sx={{ fontSize: '0.55rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
        {zone.id}
      </Typography>
    </Box>

    {editing ? (
      <input
        autoFocus
        defaultValue={zone.name}
        onBlur={(e)    => { renameZone(zone.id, e.target.value || zone.name); setEditing(false); }}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === 'Enter')  { renameZone(zone.id, e.target.value || zone.name); setEditing(false); }
          if (e.key === 'Escape') { setEditing(false); }
        }}
        onClick={(e) => e.stopPropagation()}
        style={{
          fontSize: '11px', fontWeight: 700, color: zone.color,
          background: 'rgba(255,255,255,0.95)',
          border: `1.5px solid ${zone.color}`,
          borderRadius: 3, padding: '1px 5px',
          outline: 'none', width: 100, pointerEvents: 'all',
        }}
      />
    ) : (
      <Typography sx={{
        fontSize: '0.68rem', fontWeight: 700, color: zone.color,
        bgcolor: 'rgba(255,255,255,0.80)', backdropFilter: 'blur(4px)',
        px: 0.6, py: 0.1, borderRadius: 0.5,
        lineHeight: 1.4, whiteSpace: 'nowrap', userSelect: 'none',
      }}>
        {zone.name}
      </Typography>
    )}
  </Box>
);

// ════════════════════════════════════════════════════════════════════════
// RECT / ELLIPSE — bounding-box shapes, share move + 8-handle resize logic
// ════════════════════════════════════════════════════════════════════════
const BoxZone = ({ zone, canvasRef }) => {
  const { selectedZoneId, setSelectedZoneId, updateZone, renameZone } = useZones();
  const { activeTool } = useTool();
  const [editing, setEditing] = useState(false);
  const drag = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      const ds = drag.current;
      if (!ds) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0) return;

      const dxPct = (e.clientX - ds.startClientX) / rect.width;
      const dyPct = (e.clientY - ds.startClientY) / rect.height;
      const snap  = ds.snapshot;

      if (ds.mode === 'move') {
        const zw = snap.x2Pct - snap.x1Pct;
        const zh = snap.y2Pct - snap.y1Pct;
        const x1 = Math.max(0, Math.min(1 - zw, snap.x1Pct + dxPct));
        const y1 = Math.max(0, Math.min(1 - zh, snap.y1Pct + dyPct));
        updateZone(zone.id, { x1Pct: x1, y1Pct: y1, x2Pct: x1 + zw, y2Pct: y1 + zh });
      } else {
        const h = ds.handle;
        let { x1Pct, y1Pct, x2Pct, y2Pct } = snap;
        if (h.dx1) x1Pct = Math.max(0, Math.min(x2Pct - MIN_FRAC, snap.x1Pct + dxPct));
        if (h.dx2) x2Pct = Math.min(1, Math.max(x1Pct + MIN_FRAC, snap.x2Pct + dxPct));
        if (h.dy1) y1Pct = Math.max(0, Math.min(y2Pct - MIN_FRAC, snap.y1Pct + dyPct));
        if (h.dy2) y2Pct = Math.min(1, Math.max(y1Pct + MIN_FRAC, snap.y2Pct + dyPct));
        updateZone(zone.id, { x1Pct, y1Pct, x2Pct, y2Pct });
      }
    };
    const onUp = () => { drag.current = null; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
  }, [zone.id, updateZone, canvasRef]);

  if (!zone.visible) return null;

  const isSelected = selectedZoneId === zone.id;
  const wPct = (zone.x2Pct - zone.x1Pct) * 100;
  const hPct = (zone.y2Pct - zone.y1Pct) * 100;
  const isEllipse = zone.shape === ZONE_SHAPES.ELLIPSE;

  const snapshot = () => ({ x1Pct: zone.x1Pct, y1Pct: zone.y1Pct, x2Pct: zone.x2Pct, y2Pct: zone.y2Pct });

  const onBodyMouseDown = (e) => {
    if (activeTool !== TOOLS.SELECT || editing) return;
    e.stopPropagation(); e.preventDefault();
    setSelectedZoneId(zone.id);
    drag.current = { mode: 'move', snapshot: snapshot(), startClientX: e.clientX, startClientY: e.clientY };
  };

  const onHandleMouseDown = (e, handle) => {
    e.stopPropagation(); e.preventDefault();
    drag.current = { mode: 'handle', handle, snapshot: snapshot(), startClientX: e.clientX, startClientY: e.clientY };
  };

  return (
    <Box
      onMouseDown={onBodyMouseDown}
      onClick={(e) => { e.stopPropagation(); if (activeTool === TOOLS.SELECT) setSelectedZoneId(zone.id); }}
      onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
      sx={{
        position: 'absolute',
        left: `${zone.x1Pct * 100}%`, top: `${zone.y1Pct * 100}%`,
        width: `${wPct}%`, height: `${hPct}%`,
        border: `2px ${isSelected ? 'solid' : 'dashed'} ${zone.color}`,
        bgcolor: zone.color + (isSelected ? '20' : '12'),
        borderRadius: isEllipse ? '50%' : '4px',
        cursor: activeTool === TOOLS.SELECT ? (isSelected ? 'move' : 'pointer') : 'crosshair',
        zIndex: isSelected ? 5 : 2,
        boxSizing: 'border-box',
        '&:hover': { bgcolor: zone.color + '26' },
        transition: 'background 0.12s, border 0.12s',
      }}
    >
      <ZoneLabel zone={zone} editing={editing} setEditing={setEditing} renameZone={renameZone} />

      {isSelected && activeTool === TOOLS.SELECT && HANDLES.map(h => (
        <Box key={h.id} onMouseDown={(e) => onHandleMouseDown(e, h)}
          sx={{
            position: 'absolute', ...handleStyle(h),
            width: 10, height: 10,
            borderRadius: h.cx === 'center' || h.cy === 'center' ? '2px' : '50%',
            bgcolor: '#fff', border: `2px solid ${zone.color}`,
            boxShadow: `0 0 0 1px ${zone.color}55, 0 1px 5px rgba(0,0,0,0.2)`,
            cursor: h.cursor, zIndex: 20,
            '&:hover': { transform: 'scale(1.4)', bgcolor: zone.color },
            transition: 'transform 0.1s, background 0.1s',
          }}
        />
      ))}
    </Box>
  );
};

// ════════════════════════════════════════════════════════════════════════
// POLYGON — free-form shape using an SVG path, point handles for editing
// ════════════════════════════════════════════════════════════════════════
const PolygonZone = ({ zone, canvasRef }) => {
  const { selectedZoneId, setSelectedZoneId, updateZone, renameZone, deleteZone } = useZones();
  const { activeTool } = useTool();
  const [editing, setEditing] = useState(false);
  const drag = useRef(null); // { mode:'move'|'point', pointIndex?, snapshotPoints, startClientX, startClientY }

  useEffect(() => {
    const onMove = (e) => {
      const ds = drag.current;
      if (!ds) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0) return;

      const dxPct = (e.clientX - ds.startClientX) / rect.width;
      const dyPct = (e.clientY - ds.startClientY) / rect.height;

      if (ds.mode === 'move') {
        const newPoints = ds.snapshotPoints.map(p => ({
          x: Math.max(0, Math.min(1, p.x + dxPct)),
          y: Math.max(0, Math.min(1, p.y + dyPct)),
        }));
        updateZone(zone.id, { points: newPoints });
      } else if (ds.mode === 'point') {
        const newPoints = ds.snapshotPoints.map((p, i) =>
          i === ds.pointIndex
            ? { x: Math.max(0, Math.min(1, p.x + dxPct)), y: Math.max(0, Math.min(1, p.y + dyPct)) }
            : p
        );
        updateZone(zone.id, { points: newPoints });
      }
    };
    const onUp = () => { drag.current = null; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
  }, [zone.id, updateZone, canvasRef]);

  if (!zone.visible || !zone.points || zone.points.length < 3) return null;

  const isSelected = selectedZoneId === zone.id;
  const pts = zone.points;

  // Bounding box (for the label position)
  const minX = Math.min(...pts.map(p => p.x));
  const minY = Math.min(...pts.map(p => p.y));

  const pathPoints = pts.map(p => `${p.x * 100},${p.y * 100}`).join(' ');

  const onBodyMouseDown = (e) => {
    if (activeTool !== TOOLS.SELECT || editing) return;
    e.stopPropagation(); e.preventDefault();
    setSelectedZoneId(zone.id);
    drag.current = { mode: 'move', snapshotPoints: pts.map(p => ({ ...p })), startClientX: e.clientX, startClientY: e.clientY };
  };

  const onPointMouseDown = (e, index) => {
    e.stopPropagation(); e.preventDefault();
    drag.current = { mode: 'point', pointIndex: index, snapshotPoints: pts.map(p => ({ ...p })), startClientX: e.clientX, startClientY: e.clientY };
  };

  return (
    <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: isSelected ? 5 : 2 }}>
      <svg
        width="100%" height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}
      >
        <polygon
          points={pathPoints}
          fill={zone.color + (isSelected ? '33' : '20')}
          stroke={zone.color}
          strokeWidth={isSelected ? 0.6 : 0.4}
          strokeDasharray={isSelected ? 'none' : '2,1.5'}
          vectorEffect="non-scaling-stroke"
          onMouseDown={onBodyMouseDown}
          onClick={(e) => { e.stopPropagation(); if (activeTool === TOOLS.SELECT) setSelectedZoneId(zone.id); }}
          onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
          style={{
            pointerEvents: 'all',
            cursor: activeTool === TOOLS.SELECT ? (isSelected ? 'move' : 'pointer') : 'crosshair',
          }}
        />
      </svg>

      {/* Label positioned at top-left of bounding box */}
      <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <ZoneLabel
          zone={zone} editing={editing} setEditing={setEditing} renameZone={renameZone}
          top={`calc(${minY * 100}% + 5px)`}
          left={`calc(${minX * 100}% + 6px)`}
        />
      </Box>

      {/* Editable point handles */}
      {isSelected && activeTool === TOOLS.SELECT && pts.map((p, i) => (
        <Box
          key={i}
          onMouseDown={(e) => onPointMouseDown(e, i)}
          sx={{
            position: 'absolute',
            left: `calc(${p.x * 100}% - 5px)`,
            top:  `calc(${p.y * 100}% - 5px)`,
            width: 10, height: 10, borderRadius: '50%',
            bgcolor: '#fff', border: `2px solid ${zone.color}`,
            boxShadow: `0 0 0 1px ${zone.color}55, 0 1px 5px rgba(0,0,0,0.2)`,
            cursor: 'move', zIndex: 20, pointerEvents: 'all',
            '&:hover': { transform: 'scale(1.4)', bgcolor: zone.color },
            transition: 'transform 0.1s, background 0.1s',
          }}
        />
      ))}
    </Box>
  );
};

// ════════════════════════════════════════════════════════════════════════
// Dispatcher — picks the right renderer based on zone.shape
// ════════════════════════════════════════════════════════════════════════
const ZoneRect = ({ zone, canvasRef }) => {
  if (zone.shape === ZONE_SHAPES.POLYGON) {
    return <PolygonZone zone={zone} canvasRef={canvasRef} />;
  }
  return <BoxZone zone={zone} canvasRef={canvasRef} />;
};

export default ZoneRect;
