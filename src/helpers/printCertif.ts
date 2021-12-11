import { decode } from 'base64-arraybuffer';
import { CertifTemplate } from 'gstates';

type TextData = {
  x: number;
  y: number;
  text: string;
  font_size: number;
  font_fam: string;
  color: [number, number, number, number];
  fontWeight: number;
  fontName: string;
};

export const printCertif = (certifTemplate: CertifTemplate, textData: TextData[]) => {
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
    textData.forEach(({ x, y, font_fam, font_size, color, text, fontName, fontWeight }) => {
      ctx.font = `${font_size}px "${fontName}"`;
      ctx.fillStyle = `rgba(${color.join(', ')})`;
      ctx.textAlign = 'left';
      ctx.fillText(text, x, y);
    });
  }

  const dataUrl = canvasCache.toDataURL('image/png').split(',')[1];
  const arrayBuff = decode(dataUrl);
  const blob = new Blob([arrayBuff], { type: 'image/png' });

  return blob;
};
