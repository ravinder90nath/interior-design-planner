import { useState, useCallback } from 'react';
import { useZones } from '../context/ZonesContext';

const CLOSE_THRESHOLD_PX = 14; // distance in screen px to snap-close near first point
const MIN_POINTS = 3;

/**
 * Hook for drawing free-form polygon zones, point by point.
 *
 * Usage:
 *   - Click on canvas to add a point
 *   - Click near the first point (or double-click anywhere) to close the shape
 *   - Press Escape to cancel the current polygon
 *
 * All points stored as fractions (0-1) of canvas size.
 */
const usePolygonDraw = (containerRef, getZoom, getPan) => {
  const { addPolygonZone } = useZones();
  const [points, setPoints]     = useState([]); // committed points: [{x,y}]
  const [cursorPt, setCursorPt] = useState(null); // live cursor position (preview line)

  const toFraction = useCallback((clientX, clientY) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const zoom = getZoom?.() ?? 1;
    const pan  = getPan?.()  ?? { x: 0, y: 0 };
    return {
      x: Math.max(0, Math.min(1, (clientX - rect.left - pan.x) / (rect.width  * zoom))),
      y: Math.max(0, Math.min(1, (clientY - rect.top  - pan.y) / (rect.height * zoom))),
    };
  }, [containerRef, getZoom, getPan]);

  // Distance in screen pixels between cursor and the first point (for close-snap)
  const distToFirstPx = useCallback((clientX, clientY) => {
    if (points.length === 0) return Infinity;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return Infinity;
    const zoom = getZoom?.() ?? 1;
    const pan  = getPan?.()  ?? { x: 0, y: 0 };
    const first = points[0];
    const fx = rect.left + pan.x + first.x * rect.width  * zoom;
    const fy = rect.top  + pan.y + first.y * rect.height * zoom;
    return Math.hypot(clientX - fx, clientY - fy);
  }, [points, containerRef, getZoom, getPan]);

  const finishPolygon = useCallback(() => {
    if (points.length >= MIN_POINTS) {
      addPolygonZone(points);
    }
    setPoints([]);
    setCursorPt(null);
  }, [points, addPolygonZone]);

  const cancelPolygon = useCallback(() => {
    setPoints([]);
    setCursorPt(null);
  }, []);

  const onClick = useCallback((e) => {
    e.stopPropagation();

    // If close to the first point and we have enough points, close the shape
    if (points.length >= MIN_POINTS && distToFirstPx(e.clientX, e.clientY) < CLOSE_THRESHOLD_PX) {
      finishPolygon();
      return;
    }

    const pt = toFraction(e.clientX, e.clientY);
    setPoints(prev => [...prev, pt]);
  }, [points.length, distToFirstPx, finishPolygon, toFraction]);

  const onDoubleClick = useCallback((e) => {
    e.stopPropagation();
    finishPolygon();
  }, [finishPolygon]);

  const onMouseMove = useCallback((e) => {
    if (points.length === 0) return;
    setCursorPt(toFraction(e.clientX, e.clientY));
  }, [points.length, toFraction]);

  // Snap indicator: true when cursor is close enough to first point to close
  const isNearClose = useCallback((clientX, clientY) =>
    points.length >= MIN_POINTS && distToFirstPx(clientX, clientY) < CLOSE_THRESHOLD_PX,
  [points.length, distToFirstPx]);

  return {
    points, cursorPt, isDrawing: points.length > 0,
    onClick, onDoubleClick, onMouseMove,
    cancelPolygon, finishPolygon, isNearClose,
  };
};

export default usePolygonDraw;
