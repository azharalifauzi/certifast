import { Box, useOutsideClick } from '@chakra-ui/react';
import { canvasObjects } from 'gstates';
import { useAtom } from 'jotai';
import React, { useEffect, useRef, useState } from 'react';
import { useMemo } from 'react';
import { zoomCanvas } from '.';

interface CanvasTextProps {
  id: string;
}

const CanvasText: React.FC<CanvasTextProps> = ({ id }) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [zoom] = useAtom(zoomCanvas);
  const [cObjects, setCObjects] = useAtom(canvasObjects);
  const [prevZoom, setPrevZoom] = useState(zoom);
  const [selected, setSelected] = useState<boolean>(false);
  const [triggerMove, setTriggerMove] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const { data: textData } = useMemo(() => cObjects[id], [id]);

  useEffect(() => {
    if (zoom) {
      const scaleFactor = zoom / prevZoom;

      const newCObjects = { ...cObjects };

      newCObjects[id].data.x = textData.x * scaleFactor;
      newCObjects[id].data.y = textData.y * scaleFactor;

      console.log(newCObjects);

      setCObjects(newCObjects);
      setPrevZoom(zoom);
    }
  }, [zoom]);

  useEffect(() => {
    const handleMouseUp = () => setTriggerMove(false);
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;

      if (triggerMove) {
        const newCObjects = { ...cObjects };

        newCObjects[id].data.x = clientX - mousePos.x;
        newCObjects[id].data.y = clientY - mousePos.y;

        setCObjects(newCObjects);
      }
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [triggerMove, mousePos]);

  useOutsideClick({
    ref: textRef,
    handler: () => {
      setSelected(false);
    },
  });

  return (
    <Box
      style={{
        top: textData.y,
        left: textData.x,
      }}
      ref={textRef}
      color={textData.color}
      userSelect="none"
      position="absolute"
      outline="2px solid"
      outlineColor={selected ? 'blue.400' : 'transparent'}
      onClick={() => setSelected(true)}
      fontSize={64 * zoom}
      onMouseDown={(e) => {
        setMousePos({
          x: e.clientX - textData.x,
          y: e.clientY - textData.y,
        });
        setTriggerMove(true);
      }}
    >
      {textData.text}
    </Box>
  );
};

export default CanvasText;
