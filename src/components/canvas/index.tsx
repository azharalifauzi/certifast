import { Box, Flex } from '@chakra-ui/react';
import { useWindowSize, useMeasure } from 'react-use';
import React, { useEffect, useState } from 'react';
import { useAtom, atom } from 'jotai';

const topCanvas = atom(0);
const leftCanvas = atom(0);

const CANVAS_HEIGHT = 7000;
const CANVAS_WIDTH = 7000;

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

  const handleWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    if (!ctrlKey) return;

    const { clientX, clientY, deltaY } = e;

    // Track point mouse
    const xf = clientX - left;
    const yf = clientY - top;

    // scale
    const delta = deltaY;
    const scaleIn = 1.2;
    const scaleOut = 1 / scaleIn;
    let newZoom;

    if (delta < 0) newZoom = zoom * scaleIn;
    else newZoom = zoom * scaleOut;

    // Scale Track point and then get new point after scale
    let newXf;
    let newYf;
    if (delta < 0) {
      newXf = scaleIn * xf;
      newYf = scaleIn * yf;
    } else {
      newXf = xf * scaleOut;
      newYf = yf * scaleOut;
    }

    // Find Translate x and Translate y
    const Tx = xf - newXf;
    const Ty = yf - newYf;

    const newTop = top + Ty;
    const newLeft = left + Tx;

    if (newLeft >= 0 || newTop >= 0) return;
    if (
      newLeft <= -(CANVAS_WIDTH * newZoom - windowW) ||
      newTop <= -(CANVAS_HEIGHT * newZoom - windowH)
    )
      return;

    setZoom(newZoom);
    setTop((t) => t + Ty);
    setLeft((l) => l + Tx);
  };

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
    >
      {/* Canvas Component */}
      <Box
        ref={canvasRef}
        style={{
          transform: `translate(${left}px, ${top}px)`,
          height: CANVAS_HEIGHT * zoom,
          width: CANVAS_WIDTH * zoom,
        }}
        background="gray.100"
        draggable={false}
        onWheel={handleWheel}
        position="relative"
        backgroundSize="cover"
      >
        <Box w="1%" h="1%" background="blue.200" position="absolute" top="20%" left="20%" />
      </Box>
      {/* Zoom Indicator */}
      <Flex
        position="absolute"
        bottom="6"
        left="24"
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
