import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  Box, Button, Tooltip, Typography, Divider, IconButton, CircularProgress
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
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// ── Per-mode design tokens ────────────────────────────────────────────────────
const T = {
  dark: {
    appBg:         '#0F1117',
    panelBg:       '#0D1018',
    canvasBg:      '#0C0E16',
    canvasBorder:  '#00D4FF22',
    gridLine:      '#1A1D2A',
    tabActiveBg:   '#0C0E16',
    tabInactiveBg: '#0D1018',
    tabBorder:     '#00D4FF66',
    divider:       '#1A1D2A',
    textMuted:     '#4A5568',
    textFaint:     '#1E2535',
    textDim:       '#2E3A50',
    textSub:       '#5A6478',
    textLabel:     '#CDD6E8',
    accent:        '#00D4FF',
    iconBg:        '#16192399',
    iconBorder:    '55',
  },
  light: {
    appBg:         '#EEF2F7',
    panelBg:       '#FFFFFF',
    canvasBg:      '#F7F9FC',
    canvasBorder:  '#0099BB33',
    gridLine:      '#D4DCE8',
    tabActiveBg:   '#F7F9FC',
    tabInactiveBg: '#E4EAF3',
    tabBorder:     '#0099BB77',
    divider:       '#DDE4EE',
    textMuted:     '#64748B',
    textFaint:     '#94A3B8',
    textDim:       '#475569',
    textSub:       '#64748B',
    textLabel:     '#1E293B',
    accent:        '#0099BB',
    iconBg:        '#FFFFFFBB',
    iconBorder:    '99',
  },
};

const DEVICE_CATALOG = [
  { id: 'tv',      label: 'Television', icon: TvIcon,        color: '#00BFFF' },
  { id: 'speaker', label: 'Speaker',    icon: SpeakerIcon,   color: '#A78BFA' },
  { id: 'camera',  label: 'Camera',     icon: CameraAltIcon, color: '#F472B6' },
  { id: 'light',   label: 'Light',      icon: LightbulbIcon, color: '#FBBF24' },
  { id: 'ac',      label: 'AC Unit',    icon: AcUnitIcon,    color: '#22D3EE' },
  { id: 'door',    label: 'Door',       icon: DoorFrontIcon, color: '#4ADE80' },
  { id: 'chair',   label: 'Chair',      icon: ChairIcon,     color: '#FB923C' },
  { id: 'fridge',  label: 'Fridge',     icon: KitchenIcon,   color: '#C084FC' },
  { id: 'bed',     label: 'Bed',        icon: BedIcon,       color: '#34D399' },
  { id: 'bath',    label: 'Bathtub',    icon: BathtubIcon,   color: '#60A5FA' },
];

let idCounter = 100;
let layerIdCounter = 1;
const makeDefaultLayer = (name) => ({ id: layerIdCounter++, name, blueprintImg: null, items: [] });

export default function App() {
  const [mode, setMode]             = useState('dark');
  const [layers, setLayers]         = useState([makeDefaultLayer('Layer 1')]);
  const [activeLayerId, setActiveLayerId] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [showGrid, setShowGrid]     = useState(true);
  const [exporting, setExporting]   = useState(false);
  const canvasRef  = useRef(null);
  const dragState  = useRef(null);
  const fileInputRef = useRef(null);

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: { main: mode === 'dark' ? '#00D4FF' : '#0099BB' },
      background: {
        default: T[mode].appBg,
        paper:   T[mode].panelBg,
      },
    },
    typography: { fontFamily: "'Inter', 'Segoe UI', sans-serif" },
  }), [mode]);

  const tk = T[mode]; // shorthand token accessor

  const activeLayer = layers.find(l => l.id === activeLayerId) || layers[0];
  const items       = activeLayer.items;
  const blueprintImg = activeLayer.blueprintImg;

  const updateLayer = (id, updater) =>
    setLayers(prev => prev.map(l => l.id === id ? { ...l, ...updater(l) } : l));

  const counts = items.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});

  // ── Upload ────────────────────────────────────────────────────────────────
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    updateLayer(activeLayerId, () => ({ blueprintImg: URL.createObjectURL(file) }));
    e.target.value = '';
  };

  // ── Items ─────────────────────────────────────────────────────────────────
  const addItem = (deviceId) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const newItem = { id: idCounter++, type: deviceId, rotation: 0,
      x: 40 + Math.random() * (rect.width - 120),
      y: 40 + Math.random() * (rect.height - 120) };
    updateLayer(activeLayerId, l => ({ items: [...l.items, newItem] }));
    setSelectedId(newItem.id);
  };

  const deleteSelected = () => {
    if (selectedId === null) return;
    updateLayer(activeLayerId, l => ({ items: l.items.filter(i => i.id !== selectedId) }));
    setSelectedId(null);
  };

  const rotateSelected = () => {
    if (selectedId === null) return;
    updateLayer(activeLayerId, l => ({
      items: l.items.map(i => i.id === selectedId ? { ...i, rotation: (i.rotation + 45) % 360 } : i)
    }));
  };

  // ── Layers ────────────────────────────────────────────────────────────────
  const duplicateLayer = () => {
    const newLayer = {
      ...activeLayer, id: layerIdCounter++,
      name: `Layer ${layers.length + 1}`,
      items: activeLayer.items.map(i => ({ ...i, id: idCounter++ })),
    };
    setLayers(prev => [...prev, newLayer]);
    setActiveLayerId(newLayer.id);
    setSelectedId(null);
  };

  const addBlankLayer = () => {
    const newLayer = makeDefaultLayer(`Layer ${layers.length + 1}`);
    setLayers(prev => [...prev, newLayer]);
    setActiveLayerId(newLayer.id);
    setSelectedId(null);
  };

  const deleteLayer = (id) => {
    if (layers.length <= 1) return;
    const remaining = layers.filter(l => l.id !== id);
    setLayers(remaining);
    if (activeLayerId === id) { setActiveLayerId(remaining[remaining.length - 1].id); setSelectedId(null); }
  };

  const renameLayer = (id, name) =>
    setLayers(prev => prev.map(l => l.id === id ? { ...l, name } : l));

  // ── Drag (mouse) ──────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e, itemId) => {
    e.stopPropagation();
    setSelectedId(itemId);
    const rect = canvasRef.current.getBoundingClientRect();
    const item = items.find(i => i.id === itemId);
    dragState.current = { itemId, offsetX: e.clientX - rect.left - item.x, offsetY: e.clientY - rect.top - item.y };
  }, [items]);

  const onMouseMove = useCallback((e) => {
    const ds = dragState.current;            // ← snapshot BEFORE any await/setState
    if (!ds) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - ds.offsetX;
    const y = e.clientY - rect.top  - ds.offsetY;
    const { itemId } = ds;
    setLayers(prev => prev.map(l => {
      if (l.id !== activeLayerId) return l;
      return { ...l, items: l.items.map(i =>
        i.id === itemId
          ? { ...i, x: Math.max(0, Math.min(rect.width - 48, x)), y: Math.max(0, Math.min(rect.height - 48, y)) }
          : i
      )};
    }));
  }, [activeLayerId]);

  const onMouseUp = useCallback(() => { dragState.current = null; }, []);

  // ── Drag (touch) ──────────────────────────────────────────────────────────
  const onTouchStart = useCallback((e, itemId) => {
    e.stopPropagation();
    setSelectedId(itemId);
    const rect = canvasRef.current.getBoundingClientRect();
    const item = items.find(i => i.id === itemId);
    const t = e.touches[0];
    dragState.current = { itemId, offsetX: t.clientX - rect.left - item.x, offsetY: t.clientY - rect.top - item.y };
  }, [items]);

  const onTouchMove = useCallback((e) => {
    const ds = dragState.current;            // ← same fix for touch
    if (!ds) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const t = e.touches[0];
    const x = t.clientX - rect.left - ds.offsetX;
    const y = t.clientY - rect.top  - ds.offsetY;
    const { itemId } = ds;
    setLayers(prev => prev.map(l => {
      if (l.id !== activeLayerId) return l;
      return { ...l, items: l.items.map(i =>
        i.id === itemId
          ? { ...i, x: Math.max(0, Math.min(rect.width - 48, x)), y: Math.max(0, Math.min(rect.height - 48, y)) }
          : i
      )};
    }));
  }, [activeLayerId]);

  // ── Export PDF ────────────────────────────────────────────────────────────
  const exportToPDF = async () => {
    setExporting(true);
    try {
      const canvas = canvasRef.current;
      const rect   = canvas.getBoundingClientRect();
      const pdf    = new jsPDF({ orientation: 'landscape', unit: 'px', format: [rect.width, rect.height] });
      const savedId = activeLayerId;

      for (let i = 0; i < layers.length; i++) {
        setActiveLayerId(layers[i].id);
        setSelectedId(null);
        await new Promise(r => setTimeout(r, 200));

        const snap = await html2canvas(canvas, {
          backgroundColor: tk.canvasBg, scale: 1.5,
          useCORS: true, allowTaint: true, logging: false,
        });
        const imgData = snap.toDataURL('image/png');
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, rect.width, rect.height);
        pdf.setFontSize(13);
        pdf.setTextColor(0, 180, 220);
        pdf.text(`${layers[i].name}  |  ${layers[i].items.length} items`, 12, rect.height - 10);
      }

      setActiveLayerId(savedId);
      pdf.save('interior-design-layers.pdf');
    } catch (err) { console.error('PDF export error:', err); }
    setExporting(false);
  };

  const sel       = items.find(i => i.id === selectedId);
  const selDevice = sel ? DEVICE_CATALOG.find(d => d.id === sel.type) : null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', bgcolor: tk.appBg,
        transition: 'background 0.25s' }}>

        {/* ════════════════ CANVAS PANEL ════════════════ */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2, gap: 1, minWidth: 0 }}>

          {/* TOP TOOLBAR */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>

            {/* Upload */}
            <Button variant="outlined" size="small" startIcon={<CloudUploadIcon />}
              onClick={() => fileInputRef.current.click()}
              sx={{ borderColor: tk.accent + '55', color: tk.accent, bgcolor: tk.accent + '11',
                '&:hover': { borderColor: tk.accent, bgcolor: tk.accent + '22' },
                fontWeight: 600, fontSize: '0.73rem', letterSpacing: 0.5 }}>
              Upload Blueprint
            </Button>
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleUpload} />

            {/* Grid toggle */}
            <Tooltip title={showGrid ? 'Hide grid' : 'Show grid'}>
              <IconButton size="small" onClick={() => setShowGrid(v => !v)}
                sx={{ color: showGrid ? tk.accent : tk.textMuted,
                  border: `1px solid ${showGrid ? tk.accent + '55' : tk.divider}` }}>
                <GridOnIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Theme toggle */}
            <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              <IconButton size="small" onClick={() => setMode(m => m === 'dark' ? 'light' : 'dark')}
                sx={{ color: mode === 'dark' ? '#FCD34D' : '#6366F1',
                  border: `1px solid ${mode === 'dark' ? '#FCD34D55' : '#6366F155'}`,
                  transition: 'all 0.2s' }}>
                {mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
              </IconButton>
            </Tooltip>

            {/* Item actions when selected */}
            {selectedId && (<>
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
            </>)}

            {/* Right side */}
            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
              {items.length > 0 && (
                <Tooltip title="Clear all items on this layer">
                  <IconButton size="small"
                    onClick={() => { updateLayer(activeLayerId, () => ({ items: [] })); setSelectedId(null); }}
                    sx={{ color: tk.textMuted, border: `1px solid ${tk.divider}` }}>
                    <ClearAllIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Button variant="outlined" size="small"
                startIcon={exporting ? <CircularProgress size={12} color="inherit" /> : <PictureAsPdfIcon />}
                onClick={exportToPDF} disabled={exporting}
                sx={{ borderColor: '#F472B655', color: '#F472B6', bgcolor: '#F472B60D',
                  '&:hover': { borderColor: '#F472B6', bgcolor: '#F472B61A' },
                  fontWeight: 600, fontSize: '0.73rem' }}>
                {exporting ? 'Exporting…' : 'Export to PDF'}
              </Button>
              <Typography variant="caption" sx={{ color: tk.textMuted, fontFamily: 'monospace' }}>
                {items.length} item{items.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Box>

          {/* LAYER TABS */}
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, flexWrap: 'wrap' }}>
            {layers.map(layer => {
              const isActive = layer.id === activeLayerId;
              return (
                <Box key={layer.id} onClick={() => { setActiveLayerId(layer.id); setSelectedId(null); }}
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.75,
                    px: 1.5, py: 0.6,
                    borderRadius: '6px 6px 0 0',
                    cursor: 'pointer',
                    border: `1px solid ${isActive ? tk.tabBorder : tk.divider}`,
                    borderBottom: `1px solid ${isActive ? tk.tabActiveBg : tk.divider}`,
                    background: isActive ? tk.tabActiveBg : tk.tabInactiveBg,
                    transition: 'all 0.15s',
                    '&:hover': { background: tk.tabActiveBg, opacity: 0.85 },
                  }}>
                  <Typography contentEditable suppressContentEditableWarning
                    onBlur={(e) => renameLayer(layer.id, e.target.textContent || layer.name)}
                    onClick={(e) => e.stopPropagation()}
                    variant="caption"
                    sx={{ color: isActive ? tk.accent : tk.textMuted, fontFamily: 'monospace',
                      fontWeight: isActive ? 700 : 400, fontSize: '0.72rem',
                      outline: 'none', minWidth: 44, cursor: 'text', letterSpacing: 0.5 }}>
                    {layer.name}
                  </Typography>
                  {layers.length > 1 && (
                    <CloseIcon sx={{ fontSize: 11, color: tk.textMuted, cursor: 'pointer',
                      '&:hover': { color: '#F87171' }, transition: 'color 0.15s' }}
                      onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }} />
                  )}
                </Box>
              );
            })}
            <Tooltip title="Add blank layer">
              <IconButton size="small" onClick={addBlankLayer}
                sx={{ color: tk.textMuted, border: `1px solid ${tk.divider}`, borderRadius: '6px 6px 0 0',
                  '&:hover': { color: tk.accent, borderColor: tk.accent + '55' }, p: 0.5 }}>
                <AddIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Duplicate current layer">
              <IconButton size="small" onClick={duplicateLayer}
                sx={{ color: tk.textMuted, border: `1px solid ${tk.divider}`, borderRadius: '6px 6px 0 0',
                  '&:hover': { color: '#A78BFA', borderColor: '#A78BFA55' }, p: 0.5 }}>
                <ContentCopyIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Tooltip>
          </Box>

          {/* CANVAS */}
          <Box ref={canvasRef}
            onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
            onTouchMove={onTouchMove} onTouchEnd={onMouseUp}
            onClick={() => setSelectedId(null)}
            sx={{
              flex: 1, position: 'relative',
              borderRadius: '0 4px 4px 4px',
              overflow: 'hidden',
              border: `1px solid ${tk.canvasBorder}`,
              bgcolor: tk.canvasBg,
              backgroundImage: showGrid
                ? `linear-gradient(${tk.gridLine} 1px, transparent 1px), linear-gradient(90deg, ${tk.gridLine} 1px, transparent 1px)`
                : 'none',
              backgroundSize: '32px 32px',
              cursor: 'default',
              userSelect: 'none',
              transition: 'background 0.25s',
            }}>

            {/* Blueprint */}
            {blueprintImg && (
              <img src={blueprintImg} alt="Blueprint"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
                  objectFit: 'contain', opacity: mode === 'dark' ? 0.5 : 0.6,
                  pointerEvents: 'none', userSelect: 'none' }} />
            )}

            {/* Empty state */}
            {!blueprintImg && items.length === 0 && (
              <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 2, pointerEvents: 'none' }}>
                <Box sx={{ width: 88, height: 88, borderRadius: '50%',
                  background: tk.accent + '10', border: `2px dashed ${tk.accent}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CloudUploadIcon sx={{ fontSize: 40, color: tk.accent + '44' }} />
                </Box>
                <Typography variant="body2" sx={{ color: tk.textDim, fontFamily: 'monospace', letterSpacing: 2, fontSize: '0.7rem' }}>
                  UPLOAD A BLUEPRINT TO BEGIN
                </Typography>
                <Typography variant="caption" sx={{ color: tk.textFaint }}>
                  or click any device in the panel to place it
                </Typography>
              </Box>
            )}

            {/* Placed icons */}
            {items.map(item => {
              const device     = DEVICE_CATALOG.find(d => d.id === item.type);
              const IconComp   = device.icon;
              const isSelected = selectedId === item.id;
              return (
                <Box key={item.id}
                  onMouseDown={(e) => onMouseDown(e, item.id)}
                  onTouchStart={(e) => onTouchStart(e, item.id)}
                  onClick={(e) => { e.stopPropagation(); setSelectedId(item.id); }}
                  sx={{
                    position: 'absolute', left: item.x, top: item.y,
                    width: 48, height: 48,
                    cursor: 'grab', '&:active': { cursor: 'grabbing' },
                    transform: `rotate(${item.rotation}deg)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 1.5,
                    zIndex: isSelected ? 100 : 10,
                    background: isSelected ? device.color + '28' : tk.iconBg,
                    border: `${isSelected ? 2 : 1}px solid ${device.color}${isSelected ? 'CC' : '66'}`,
                    boxShadow: isSelected ? `0 0 18px ${device.color}55` : '0 2px 8px #00000033',
                    backdropFilter: 'blur(8px)',
                    transition: 'box-shadow 0.1s, background 0.1s',
                  }}>
                  <IconComp sx={{ fontSize: 26, color: device.color,
                    filter: isSelected ? `drop-shadow(0 0 4px ${device.color}99)` : 'none' }} />
                  {isSelected && (
                    <Box sx={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)',
                      width: 2, height: 10, bgcolor: device.color, borderRadius: 1, opacity: 0.8 }} />
                  )}
                </Box>
              );
            })}
          </Box>

          <Typography variant="caption" sx={{ color: tk.textFaint, fontFamily: 'monospace', textAlign: 'center', letterSpacing: 1 }}>
            CLICK TO SELECT · DRAG TO MOVE · CLICK LAYER NAME TO RENAME
          </Typography>
        </Box>

        {/* ════════════════ RIGHT PANEL ════════════════ */}
        <Box sx={{ width: 210, bgcolor: tk.panelBg, borderLeft: `1px solid ${tk.divider}`,
          display: 'flex', flexDirection: 'column', overflowY: 'auto', flexShrink: 0,
          transition: 'background 0.25s' }}>

          {/* Header */}
          <Box sx={{ p: 2, pb: 1.5, borderBottom: `1px solid ${tk.divider}` }}>
            <Typography variant="caption" sx={{ color: tk.accent, fontFamily: 'monospace',
              fontWeight: 700, letterSpacing: 2.5, fontSize: '0.6rem', display: 'block' }}>
              DEVICE LIBRARY
            </Typography>
            <Typography variant="caption" sx={{ color: tk.textDim, fontSize: '0.65rem' }}>
              Click to add to canvas
            </Typography>
          </Box>

          {/* Device list */}
          <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {DEVICE_CATALOG.map(device => {
              const IconComp = device.icon;
              const count    = counts[device.id] || 0;
              return (
                <Box key={device.id} onClick={() => addItem(device.id)}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1.5,
                    px: 1.5, py: 0.9, borderRadius: 1.5, cursor: 'pointer',
                    border: `1px solid ${count > 0 ? device.color + '55' : tk.divider}`,
                    background: count > 0 ? device.color + '0D' : 'transparent',
                    transition: 'all 0.15s ease',
                    '&:hover': { background: device.color + '1A', border: `1px solid ${device.color}77`, transform: 'translateX(3px)' },
                  }}>
                  <IconComp sx={{ fontSize: 18, color: count > 0 ? device.color : device.color + '88', flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ color: count > 0 ? tk.textLabel : tk.textMuted,
                    fontWeight: count > 0 ? 600 : 400, fontSize: '0.78rem', flex: 1 }}>
                    {device.label}
                  </Typography>
                  {count > 0 && (
                    <Box sx={{ minWidth: 20, height: 20, borderRadius: '50%', background: device.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, fontFamily: 'monospace', color: '#0A0C12', lineHeight: 1 }}>
                        {count}
                      </Typography>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>

          <Divider sx={{ borderColor: tk.divider, mx: 1.5 }} />

          {/* Placement summary */}
          <Box sx={{ p: 1.5 }}>
            <Typography variant="caption" sx={{ color: tk.textDim, fontFamily: 'monospace',
              letterSpacing: 2, fontSize: '0.58rem', display: 'block', mb: 1 }}>
              PLACEMENT SUMMARY
            </Typography>
            {Object.keys(counts).length === 0 ? (
              <Typography variant="caption" sx={{ color: tk.textFaint, fontFamily: 'monospace', fontSize: '0.7rem' }}>
                No devices placed yet
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {Object.entries(counts).map(([type, count]) => {
                  const device = DEVICE_CATALOG.find(d => d.id === type);
                  return (
                    <Box key={type} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.2 }}>
                      <Typography variant="caption" sx={{ color: tk.textSub, fontSize: '0.72rem' }}>{device.label}</Typography>
                      <Typography variant="caption" sx={{ color: device.color, fontFamily: 'monospace', fontWeight: 700, fontSize: '0.72rem' }}>
                        ×{count}
                      </Typography>
                    </Box>
                  );
                })}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5, pt: 0.5, borderTop: `1px solid ${tk.divider}` }}>
                  <Typography variant="caption" sx={{ color: tk.textLabel, fontSize: '0.72rem', fontWeight: 600 }}>Total</Typography>
                  <Typography variant="caption" sx={{ color: tk.accent, fontFamily: 'monospace', fontWeight: 800, fontSize: '0.72rem' }}>
                    ×{items.length}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          <Divider sx={{ borderColor: tk.divider, mx: 1.5 }} />

          {/* All layers summary */}
          <Box sx={{ p: 1.5 }}>
            <Typography variant="caption" sx={{ color: tk.textDim, fontFamily: 'monospace',
              letterSpacing: 2, fontSize: '0.58rem', display: 'block', mb: 1 }}>
              ALL LAYERS
            </Typography>
            {layers.map(layer => (
              <Box key={layer.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.3 }}>
                <Typography variant="caption" sx={{ color: layer.id === activeLayerId ? tk.accent : tk.textMuted,
                  fontSize: '0.72rem', fontFamily: 'monospace' }}>
                  {layer.name}
                </Typography>
                <Typography variant="caption" sx={{ color: tk.textSub, fontFamily: 'monospace', fontSize: '0.68rem' }}>
                  {layer.items.length} items
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Selected item controls */}
          {sel && selDevice && (<>
            <Divider sx={{ borderColor: tk.divider, mx: 1.5 }} />
            <Box sx={{ p: 1.5 }}>
              <Typography variant="caption" sx={{ color: tk.textDim, fontFamily: 'monospace',
                letterSpacing: 2, fontSize: '0.58rem', display: 'block', mb: 1 }}>
                SELECTED: {selDevice.label.toUpperCase()}
              </Typography>
              <Typography variant="caption" sx={{ color: tk.textSub, fontFamily: 'monospace', fontSize: '0.65rem', display: 'block', mb: 1 }}>
                rotation: {sel.rotation}°
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.75 }}>
                <Button size="small" onClick={rotateSelected}
                  sx={{ flex: 1, fontSize: '0.68rem', py: 0.6, color: '#A78BFA',
                    border: '1px solid #A78BFA33', '&:hover': { bgcolor: '#A78BFA11' }, minWidth: 0 }}>
                  <RotateRightIcon sx={{ fontSize: 14, mr: 0.5 }} /> Rotate
                </Button>
                <Button size="small" onClick={deleteSelected}
                  sx={{ flex: 1, fontSize: '0.68rem', py: 0.6, color: '#F87171',
                    border: '1px solid #F8717133', '&:hover': { bgcolor: '#F8717111' }, minWidth: 0 }}>
                  <DeleteIcon sx={{ fontSize: 14, mr: 0.5 }} /> Delete
                </Button>
              </Box>
            </Box>
          </>)}

          <Box sx={{ flex: 1 }} />
          <Box sx={{ p: 1.5, borderTop: `1px solid ${tk.divider}`, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: tk.divider, fontFamily: 'monospace', fontSize: '0.58rem', letterSpacing: 1 }}>
              INTERIOR DESIGN TOOL
            </Typography>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
