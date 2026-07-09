import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { useZones } from '../../context/ZonesContext';
import { useTool, TOOLS } from '../../context/ToolContext';

/**
 * ZoneRect — movable + resizable zone rectangle.
 *
 * KEY DESIGN:
 *   All drag math uses canvasRef.getBoundingClientRect() for the
 *   outer unscaled container size — this is always stable regardless
 *   of CSS transforms or zoom on the inner layer.
 *
 *   Positions are stored as fractions (0-1) and rendered as % CSS,
 *   so they are device-independent.
 *
 * INTERACTIONS (Select tool only):
 *   • Click body        → select
 *   • Drag body         → move
 *   • Drag any handle   → resize that edge/corner
 *   • Double-click label → rename inline
 */

const MIN_FRAC = 0.02; // minimum zone size (2% of canvas)

// 8 handles: which fraction edges they mutate
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

// Position a handle on the border of the zone box
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

const ZoneRect = ({ zone, canvasRef }) => {
  const { selectedZoneId, setSelectedZoneId, updateZone, renameZone } = useZones();
  const { activeTool } = useTool();
  const [editing, setEditing] = useState(false);

  // Drag state: { mode:'move'|'handle', handle?, snapshot, startClientX, startClientY }
  const drag = useRef(null);

  const isSelected = selectedZoneId === zone.id;

  if (!zone.visible) return null;

  // ── Helpers ────────────────────────────────────────────────────────────────
  /**
   * Convert a clientX/Y delta to fraction deltas using the OUTER canvas rect.
   * getBoundingClientRect() on the outer container is unaffected by the CSS
   * transform on the inner Box — it always returns the true screen size.
   */
  const toDelta = (dClientX, dClientY) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return { dxPct: 0, dyPct: 0 };
    return {
      dxPct: dClientX / rect.width,
      dyPct: dClientY / rect.height,
    };
  };

  // ── Global mouse tracking ──────────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e) => {
      const ds = drag.current;
      if (!ds) return;

      const { dxPct, dyPct } = toDelta(
        e.clientX - ds.startClientX,
        e.clientY - ds.startClientY,
      );

      const snap = ds.snapshot; // zone coords at drag start

      if (ds.mode === 'move') {
        const zw = snap.x2Pct - snap.x1Pct;
        const zh = snap.y2Pct - snap.y1Pct;
        let x1 = snap.x1Pct + dxPct;
        let y1 = snap.y1Pct + dyPct;
        x1 = Math.max(0, Math.min(1 - zw, x1));
        y1 = Math.max(0, Math.min(1 - zh, y1));
        updateZone(zone.id, { x1Pct: x1, y1Pct: y1, x2Pct: x1 + zw, y2Pct: y1 + zh });

      } else {
        // resize: each dx1/dy1/dx2/dy2 is 0 or 1 indicating which edges move
        const h = ds.handle;
        let { x1Pct, y1Pct, x2Pct, y2Pct } = snap;

        if (h.dx1) x1Pct = Math.max(0,           Math.min(x2Pct - MIN_FRAC, snap.x1Pct + dxPct));
        if (h.dx2) x2Pct = Math.min(1,            Math.max(x1Pct + MIN_FRAC, snap.x2Pct + dxPct));
        if (h.dy1) y1Pct = Math.max(0,           Math.min(y2Pct - MIN_FRAC, snap.y1Pct + dyPct));
        if (h.dy2) y2Pct = Math.min(1,            Math.max(y1Pct + MIN_FRAC, snap.y2Pct + dyPct));

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
  }, [zone.id, zone.x1Pct, zone.y1Pct, zone.x2Pct, zone.y2Pct, updateZone, canvasRef]);

  // ── Event handlers ─────────────────────────────────────────────────────────
  const onBodyMouseDown = (e) => {
    if (activeTool !== TOOLS.SELECT || editing) return;
    e.stopPropagation();
    e.preventDefault();
    setSelectedZoneId(zone.id);
    drag.current = {
      mode: 'move',
      snapshot: { x1Pct: zone.x1Pct, y1Pct: zone.y1Pct, x2Pct: zone.x2Pct, y2Pct: zone.y2Pct },
      startClientX: e.clientX,
      startClientY: e.clientY,
    };
  };

  const onHandleMouseDown = (e, handle) => {
    e.stopPropagation();
    e.preventDefault();
    drag.current = {
      mode: 'handle',
      handle,
      snapshot: { x1Pct: zone.x1Pct, y1Pct: zone.y1Pct, x2Pct: zone.x2Pct, y2Pct: zone.y2Pct },
      startClientX: e.clientX,
      startClientY: e.clientY,
    };
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const wPct = (zone.x2Pct - zone.x1Pct) * 100;
  const hPct = (zone.y2Pct - zone.y1Pct) * 100;

  return (
    <Box
      onMouseDown={onBodyMouseDown}
      onClick={(e) => { e.stopPropagation(); if (activeTool === TOOLS.SELECT) setSelectedZoneId(zone.id); }}
      onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
      sx={{
        position:  'absolute',
        left:      `${zone.x1Pct * 100}%`,
        top:       `${zone.y1Pct * 100}%`,
        width:     `${wPct}%`,
        height:    `${hPct}%`,
        border:    `2px ${isSelected ? 'solid' : 'dashed'} ${zone.color}`,
        bgcolor:   zone.color + (isSelected ? '20' : '12'),
        borderRadius: '4px',
        cursor:    activeTool === TOOLS.SELECT
          ? (isSelected ? 'move' : 'pointer')
          : 'crosshair',
        zIndex:    isSelected ? 5 : 2,
        boxSizing: 'border-box',
        '&:hover': { bgcolor: zone.color + '26' },
        transition: 'background 0.12s, border 0.12s',
      }}
    >
      {/* ── Label ── */}
      <Box sx={{
        position: 'absolute', top: 5, left: 6,
        display: 'flex', alignItems: 'center', gap: 0.5,
        pointerEvents: editing ? 'all' : 'none',
      }}>
        {/* Number badge */}
        <Box sx={{
          width: 18, height: 18, borderRadius: '50%', bgcolor: zone.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Typography sx={{ fontSize: '0.55rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
            {zone.id}
          </Typography>
        </Box>

        {/* Name — editable on double-click */}
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
              fontSize: '11px', fontWeight: 700,
              color: zone.color,
              background: 'rgba(255,255,255,0.95)',
              border: `1.5px solid ${zone.color}`,
              borderRadius: 3, padding: '1px 5px',
              outline: 'none', width: 100,
              pointerEvents: 'all',
            }}
          />
        ) : (
          <Typography sx={{
            fontSize: '0.68rem', fontWeight: 700,
            color: zone.color,
            bgcolor: 'rgba(255,255,255,0.80)',
            backdropFilter: 'blur(4px)',
            px: 0.6, py: 0.1, borderRadius: 0.5,
            lineHeight: 1.4, whiteSpace: 'nowrap', userSelect: 'none',
          }}>
            {zone.name}
          </Typography>
        )}
      </Box>

      {/* ── 8 resize handles (selected + select tool only) ── */}
      {isSelected && activeTool === TOOLS.SELECT && HANDLES.map(h => (
        <Box
          key={h.id}
          onMouseDown={(e) => onHandleMouseDown(e, h)}
          sx={{
            position: 'absolute',
            ...handleStyle(h),
            width: 10, height: 10,
            borderRadius: h.cx === 'center' || h.cy === 'center' ? '2px' : '50%',
            bgcolor: '#fff',
            border: `2px solid ${zone.color}`,
            boxShadow: `0 0 0 1px ${zone.color}55, 0 1px 5px rgba(0,0,0,0.2)`,
            cursor: h.cursor,
            zIndex: 20,
            '&:hover': { transform: 'scale(1.4)', bgcolor: zone.color },
            transition: 'transform 0.1s, background 0.1s',
          }}
        />
      ))}
    </Box>
  );
};

export default ZoneRect;
