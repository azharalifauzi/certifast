import { Box } from '@chakra-ui/react';
import { canvasObjects, activeToolbar as activeToolbarAtom, selectedObject } from 'gstates';
import { useAtom } from 'jotai';
import React, { useEffect, useRef, useState } from 'react';
import { useMemo } from 'react';
import { useMount } from 'react-use';
import WebFont from 'webfontloader';
import { zoomCanvas } from '.';

interface CanvasTextProps {
  id: string;
}

const CanvasText: React.FC<CanvasTextProps> = ({ id }) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [zoom] = useAtom(zoomCanvas);
  const [cObjects, setCObjects] = useAtom(canvasObjects);
  const [activeToolbar, setActiveToolbar] = useAtom(activeToolbarAtom);
  const [prevZoom, setPrevZoom] = useState(zoom);
  const [selected, setSelected] = useAtom(selectedObject);
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
    };
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY, movementX } = e;

      if (triggerMove && activeToolbar === 'move') {
        setCObjects((obj) => {
          const newCObjects = { ...obj };
          newCObjects[id].data.x = clientX - mousePos.x;
          newCObjects[id].data.y = clientY - mousePos.y;
          return newCObjects;
        });
      } else if (resize && activeToolbar === 'move') {
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
  }, [triggerMove, mousePos, activeToolbar, id, setCObjects, resize, mousePosResize.x, zoom]);

  useEffect(() => {
    const handleDelete = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selected === id) {
        setCObjects((cObjects) => {
          const { [id]: _, ...newCObjects } = cObjects;

          return newCObjects;
        });
        setSelected('');
      }
    };

    window.addEventListener('keydown', handleDelete);

    return () => window.removeEventListener('keydown', handleDelete);
  }, [id, selected, setCObjects, setSelected]);

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
      borderColor={selected === id ? 'blue.400' : 'transparent'}
      fontSize={textData.size * zoom}
      onClick={() => {
        if (activeToolbar === 'move') setSelected(id);
      }}
      onMouseDown={(e) => {
        if (activeToolbar === 'move') setSelected(id);
        setMousePos({
          x: e.clientX - textData.x,
          y: e.clientY - textData.y,
        });
        setMousePosResize({
          x: e.clientX,
          y: e.clientY,
        });
        if (activeToolbar === 'resize') setResize(true);
        else setTriggerMove(true);
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
            if (activeToolbar === 'move') setActiveToolbar('resize');
          }}
          onMouseLeave={() => setActiveToolbar('move')}
        />
      ) : null}
      {textData.text}
    </Box>
  );
};

export default CanvasText;
