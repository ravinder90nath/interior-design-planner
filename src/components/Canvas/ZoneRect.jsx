import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useZones } from '../../context/ZonesContext';
import { useTool, TOOLS } from '../../context/ToolContext';

/**
 * ZoneRect — a fully editable zone rectangle.
 *
 * In SELECT mode:
 *   • Click  → select zone
 *   • Drag body          → move the whole zone
 *   • Drag corner handle → resize from that corner
 *   • Drag edge handle   → resize that edge only
 *   • Double-click label → rename inline
 *
 * All coords in fraction space (0-1) same as icons.
 * The parent Box (the transform layer) has position:absolute inset:0,
 * so offsetWidth/offsetHeight gives us the logical canvas size.
 */

// 8 handle definitions: id, cursor, which edges they control
const HANDLES = [
  { id: 'nw', cursor: 'nw-resize', x: 'left',   y: 'top',    moveX1: true,  moveY1: true,  moveX2: false, moveY2: false },
  { id: 'n',  cursor: 'n-resize',  x: 'center', y: 'top',    moveX1: false, moveY1: true,  moveX2: false, moveY2: false },
  { id: 'ne', cursor: 'ne-resize', x: 'right',  y: 'top',    moveX1: false, moveY1: true,  moveX2: true,  moveY2: false },
  { id: 'e',  cursor: 'e-resize',  x: 'right',  y: 'center', moveX1: false, moveY1: false, moveX2: true,  moveY2: false },
  { id: 'se', cursor: 'se-resize', x: 'right',  y: 'bottom', moveX1: false, moveY1: false, moveX2: true,  moveY2: true  },
  { id: 's',  cursor: 's-resize',  x: 'center', y: 'bottom', moveX1: false, moveY1: false, moveX2: false, moveY2: true  },
  { id: 'sw', cursor: 'sw-resize', x: 'left',   y: 'bottom', moveX1: true,  moveY1: false, moveX2: false, moveY2: true  },
  { id: 'w',  cursor: 'w-resize',  x: 'left',   y: 'center', moveX1: true,  moveY1: false, moveX2: false, moveY2: false },
];

const handlePos = (h) => {
  const x = h.x === 'left' ? -5 : h.x === 'right' ? 'calc(100% - 5px)' : 'calc(50% - 5px)';
  const y = h.y === 'top'  ? -5 : h.y === 'bottom' ? 'calc(100% - 5px)' : 'calc(50% - 5px)';
  return { left: x, top: y };
};

const MIN_SIZE = 0.02; // minimum zone size as fraction

const ZoneRect = ({ zone, canvasParentRef }) => {
  const { selectedZoneId, setSelectedZoneId, updateZone, renameZone } = useZones();
  const { activeTool } = useTool();
  const [editing, setEditing] = useState(false);
  const dragRef  = useRef(null); // { type:'move'|'handle', handle?, startZone, startX, startY }
  const boxRef   = useRef(null);

  const isSelected = selectedZoneId === zone.id;

  if (!zone.visible) return null;

  // Get the logical canvas size from the parent transform box
  const getCanvasSize = () => {
    const el = boxRef.current?.parentElement;
    return el
      ? { w: el.offsetWidth, h: el.offsetHeight }
      : { w: 1, h: 1 };
  };

  // ── Move: drag the zone body ─────────────────────────────────────────────
  const onBodyMouseDown = useCallback((e) => {
    if (activeTool !== TOOLS.SELECT) return;
    if (editing) return;
    e.stopPropagation();
    e.preventDefault();
    setSelectedZoneId(zone.id);
    dragRef.current = {
      type: 'move',
      startZone: { ...zone },
      startX: e.clientX,
      startY: e.clientY,
    };
  }, [activeTool, editing, zone, setSelectedZoneId]);

  // ── Resize: drag a handle ────────────────────────────────────────────────
  const onHandleMouseDown = useCallback((e, handle) => {
    e.stopPropagation();
    e.preventDefault();
    dragRef.current = {
      type: 'handle',
      handle,
      startZone: { ...zone },
      startX: e.clientX,
      startY: e.clientY,
    };
  }, [zone]);

  // ── Global mouse move / up ───────────────────────────────────────────────
  useEffect(() => {
    const onMouseMove = (e) => {
      const ds = dragRef.current;
      if (!ds) return;

      const { w, h } = getCanvasSize();
      const dxPct = (e.clientX - ds.startX) / w;
      const dyPct = (e.clientY - ds.startY) / h;

      if (ds.type === 'move') {
        const zw = ds.startZone.x2Pct - ds.startZone.x1Pct;
        const zh = ds.startZone.y2Pct - ds.startZone.y1Pct;
        let x1 = ds.startZone.x1Pct + dxPct;
        let y1 = ds.startZone.y1Pct + dyPct;
        // clamp so zone stays inside canvas
        x1 = Math.max(0, Math.min(1 - zw, x1));
        y1 = Math.max(0, Math.min(1 - zh, y1));
        updateZone(zone.id, { x1Pct: x1, y1Pct: y1, x2Pct: x1 + zw, y2Pct: y1 + zh });

      } else {
        // resize — move the edges this handle controls
        const hd = ds.handle;
        let { x1Pct, y1Pct, x2Pct, y2Pct } = ds.startZone;
        if (hd.moveX1) x1Pct = Math.max(0, Math.min(x2Pct - MIN_SIZE, x1Pct + dxPct));
        if (hd.moveX2) x2Pct = Math.min(1, Math.max(x1Pct + MIN_SIZE, x2Pct + dxPct));
        if (hd.moveY1) y1Pct = Math.max(0, Math.min(y2Pct - MIN_SIZE, y1Pct + dyPct));
        if (hd.moveY2) y2Pct = Math.min(1, Math.max(y1Pct + MIN_SIZE, y2Pct + dyPct));
        updateZone(zone.id, { x1Pct, y1Pct, x2Pct, y2Pct });
      }
    };

    const onMouseUp = () => { dragRef.current = null; };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup',   onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup',   onMouseUp);
    };
  }, [zone.id, updateZone]);

  const w = (zone.x2Pct - zone.x1Pct) * 100;
  const h = (zone.y2Pct - zone.y1Pct) * 100;

  return (
    <Box
      ref={boxRef}
      onMouseDown={onBodyMouseDown}
      onClick={(e) => { e.stopPropagation(); if (activeTool === TOOLS.SELECT) setSelectedZoneId(zone.id); }}
      onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
      sx={{
        position: 'absolute',
        left:   `${zone.x1Pct * 100}%`,
        top:    `${zone.y1Pct * 100}%`,
        width:  `${w}%`,
        height: `${h}%`,
        border: `2px ${isSelected ? 'solid' : 'dashed'} ${zone.color}`,
        bgcolor: zone.color + (isSelected ? '20' : '12'),
        borderRadius: '4px',
        cursor: activeTool === TOOLS.SELECT ? (isSelected ? 'move' : 'pointer') : 'crosshair',
        zIndex: isSelected ? 5 : 1,
        boxSizing: 'border-box',
        '&:hover': { bgcolor: zone.color + '26' },
        transition: 'background 0.12s',
      }}
    >
      {/* ── Zone label ── */}
      <Box sx={{ position: 'absolute', top: 5, left: 6, display: 'flex', alignItems: 'center', gap: 0.5, pointerEvents: 'none' }}>
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
            onBlur={(e) => { renameZone(zone.id, e.target.value || zone.name); setEditing(false); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter')  { renameZone(zone.id, e.target.value || zone.name); setEditing(false); }
              if (e.key === 'Escape') { setEditing(false); }
              e.stopPropagation();
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
            fontSize: '0.68rem', fontWeight: 700, color: zone.color,
            bgcolor: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(4px)',
            px: 0.6, py: 0.1, borderRadius: 0.5,
            lineHeight: 1.4, whiteSpace: 'nowrap', userSelect: 'none',
          }}>
            {zone.name}
          </Typography>
        )}
      </Box>

      {/* ── 8 resize handles (only when selected + select tool) ── */}
      {isSelected && activeTool === TOOLS.SELECT && HANDLES.map(h => (
        <Box
          key={h.id}
          onMouseDown={(e) => onHandleMouseDown(e, h)}
          sx={{
            position: 'absolute',
            ...handlePos(h),
            width: 10, height: 10,
            borderRadius: h.x === 'center' || h.y === 'center' ? '2px' : '50%',
            bgcolor: '#fff',
            border: `2px solid ${zone.color}`,
            boxShadow: `0 0 0 1px ${zone.color}44, 0 1px 4px rgba(0,0,0,0.25)`,
            cursor: h.cursor,
            zIndex: 10,
            transition: 'transform 0.1s',
            '&:hover': { transform: 'scale(1.3)', bgcolor: zone.color },
          }}
        />
      ))}
    </Box>
  );
};

export default ZoneRect;
