import { useRef, useCallback } from 'react';
import { ICON_SIZE } from '../constants';

/**
 * Drag handler for canvas icons.
 *
 * Items are stored as xPct/yPct (0-1 fractions of canvas size).
 * We convert to pixels for the drag offset calculation, then pass
 * pixel coords + canvasRect to onMove so LayersContext can convert
 * back to fractions — keeping positions device-independent.
 *
 * @param containerRef   ref to the outer canvas container
 * @param getItem        (id) => { xPct, yPct } — stored fractions
 * @param onMove         (id, xPx, yPx, canvasRect) => void
 * @param onSelect       (id) => void
 * @param getZoom        () => number
 * @param getPan         () => { x, y }
 */
const useDrag = ({ containerRef, getItem, onMove, onSelect, getZoom, getPan }) => {
  const dragState = useRef(null);

  const getRect = () => containerRef.current?.getBoundingClientRect() || { left:0, top:0, width:1, height:1 };
  const zoom    = () => getZoom ? getZoom() : 1;
  const pan     = () => getPan  ? getPan()  : { x: 0, y: 0 };

  /** Convert fraction → pixel in current canvas space */
  const pctToPx = (xPct, yPct, rect) => ({
    x: xPct * rect.width,
    y: yPct * rect.height,
  });

  const startDrag = useCallback((id, clientX, clientY) => {
    onSelect(id);
    const rect = getRect();
    const z    = zoom();
    const p    = pan();
    const item = getItem(id);

    // cursor position in canvas-local space
    const cursorX = (clientX - rect.left - p.x) / z;
    const cursorY = (clientY - rect.top  - p.y) / z;

    // item top-left in canvas-local pixels
    const { x: itemX, y: itemY } = pctToPx(item.xPct, item.yPct, rect);

    dragState.current = {
      id,
      offsetX: cursorX - itemX,
      offsetY: cursorY - itemY,
    };
  }, [containerRef, getItem, onSelect, getZoom, getPan]);

  const moveDrag = useCallback((clientX, clientY) => {
    const ds = dragState.current;
    if (!ds) return;

    const rect  = getRect();
    const z     = zoom();
    const p     = pan();

    // canvas-local position of the icon top-left
    const rawX  = (clientX - rect.left - p.x) / z - ds.offsetX;
    const rawY  = (clientY - rect.top  - p.y) / z - ds.offsetY;

    // clamp so icon stays inside the canvas
    const maxX = rect.width  - ICON_SIZE;
    const maxY = rect.height - ICON_SIZE;
    const xPx  = Math.max(0, Math.min(maxX, rawX));
    const yPx  = Math.max(0, Math.min(maxY, rawY));

    onMove(ds.id, xPx, yPx, rect);
  }, [containerRef, onMove, getZoom, getPan]);

  const endDrag = useCallback(() => { dragState.current = null; }, []);

  /* ── mouse ── */
  const onMouseDown  = useCallback((e, id) => { e.stopPropagation(); startDrag(id, e.clientX, e.clientY); }, [startDrag]);
  const onMouseMove  = useCallback((e) => moveDrag(e.clientX, e.clientY), [moveDrag]);
  const onMouseUp    = endDrag;
  const onMouseLeave = endDrag;

  /* ── touch ── */
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
