import jsPDF from 'jspdf';
import { GRID_SIZE, PDF_SCALE, PDF_FILENAME, THEME_TOKENS } from '../constants';

/**
 * Renders a single layer onto an offscreen <canvas> and returns a PNG data URL.
 */
const renderLayerToDataURL = ({ layer, pageW, pageH, mode, showGrid }) =>
  new Promise((resolve) => {
    const offscreen  = document.createElement('canvas');
    offscreen.width  = pageW * PDF_SCALE;
    offscreen.height = pageH * PDF_SCALE;
    const ctx = offscreen.getContext('2d');
    ctx.scale(PDF_SCALE, PDF_SCALE);

    const tk = THEME_TOKENS[mode];

    // Background
    ctx.fillStyle = tk.canvasBg;
    ctx.fillRect(0, 0, pageW, pageH);

    // Grid
    if (showGrid) {
      ctx.strokeStyle = tk.gridLine;
      ctx.lineWidth   = 0.5;
      for (let x = 0; x <= pageW; x += GRID_SIZE) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, pageH); ctx.stroke();
      }
      for (let y = 0; y <= pageH; y += GRID_SIZE) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(pageW, y); ctx.stroke();
      }
    }

    const drawIcons = () => {
      layer.items.forEach(({ type, x, y, rotation, color: itemColor }) => {
        const device = layer._catalog?.find(d => d.id === type);
        const color  = device?.color || itemColor || '#00D4FF';
        const emoji  = device?.emoji || '📦';

        ctx.save();
        ctx.translate(x + 24, y + 24);
        ctx.rotate((rotation * Math.PI) / 180);

        // Box
        ctx.fillStyle   = color + '33';
        ctx.strokeStyle = color + 'BB';
        ctx.lineWidth   = 1.5;
        ctx.beginPath();
        ctx.roundRect(-24, -24, 48, 48, 6);
        ctx.fill();
        ctx.stroke();

        // Icon
        ctx.font         = '22px serif';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle    = color;
        ctx.fillText(emoji, 0, 1);
        ctx.restore();
      });

      resolve(offscreen.toDataURL('image/png'));
    };

    if (layer.blueprintImg) {
      const img    = new Image();
      img.crossOrigin = 'anonymous';
      img.onload  = () => {
        const imgAspect  = img.width / img.height;
        const pageAspect = pageW / pageH;
        let drawW, drawH, drawX, drawY;
        if (imgAspect > pageAspect) {
          drawW = pageW; drawH = pageW / imgAspect;
          drawX = 0;     drawY = (pageH - drawH) / 2;
        } else {
          drawH = pageH; drawW = pageH * imgAspect;
          drawX = (pageW - drawW) / 2; drawY = 0;
        }
        ctx.globalAlpha = mode === 'dark' ? 0.5 : 0.6;
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        ctx.globalAlpha = 1;
        drawIcons();
      };
      img.onerror = () => drawIcons();
      img.src     = layer.blueprintImg;
    } else {
      drawIcons();
    }
  });

/**
 * Exports all layers to a PDF file, one layer per page.
 * @param {object[]} layers
 * @param {object[]} catalog  DEVICE_CATALOG (injected to avoid circular import)
 * @param {DOMRect}  canvasRect
 * @param {string}   mode
 * @param {boolean}  showGrid
 */
export const exportLayersToPDF = async ({ layers, catalog, canvasRect, mode, showGrid }) => {
  const pageW = Math.round(canvasRect.width);
  const pageH = Math.round(canvasRect.height);
  const pdf   = new jsPDF({ orientation: 'landscape', unit: 'px', format: [pageW, pageH] });

  // Attach catalog to each layer temporarily for icon lookup
  const enriched = layers.map(l => ({ ...l, _catalog: catalog }));

  for (let i = 0; i < enriched.length; i++) {
    const imgData = await renderLayerToDataURL({ layer: enriched[i], pageW, pageH, mode, showGrid });
    if (i > 0) pdf.addPage([pageW, pageH], 'landscape');
    pdf.addImage(imgData, 'PNG', 0, 0, pageW, pageH, undefined, 'FAST');

    pdf.setFontSize(11);
    pdf.setTextColor(0, 153, 187);
    pdf.text(
      `${enriched[i].name}  ·  ${enriched[i].items.length} item${enriched[i].items.length !== 1 ? 's' : ''}`,
      10, pageH - 8
    );
  }

  pdf.save(PDF_FILENAME);
};
