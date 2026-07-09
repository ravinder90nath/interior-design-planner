import { useRef, useState, useCallback } from 'react';
import { useZones } from '../context/ZonesContext';

const MIN_SIZE_PCT = 0.02; // minimum 2% of canvas in each dimension

/**
 * Hook for drawing rect/ellipse zones by dragging on the canvas.
 * `shape` is 'rect' or 'ellipse' — passed to addZone so ZoneRect
 * knows how to render it (square box vs inscribed ellipse).
 *
 * All positions stored as fractions (0-1) of canvas size.
 */
const useZoneDraw = (containerRef, getZoom, getPan, shape = 'rect') => {
  const { addZone } = useZones();
  const drawState = useRef(null);
  const [preview, setPreview] = useState(null); // { x1Pct, y1Pct, x2Pct, y2Pct }

  const toFraction = useCallback((clientX, clientY) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { xPct: 0, yPct: 0 };
    const zoom = getZoom?.() ?? 1;
    const pan  = getPan?.()  ?? { x: 0, y: 0 };
    return {
      xPct: Math.max(0, Math.min(1, (clientX - rect.left - pan.x) / (rect.width  * zoom))),
      yPct: Math.max(0, Math.min(1, (clientY - rect.top  - pan.y) / (rect.height * zoom))),
    };
  }, [containerRef, getZoom, getPan]);

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    const { xPct, yPct } = toFraction(e.clientX, e.clientY);
    drawState.current = { x1Pct: xPct, y1Pct: yPct };
    setPreview({ x1Pct: xPct, y1Pct: yPct, x2Pct: xPct, y2Pct: yPct });
  }, [toFraction]);

  const onMouseMove = useCallback((e) => {
    if (!drawState.current) return;
    const { xPct, yPct } = toFraction(e.clientX, e.clientY);
    setPreview({
      x1Pct: drawState.current.x1Pct,
      y1Pct: drawState.current.y1Pct,
      x2Pct: xPct,
      y2Pct: yPct,
    });
  }, [toFraction]);

  const onMouseUp = useCallback((e) => {
    if (!drawState.current) return;
    const { xPct, yPct } = toFraction(e.clientX, e.clientY);
    const { x1Pct, y1Pct } = drawState.current;
    drawState.current = null;
    setPreview(null);

    const w = Math.abs(xPct - x1Pct);
    const h = Math.abs(yPct - y1Pct);
    if (w > MIN_SIZE_PCT && h > MIN_SIZE_PCT) {
      addZone(x1Pct, y1Pct, xPct, yPct, shape);
    }
  }, [toFraction, addZone, shape]);

  const onMouseLeave = useCallback(() => {
    if (!drawState.current) return;
    drawState.current = null;
    setPreview(null);
  }, []);

  return { preview, onMouseDown, onMouseMove, onMouseUp, onMouseLeave };
};

export default useZoneDraw;
