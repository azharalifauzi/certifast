import { zoomCanvas } from 'components/canvas';
import {
  canvasObjects,
  mousePosRelativeToTemplate,
  multiSelected as multiSelectedAtom,
  selectedObject as selectedObjectAtom,
} from 'gstates';
import { useAtom } from 'jotai';
import { useEffect, useMemo, useState } from 'react';

const isNegative = (num: number) => num < 0;

export const useSelectionBox = () => {
  const [mousePos] = useAtom(mousePosRelativeToTemplate);
  const [multiSelected, setMultiSelected] = useAtom(multiSelectedAtom);
  const [selectedObject, setSelectedObject] = useAtom(selectedObjectAtom);
  const [cObjects, setCObjects] = useAtom(canvasObjects);
  const [zoom] = useAtom(zoomCanvas);
  const [initPos, setInitPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [isSelecting, setSelecting] = useState<boolean>(false);

  const selectionBox = useMemo(() => {
    const { x: x1, y: y1 } = initPos;
    const { x: x2, y: y2 } = currentPos;
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);

    let x: number = x1;
    let y: number = y1;

    if (isNegative(x2 - x1)) {
      x = x2;
    }

    if (isNegative(y2 - y1)) {
      y = y2;
    }

    return { height, width, x, y };
  }, [initPos, currentPos]);

  useEffect(() => {
    if (isSelecting) {
      const selected: string[] = [];
      const x = selectionBox.x / zoom;
      const y = selectionBox.y / zoom;
      const width = selectionBox.width / zoom;
      const height = selectionBox.height / zoom;
      const xw = x + width;
      const yh = y + height;
      Object.values(cObjects).forEach(({ data }) => {
        const { id } = data;
        const _x = data.x / zoom;
        const _y = data.y / zoom;
        const _width = data.width ?? 0 / zoom;
        const _height = data.height ?? 0 / zoom;

        const _xw = _x + _width;
        const _yh = _y + _height;

        if (_xw >= x && _y <= yh && y <= _yh && xw >= _x) {
          selected.push(id);
        }
      });

      if (selected.length > 1) setMultiSelected(selected);
      else if (selected.length === 1) setSelectedObject(selected[0]);
      else {
        // setMultiSelected([]);
        // setSelectedObject('');
      }
    }
  }, [isSelecting, cObjects, selectionBox, setMultiSelected, setSelectedObject, zoom]);

  useEffect(() => {
    const handleMouseDown = () => {
      setInitPos({ x: mousePos.x, y: mousePos.y });
      setCurrentPos({ x: mousePos.x, y: mousePos.y });
      setSelecting(true);
    };

    window.addEventListener('mousedown', handleMouseDown, { capture: false });

    return () => window.removeEventListener('mousedown', handleMouseDown);
  }, [mousePos]);

  useEffect(() => {
    if (isSelecting) {
      setCurrentPos({ x: mousePos.x, y: mousePos.y });
    }
  }, [mousePos, isSelecting]);

  useEffect(() => {
    const handleMouseUp = () => {
      setSelecting(false);
      setInitPos({ x: 0, y: 0 });
      setCurrentPos({ x: 0, y: 0 });
    };

    window.addEventListener('mouseup', handleMouseUp, { capture: false });

    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  return { isSelecting, initPos, currentPos, selectionBox };
};
