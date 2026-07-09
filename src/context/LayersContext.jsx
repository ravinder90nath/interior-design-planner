import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { makeLayer, nextItemId } from '../utils/layerFactory';

const LayersContext = createContext(null);

export const useLayers = () => {
  const ctx = useContext(LayersContext);
  if (!ctx) throw new Error('useLayers must be inside <LayersProvider>');
  return ctx;
};

const STORAGE_KEY = (id) => `idt_board_${id}`;

const loadBoard = (projectId) => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY(projectId));
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
};

const saveBoard = (projectId, data) => {
  try { localStorage.setItem(STORAGE_KEY(projectId), JSON.stringify(data)); } catch {}
};

export const LayersProvider = ({ children, projectId }) => {
  const saved   = projectId ? loadBoard(projectId) : null;
  const initial = saved?.layers?.[0] ?? makeLayer('Layer 1');

  const [layers, setLayers]               = useState(saved?.layers ?? [initial]);
  const [activeLayerId, setActiveLayerId] = useState(saved?.activeLayerId ?? initial.id);
  const [selectedId, setSelectedId]       = useState(null);

  // Auto-save to localStorage whenever layers change
  useEffect(() => {
    if (projectId) {
      saveBoard(projectId, { layers, activeLayerId });
    }
  }, [layers, activeLayerId, projectId]);

  const updateLayer = useCallback((id, updater) =>
    setLayers(prev => prev.map(l => l.id === id ? { ...l, ...updater(l) } : l)),
  []);

  const activeLayer  = layers.find(l => l.id === activeLayerId) || layers[0];
  const items        = activeLayer?.items ?? [];
  const blueprintImg = activeLayer?.blueprintImg ?? null;

  const counts = items.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});

  const setBlueprintImg = useCallback((url) => {
    updateLayer(activeLayerId, () => ({ blueprintImg: url }));
  }, [activeLayerId, updateLayer]);

  const addItem = useCallback((deviceId, canvasRect) => {
    const xPct = 0.1 + Math.random() * 0.8;
    const yPct = 0.1 + Math.random() * 0.8;
    const newItem = { id: nextItemId(), type: deviceId, rotation: 0, xPct, yPct };
    updateLayer(activeLayerId, l => ({ items: [...l.items, newItem] }));
    setSelectedId(newItem.id);
  }, [activeLayerId, updateLayer]);

  const deleteItem = useCallback((id) => {
    updateLayer(activeLayerId, l => ({ items: l.items.filter(i => i.id !== id) }));
    setSelectedId(prev => (prev === id ? null : prev));
  }, [activeLayerId, updateLayer]);

  const rotateItem = useCallback((id) => {
    updateLayer(activeLayerId, l => ({
      items: l.items.map(i => i.id === id ? { ...i, rotation: (i.rotation + 45) % 360 } : i),
    }));
  }, [activeLayerId, updateLayer]);

  const moveItem = useCallback((id, xPct, yPct) => {
    setLayers(prev => prev.map(l => {
      if (l.id !== activeLayerId) return l;
      return { ...l, items: l.items.map(i => i.id === id ? { ...i, xPct, yPct } : i) };
    }));
  }, [activeLayerId]);

  const clearItems = useCallback(() => {
    updateLayer(activeLayerId, () => ({ items: [] }));
    setSelectedId(null);
  }, [activeLayerId, updateLayer]);

  const switchLayer = useCallback((id) => {
    setActiveLayerId(id);
    setSelectedId(null);
  }, []);

  const addBlankLayer = useCallback(() => {
    const layer = makeLayer(`Layer ${layers.length + 1}`);
    setLayers(prev => [...prev, layer]);
    setActiveLayerId(layer.id);
    setSelectedId(null);
  }, [layers.length]);

  const duplicateLayer = useCallback(() => {
    const copy = {
      ...activeLayer,
      id:    makeLayer('').id,
      name:  `Layer ${layers.length + 1}`,
      items: activeLayer.items.map(i => ({ ...i, id: nextItemId() })),
    };
    setLayers(prev => [...prev, copy]);
    setActiveLayerId(copy.id);
    setSelectedId(null);
  }, [activeLayer, layers.length]);

  const deleteLayer = useCallback((id) => {
    if (layers.length <= 1) return;
    const remaining = layers.filter(l => l.id !== id);
    setLayers(remaining);
    if (activeLayerId === id) {
      setActiveLayerId(remaining[remaining.length - 1].id);
      setSelectedId(null);
    }
  }, [layers, activeLayerId]);

  const renameLayer = useCallback((id, name) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, name } : l));
  }, []);

  return (
    <LayersContext.Provider value={{
      layers, activeLayerId, activeLayer,
      items, blueprintImg, counts, selectedId,
      setSelectedId, setBlueprintImg,
      addItem, deleteItem, rotateItem, moveItem, clearItems,
      switchLayer, addBlankLayer, duplicateLayer, deleteLayer, renameLayer,
    }}>
      {children}
    </LayersContext.Provider>
  );
};
