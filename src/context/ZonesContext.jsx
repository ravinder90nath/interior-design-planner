import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

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
  RECT:    'rect',
  ELLIPSE: 'ellipse',
  POLYGON: 'polygon',
};

const STORAGE_KEY = (id) => `idt_zones_${id}`;

const loadZones = (projectId) => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY(projectId));
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
};

const saveZones = (projectId, data) => {
  try { localStorage.setItem(STORAGE_KEY(projectId), JSON.stringify(data)); } catch {}
};

/**
 * All zone geometry stored as fractions (0-1) of canvas size so positions
 * stay aligned across screen sizes — same approach as device icons.
 *
 * Rect / Ellipse zones: { x1Pct, y1Pct, x2Pct, y2Pct }
 * Polygon zones:        { points: [{x,y}, ...] }
 *
 * Persisted to localStorage per project, same pattern as LayersContext.
 */
export const ZonesProvider = ({ children, projectId }) => {
  const saved = projectId ? loadZones(projectId) : null;

  const [zones, setZones]                   = useState(saved?.zones ?? []);
  const [selectedZoneId, setSelectedZoneId] = useState(null);

  // Keep the id counter ahead of any restored zones so new ids never collide
  useEffect(() => {
    if (saved?.zones?.length) {
      const maxId = Math.max(...saved.zones.map(z => z.id), 0);
      zoneCounter = Math.max(zoneCounter, maxId + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save to localStorage whenever zones change
  useEffect(() => {
    if (projectId) {
      saveZones(projectId, { zones });
    }
  }, [zones, projectId]);

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
