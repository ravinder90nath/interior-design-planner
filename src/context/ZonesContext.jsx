import React, { createContext, useContext, useState, useCallback } from 'react';

const ZonesContext = createContext(null);

export const useZones = () => {
  const ctx = useContext(ZonesContext);
  if (!ctx) throw new Error('useZones must be inside <ZonesProvider>');
  return ctx;
};

let zoneCounter = 1;
const nextZoneId = () => zoneCounter++;

const ZONE_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
  '#6366F1', '#84CC16',
];

export const ZONE_SHAPES = {
  RECT:    'rect',     // bounding box: x1Pct,y1Pct,x2Pct,y2Pct
  ELLIPSE: 'ellipse',  // bounding box: x1Pct,y1Pct,x2Pct,y2Pct (ellipse inscribed in box)
  POLYGON: 'polygon',  // points: [{x,y}, ...] all in 0-1 fraction space
};

/**
 * All zone geometry stored as fractions (0-1) of canvas size so positions
 * stay aligned across screen sizes — same approach as device icons.
 *
 * Rect / Ellipse zones: { x1Pct, y1Pct, x2Pct, y2Pct }
 * Polygon zones:        { points: [{x,y}, ...] }
 */
export const ZonesProvider = ({ children }) => {
  const [zones, setZones]                   = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState(null);

  const nextColor = (id) => ZONE_COLORS[(id - 1) % ZONE_COLORS.length];

  // ── Rect / Ellipse ──────────────────────────────────────────────────────
  const addZone = useCallback((x1Pct, y1Pct, x2Pct, y2Pct, shape = ZONE_SHAPES.RECT) => {
    const id    = nextZoneId();
    const color = nextColor(id);
    const zone  = {
      id, name: `Zone ${id}`, color, visible: true, shape,
      x1Pct: Math.min(x1Pct, x2Pct),
      y1Pct: Math.min(y1Pct, y2Pct),
      x2Pct: Math.max(x1Pct, x2Pct),
      y2Pct: Math.max(y1Pct, y2Pct),
    };
    setZones(prev => [...prev, zone]);
    setSelectedZoneId(id);
    return zone;
  }, []);

  // ── Polygon (free-form, point by point) ─────────────────────────────────
  const addPolygonZone = useCallback((points) => {
    if (!points || points.length < 3) return null;
    const id    = nextZoneId();
    const color = nextColor(id);
    const zone  = {
      id, name: `Zone ${id}`, color, visible: true,
      shape: ZONE_SHAPES.POLYGON,
      points: points.map(p => ({ x: p.x, y: p.y })),
    };
    setZones(prev => [...prev, zone]);
    setSelectedZoneId(id);
    return zone;
  }, []);

  const updateZone = useCallback((id, changes) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, ...changes } : z));
  }, []);

  const deleteZone = useCallback((id) => {
    setZones(prev => prev.filter(z => z.id !== id));
    setSelectedZoneId(prev => prev === id ? null : prev);
  }, []);

  const toggleZoneVisible = useCallback((id) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, visible: !z.visible } : z));
  }, []);

  const renameZone = useCallback((id, name) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, name } : z));
  }, []);

  const recolorZone = useCallback((id, color) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, color } : z));
  }, []);

  return (
    <ZonesContext.Provider value={{
      zones, selectedZoneId, setSelectedZoneId,
      addZone, addPolygonZone, updateZone, deleteZone,
      toggleZoneVisible, renameZone, recolorZone,
    }}>
      {children}
    </ZonesContext.Provider>
  );
};
