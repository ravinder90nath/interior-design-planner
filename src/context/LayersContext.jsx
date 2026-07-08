import React, { createContext, useContext, useState, useCallback } from 'react';
import { makeLayer, nextItemId } from '../utils/layerFactory';

const LayersContext = createContext(null);

export const useLayers = () => {
  const ctx = useContext(LayersContext);
  if (!ctx) throw new Error('useLayers must be used inside <LayersProvider>');
  return ctx;
};

export const LayersProvider = ({ children }) => {
  const initial = makeLayer('Layer 1');
  const [layers, setLayers]               = useState([initial]);
  const [activeLayerId, setActiveLayerId] = useState(initial.id);
  const [selectedId, setSelectedId]       = useState(null);

  /* ── helpers ─────────────────────────────────────────────────────────── */
  const updateLayer = useCallback((id, updater) =>
    setLayers(prev => prev.map(l => l.id === id ? { ...l, ...updater(l) } : l)),
  []);

  const activeLayer  = layers.find(l => l.id === activeLayerId) || layers[0];
  const items        = activeLayer.items;
  const blueprintImg = activeLayer.blueprintImg;

  const counts = items.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});

  /* ── blueprint ───────────────────────────────────────────────────────── */
  const setBlueprintImg = useCallback((url) => {
    updateLayer(activeLayerId, () => ({ blueprintImg: url }));
  }, [activeLayerId, updateLayer]);

  /* ── items ───────────────────────────────────────────────────────────── */
  const addItem = useCallback((deviceId, canvasRect) => {
    const newItem = {
      id:       nextItemId(),
      type:     deviceId,
      rotation: 0,
      x: 40 + Math.random() * (canvasRect.width  - 120),
      y: 40 + Math.random() * (canvasRect.height - 120),
    };
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

  const moveItem = useCallback((id, x, y) => {
    setLayers(prev => prev.map(l => {
      if (l.id !== activeLayerId) return l;
      return { ...l, items: l.items.map(i => i.id === id ? { ...i, x, y } : i) };
    }));
  }, [activeLayerId]);

  const clearItems = useCallback(() => {
    updateLayer(activeLayerId, () => ({ items: [] }));
    setSelectedId(null);
  }, [activeLayerId, updateLayer]);

  /* ── layers ──────────────────────────────────────────────────────────── */
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
      id:    makeLayer('').id,   // just uses the counter
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
