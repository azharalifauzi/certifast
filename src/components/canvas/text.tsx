import { Box } from '@chakra-ui/react';
import {
  canvasObjects,
  activeToolbar as activeToolbarAtom,
  selectedObject,
  spaceKey as spaceKeyAtom,
  dynamicTextInput,
} from 'gstates';
import { useAtom } from 'jotai';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import React, { useEffect, useRef, useState, memo } from 'react';
import { useMemo } from 'react';
import { useMount } from 'react-use';
import WebFont from 'webfontloader';
import { zoomCanvas } from '.';
import { GiCrosshair } from 'react-icons/gi';

interface CanvasTextProps {
  id: string;
}

const CanvasText: React.FC<CanvasTextProps> = ({ id }) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [zoom] = useAtom(zoomCanvas);
  const [cObjects, setCObjects] = useAtom(canvasObjects);
  const [activeToolbar, setActiveToolbar] = useAtom(activeToolbarAtom);
  const [selected, setSelected] = useAtom(selectedObject);
  const spaceKey = useAtomValue(spaceKeyAtom);
  const setDynamicInputText = useUpdateAtom(dynamicTextInput);
  const [prevZoom, setPrevZoom] = useState(zoom);
  const [triggerMove, setTriggerMove] = useState<boolean>(false);
  const [resize, setResize] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mousePosResize, setMousePosResize] = useState({ x: 0, y: 0 });

  const { data: textData } = useMemo(() => cObjects[id], [id, cObjects]);

  useMount(() => {
    WebFont.load({
      google: {
        families: [cObjects[id].data.family],
      },
    });
  });

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
      setActiveToolbar('move');
    };
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY, movementX } = e;

      if (spaceKey) return;

      if (triggerMove && activeToolbar === 'move') {
        setCObjects((obj) => {
          const newCObjects = { ...obj };
          newCObjects[id].data.x = clientX - mousePos.x;
          newCObjects[id].data.y = clientY - mousePos.y;
          return newCObjects;
        });
      } else if (resize && activeToolbar === 'resize') {
        setCObjects((obj) => {
          const newCObjects = { ...obj };
          const newSize = newCObjects[id].data.size + (movementX * 0.4) / zoom;
          if (newSize > 0) newCObjects[id].data.size = newSize;
          return newCObjects;
        });
      }
    };

    window.addEventListener('mouseup', handleMouseUp);
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
    mousePosResize.x,
    zoom,
    spaceKey,
    setActiveToolbar,
  ]);

  useEffect(() => {
    const handleDelete = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selected === id) {
        setCObjects((cObjects) => {
          const { [id]: _, ...newCObjects } = cObjects;

          return newCObjects;
        });
        setSelected('');
        setDynamicInputText((input) => {
          const { [id]: _, ...newInput } = input;
          return newInput;
        });
      }
    };

    window.addEventListener('keydown', handleDelete);

    return () => window.removeEventListener('keydown', handleDelete);
  }, [id, selected, setCObjects, setSelected, setDynamicInputText]);

  return (
    <Box
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
      onClick={() => {
        if (spaceKey) return;
        if (activeToolbar === 'move') setSelected(id);
      }}
      onMouseDown={(e) => {
        if (spaceKey) return;
        if (activeToolbar === 'move') setSelected(id);
        setMousePos({
          x: e.clientX - textData.x,
          y: e.clientY - textData.y,
        });
        setMousePosResize({
          x: e.clientX,
          y: e.clientY,
        });
        if (resize) {
          setActiveToolbar('resize');
        } else setTriggerMove(true);
      }}
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
          }}
          onMouseLeave={() => {
            if (activeToolbar === 'move') setResize(false);
          }}
        />
      ) : null}
      {selected === id ? (
        <Box
          left={textData.align === 'left' ? '0' : textData.align === 'center' ? '50%' : '100%'}
          top="50%"
          transform="translate(-50%, -50%)"
          position="absolute"
        >
          <GiCrosshair color="#4399E1" size={12 * zoom} />
        </Box>
      ) : null}
      {textData.text}
    </Box>
  );
};

export default memo(CanvasText);
