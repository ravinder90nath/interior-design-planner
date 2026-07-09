import { useRef, useCallback } from 'react';

/**
 * Drag handler for canvas icons.
 * Accounts for zoom + pan so dragging feels 1:1 at any zoom level.
 *
 * @param containerRef  ref to the outer canvas container (unzoomed coords)
 * @param getItem       (id) => { x, y } in canvas space
 * @param onMove        (id, x, y) => void
 * @param onSelect      (id) => void
 * @param iconSize      px (default 48)
 * @param getZoom       () => current zoom level
 * @param getPan        () => { x, y } current pan offset
 */
const useDrag = ({ containerRef, getItem, onMove, onSelect, iconSize = 48, getZoom, getPan }) => {
  const dragState = useRef(null);

  // Convert a client-space delta to canvas-space delta
  const toCanvas = useCallback((clientX, clientY) => {
    const rect = containerRef.current.getBoundingClientRect();
    const zoom = getZoom ? getZoom() : 1;
    const pan  = getPan  ? getPan()  : { x: 0, y: 0 };
    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top  - pan.y) / zoom,
    };
  }, [containerRef, getZoom, getPan]);

  const clamp = useCallback((val, maxCanvas) =>
    Math.max(0, Math.min(maxCanvas - iconSize, val)),
  [iconSize]);

  const startDrag = useCallback((id, clientX, clientY) => {
    onSelect(id);
    const rect = containerRef.current.getBoundingClientRect();
    const zoom = getZoom ? getZoom() : 1;
    const pan  = getPan  ? getPan()  : { x: 0, y: 0 };
    const item = getItem(id);

    // offset in canvas space between cursor and item top-left
    dragState.current = {
      id,
      offsetX: (clientX - rect.left - pan.x) / zoom - item.x,
      offsetY: (clientY - rect.top  - pan.y) / zoom - item.y,
    };
  }, [containerRef, getItem, onSelect, getZoom, getPan]);

  const moveDrag = useCallback((clientX, clientY) => {
    const ds = dragState.current;
    if (!ds) return;
    const rect = containerRef.current.getBoundingClientRect();
    const zoom = getZoom ? getZoom() : 1;
    const pan  = getPan  ? getPan()  : { x: 0, y: 0 };

    // Canvas-space dimensions of the container
    const canvasW = rect.width  / zoom;
    const canvasH = rect.height / zoom;

    const x = clamp((clientX - rect.left - pan.x) / zoom - ds.offsetX, canvasW);
    const y = clamp((clientY - rect.top  - pan.y) / zoom - ds.offsetY, canvasH);
    onMove(ds.id, x, y);
  }, [containerRef, clamp, onMove, getZoom, getPan]);

  const endDrag = useCallback(() => { dragState.current = null; }, []);

  /* mouse */
  const onMouseDown = useCallback((e, id) => {
    e.stopPropagation();
    startDrag(id, e.clientX, e.clientY);
  }, [startDrag]);

  const onMouseMove  = useCallback((e) => moveDrag(e.clientX, e.clientY), [moveDrag]);
  const onMouseUp    = endDrag;
  const onMouseLeave = endDrag;

  /* touch */
  const onTouchStart = useCallback((e, id) => {
    e.stopPropagation();
    const t = e.touches[0];
    startDrag(id, t.clientX, t.clientY);
  }, [startDrag]);

  const onTouchMove = useCallback((e) => {
    const t = e.touches[0];
    moveDrag(t.clientX, t.clientY);
  }, [moveDrag]);

  const onTouchEnd = endDrag;

  return { onMouseDown, onMouseMove, onMouseUp, onMouseLeave, onTouchStart, onTouchMove, onTouchEnd };
};

export default useDrag;
