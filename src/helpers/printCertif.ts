import { decode } from 'base64-arraybuffer';
import { CertifTemplate } from 'gstates';
import jsPDF from 'jspdf';

type TextData = {
  x: number;
  y: number;
  text: string;
  font_size: number;
  font_fam: string;
  color: [number, number, number, number];
  fontWeight: string | number;
  fontName: string;
};

export const printCertif = (
  certifTemplate: CertifTemplate,
  textData: TextData[],
  format: 'jpg' | 'pdf' = 'jpg'
) => {
  let canvasCache = document.getElementById('certif-render-engine') as HTMLCanvasElement;

  if (!canvasCache) {
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    canvas.id = 'certif-render-engine';
    canvas.style.position = 'fixed';
    canvas.style.top = '-10000px';
    canvas.style.left = '-10000px';
    canvas.width = certifTemplate.width;
    canvas.height = certifTemplate.height;
    canvasCache = canvas;
  }

  const image = document.getElementById('certif-template') as HTMLImageElement;

  const ctx = canvasCache.getContext('2d');
  if (ctx) {
    ctx.drawImage(image, 0, 0, certifTemplate.width, certifTemplate.height);
    textData.forEach(({ x, y, font_size, color, text, fontName, fontWeight }) => {
      ctx.font = `${font_size}px "${fontName}"`;

      if (fontWeight !== 'opentype') {
        ctx.font = fontWeight.toString().concat(' ', ctx.font);
      }

      ctx.fillStyle = `rgba(${color.join(', ')})`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(text, x, y);
    });
  }

  if (format === 'pdf') {
    const pdf = new jsPDF({
      unit: 'px',
      format: [certifTemplate.width, certifTemplate.height],
      orientation: certifTemplate.width > certifTemplate.height ? 'landscape' : 'portrait',
      hotfixes: ['px_scaling'],
    });
    pdf.addImage(
      canvasCache.toDataURL('image/jpeg', 1.0),
      'JPEG',
      0,
      0,
      certifTemplate.width,
      certifTemplate.height
    );
    const file = new Uint8Array(pdf.output('arraybuffer'));

    return file;
  }

  const dataUrl = canvasCache.toDataURL('image/jpg', 1.0).split(',')[1];
  const arrayBuff = decode(dataUrl);
  const uint8array = new Uint8Array(arrayBuff);

  return uint8array;
};
