import { Box } from '@chakra-ui/react';
import {
  canvasObjects,
  activeToolbar as activeToolbarAtom,
  selectedObject,
  spaceKey as spaceKeyAtom,
  dynamicTextInput,
  willSnap,
  isObjectMoving,
  activeEvent,
  multiSelected,
  shiftKey as shiftKeyAtom,
  preventCanvasShortcut as preventCanvasShortcutAtom,
  newTextJustAddedID as newTextJustAddedIDAtom,
} from 'gstates';
import { atom, useAtom } from 'jotai';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import React, { useEffect, useState, memo, useRef, useCallback } from 'react';
import { useMemo } from 'react';
import { useMount, useMeasure, useClickAway } from 'react-use';
import WebFont from 'webfontloader';
import { zoomCanvas } from '.';
import { GiCrosshair } from 'react-icons/gi';
import { useUndo } from 'hooks';
import cloneDeep from 'clone-deep';
import { multiSelectMetaDataAtom } from './MultiSelectBox';

interface CanvasTextProps {
  id: string;
}

export const isEditAtom = atom({ selectedId: '', value: false });

const CanvasText: React.FC<CanvasTextProps> = ({ id }) => {
  const [textRef, { height, width }] = useMeasure<HTMLDivElement>();
  const inputRef = useRef<HTMLInputElement>(null);
  const [zoom] = useAtom(zoomCanvas);
  const [cObjects, setCObjects] = useAtom(canvasObjects);
  const [activeToolbar, setActiveToolbar] = useAtom(activeToolbarAtom);
  const [selected, setSelected] = useAtom(selectedObject);
  const [, setTextMoving] = useAtom(isObjectMoving);
  const [, setEvent] = useAtom(activeEvent);
  const [multiSelectedObj, setMultiSelectedObj] = useAtom(multiSelected);
  const [, setMultiSelectMetaData] = useAtom(multiSelectMetaDataAtom);
  const [newTextJustAddedID, setNewTextJustAddedID] = useAtom(newTextJustAddedIDAtom);
  const spaceKey = useAtomValue(spaceKeyAtom);
  const shiftKey = useAtomValue(shiftKeyAtom);
  const isWilLSnap = useAtomValue(willSnap);
  const preventCanvasShortcut = useAtomValue(preventCanvasShortcutAtom);
  const setDynamicInputText = useUpdateAtom(dynamicTextInput);
  const setEditGlobal = useUpdateAtom(isEditAtom);
  const [prevZoom, setPrevZoom] = useState(zoom);
  const [triggerMove, setTriggerMove] = useState<boolean>(false);
  const [resize, setResize] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isEdit, setEdit] = useState<boolean>(false);
  const [editCache, setEditCache] = useState({ initHeight: 0, initWidth: 0, initText: '' });
  const [moveCache, setMoveCache] = useState({ initX: 0, initY: 0, cObjects: {} });
  const [resizeCache, setResizeCache] = useState({ initSize: 0, cObjects: {} });

  const { data: textData } = useMemo(() => cObjects[id], [id, cObjects]);
  const isMultiSelected = useMemo(() => multiSelectedObj.includes(id), [id, multiSelectedObj]);

  const { pushToUndoStack } = useUndo();

  useClickAway(
    inputRef,
    () => {
      if (!textData.text)
        setCObjects((obj) => {
          const newObj = { ...obj };
          newObj[selected].data.text = editCache.initText;
          return newObj;
        });
      setEdit(false);
      setEditGlobal({ selectedId: '', value: false });
      setEvent('idle');
    },
    ['click']
  );

  useMount(() => {
    WebFont.load({
      google: {
        families: [cObjects[id].data.family],
      },
    });
  });

  const handleEdit = useCallback(() => {
    setEditCache({
      initHeight: height,
      initWidth: width,
      initText: textData.text,
    });
    setEdit(true);
    setEditGlobal({ selectedId: id, value: true });
    setEvent('textedit');
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(0, textData.text.length - 1);
      inputRef.current?.select();
    }, 100);
  }, [height, id, width, textData.text, setEditGlobal, setEvent]);

  useEffect(() => {
    if (newTextJustAddedID === id) {
      handleEdit();
      setTimeout(() => {
        setNewTextJustAddedID('');
      }, 0);
    }
  }, [newTextJustAddedID, id, setSelected, handleEdit, setNewTextJustAddedID]);

  useEffect(() => {
    setCObjects((objects) => {
      const newObj = { ...objects };
      newObj[id].data.height = height / zoom + 10;
      newObj[id].data.width = width / zoom + 10;

      return newObj;
    });
  }, [setCObjects, id, width, height, zoom, selected]);

  useEffect(() => {
    if (zoom) {
      const scaleFactor = zoom / prevZoom;

      setCObjects((cObjects) => {
        const newCObjects = { ...cObjects };

        newCObjects[id].data.x *= scaleFactor;
        newCObjects[id].data.y *= scaleFactor;
        return newCObjects;
      });
      setPrevZoom(zoom);
    }
  }, [zoom, setCObjects, id, prevZoom]);

  useEffect(() => {
    const handleMouseUp = () => {
      setTriggerMove(false);
      setResize(false);
      setTextMoving(false);
      setEvent('idle');
      if (activeToolbar === 'resize') setActiveToolbar('move');
      if ((moveCache.initX !== textData.x || moveCache.initY !== textData.y) && triggerMove)
        pushToUndoStack(moveCache.cObjects);
      if (resizeCache.initSize !== textData.size && resize) pushToUndoStack(resizeCache.cObjects);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY, movementX } = e;
      if (spaceKey) return;
      if (triggerMove && activeToolbar === 'move' && !isWilLSnap) {
        setTextMoving(true);
        setEvent('move');
        setCObjects((obj) => {
          const newCObjects = { ...obj };
          newCObjects[id].data.x = clientX - mousePos.x;
          newCObjects[id].data.y = clientY - mousePos.y;
          newCObjects[id].data.isSnapped = false;
          return newCObjects;
        });
      } else if (resize && activeToolbar === 'resize') {
        setEvent('resize');
        setCObjects((obj) => {
          const newCObjects = { ...obj };
          const newSize = newCObjects[id].data.size + (movementX * 0.4) / zoom;
          if (newSize > 0) newCObjects[id].data.size = newSize;
          return newCObjects;
        });
      }
    };

    window.addEventListener('mouseup', handleMouseUp, { capture: false });
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [
    triggerMove,
    mousePos,
    activeToolbar,
    id,
    setCObjects,
    resize,
    zoom,
    spaceKey,
    setActiveToolbar,
    isWilLSnap,
    setTextMoving,
    moveCache,
    pushToUndoStack,
    textData,
    resizeCache,
    setEvent,
  ]);

  useEffect(() => {
    const handleDelete = (e: KeyboardEvent) => {
      if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        selected === id &&
        !preventCanvasShortcut
      ) {
        setCObjects((cObjects) => {
          const { [id]: _, ...newCObjects } = cObjects;
          pushToUndoStack(cObjects);
          return newCObjects;
        });
        setSelected('');
        setDynamicInputText((input) => {
          const { [id]: _, ...newInput } = input;
          return newInput;
        });
      }
    };

    window.addEventListener('keydown', handleDelete, { capture: false });

    return () => window.removeEventListener('keydown', handleDelete);
  }, [
    id,
    selected,
    setCObjects,
    setSelected,
    setDynamicInputText,
    pushToUndoStack,
    preventCanvasShortcut,
  ]);

  const handleChangeText: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setCObjects((obj) => {
      const newObj = { ...obj };
      newObj[selected].data.text = e.target.value;
      return newObj;
    });
  };

  const chEdit = useMemo(() => {
    const text = textData.text;
    let p1 = text.length - 1;
    let ch = 0;
    while (text[p1] === ' ') {
      ch++;
      p1--;
    }
    return ch;
  }, [textData.text]);

  const multiSelectionBoxMeta = useMemo(() => {
    if (multiSelectedObj.length === 0 || Object.keys(cObjects).length < 2)
      return { x: 0, y: 0, width: 0, height: 0 };

    let x = cObjects[multiSelectedObj[0]].data.x / zoom;
    let y = cObjects[multiSelectedObj[0]].data.y / zoom;
    let maxX = cObjects[multiSelectedObj[0]].data.x / zoom;
    let maxY = cObjects[multiSelectedObj[0]].data.y / zoom;

    multiSelectedObj.forEach((id) => {
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
  }, [multiSelectedObj, cObjects, zoom]);

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (spaceKey) return;

    if (shiftKey) {
      if (multiSelectedObj.length >= 2 && !multiSelectedObj.includes(id)) {
        setMultiSelectedObj([...multiSelectedObj, id]);
      } else if (selected && selected !== id) {
        setMultiSelectedObj([selected, id]);
        setSelected('');
      } else if (multiSelectedObj.includes(id)) {
        const newMultiSelected = [...multiSelectedObj];
        const indexOf = multiSelectedObj.indexOf(id);
        newMultiSelected.splice(indexOf, 1);

        if (newMultiSelected.length === 1) {
          setMultiSelectedObj([]);
          setSelected(newMultiSelected[0]);
        } else setMultiSelectedObj(newMultiSelected);
      } else {
        setSelected(id);
      }

      return;
    }

    if (isMultiSelected) {
      setMultiSelectMetaData({
        initMove: true,
        initMoveMousePos: {
          x: e.clientX - multiSelectionBoxMeta.x * zoom,
          y: e.clientY - multiSelectionBoxMeta.y * zoom,
        },
        isFromOutside: true,
        isMovedAfterInit: false,
        initPos: {
          x: multiSelectionBoxMeta.x,
          y: multiSelectionBoxMeta.y,
        },
        outsideMeta: {
          selectedId: id,
        },
        cache: {
          cObjects: cloneDeep(cObjects),
        },
      });
      return;
    }

    if (!multiSelectedObj.includes(id)) {
      setMultiSelectedObj([]);
    }

    if (activeToolbar === 'move') setSelected(id);
    setMousePos({
      x: e.clientX - textData.x,
      y: e.clientY - textData.y,
    });
    setMoveCache({ cObjects: cloneDeep(cObjects), initX: textData.x, initY: textData.y });
    setResizeCache({ cObjects: cloneDeep(cObjects), initSize: textData.size });
    if (resize) {
      setActiveToolbar('resize');
    } else {
      setTriggerMove(true);
      setActiveToolbar('move');
    }
  };

  return (
    <>
      {isEdit ? (
        <Box
          as="input"
          position="absolute"
          zIndex="11"
          background="transparent"
          lineHeight="1.0"
          border="2px solid"
          borderColor="blue.400"
          style={{
            width: `calc(${width + 4}px + ${chEdit}ch)`,
            height: !textData.text ? editCache.initHeight + 4 : height + 4,
          }}
          _focus={{ outline: 'none' }}
          _selection={{ background: 'lightblue' }}
          onKeyDown={(e) => e.stopPropagation()}
          onKeyPress={(e) => e.stopPropagation()}
          onChange={handleChangeText}
          fontFamily={textData.family}
          fontWeight={textData.weight}
          value={textData.text}
          ref={inputRef}
          top={textData.y}
          left={textData.x}
          color={textData.color}
          fontSize={textData.size * zoom}
        />
      ) : null}
      <Box
        opacity={isEdit ? 0 : 1}
        fontFamily={textData.family}
        fontWeight={textData.weight}
        _hover={{
          textDecoration: 'underline',
          textDecorationColor: 'blue.400',
          textDecorationThickness: '2px',
        }}
        style={{
          top: textData.y,
          left: textData.x,
        }}
        zIndex="10"
        ref={textRef}
        color={textData.color}
        userSelect="none"
        position="absolute"
        border="2px solid"
        lineHeight="1.0"
        borderColor={selected === id ? 'blue.400' : 'transparent'}
        fontSize={textData.size * zoom}
        onMouseDown={onMouseDown}
        onMouseMove={() => {
          if (activeToolbar === 'move' && resize) setResize(false);
        }}
        onDoubleClick={handleEdit}
      >
        {selected === id ? (
          <Box
            style={{
              height: 10,
              width: 10,
              right: -6,
              bottom: -6,
            }}
            position="absolute"
            borderRadius="50%"
            background="white"
            border="1px solid"
            borderColor="blue.400"
            _hover={{
              cursor: 'nw-resize',
            }}
            onMouseOver={() => {
              setResize(true);
              setEvent('resize');
            }}
            onMouseLeave={() => {
              if (activeToolbar === 'move') setResize(false);
              setEvent('idle');
            }}
            onMouseMove={(e) => e.stopPropagation()}
          />
        ) : null}
        {selected === id && !newTextJustAddedID ? (
          <>
            <Box
              left={textData.align === 'left' ? '0' : textData.align === 'center' ? '50%' : '100%'}
              top="50%"
              transform="translate(-50%, -50%)"
              position="absolute"
            >
              <GiCrosshair color="#4399E1" size={12 * zoom} />
            </Box>
            <Box
              pos="absolute"
              bottom="-20px"
              transform="translateX(-50%)"
              left="50%"
              background="blue.400"
              color="white"
              fontSize="xs"
              width="max-content"
              fontFamily="body"
            >
              {textData.width?.toFixed(0)} x {textData.height?.toFixed(0)}
            </Box>
          </>
        ) : null}
        {textData.text}
      </Box>
    </>
  );
};

export default memo(CanvasText);
