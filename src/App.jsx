import React, { useState, useRef, useCallback } from 'react';
import {
  Box, Button, Tooltip, Typography, Divider, IconButton
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import TvIcon from '@mui/icons-material/Tv';
import SpeakerIcon from '@mui/icons-material/Speaker';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import DoorFrontIcon from '@mui/icons-material/DoorFront';
import ChairIcon from '@mui/icons-material/Chair';
import KitchenIcon from '@mui/icons-material/Kitchen';
import BedIcon from '@mui/icons-material/Bed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import GridOnIcon from '@mui/icons-material/GridOn';
import ClearAllIcon from '@mui/icons-material/ClearAll';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#00D4FF' },
    background: { default: '#0F1117', paper: '#1A1D27' },
  },
  typography: { fontFamily: "'Inter', 'Segoe UI', sans-serif" },
});

const DEVICE_CATALOG = [
  { id: 'tv',      label: 'Television',  icon: TvIcon,         color: '#00D4FF' },
  { id: 'speaker', label: 'Speaker',     icon: SpeakerIcon,    color: '#A78BFA' },
  { id: 'camera',  label: 'Camera',      icon: CameraAltIcon,  color: '#F472B6' },
  { id: 'light',   label: 'Light',       icon: LightbulbIcon,  color: '#FCD34D' },
  { id: 'ac',      label: 'AC Unit',     icon: AcUnitIcon,     color: '#67E8F9' },
  { id: 'door',    label: 'Door',        icon: DoorFrontIcon,  color: '#86EFAC' },
  { id: 'chair',   label: 'Chair',       icon: ChairIcon,      color: '#FB923C' },
  { id: 'fridge',  label: 'Fridge',      icon: KitchenIcon,    color: '#C4B5FD' },
  { id: 'bed',     label: 'Bed',         icon: BedIcon,        color: '#6EE7B7' },
  { id: 'bath',    label: 'Bathtub',     icon: BathtubIcon,    color: '#93C5FD' },
];

let idCounter = 1;

export default function App() {
  const [blueprintImg, setBlueprintImg] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showGrid, setShowGrid] = useState(true);
  const canvasRef = useRef(null);
  const dragState = useRef(null);
  const fileInputRef = useRef(null);

  const counts = items.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBlueprintImg(URL.createObjectURL(file));
  };

  const addItem = (deviceId) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = 40 + Math.random() * (rect.width - 120);
    const y = 40 + Math.random() * (rect.height - 120);
    const newItem = { id: idCounter++, type: deviceId, x, y, rotation: 0 };
    setItems(prev => [...prev, newItem]);
    setSelectedId(newItem.id);
  };

  const deleteSelected = () => {
    if (selectedId === null) return;
    setItems(prev => prev.filter(i => i.id !== selectedId));
    setSelectedId(null);
  };

  const rotateSelected = () => {
    if (selectedId === null) return;
    setItems(prev => prev.map(i =>
      i.id === selectedId ? { ...i, rotation: (i.rotation + 45) % 360 } : i
    ));
  };

  const onMouseDown = useCallback((e, itemId) => {
    e.stopPropagation();
    setSelectedId(itemId);
    const rect = canvasRef.current.getBoundingClientRect();
    const item = items.find(i => i.id === itemId);
    dragState.current = {
      itemId,
      offsetX: e.clientX - rect.left - item.x,
      offsetY: e.clientY - rect.top - item.y,
    };
  }, [items]);

  const onMouseMove = useCallback((e) => {
    if (!dragState.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragState.current.offsetX;
    const y = e.clientY - rect.top - dragState.current.offsetY;
    setItems(prev => prev.map(i =>
      i.id === dragState.current.itemId
        ? { ...i, x: Math.max(0, Math.min(rect.width - 48, x)), y: Math.max(0, Math.min(rect.height - 48, y)) }
        : i
    ));
  }, []);

  const onMouseUp = useCallback(() => { dragState.current = null; }, []);

  const onTouchStart = useCallback((e, itemId) => {
    e.stopPropagation();
    setSelectedId(itemId);
    const rect = canvasRef.current.getBoundingClientRect();
    const item = items.find(i => i.id === itemId);
    const t = e.touches[0];
    dragState.current = {
      itemId,
      offsetX: t.clientX - rect.left - item.x,
      offsetY: t.clientY - rect.top - item.y,
    };
  }, [items]);

  const onTouchMove = useCallback((e) => {
    if (!dragState.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const t = e.touches[0];
    const x = t.clientX - rect.left - dragState.current.offsetX;
    const y = t.clientY - rect.top - dragState.current.offsetY;
    setItems(prev => prev.map(i =>
      i.id === dragState.current.itemId
        ? { ...i, x: Math.max(0, Math.min(rect.width - 48, x)), y: Math.max(0, Math.min(rect.height - 48, y)) }
        : i
    ));
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', bgcolor: '#0F1117' }}>

        {/* CANVAS AREA */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2, gap: 1.5, minWidth: 0 }}>

          {/* Toolbar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<CloudUploadIcon />}
              onClick={() => fileInputRef.current.click()}
              sx={{
                borderColor: '#00D4FF55',
                color: '#00D4FF',
                bgcolor: '#00D4FF0D',
                '&:hover': { borderColor: '#00D4FF', bgcolor: '#00D4FF1A' },
                fontWeight: 600,
                fontSize: '0.75rem',
                letterSpacing: 0.5,
              }}
            >
              Upload Blueprint
            </Button>
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleUpload} />

            <Tooltip title={showGrid ? 'Hide grid' : 'Show grid'}>
              <IconButton size="small" onClick={() => setShowGrid(v => !v)}
                sx={{ color: showGrid ? '#00D4FF' : '#4A5568', border: `1px solid ${showGrid ? '#00D4FF44' : '#2E3347'}` }}>
                <GridOnIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {selectedId && (
              <>
                <Tooltip title="Rotate 45°">
                  <IconButton size="small" onClick={rotateSelected}
                    sx={{ color: '#A78BFA', border: '1px solid #A78BFA44' }}>
                    <RotateRightIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete selected">
                  <IconButton size="small" onClick={deleteSelected}
                    sx={{ color: '#F87171', border: '1px solid #F8717144' }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}

            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
              {items.length > 0 && (
                <Tooltip title="Clear all">
                  <IconButton size="small" onClick={() => { setItems([]); setSelectedId(null); }}
                    sx={{ color: '#6B7280', border: '1px solid #2E3347' }}>
                    <ClearAllIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Typography variant="caption" sx={{ color: '#4A5568', fontFamily: 'monospace' }}>
                {items.length} item{items.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Box>

          {/* Canvas */}
          <Box
            ref={canvasRef}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchMove={onTouchMove}
            onTouchEnd={onMouseUp}
            onClick={() => setSelectedId(null)}
            sx={{
              flex: 1,
              position: 'relative',
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid #1E2233',
              bgcolor: '#0C0E16',
              backgroundImage: showGrid
                ? 'linear-gradient(#1A1D2A 1px, transparent 1px), linear-gradient(90deg, #1A1D2A 1px, transparent 1px)'
                : 'none',
              backgroundSize: '32px 32px',
              boxShadow: 'inset 0 0 80px #00D4FF06',
              cursor: 'default',
              userSelect: 'none',
            }}
          >
            {blueprintImg && (
              <img src={blueprintImg} alt="Blueprint"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
                  objectFit: 'contain', opacity: 0.5, pointerEvents: 'none', userSelect: 'none' }} />
            )}

            {!blueprintImg && items.length === 0 && (
              <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 2, pointerEvents: 'none' }}>
                <Box sx={{ width: 88, height: 88, borderRadius: '50%',
                  background: '#00D4FF08', border: '2px dashed #00D4FF25',
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CloudUploadIcon sx={{ fontSize: 40, color: '#00D4FF30' }} />
                </Box>
                <Typography variant="body2" sx={{ color: '#2E3A50', fontFamily: 'monospace', letterSpacing: 2, fontSize: '0.7rem' }}>
                  UPLOAD A BLUEPRINT TO BEGIN
                </Typography>
                <Typography variant="caption" sx={{ color: '#1E2535' }}>
                  or click any device in the panel to place it
                </Typography>
              </Box>
            )}

            {items.map(item => {
              const device = DEVICE_CATALOG.find(d => d.id === item.type);
              const IconComp = device.icon;
              const isSelected = selectedId === item.id;
              return (
                <Box key={item.id}
                  onMouseDown={(e) => onMouseDown(e, item.id)}
                  onTouchStart={(e) => onTouchStart(e, item.id)}
                  onClick={(e) => { e.stopPropagation(); setSelectedId(item.id); }}
                  sx={{
                    position: 'absolute',
                    left: item.x, top: item.y,
                    width: 48, height: 48,
                    cursor: 'grab',
                    '&:active': { cursor: 'grabbing' },
                    transform: `rotate(${item.rotation}deg)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 1.5,
                    zIndex: isSelected ? 100 : 10,
                    background: isSelected ? `${device.color}22` : '#16192399',
                    border: `${isSelected ? 2 : 1}px solid ${isSelected ? device.color : device.color + '55'}`,
                    boxShadow: isSelected ? `0 0 20px ${device.color}55, 0 0 4px ${device.color}33` : `0 2px 8px #00000066`,
                    backdropFilter: 'blur(8px)',
                    transition: 'box-shadow 0.1s, background 0.1s',
                  }}
                >
                  <IconComp sx={{ fontSize: 26, color: device.color, filter: isSelected ? `drop-shadow(0 0 4px ${device.color}99)` : 'none' }} />
                  {isSelected && (
                    <Box sx={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)',
                      width: 2, height: 10, bgcolor: device.color, borderRadius: 1, opacity: 0.8 }} />
                  )}
                </Box>
              );
            })}
          </Box>

          <Typography variant="caption" sx={{ color: '#1E2535', fontFamily: 'monospace', textAlign: 'center', letterSpacing: 1 }}>
            CLICK TO SELECT · DRAG TO MOVE · TOOLBAR TO ROTATE / DELETE
          </Typography>
        </Box>

        {/* RIGHT PANEL */}
        <Box sx={{ width: 210, bgcolor: '#0D1018', borderLeft: '1px solid #1A1D2A',
          display: 'flex', flexDirection: 'column', overflowY: 'auto', flexShrink: 0 }}>

          <Box sx={{ p: 2, pb: 1.5, borderBottom: '1px solid #1A1D2A' }}>
            <Typography variant="caption" sx={{
              color: '#00D4FF', fontFamily: 'monospace', fontWeight: 700,
              letterSpacing: 2.5, fontSize: '0.6rem', display: 'block'
            }}>
              DEVICE LIBRARY
            </Typography>
            <Typography variant="caption" sx={{ color: '#2E3A50', fontSize: '0.65rem' }}>
              Click to add to canvas
            </Typography>
          </Box>

          <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {DEVICE_CATALOG.map(device => {
              const IconComp = device.icon;
              const count = counts[device.id] || 0;
              return (
                <Box key={device.id} onClick={() => addItem(device.id)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5,
                    px: 1.5, py: 0.9,
                    borderRadius: 1.5,
                    cursor: 'pointer',
                    border: `1px solid ${count > 0 ? device.color + '44' : '#1A1D2A'}`,
                    background: count > 0 ? `${device.color}0A` : 'transparent',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      background: `${device.color}18`,
                      border: `1px solid ${device.color}66`,
                      transform: 'translateX(3px)',
                    },
                  }}
                >
                  <IconComp sx={{ fontSize: 18, color: count > 0 ? device.color : device.color + '88', flexShrink: 0 }} />
                  <Typography variant="body2" sx={{
                    color: count > 0 ? '#CDD6E8' : '#4A5568',
                    fontWeight: count > 0 ? 600 : 400,
                    fontSize: '0.78rem',
                    flex: 1,
                  }}>
                    {device.label}
                  </Typography>
                  {count > 0 && (
                    <Box sx={{
                      minWidth: 20, height: 20, borderRadius: '50%',
                      background: device.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, fontFamily: 'monospace', color: '#0A0C12', lineHeight: 1 }}>
                        {count}
                      </Typography>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>

          <Divider sx={{ borderColor: '#1A1D2A', mx: 1.5 }} />

          {/* Summary */}
          <Box sx={{ p: 1.5, pt: 1.5 }}>
            <Typography variant="caption" sx={{
              color: '#2E3A50', fontFamily: 'monospace', letterSpacing: 2,
              fontSize: '0.58rem', display: 'block', mb: 1,
            }}>
              PLACEMENT SUMMARY
            </Typography>
            {Object.keys(counts).length === 0 ? (
              <Typography variant="caption" sx={{ color: '#1E2535', fontFamily: 'monospace', fontSize: '0.7rem' }}>
                No devices placed yet
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {Object.entries(counts).map(([type, count]) => {
                  const device = DEVICE_CATALOG.find(d => d.id === type);
                  return (
                    <Box key={type} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.2 }}>
                      <Typography variant="caption" sx={{ color: '#5A6478', fontSize: '0.72rem' }}>
                        {device.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: device.color, fontFamily: 'monospace', fontWeight: 700, fontSize: '0.72rem' }}>
                        ×{count}
                      </Typography>
                    </Box>
                  );
                })}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5, pt: 0.5, borderTop: '1px solid #1A1D2A' }}>
                  <Typography variant="caption" sx={{ color: '#8A93A8', fontSize: '0.72rem', fontWeight: 600 }}>Total</Typography>
                  <Typography variant="caption" sx={{ color: '#00D4FF', fontFamily: 'monospace', fontWeight: 800, fontSize: '0.72rem' }}>
                    ×{items.length}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          {selectedId && (() => {
            const sel = items.find(i => i.id === selectedId);
            const device = sel ? DEVICE_CATALOG.find(d => d.id === sel.type) : null;
            return sel ? (
              <>
                <Divider sx={{ borderColor: '#1A1D2A', mx: 1.5 }} />
                <Box sx={{ p: 1.5 }}>
                  <Typography variant="caption" sx={{
                    color: '#2E3A50', fontFamily: 'monospace', letterSpacing: 2,
                    fontSize: '0.58rem', display: 'block', mb: 1,
                  }}>
                    SELECTED: {device.label.toUpperCase()}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#3A4462', fontFamily: 'monospace', fontSize: '0.65rem', display: 'block', mb: 1 }}>
                    rotation: {sel.rotation}°
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.75 }}>
                    <Button size="small" onClick={rotateSelected}
                      sx={{ flex: 1, fontSize: '0.68rem', py: 0.6, color: '#A78BFA', border: '1px solid #A78BFA33', '&:hover': { bgcolor: '#A78BFA11' }, minWidth: 0 }}>
                      <RotateRightIcon sx={{ fontSize: 14, mr: 0.5 }} /> Rotate
                    </Button>
                    <Button size="small" onClick={deleteSelected}
                      sx={{ flex: 1, fontSize: '0.68rem', py: 0.6, color: '#F87171', border: '1px solid #F8717133', '&:hover': { bgcolor: '#F8717111' }, minWidth: 0 }}>
                      <DeleteIcon sx={{ fontSize: 14, mr: 0.5 }} /> Delete
                    </Button>
                  </Box>
                </Box>
              </>
            ) : null;
          })()}

          <Box sx={{ flex: 1 }} />
          <Box sx={{ p: 1.5, borderTop: '1px solid #1A1D2A', textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#1A1D2A', fontFamily: 'monospace', fontSize: '0.58rem', letterSpacing: 1 }}>
              INTERIOR DESIGN TOOL
            </Typography>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
