import { atom } from 'jotai';

type CertifTemplate = {
  file: File | null;
  width: number;
  height: number;
  url: string;
};
export const certifTemplate = atom<CertifTemplate>({ file: null, width: 0, height: 0, url: '' });
