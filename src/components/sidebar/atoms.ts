import { atom } from 'jotai';
import type { Tutorial } from './TutorialPopup';
import type { TutorialData } from './data';

export const activeTutorialAtom = atom<Tutorial[]>([]);
export const arrowStyleAtom = atom({ top: 0, left: 0, display: 'none' });
export const isPopupOpenAtom = atom<keyof TutorialData | ''>('');
