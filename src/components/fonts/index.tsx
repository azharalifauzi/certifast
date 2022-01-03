import React from 'react';
import { Global } from '@emotion/react';
import { useAtomValue } from 'jotai/utils';
import { customFonts as customFontsAtom } from 'gstates';

const Fonts = () => {
  const customFonts = useAtomValue(customFontsAtom);

  const fontFaces = customFonts.map(({ family, format, files }) => {
    return `
    @font-face {
      font-family: '${family}';
      src: url('${files.webfont}') format('woff');
    }
  `;
  });

  return <Global styles={fontFaces.join('\n')} />;
};

export default Fonts;
