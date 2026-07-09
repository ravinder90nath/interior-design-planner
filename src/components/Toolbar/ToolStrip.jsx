import React from 'react';
import { Box, Tooltip, IconButton, Typography, Divider } from '@mui/material';
import NearMeIcon from '@mui/icons-material/NearMe';
import RectangleOutlinedIcon from '@mui/icons-material/RectangleOutlined';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import TimelineIcon from '@mui/icons-material/Timeline';
import PanToolIcon from '@mui/icons-material/PanTool';
import { useApp } from '../../context/AppContext';
import { useTool, TOOLS } from '../../context/ToolContext';

const TOOL_LIST = [
  { id: TOOLS.SELECT,  icon: NearMeIcon,            label: 'Select / Move (V)',        key: 'v' },
  { id: TOOLS.ZONE,    icon: RectangleOutlinedIcon, label: 'Rectangle Zone (R)',        key: 'r' },
  { id: TOOLS.CIRCLE,  icon: CircleOutlinedIcon,    label: 'Circle / Ellipse Zone (C)', key: 'c' },
  { id: TOOLS.POLYGON, icon: TimelineIcon,           label: 'Free-form Zone — click points (P)', key: 'p' },
  { id: TOOLS.PAN,     icon: PanToolIcon,            label: 'Pan Canvas (H)',            key: 'h' },
];

const ToolStrip = () => {
  const { tk } = useApp();
  const { activeTool, setActiveTool } = useTool();

  React.useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.contentEditable === 'true') return;
      const match = TOOL_LIST.find(t => t.key === e.key.toLowerCase());
      if (match) setActiveTool(match.id);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setActiveTool]);

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 0.5,
      px: 1, py: 0.5,
      bgcolor: tk.panelBg,
      border: `1px solid ${tk.divider}`,
      borderRadius: 1.5,
      boxShadow: '0 1px 4px #00000011',
      flexWrap: 'wrap',
    }}>
      <Typography variant="caption" sx={{
        color: tk.textFaint, fontFamily: 'monospace',
        fontSize: '0.58rem', letterSpacing: 1.5, px: 0.5, whiteSpace: 'nowrap',
      }}>
        TOOLS
      </Typography>
      <Divider orientation="vertical" flexItem sx={{ borderColor: tk.divider, mx: 0.5 }} />

      {TOOL_LIST.map(tool => {
        const IconComp = tool.icon;
        const isActive = activeTool === tool.id;
        return (
          <Tooltip key={tool.id} title={tool.label} placement="bottom">
            <IconButton
              size="small"
              onClick={() => setActiveTool(tool.id)}
              sx={{
                width: 32, height: 32,
                borderRadius: 1,
                color:   isActive ? '#fff' : tk.textMuted,
                bgcolor: isActive ? tk.accent : 'transparent',
                border:  `1px solid ${isActive ? tk.accent : 'transparent'}`,
                '&:hover': {
                  bgcolor: isActive ? tk.accent : tk.accent + '18',
                  color:   isActive ? '#fff' : tk.accent,
                },
                transition: 'all 0.15s',
              }}
            >
              <IconComp sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        );
      })}
    </Box>
  );
};

export default ToolStrip;
