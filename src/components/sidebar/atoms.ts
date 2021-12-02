import { atom } from 'jotai';
import type { Tutorial } from './TutorialPopup';
import type { TutorialData, TutorialDataItem } from './data';

export const activeTutorialAtom = atom<TutorialDataItem<Tutorial[]>>({
  id: '',
  data: [],
});
export const arrowStyleAtom = atom({ top: 0, left: 0, display: 'none' });
export const isPopupOpenAtom = atom<keyof TutorialData | ''>('');
