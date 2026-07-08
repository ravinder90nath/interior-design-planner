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

export const APP_NAME    = import.meta.env.VITE_APP_NAME    || 'Interior Design Tool';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';
export const DEFAULT_THEME   = import.meta.env.VITE_DEFAULT_THEME   || 'light';
export const GRID_SIZE       = Number(import.meta.env.VITE_GRID_SIZE)   || 32;
export const ICON_SIZE       = Number(import.meta.env.VITE_ICON_SIZE)   || 48;
export const PDF_SCALE       = Number(import.meta.env.VITE_PDF_SCALE)   || 2;
export const PDF_FILENAME    = import.meta.env.VITE_PDF_FILENAME    || 'interior-design-layers.pdf';
export const LAYER_DEFAULT_NAME = import.meta.env.VITE_LAYER_DEFAULT_NAME || 'Layer';

export const DEVICE_CATALOG = [
  { id: 'tv',      label: 'Television', icon: TvIcon,        color: '#00BFFF', emoji: '📺' },
  { id: 'speaker', label: 'Speaker',    icon: SpeakerIcon,   color: '#A78BFA', emoji: '🔊' },
  { id: 'camera',  label: 'Camera',     icon: CameraAltIcon, color: '#F472B6', emoji: '📷' },
  { id: 'light',   label: 'Light',      icon: LightbulbIcon, color: '#FBBF24', emoji: '💡' },
  { id: 'ac',      label: 'AC Unit',    icon: AcUnitIcon,    color: '#22D3EE', emoji: '❄️' },
  { id: 'door',    label: 'Door',       icon: DoorFrontIcon, color: '#4ADE80', emoji: '🚪' },
  { id: 'chair',   label: 'Chair',      icon: ChairIcon,     color: '#FB923C', emoji: '🪑' },
  { id: 'fridge',  label: 'Fridge',     icon: KitchenIcon,   color: '#C084FC', emoji: '🧊' },
  { id: 'bed',     label: 'Bed',        icon: BedIcon,       color: '#34D399', emoji: '🛏️' },
  { id: 'bath',    label: 'Bathtub',    icon: BathtubIcon,   color: '#60A5FA', emoji: '🛁' },
];

/** Per-mode design tokens */
export const THEME_TOKENS = {
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
  },
};
