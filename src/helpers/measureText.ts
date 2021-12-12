export const measureText = (
  text: string,
  font: string,
  fontSize: number,
  fontWeight: number | string
) => {
  let lDiv: HTMLDivElement | null = document.createElement('div');

  document.body.appendChild(lDiv);

  lDiv.style.fontSize = `${fontSize}px`;
  lDiv.style.fontFamily = font;
  if (fontWeight !== 'opentype') lDiv.style.fontWeight = fontWeight.toString();
  lDiv.style.position = 'fixed';
  lDiv.style.left = '-1000px';
  lDiv.style.top = '-1000px';
  lDiv.style.zIndex = '999';
  lDiv.style.lineHeight = '1';
  lDiv.style.width = 'max-content';
  lDiv.style.border = '2px solid';

  lDiv.textContent = text;

  const { height, width } = lDiv.getBoundingClientRect();

  const lResult = {
    width,
    height,
  };

  document.body.removeChild(lDiv);
  lDiv = null;

  return lResult;
};
