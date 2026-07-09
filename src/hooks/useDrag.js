import { useRef, useCallback } from 'react';
import { ICON_SIZE } from '../constants';

/**
 * Drag handler — works in fraction (0-1) space.
 *
 * Icons are positioned with CSS `left: calc(xPct*100% - 24px)`.
 * The inner transform Box has the same CSS dimensions as the outer
 * canvas container (inset:0), just scaled via CSS transform.
 *
 * To get the fraction of where the cursor is, we compute:
 *   cursorFracX = (clientX - rect.left - pan.x) / (rect.width  * zoom)  -- NO
 *
 * Actually the rect of the OUTER container already includes the CSS transform
 * scale, so getBoundingClientRect() returns the VISUAL (scaled) rect.
 * We want the LOGICAL size = rect.width / zoom.
 *
 * So:
 *   logicalW = rect.width  (outer container doesn't change size due to transform on INNER box)
 *   The inner box has the same layout size as the outer (inset:0).
 *   The CSS transform scale only affects visuals, not layout.
 *
 * So the logical canvas size = canvasRef.getBoundingClientRect() size (always).
 * The pan/zoom transform shifts pixels on screen, so to map screen coords
 * to logical canvas coords:
 *
 *   logicalX = (screenX - rect.left - pan.x) / zoom
 *   fraction = logicalX / rect.width
 *
 * We store the drag offset as a fraction of canvas size so it stays
 * correct if the window is resized mid-drag.
 */
const useDrag = ({ containerRef, getItem, onMove, onSelect, getZoom, getPan }) => {
  const dragState = useRef(null); // { id, offsetXPct, offsetYPct }

  const startDrag = useCallback((id, clientX, clientY) => {
    onSelect(id);
    const rect = containerRef.current.getBoundingClientRect();
    const zoom = getZoom?.() ?? 1;
    const pan  = getPan?.()  ?? { x: 0, y: 0 };
    const item = getItem(id);

    // Where is the cursor in canvas logical space (0-1)?
    const cursorXPct = (clientX - rect.left - pan.x) / (rect.width  * zoom);
    const cursorYPct = (clientY - rect.top  - pan.y) / (rect.height * zoom);

    // Icon top-left in fraction space (CanvasIcon uses center point, so shift by half icon)
    const iconXPct = item.xPct - (ICON_SIZE / 2) / rect.width;
    const iconYPct = item.yPct - (ICON_SIZE / 2) / rect.height;

    dragState.current = {
      id,
      offsetXPct: cursorXPct - iconXPct,
      offsetYPct: cursorYPct - iconYPct,
    };
  }, [containerRef, getItem, onSelect, getZoom, getPan]);

  const moveDrag = useCallback((clientX, clientY) => {
    const ds = dragState.current;
    if (!ds) return;

    const rect = containerRef.current.getBoundingClientRect();
    const zoom = getZoom?.() ?? 1;
    const pan  = getPan?.()  ?? { x: 0, y: 0 };

    // Cursor fraction in canvas space
    const cursorXPct = (clientX - rect.left - pan.x) / (rect.width  * zoom);
    const cursorYPct = (clientY - rect.top  - pan.y) / (rect.height * zoom);

    // Icon top-left fraction
    const iconXPct = cursorXPct - ds.offsetXPct;
    const iconYPct = cursorYPct - ds.offsetYPct;

    // Convert back to center-point fraction (what we store as xPct/yPct)
    const xPct = iconXPct + (ICON_SIZE / 2) / rect.width;
    const yPct = iconYPct + (ICON_SIZE / 2) / rect.height;

    // Clamp so icon stays fully within canvas bounds
    const halfW = (ICON_SIZE / 2) / rect.width;
    const halfH = (ICON_SIZE / 2) / rect.height;
    const clampedX = Math.max(halfW, Math.min(1 - halfW, xPct));
    const clampedY = Math.max(halfH, Math.min(1 - halfH, yPct));

    onMove(ds.id, clampedX, clampedY);
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
    startDrag(id, e.touches[0].clientX, e.touches[0].clientY);
  }, [startDrag]);

  const onTouchMove  = useCallback((e) => moveDrag(e.touches[0].clientX, e.touches[0].clientY), [moveDrag]);
  const onTouchEnd   = endDrag;

  return { onMouseDown, onMouseMove, onMouseUp, onMouseLeave, onTouchStart, onTouchMove, onTouchEnd };
};

export default useDrag;
