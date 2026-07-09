import React, { useRef } from 'react';
import { Box, Typography, IconButton, Tooltip, Divider } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useApp } from '../../context/AppContext';
import { useZones } from '../../context/ZonesContext';

const COLOR_PRESETS = [
  '#3B82F6','#10B981','#F59E0B','#EF4444',
  '#8B5CF6','#EC4899','#14B8A6','#F97316',
];

const ZoneColorPicker = ({ zone }) => {
  const { recolorZone } = useZones();
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.4, mt: 0.5, pl: 0.5 }}>
      {COLOR_PRESETS.map(c => (
        <Box key={c} onClick={(e) => { e.stopPropagation(); recolorZone(zone.id, c); }}
          sx={{
            width: 14, height: 14, borderRadius: '50%', bgcolor: c,
            border: `2px solid ${zone.color === c ? '#fff' : 'transparent'}`,
            outline: zone.color === c ? `2px solid ${c}` : 'none',
            cursor: 'pointer', transition: 'all 0.1s',
            '&:hover': { transform: 'scale(1.2)' },
          }} />
      ))}
    </Box>
  );
};

const ZoneRow = ({ zone }) => {
  const { tk } = useApp();
  const { selectedZoneId, setSelectedZoneId, toggleZoneVisible, deleteZone, renameZone } = useZones();
  const [editingName, setEditingName] = React.useState(false);
  const [showColors, setShowColors]   = React.useState(false);
  const isSelected = selectedZoneId === zone.id;

  return (
    <Box
      onClick={() => setSelectedZoneId(zone.id)}
      sx={{
        borderRadius: 1.5, mb: 0.5,
        border: `1px solid ${isSelected ? zone.color + '88' : tk.divider}`,
        bgcolor: isSelected ? zone.color + '0D' : 'transparent',
        transition: 'all 0.15s',
        overflow: 'hidden',
        '&:hover': { bgcolor: zone.color + '0D', border: `1px solid ${zone.color}55` },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1, py: 0.6 }}>
        {/* Color dot / picker toggle */}
        <Tooltip title="Change color">
          <Box onClick={(e) => { e.stopPropagation(); setShowColors(v => !v); }}
            sx={{
              width: 14, height: 14, borderRadius: '50%',
              bgcolor: zone.color, flexShrink: 0, cursor: 'pointer',
              border: `2px solid ${zone.color}66`,
              '&:hover': { transform: 'scale(1.2)' }, transition: 'transform 0.1s',
            }} />
        </Tooltip>

        {/* Zone number */}
        <Typography variant="caption" sx={{
          fontFamily: 'monospace', fontWeight: 700,
          color: zone.color, fontSize: '0.65rem', flexShrink: 0,
        }}>
          #{zone.id}
        </Typography>

        {/* Name — editable inline */}
        {editingName ? (
          <input
            autoFocus
            defaultValue={zone.name}
            onBlur={(e) => { renameZone(zone.id, e.target.value || zone.name); setEditingName(false); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { renameZone(zone.id, e.target.value || zone.name); setEditingName(false); }
              if (e.key === 'Escape') setEditingName(false);
            }}
            onClick={(e) => e.stopPropagation()}
            style={{
              flex: 1, fontSize: '12px', fontWeight: 600,
              color: tk.textLabel,
              background: tk.canvasBg,
              border: `1px solid ${zone.color}`,
              borderRadius: 3, padding: '2px 6px',
              outline: 'none',
            }}
          />
        ) : (
          <Typography variant="caption" sx={{
            flex: 1, color: tk.textLabel, fontWeight: 600,
            fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {zone.name}
          </Typography>
        )}

        {/* Actions */}
        <Tooltip title="Rename">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); setEditingName(true); }}
            sx={{ p: 0.3, color: tk.textMuted, '&:hover': { color: tk.accent } }}>
            <EditIcon sx={{ fontSize: 13 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title={zone.visible ? 'Hide zone' : 'Show zone'}>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); toggleZoneVisible(zone.id); }}
            sx={{ p: 0.3, color: zone.visible ? tk.accent : tk.textMuted }}>
            {zone.visible
              ? <VisibilityIcon sx={{ fontSize: 13 }} />
              : <VisibilityOffIcon sx={{ fontSize: 13 }} />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete zone">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); deleteZone(zone.id); }}
            sx={{ p: 0.3, color: tk.textMuted, '&:hover': { color: '#F87171' } }}>
            <DeleteIcon sx={{ fontSize: 13 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Color picker expand */}
      {showColors && (
        <Box sx={{ px: 1, pb: 0.75 }} onClick={(e) => e.stopPropagation()}>
          <ZoneColorPicker zone={zone} />
        </Box>
      )}
    </Box>
  );
};

const ZonesList = () => {
  const { tk } = useApp();
  const { zones } = useZones();

  return (
    <Box sx={{ p: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="caption" sx={{
          color: tk.textDim, fontFamily: 'monospace',
          letterSpacing: 2, fontSize: '0.58rem',
        }}>
          ZONES
        </Typography>
        <Typography variant="caption" sx={{ color: tk.textFaint, fontFamily: 'monospace', fontSize: '0.65rem' }}>
          {zones.length} total
        </Typography>
      </Box>

      {zones.length === 0 ? (
        <Box sx={{ py: 1.5, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: tk.textFaint, fontFamily: 'monospace', fontSize: '0.68rem' }}>
            No zones yet
          </Typography>
          <Typography variant="caption" sx={{ color: tk.textFaint, display: 'block', fontSize: '0.63rem', mt: 0.5 }}>
            Select the Zone tool and drag on canvas
          </Typography>
        </Box>
      ) : (
        zones.map(zone => <ZoneRow key={zone.id} zone={zone} />)
      )}
    </Box>
  );
};

export default ZonesList;
