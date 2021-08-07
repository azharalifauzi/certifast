import { Box, useOutsideClick } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import React, { useEffect, useRef, useState } from 'react';
import { zoomCanvas } from '.';

interface CanvasTextProps {
  id: string;
}

const CanvasText: React.FC<CanvasTextProps> = () => {
  const textRef = useRef<HTMLDivElement>(null);
  const [zoom] = useAtom(zoomCanvas);
  const [prevZoom, setPrevZoom] = useState(zoom);
  const [selected, setSelected] = useState<boolean>(false);
  const [top, setTop] = useState<number>(0);
  const [left, setLeft] = useState<number>(0);
  const [triggerMove, setTriggerMove] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (zoom) {
      const scaleFactor = zoom / prevZoom;

      setTop((t) => t * scaleFactor);
      setLeft((l) => l * scaleFactor);
      setPrevZoom(zoom);
    }
  }, [zoom]);

  useEffect(() => {
    const handleMouseUp = () => setTriggerMove(false);
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;

      if (triggerMove) {
        setLeft(clientX - mousePos.x);
        setTop(clientY - mousePos.y);
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
        top,
        left,
      }}
      ref={textRef}
      userSelect="none"
      position="absolute"
      outline="2px solid"
      outlineColor={selected ? 'blue.400' : 'transparent'}
      onClick={() => setSelected(true)}
      fontSize={64 * zoom}
      onMouseDown={(e) => {
        setMousePos({
          x: e.clientX - left,
          y: e.clientY - top,
        });
        setTriggerMove(true);
      }}
    >
      Test
    </Box>
  );
};

export default CanvasText;
