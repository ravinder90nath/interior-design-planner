import React, { useRef } from 'react';
import { Box, Typography } from '@mui/material';

import { AppProvider, useApp }   from './context/AppContext';
import { LayersProvider }         from './context/LayersContext';
import { ZonesProvider }          from './context/ZonesContext';
import { ToolProvider }           from './context/ToolContext';
import Toolbar                    from './components/Toolbar/Toolbar';
import LayerTabs                  from './components/Layers/LayerTabs';
import CanvasBoard                from './components/Canvas/CanvasBoard';
import RightPanel                 from './components/Panel/RightPanel';
import useExportPDF               from './hooks/useExportPDF';

const Layout = () => {
  const { tk } = useApp();
  const canvasRef = useRef(null);
  const { exporting, exportPDF } = useExportPDF(canvasRef);

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100vw',
      overflow: 'hidden', bgcolor: tk.appBg, transition: 'background 0.25s' }}>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2, gap: 1, minWidth: 0 }}>
        <Toolbar onExportPDF={exportPDF} exporting={exporting} />
        <LayerTabs />
        <CanvasBoard canvasRef={canvasRef} />
        <Typography variant="caption" sx={{
          color: tk.textFaint, fontFamily: 'monospace', textAlign: 'center', letterSpacing: 1,
        }}>
          V — Select · Z — Zone · H — Pan · Double-click zone label to rename
        </Typography>
      </Box>

      <RightPanel canvasRef={canvasRef} />
    </Box>
  );
};

export default function App() {
  return (
    <AppProvider>
      <LayersProvider>
        <ZonesProvider>
          <ToolProvider>
            <Layout />
          </ToolProvider>
        </ZonesProvider>
      </LayersProvider>
    </AppProvider>
  );
}
