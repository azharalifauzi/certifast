export const calculateTopLeftAfterZoom = (
  x: number,
  y: number,
  width: number,
  height: number,
  transformOriginX: number,
  transformOriginY: number,
  zoom: number
) => {
  const scaleMatrix = [
    [zoom, 0, transformOriginX * (1 - zoom)],
    [0, zoom, transformOriginY * (1 - zoom)],
    [0, 0, 1],
  ];

  const { topLeft } = getRectanglePoints(x, y, width, height);

  // satisfy the matrix
  topLeft.push(1);

  const newTopLeft: number[] = [];

  scaleMatrix.forEach((matrix) => {
    const sum = matrix
      .map((val, i) => {
        return val * topLeft[i];
      })
      .reduce((prev, curr) => prev + curr, 0);

    newTopLeft.push(sum);
  });

  return { x: newTopLeft[0], y: newTopLeft[1] };
};

const getRectanglePoints = (x: number, y: number, width: number, height: number) => {
  return {
    topLeft: [x, y],
    topRight: [x + width, y],
    bottomLeft: [x, y + height],
    bottomRight: [x + width, y + height],
  };
};
