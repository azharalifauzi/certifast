import { zoomCanvas } from 'components/canvas';
import { isEditAtom } from 'components/canvas/text';
import {
  activeEvent,
  canvasObjects,
  mousePosRelativeToTemplate,
  multiSelected as multiSelectedAtom,
  selectedObject as selectedObjectAtom,
  spaceKey,
  isInsideCanvas as isInsideCanvasAtom,
} from 'gstates';
import { useAtom } from 'jotai';
import { useAtomValue } from 'jotai/utils';
import { useEffect, useMemo, useState } from 'react';

const isNegative = (num: number) => num < 0;

export const useSelectionBox = () => {
  const [mousePos] = useAtom(mousePosRelativeToTemplate);
  const [, setMultiSelected] = useAtom(multiSelectedAtom);
  const [, setSelectedObject] = useAtom(selectedObjectAtom);
  const [cObjects, setCObjects] = useAtom(canvasObjects);
  const [zoom] = useAtom(zoomCanvas);
  const [event, setEvent] = useAtom(activeEvent);
  const [space] = useAtom(spaceKey);
  const isEditGlobal = useAtomValue(isEditAtom);
  const isInsideCanvas = useAtomValue(isInsideCanvasAtom);
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
        } else {
          const indexOf = selected.indexOf(id);

          selected.splice(indexOf, 0);
        }
      });

      if (selected.length > 1) {
        setMultiSelected(selected);
        setSelectedObject('');
      } else if (selected.length === 1) {
        setSelectedObject(selected[0]);
        setMultiSelected([]);
      } else {
        if (event !== 'resize' && !space && event !== 'move') {
          setMultiSelected([]);
          setSelectedObject('');
        }
      }
    }
  }, [
    isSelecting,
    cObjects,
    selectionBox,
    setMultiSelected,
    setSelectedObject,
    zoom,
    event,
    space,
  ]);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (event === 'idle' && !isEditGlobal.value && e.button === 0 && isInsideCanvas) {
        const coord = { x: mousePos.x, y: mousePos.y };

        setInitPos(coord);
        setCurrentPos(coord);
        setSelecting(true);
        setEvent('multiselect');
      }
    };

    window.addEventListener('mousedown', handleMouseDown, { capture: false });

    return () => window.removeEventListener('mousedown', handleMouseDown);
  }, [mousePos, setEvent, event, isEditGlobal, isInsideCanvas]);

  useEffect(() => {
    if (event === 'multiselect') {
      setCurrentPos({ x: mousePos.x, y: mousePos.y });
    }
  }, [mousePos, event]);

  useEffect(() => {
    const handleMouseUp = () => {
      setSelecting(false);
      setInitPos({ x: 0, y: 0 });
      setCurrentPos({ x: 0, y: 0 });
      setEvent('idle');
    };

    window.addEventListener('mouseup', handleMouseUp, { capture: false });

    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [setEvent]);

  return { isSelecting, initPos, currentPos, selectionBox };
};
