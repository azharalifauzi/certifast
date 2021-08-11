import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

type CertifTemplate = {
  file: string;
  width: number;
  height: number;
};
export const certifTemplate = atomWithStorage<CertifTemplate>('certifTemplate', {
  file: '',
  width: 0,
  height: 0,
});

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

export const canvasObjects = atomWithStorage<Record<string, CanvasObject>>('cObjects', {});

export const mousePosRelativeToTemplate = atom<{ x: number; y: number }>({ x: 0, y: 0 });

type ActiveToolbar = 'text' | 'move' | 'resize';

export const activeToolbar = atom<ActiveToolbar>('move');
export const selectedObject = atom<string>('');
