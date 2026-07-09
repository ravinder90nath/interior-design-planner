import React from 'react';
import { Box } from '@mui/material';
import { useApp } from '../../context/AppContext';
import { DEVICE_CATALOG, ICON_SIZE } from '../../constants';

/**
 * A single draggable device icon.
 *
 * Positioning strategy:
 *   item.xPct / item.yPct are 0-1 fractions stored in state.
 *   We convert to CSS `left` / `top` as percentages directly.
 *   Because this component sits inside the zoom/pan transform Box
 *   (which is position:absolute inset:0), the % always refers to
 *   that inner box — so icons stay anchored to the blueprint at
 *   ANY screen size, zoom level, or device.
 *
 *   We subtract half the icon size (in %) so the icon is
 *   centered on the stored coordinate point.
 */
const CanvasIcon = ({ item, isSelected, onMouseDown, onTouchStart, onClick }) => {
  const { tk } = useApp();
  const device  = DEVICE_CATALOG.find(d => d.id === item.type);
  if (!device) return null;
  const IconComp = device.icon;

  // Convert fraction to %, offset by half icon width so the centre is at xPct
  const leftPct = `calc(${item.xPct * 100}% - ${ICON_SIZE / 2}px)`;
  const topPct  = `calc(${item.yPct * 100}% - ${ICON_SIZE / 2}px)`;

  return (
    <Box
      onMouseDown={(e) => onMouseDown(e, item.id)}
      onTouchStart={(e) => onTouchStart(e, item.id)}
      onClick={(e) => { e.stopPropagation(); onClick(item.id); }}
      sx={{
        position: 'absolute',
        left: leftPct,
        top:  topPct,
        width:  ICON_SIZE,
        height: ICON_SIZE,
        cursor: 'grab',
        '&:active': { cursor: 'grabbing' },
        transform: `rotate(${item.rotation}deg)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 1.5,
        zIndex: isSelected ? 100 : 10,
        background:  isSelected ? device.color + '28' : tk.iconBg,
        border: `${isSelected ? 2 : 1}px solid ${device.color}${isSelected ? 'CC' : '66'}`,
        boxShadow: isSelected ? `0 0 18px ${device.color}55` : '0 2px 8px #00000033',
        backdropFilter: 'blur(8px)',
        transition: 'box-shadow 0.1s, background 0.1s',
        userSelect: 'none',
      }}
    >
      <IconComp sx={{
        fontSize: 26, color: device.color,
        filter: isSelected ? `drop-shadow(0 0 4px ${device.color}99)` : 'none',
      }} />
      {isSelected && (
        <Box sx={{
          position: 'absolute', top: -16, left: '50%',
          transform: 'translateX(-50%)',
          width: 2, height: 10,
          bgcolor: device.color, borderRadius: 1, opacity: 0.8,
        }} />
      )}
    </Box>
  );
};

export default CanvasIcon;
