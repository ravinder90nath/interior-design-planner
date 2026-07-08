import { useRef, useCallback } from 'react';

/**
 * Returns { onMouseDown, onMouseMove, onMouseUp, onTouchStart, onTouchMove }
 * handlers for dragging items inside a canvas container.
 *
 * @param {React.RefObject} containerRef  ref to the canvas container div
 * @param {function} getItem              (id) => { x, y } — current position
 * @param {function} onMove               (id, x, y) => void — called on each drag step
 * @param {function} onSelect             (id) => void — called on pointer down
 * @param {number}   iconSize             icon width/height in px (default 48)
 */
const useDrag = ({ containerRef, getItem, onMove, onSelect, iconSize = 48 }) => {
  const dragState = useRef(null);

  const clamp = useCallback((val, max) => Math.max(0, Math.min(max - iconSize, val)), [iconSize]);

  const startDrag = useCallback((id, clientX, clientY) => {
    onSelect(id);
    const rect = containerRef.current.getBoundingClientRect();
    const item = getItem(id);
    dragState.current = {
      id,
      offsetX: clientX - rect.left - item.x,
      offsetY: clientY - rect.top  - item.y,
    };
  }, [containerRef, getItem, onSelect]);

  const moveDrag = useCallback((clientX, clientY) => {
    const ds = dragState.current;   // snapshot — must capture before any setState
    if (!ds) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clamp(clientX - rect.left - ds.offsetX, rect.width);
    const y = clamp(clientY - rect.top  - ds.offsetY, rect.height);
    onMove(ds.id, x, y);
  }, [containerRef, clamp, onMove]);

  const endDrag = useCallback(() => { dragState.current = null; }, []);

  /* mouse */
  const onMouseDown  = useCallback((e, id) => {
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

  const onTouchMove  = useCallback((e) => {
    const t = e.touches[0];
    moveDrag(t.clientX, t.clientY);
  }, [moveDrag]);

  const onTouchEnd   = endDrag;

  return { onMouseDown, onMouseMove, onMouseUp, onMouseLeave, onTouchStart, onTouchMove, onTouchEnd };
};

export default useDrag;
