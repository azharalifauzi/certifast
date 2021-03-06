import React, { useEffect, useMemo, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { atom, useAtom } from 'jotai';
import {
  activeEvent,
  canvasObjects,
  dynamicTextInput,
  multiSelected,
  selectedObject,
  spaceKey,
} from 'gstates';
import { zoomCanvas } from '.';
import { useUndo } from 'hooks';
import cloneDeep from 'clone-deep';

type MultiSelectMetaData = {
  initMove: boolean;
  initMoveMousePos: {
    x: number;
    y: number;
  };
  isMovedAfterInit: boolean;
  isFromOutside: boolean;
  initPos: {
    x: number;
    y: number;
  };
  outsideMeta: {
    selectedId: string;
  };
  cache: {
    cObjects: any;
  };
};

export const multiSelectMetaDataAtom = atom<MultiSelectMetaData>({
  initMove: false,
  initMoveMousePos: {
    x: 0,
    y: 0,
  },
  isMovedAfterInit: false,
  isFromOutside: false,
  initPos: {
    x: 0,
    y: 0,
  },
  outsideMeta: {
    selectedId: '',
  },
  cache: {
    cObjects: {},
  },
});

const MultiSelectBox = () => {
  const [selected, setSelected] = useAtom(multiSelected);
  const [, setSingleSelected] = useAtom(selectedObject);
  const [cObjects, setCObjects] = useAtom(canvasObjects);
  const [, setDynamicInputText] = useAtom(dynamicTextInput);
  const [zoom] = useAtom(zoomCanvas);
  const [, setEvent] = useAtom(activeEvent);
  const [space] = useAtom(spaceKey);
  const [multiSelectMetaData, setMultiSelectMetaData] = useAtom(multiSelectMetaDataAtom);
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
      setMultiSelectMetaData((meta) => {
        const isMovedAfterInit = meta.initPos.x !== x || meta.initPos.y !== y;

        if (!isMovedAfterInit && meta.initMove) {
          setSingleSelected(meta.outsideMeta.selectedId);
          setSelected([]);
        }

        if (isMovedAfterInit && meta.initMove) {
          pushToUndoStack(meta.cache.cObjects);
        }

        return {
          isMovedAfterInit,
          initMove: false,
          initMoveMousePos: {
            x: 0,
            y: 0,
          },
          isFromOutside: false,
          initPos: {
            x: 0,
            y: 0,
          },
          outsideMeta: {
            selectedId: '',
          },
          cache: {
            cObjects: {},
          },
        };
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;

      if (multiSelectMetaData.initMove && multiSelectMetaData.isFromOutside) {
        const newX = clientX - multiSelectMetaData.initMoveMousePos.x - x * zoom;
        const newY = clientY - multiSelectMetaData.initMoveMousePos.y - y * zoom;
        setCObjects((obj) => {
          const newObj = cloneDeep(obj);
          selected.forEach((id) => {
            newObj[id].data.x += newX;
            newObj[id].data.y += newY;
          });

          return newObj;
        });

        return;
      }

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
    multiSelectMetaData,
    setMultiSelectMetaData,
    setSingleSelected,
    setSelected,
  ]);

  useEffect(() => {
    const handleDelete = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        setCObjects((cObjects) => {
          pushToUndoStack(cloneDeep(cObjects));
          let newCObjects = cloneDeep(cObjects);
          selected.forEach((id) => {
            const { [id]: _, ...otherObjects } = newCObjects;
            newCObjects = cloneDeep(otherObjects);
          });

          return newCObjects;
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
