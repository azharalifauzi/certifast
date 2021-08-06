import { Box, Flex } from '@chakra-ui/react';
import { useWindowSize, useMeasure } from 'react-use';
import React, { useEffect, useState } from 'react';
import { useAtom, atom } from 'jotai';
import { calculateTopLeftAfterZoom } from 'helpers';

const topCanvas = atom(0);
const leftCanvas = atom(0);

const CANVAS_HEIGHT = 4000;
const CANVAS_WIDTH = 4000;

const Canvas = () => {
  const [top, setTop] = useAtom(topCanvas);
  const [left, setLeft] = useAtom(leftCanvas);
  const { height } = useWindowSize();
  const [triggerPan, setTriggerPan] = useState<boolean>(false);
  const [ctrlKey, setCtrlKey] = useState<boolean>(false);
  const [spaceKey, setSpaceKey] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1.0);
  const [windowRef, { width: windowW, height: windowH }] = useMeasure<HTMLDivElement>();
  const [canvasRef, { width: canvasW, height: canvasH }] = useMeasure<HTMLDivElement>();

  useEffect(() => {
    if (spaceKey && !triggerPan) document.body.style.cursor = 'grab';
    else if (spaceKey && triggerPan) document.body.style.cursor = 'grabbing';
    else document.body.style.cursor = 'default';
  }, [triggerPan, spaceKey]);

  useEffect(() => {
    window.addEventListener('mouseup', () => {
      setTriggerPan(false);
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Control') setCtrlKey(true);
      if (e.key === ' ') setSpaceKey(true);
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'Control') setCtrlKey(false);
      if (e.key === ' ') setSpaceKey(false);
    });

    window.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
      },
      { passive: false }
    );
  }, []);

  return (
    // Window Component
    <Box
      overflow="hidden"
      position="relative"
      height={height}
      zIndex="10"
      ref={windowRef}
      onMouseMove={(e) => {
        const { movementX, movementY } = e;

        if (triggerPan && spaceKey) {
          if (left + movementX <= 0 && left + movementX >= -(canvasW - windowW))
            setLeft((l) => l + movementX);
          if (top + movementY <= 0 && top + movementY >= -(canvasH - windowH))
            setTop((t) => t + movementY);
        }
      }}
      onMouseDown={() => {
        setTriggerPan(true);
      }}
      onWheel={(e) => {
        const { offsetX, offsetY } = e.nativeEvent;

        if (ctrlKey) {
          // zoom in
          if (e.deltaY < 0 && zoom < 2.0) {
            let { x, y } = calculateTopLeftAfterZoom(
              top,
              left,
              CANVAS_WIDTH * zoom,
              CANVAS_HEIGHT * zoom,
              offsetX,
              offsetY,
              (zoom + 0.01) / zoom
            );

            if (x / top > 1 && x / top < 1.04) {
              const temp = x;
              x = y;
              y = temp;
            }

            const nextCanvasW = CANVAS_WIDTH * (zoom + 0.01);
            const nextCanvasH = CANVAS_HEIGHT * (zoom + 0.01);

            if (x < 0 && x + nextCanvasW > windowW) setLeft(x);
            else setLeft(windowW - nextCanvasW);
            if (y < 0 && y + nextCanvasH > windowH) setTop(y);
            else setTop(windowH - nextCanvasH);

            setZoom((z) => z + 0.01);
          }
          // zoom out
          else if (e.deltaY > 0 && zoom > 0.7) {
            let { x, y } = calculateTopLeftAfterZoom(
              top,
              left,
              CANVAS_WIDTH * zoom,
              CANVAS_HEIGHT * zoom,
              offsetX,
              offsetY,
              (zoom - 0.01) / zoom
            );

            if (top / x > 1 && top / x < 1.04) {
              const temp = x;
              x = y;
              y = temp;
            }

            const nextCanvasW = CANVAS_WIDTH * (zoom - 0.01);
            const nextCanvasH = CANVAS_HEIGHT * (zoom - 0.01);

            if (x < 0 && x + nextCanvasW > windowW) setLeft(x);
            else setLeft(windowW - nextCanvasW);
            if (y < 0 && y + nextCanvasH > windowH) setTop(y);
            else setTop(windowH - nextCanvasH);

            setZoom((z) => z - 0.01);
          }
        }
      }}
    >
      <Box position="absolute" top="0" left="0" height="100%" width="100%" zIndex="100" />
      {/* Canvas Component */}
      <Box
        ref={canvasRef}
        style={{
          top,
          left,
          height: CANVAS_HEIGHT * zoom,
          width: CANVAS_WIDTH * zoom,
        }}
        position="absolute"
        background="gray.200"
        draggable={false}
      >
        <Box w="5%" h="5%" background="blue.200" position="absolute" top={1000} left={1000} />
      </Box>
      {/* Zoom Indicator */}
      <Flex
        position="absolute"
        bottom="6"
        right="6"
        background="rgba(0,0,0, .4)"
        color="white"
        width="16"
        height="16"
        borderRadius="50%"
        justifyContent="center"
        alignItems="center"
      >
        {(zoom * 100).toFixed(0)}%
      </Flex>
    </Box>
  );
};

export default Canvas;
