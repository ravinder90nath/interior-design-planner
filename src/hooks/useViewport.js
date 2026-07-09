import { useState, useRef, useCallback, useEffect } from 'react';

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 4;
const ZOOM_SENSITIVITY = 0.001;

/**
 * Manages zoom + pan viewport state for the canvas.
 *
 * zoom  : number (1 = 100%)
 * pan   : { x, y } offset in px
 *
 * Zoom: mouse wheel (centered on cursor position)
 * Pan:  Ctrl + mouse drag on the canvas background
 *
 * Returns refs and handlers to attach to the outer container,
 * plus the transform string to apply to the inner content div.
 */
const useViewport = (containerRef) => {
  const [zoom, setZoom] = useState(1);
  const [pan,  setPan]  = useState({ x: 0, y: 0 });

  const panState = useRef(null); // { startX, startY, startPanX, startPanY }

  // ── Zoom on wheel ───────────────────────────────────────────────────────
  const onWheel = useCallback((e) => {
    e.preventDefault();

    const rect    = containerRef.current.getBoundingClientRect();
    // Cursor position relative to container
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    setZoom(prevZoom => {
      const delta   = -e.deltaY * ZOOM_SENSITIVITY;
      const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prevZoom * (1 + delta)));
      const scale   = nextZoom / prevZoom;

      // Adjust pan so the point under cursor stays fixed
      setPan(prevPan => ({
        x: cursorX - scale * (cursorX - prevPan.x),
        y: cursorY - scale * (cursorY - prevPan.y),
      }));

      return nextZoom;
    });
  }, [containerRef]);

  // Attach wheel as non-passive so we can preventDefault
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [containerRef, onWheel]);

  // ── Pan on Ctrl + mouse drag ────────────────────────────────────────────
  const onMouseDown = useCallback((e) => {
    // Only pan when Ctrl is held AND clicking on the background (not an icon)
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    panState.current = {
      startX:    e.clientX,
      startY:    e.clientY,
      startPanX: pan.x,
      startPanY: pan.y,
    };
  }, [pan]);

  const onMouseMove = useCallback((e) => {
    const ps = panState.current;
    if (!ps) return;
    setPan({
      x: ps.startPanX + (e.clientX - ps.startX),
      y: ps.startPanY + (e.clientY - ps.startY),
    });
  }, []);

  const onMouseUp   = useCallback(() => { panState.current = null; }, []);
  const onMouseLeave = onMouseUp;

  // ── Reset view ───────────────────────────────────────────────────────────
  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // ── CSS transform for the inner content div ──────────────────────────────
  // We use translate THEN scale so pan is in screen-space
  const transform = `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;
  const transformOrigin = '0 0';

  // ── Convert screen coords → canvas-local coords (for item placement) ────
  const screenToCanvas = useCallback((screenX, screenY) => {
    const rect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
    return {
      x: (screenX - rect.left - pan.x) / zoom,
      y: (screenY - rect.top  - pan.y) / zoom,
    };
  }, [containerRef, pan, zoom]);

  // Zoom toward a specific point in screen-space (used by button clicks)
  const zoomTo = useCallback((nextZoom, centerX, centerY) => {
    setZoom(prevZoom => {
      const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom));
      const scale   = clamped / prevZoom;
      setPan(prevPan => ({
        x: centerX - scale * (centerX - prevPan.x),
        y: centerY - scale * (centerY - prevPan.y),
      }));
      return clamped;
    });
  }, []);

  return {
    zoom, pan,
    transform, transformOrigin,
    panHandlers: { onMouseDown, onMouseMove, onMouseUp, onMouseLeave },
    resetView, zoomTo,
    screenToCanvas,
    isPanning: (e) => e.ctrlKey || e.metaKey,
  };
};

export default useViewport;
