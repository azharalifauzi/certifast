import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export type CertifTemplate = {
  file: string;
  width: number;
  height: number;
};
export const certifTemplate = atomWithStorage<CertifTemplate>('certifTemplate', {
  file: '',
  width: 0,
  height: 0,
});

export type CanvasTextMeta = {
  x: number;
  y: number;
  text: string;
  size: number;
  weight: string;
  align: 'left' | 'center' | 'right';
  family: string;
  color: string;
  id: string;
  width: number;
  height: number;
  isSnapped: boolean;
};

export type CanvasObject = {
  type: 'text' | 'static-text';
  data: CanvasTextMeta;
};

export const canvasObjects = atomWithStorage<Record<string, CanvasObject>>('cObjects', {});

export const mousePosRelativeToTemplate = atom<{ x: number; y: number }>({ x: 0, y: 0 });

// Toolbar things
type ActiveToolbar = 'text' | 'move' | 'resize';
export const activeToolbar = atom<ActiveToolbar>('move');
export const spaceKey = atom<boolean>(false);
export const ctrlKey = atom<boolean>(false);
export const shiftKey = atom<boolean>(false);
export const isInsideCanvas = atom<boolean>(false);

export const selectedObject = atom<string>('');
export const multiSelected = atom<string[]>([]);

export const dynamicTextInput = atomWithStorage<Record<string, string[]>>('dynamicTextInput', {});
export const preventToolbar = atom<boolean>(false);
export const willSnap = atom<boolean>(false);
export const isObjectMoving = atom<boolean>(false);

type Event = 'resize' | 'move' | 'pan' | 'select' | 'multiselect' | 'idle' | 'zoom' | 'textedit';
export const activeEvent = atom<Event>('idle');

export const preventCanvasShortcut = atom<boolean>(false);
export const customFonts = atomWithStorage<CustomFont[]>('customFonts', []);
export const newTextJustAddedID = atom<string>('');

export const updateV1Atom = atomWithStorage('CERTIFAST_V1.0', {
  whatsnew: true,
  manageInputPopover: true,
});
