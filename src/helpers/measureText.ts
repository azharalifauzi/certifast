export const measureText = (text: string, font: string, fontSize: number) => {
  let lDiv: HTMLDivElement | null = document.createElement('div');

  document.body.appendChild(lDiv);

  lDiv.style.fontSize = `${fontSize}px`;
  lDiv.style.fontFamily = font;
  lDiv.style.position = 'absolute';
  lDiv.style.left = '-1000px';
  lDiv.style.top = '-1000px';

  lDiv.innerHTML = text;

  const lResult = {
    width: lDiv.clientWidth,
    height: lDiv.clientHeight,
  };

  document.body.removeChild(lDiv);
  lDiv = null;

  return lResult;
};
