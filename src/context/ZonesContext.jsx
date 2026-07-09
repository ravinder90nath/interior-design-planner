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

/**
 * All zone positions stored as fractions (x1Pct, y1Pct, x2Pct, y2Pct)
 * so they stay aligned across screen sizes — same approach as icons.
 */
export const ZonesProvider = ({ children }) => {
  const [zones, setZones]               = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState(null);

  const addZone = useCallback((x1Pct, y1Pct, x2Pct, y2Pct) => {
    const id    = nextZoneId();
    const color = ZONE_COLORS[(id - 1) % ZONE_COLORS.length];
    const zone  = {
      id,
      name:    `Zone ${id}`,
      color,
      visible: true,
      x1Pct: Math.min(x1Pct, x2Pct),
      y1Pct: Math.min(y1Pct, y2Pct),
      x2Pct: Math.max(x1Pct, x2Pct),
      y2Pct: Math.max(y1Pct, y2Pct),
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
      addZone, updateZone, deleteZone,
      toggleZoneVisible, renameZone, recolorZone,
    }}>
      {children}
    </ZonesContext.Provider>
  );
};
