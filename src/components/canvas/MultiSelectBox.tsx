import React, { useEffect, useMemo, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import { activeEvent, canvasObjects, dynamicTextInput, multiSelected, spaceKey } from 'gstates';
import { zoomCanvas } from '.';
import { useUndo } from 'hooks';
import cloneDeep from 'clone-deep';

const MultiSelectBox = () => {
  const [selected, setSelected] = useAtom(multiSelected);
  const [cObjects, setCObjects] = useAtom(canvasObjects);
  const [, setDynamicInputText] = useAtom(dynamicTextInput);
  const [zoom] = useAtom(zoomCanvas);
  const [event, setEvent] = useAtom(activeEvent);
  const [space] = useAtom(spaceKey);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [moveCache, setMoveCache] = useState({ initX: 0, initY: 0, cObjects: {} });
  const [triggerMove, setTriggerMove] = useState(false);

  const { pushToUndoStack } = useUndo();

  const { x, y, width, height } = useMemo(() => {
    if (selected.length === 0 || Object.keys(cObjects).length < 2)
      return { x: 0, y: 0, width: 0, height: 0 };

    let x = cObjects[selected[0]].data.x / zoom;
    let y = cObjects[selected[0]].data.y / zoom;
    let maxX = cObjects[selected[0]].data.x / zoom;
    let maxY = cObjects[selected[0]].data.y / zoom;

    selected.forEach((id) => {
      const objData = cObjects[id].data;
      const _x = objData.x / zoom;
      const _y = objData.y / zoom;
      const _height = objData.height ?? 0 / zoom;
      const _width = objData.width ?? 0 / zoom;

      x = Math.min(_x, x);
      y = Math.min(_y, y);
      maxX = Math.max(_x + _width, maxX);
      maxY = Math.max(_y + _height, maxY);
    });

    const width = (maxX - x) * zoom;
    const height = (maxY - y) * zoom;

    return { x, y, height, width };
  }, [selected, cObjects, zoom]);

  useEffect(() => {
    const handleMouseUp = () => {
      setEvent('idle');
      setTriggerMove(false);
      if ((moveCache.initX !== x || moveCache.initY !== y) && triggerMove) {
        pushToUndoStack(moveCache.cObjects);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;

      if (triggerMove && !space) {
        const newX = clientX - mousePos.x - x * zoom;
        const newY = clientY - mousePos.y - y * zoom;
        setCObjects((obj) => {
          const newObj = cloneDeep(obj);
          selected.forEach((id) => {
            newObj[id].data.x += newX;
            newObj[id].data.y += newY;
          });

          return newObj;
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    setCObjects,
    setEvent,
    selected,
    mousePos,
    x,
    y,
    zoom,
    space,
    moveCache,
    pushToUndoStack,
    triggerMove,
  ]);

  useEffect(() => {
    const handleDelete = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        setCObjects((cObjects) => {
          pushToUndoStack(cloneDeep(cObjects));
          selected.forEach((id) => {
            delete cObjects[id];
          });

          return cObjects;
        });
        setSelected([]);
        setDynamicInputText((input) => {
          selected.forEach((id) => {
            delete input[id];
          });

          return input;
        });
      }
    };

    window.addEventListener('keydown', handleDelete, { capture: false });

    return () => window.removeEventListener('keydown', handleDelete);
  }, [selected, setCObjects, setSelected, setDynamicInputText, pushToUndoStack]);

  return (
    <>
      <Box
        style={{
          width: width + 4,
          height: height + 4,
          top: y * zoom,
          left: x * zoom,
          zIndex: space ? 0 : 5,
        }}
        border="2px solid"
        borderColor="blue.400"
        position="absolute"
        onMouseDown={(e) => {
          e.stopPropagation();
          console.log('triggered');
          setEvent('move');
          setTriggerMove(true);
          setMousePos({
            x: e.clientX - x * zoom,
            y: e.clientY - y * zoom,
          });
          setMoveCache({
            initX: x,
            initY: y,
            cObjects: cloneDeep(cObjects),
          });
        }}
      >
        <Box
          pos="absolute"
          bottom="-20px"
          transform="translateX(-50%)"
          left="50%"
          background="blue.400"
          color="white"
          fontSize="xs"
          width="max-content"
        >
          {(width / zoom).toFixed(0)} x {(height / zoom).toFixed(0)}
        </Box>
      </Box>
    </>
  );
};

export default MultiSelectBox;
