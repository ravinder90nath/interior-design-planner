import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useZones } from '../../context/ZonesContext';
import { useTool, TOOLS } from '../../context/ToolContext';

const ZoneRect = ({ zone }) => {
  const { selectedZoneId, setSelectedZoneId, renameZone } = useZones();
  const { activeTool } = useTool();
  const [editing, setEditing] = useState(false);

  if (!zone.visible) return null;

  const isSelected = selectedZoneId === zone.id;
  const w = (zone.x2Pct - zone.x1Pct) * 100;
  const h = (zone.y2Pct - zone.y1Pct) * 100;

  const handleClick = (e) => {
    e.stopPropagation();
    if (activeTool === TOOLS.SELECT) setSelectedZoneId(zone.id);
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setEditing(true);
  };

  return (
    <Box
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      sx={{
        position: 'absolute',
        left:   `${zone.x1Pct * 100}%`,
        top:    `${zone.y1Pct * 100}%`,
        width:  `${w}%`,
        height: `${h}%`,
        border: `2px ${isSelected ? 'solid' : 'dashed'} ${zone.color}`,
        bgcolor: zone.color + (isSelected ? '22' : '14'),
        borderRadius: '4px',
        cursor: activeTool === TOOLS.SELECT ? 'pointer' : 'crosshair',
        zIndex: 1,
        transition: 'background 0.15s, border 0.15s',
        '&:hover': { bgcolor: zone.color + '28' },
        boxSizing: 'border-box',
      }}
    >
      {/* Zone label top-left */}
      <Box sx={{
        position: 'absolute', top: 4, left: 6,
        display: 'flex', alignItems: 'center', gap: 0.5,
      }}>
        {/* Zone number badge */}
        <Box sx={{
          width: 18, height: 18, borderRadius: '50%',
          bgcolor: zone.color, display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Typography sx={{ fontSize: '0.55rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
            {zone.id}
          </Typography>
        </Box>

        {/* Editable zone name */}
        {editing ? (
          <input
            autoFocus
            defaultValue={zone.name}
            onBlur={(e) => { renameZone(zone.id, e.target.value || zone.name); setEditing(false); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { renameZone(zone.id, e.target.value || zone.name); setEditing(false); }
              if (e.key === 'Escape') setEditing(false);
            }}
            onClick={(e) => e.stopPropagation()}
            style={{
              fontSize: '11px', fontWeight: 700,
              color: zone.color,
              background: 'rgba(255,255,255,0.9)',
              border: `1px solid ${zone.color}`,
              borderRadius: 3, padding: '1px 4px',
              outline: 'none', width: 90,
            }}
          />
        ) : (
          <Typography
            onDoubleClick={handleDoubleClick}
            sx={{
              fontSize: '0.68rem', fontWeight: 700,
              color: zone.color,
              bgcolor: 'rgba(255,255,255,0.75)',
              backdropFilter: 'blur(4px)',
              px: 0.5, py: 0.1, borderRadius: 0.5,
              lineHeight: 1.4,
              whiteSpace: 'nowrap',
              userSelect: 'none',
              textShadow: '0 0 4px rgba(255,255,255,0.8)',
            }}
          >
            {zone.name}
          </Typography>
        )}
      </Box>

      {/* Selection handles */}
      {isSelected && (
        <>
          {[
            { top: -4, left: -4 }, { top: -4, right: -4 },
            { bottom: -4, left: -4 }, { bottom: -4, right: -4 },
          ].map((pos, i) => (
            <Box key={i} sx={{
              position: 'absolute', ...pos,
              width: 8, height: 8, borderRadius: '50%',
              bgcolor: zone.color, border: '2px solid #fff',
              boxShadow: '0 0 4px rgba(0,0,0,0.3)',
            }} />
          ))}
        </>
      )}
    </Box>
  );
};

export default ZoneRect;
