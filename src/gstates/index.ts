import { atom } from 'jotai';

type CertifTemplate = {
  file: File | null;
  width: number;
  height: number;
  url: string;
};
export const certifTemplate = atom<CertifTemplate>({ file: null, width: 0, height: 0, url: '' });

type CanvasTextMeta = {
  x: number;
  y: number;
  text: string;
  size: number;
  weight: string;
  align: 'left' | 'center' | 'right';
  family: string;
  color: string;
  id: string;
};

type CanvasObject = {
  type: 'text' | 'static-text';
  data: CanvasTextMeta;
};

export const canvasObjects = atom<Record<string, CanvasObject>>({
  'test-1': {
    type: 'text',
    data: {
      x: 0,
      y: 0,
      text: 'Test 1',
      size: 64,
      weight: 'regular',
      align: 'left',
      family: 'Courier New',
      color: '#000',
      id: 'test-1',
    },
  },
});
