import { useEventListener } from '@chakra-ui/hooks';
import { Box } from '@chakra-ui/layout';
import { useAtom } from 'jotai';
import { useAtomValue } from 'jotai/utils';
import React, { memo, useMemo, useState, useEffect } from 'react';
import { leftCanvas, topCanvas, zoomCanvas } from '.';

interface ScrollBarProps {
  windowH: number;
  windowW: number;
  canvasH: number;
  canvasW: number;
}

const ScrollBar: React.FC<ScrollBarProps> = ({ windowH, windowW, canvasH, canvasW }) => {
  const zoom = useAtomValue(zoomCanvas);
  const [top, setTop] = useAtom(topCanvas);
  const [left, setLeft] = useAtom(leftCanvas);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [triggerMoveX, setTriggerMoveX] = useState(false);
  const [triggerMoveY, setTriggerMoveY] = useState(false);
  const [translateX, setTranslateX] = useState<number>(0);
  const [translateY, setTranslateY] = useState<number>(0);
  const scrollBarHeight = useMemo(() => (0.2 * windowH) / zoom, [zoom, windowH]);
  const scrollBarWidth = useMemo(() => (0.2 * windowW) / zoom, [zoom, windowW]);

  useEffect(() => {
    if (!triggerMoveY) {
      const movement = top * -1;
      const ratio = (scrollBarHeight - windowH) / (windowH - canvasH);
      const newY = movement * ratio;
      setTranslateY(newY);
    }
  }, [top, triggerMoveY, canvasH, scrollBarHeight, windowH]);

  useEffect(() => {
    if (!triggerMoveX) {
      const movement = left * -1;
      const ratio = (scrollBarWidth - windowW + 344) / (windowW - canvasW);
      const newX = movement * ratio;
      setTranslateX(newX);
    }
  }, [left, triggerMoveX, canvasW, scrollBarWidth, windowW]);

  useEventListener('mousemove', (e) => {
    const { clientX, clientY } = e;
    const newX = clientX - mousePos.x;
    const newY = clientY - mousePos.y;

    if (triggerMoveY && newY >= 0 && newY <= windowH - scrollBarHeight) {
      const ratio = -(windowH - canvasH) / (scrollBarHeight - windowH);

      setTranslateY(newY);
      setTop(ratio * newY);
    }

    if (triggerMoveX && newX >= 0 && newX <= windowW - scrollBarWidth - 344) {
      const ratio = -(windowW - canvasW) / (scrollBarWidth - windowW + 344);

      setTranslateX(newX);
      setLeft(ratio * newX);
    }
  });

  useEventListener('mouseup', () => {
    setTriggerMoveX(false);
    setTriggerMoveY(false);
  });

  return (
    <>
      {/* Scrollbar X */}
      <Box
        userSelect="none"
        position="fixed"
        bottom="2"
        left="14"
        height="2"
        borderRadius="10px"
        zIndex="100"
        background="blackAlpha.500"
        _hover={{ background: 'blackAlpha.600' }}
        onMouseDown={(e) => {
          setMousePos({ ...mousePos, x: e.clientX - translateX });
          setTriggerMoveX(true);
        }}
        transform={`translateX(${translateX}px)`}
        draggable={false}
        style={{
          width: scrollBarWidth,
        }}
      ></Box>
      {/* Scrollbar Y */}
      <Box
        userSelect="none"
        position="fixed"
        top="0"
        right="296px"
        height={scrollBarHeight}
        borderRadius="10px"
        width="2"
        zIndex="100"
        background="blackAlpha.500"
        _hover={{ background: 'blackAlpha.600' }}
        onMouseDown={(e) => {
          setMousePos({ ...mousePos, y: e.clientY - translateY });
          setTriggerMoveY(true);
        }}
        transform={`translateY(${translateY}px)`}
        draggable={false}
        style={{
          height: scrollBarHeight,
        }}
      ></Box>
    </>
  );
};

export default memo(ScrollBar);
