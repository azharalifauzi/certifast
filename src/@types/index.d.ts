type GoogleFont = {
  family: string;
  variants: string[];
  files: Record<string, string>;
  kind?: string;
};

type Ruler = {
  x: number;
  y: number;
  width: number | string;
  height: number | string;
};

type CustomFont = GoogleFont & { id: string; format: 'ttf' | 'woff' | 'woff2' | 'otf' };
