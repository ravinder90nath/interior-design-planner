import { useState, useCallback } from 'react';
import { exportLayersToPDF } from '../utils/exportPDF';
import { DEVICE_CATALOG } from '../constants';
import { useLayers } from '../context/LayersContext';
import { useApp } from '../context/AppContext';

const useExportPDF = (canvasRef) => {
  const [exporting, setExporting] = useState(false);
  const { layers } = useLayers();
  const { mode, showGrid } = useApp();

  const exportPDF = useCallback(async () => {
    if (!canvasRef.current) return;
    setExporting(true);
    try {
      await exportLayersToPDF({
        layers,
        catalog:    DEVICE_CATALOG,
        canvasRect: canvasRef.current.getBoundingClientRect(),
        mode,
        showGrid,
      });
    } catch (err) {
      console.error('Export failed:', err);
    }
    setExporting(false);
  }, [layers, mode, showGrid, canvasRef]);

  return { exporting, exportPDF };
};

export default useExportPDF;
