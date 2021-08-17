import { Box, Flex, Image } from '@chakra-ui/react';
import { useWindowSize, useMeasure, useMount } from 'react-use';
import React, { useEffect, useState, memo } from 'react';
import { useAtom, atom } from 'jotai';
import { Loading } from 'components';
import CanvasText from './text';
import {
  canvasObjects,
  certifTemplate,
  mousePosRelativeToTemplate as mousePosRelativeToTemplateAtom,
  activeToolbar as activeToolbarAtom,
  selectedObject,
  spaceKey as spaceKeyAtom,
  ctrlKey as ctrlKeyAtom,
  isOutsideCanvas as isMouseOutsideCanvasAtom,
} from 'gstates';
import { v4 as uuid } from 'uuid';
import { atomWithStorage } from 'jotai/utils';

const CANVAS_HEIGHT = 7000;
const CANVAS_WIDTH = 7000;

const topCanvas = atom(CANVAS_HEIGHT / 2);
const leftCanvas = atom(CANVAS_WIDTH / 2);
export const zoomCanvas = atomWithStorage('zoom', 1.0);

const widthInCanvas = (w: number): string => `${(w / CANVAS_WIDTH) * 100}%`;
const heightInCanvas = (h: number): string => `${(h / CANVAS_HEIGHT) * 100}%`;

const Canvas = () => {
  const [top, setTop] = useAtom(topCanvas);
  const [left, setLeft] = useAtom(leftCanvas);
  const [zoom, setZoom] = useAtom(zoomCanvas);
  const [template] = useAtom(certifTemplate);
  const [cObjects, setCObjects] = useAtom(canvasObjects);
  const [mousePosRelativeToTemplate, setMousePosRelativeToTemplate] = useAtom(
    mousePosRelativeToTemplateAtom
  );
  const [activeToolbar] = useAtom(activeToolbarAtom);
  const [selected, setSelected] = useAtom(selectedObject);
  const [ctrlKey, setCtrlKey] = useAtom(ctrlKeyAtom);
  const [spaceKey, setSpaceKey] = useAtom(spaceKeyAtom);
  const [isMouseOutsideCanvas, setIsMouseOutsideCanvas] = useAtom(isMouseOutsideCanvasAtom);
  const { height, width } = useWindowSize();
  const [initialized, setInitialized] = useState<boolean>(false);
  const [triggerPan, setTriggerPan] = useState<boolean>(false);
  const [windowRef, { width: windowW, height: windowH }] = useMeasure<HTMLDivElement>();
  const [canvasRef, { width: canvasW, height: canvasH }] = useMeasure<HTMLDivElement>();

  useMount(() => {
    setTimeout(
      () => {
        setTop(-(CANVAS_HEIGHT * zoom - height) / 2);
        setLeft(-(CANVAS_WIDTH * zoom - width + 320 - 64) / 2);

        setInitialized(true);
      },
      import.meta.env.DEV ? 100 : 1000
    );
  });

  useEffect(() => {
    if (!isMouseOutsideCanvas) document.body.style.cursor = 'default';
    else if (spaceKey && !triggerPan) document.body.style.cursor = 'grab';
    else if (spaceKey && triggerPan) document.body.style.cursor = 'grabbing';
    else if (activeToolbar === 'text') document.body.style.cursor = 'text';
    else document.body.style.cursor = 'default';
  }, [triggerPan, spaceKey, activeToolbar, isMouseOutsideCanvas]);

  useEffect(() => {
    const handleMouseUp = () => setTriggerPan(false);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Control' || e.metaKey) setCtrlKey(true);
      if (e.key === ' ') setSpaceKey(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control' || e.metaKey) setCtrlKey(false);
      if (e.key === ' ') setSpaceKey(false);
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setCtrlKey, setSpaceKey]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (ctrlKey) e.preventDefault();
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => window.removeEventListener('wheel', handleWheel);
  }, [ctrlKey]);

  // mouse position listener relative to certif template
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!selected) {
        const { clientX, clientY } = e;

        const relativeToCanvasX = (CANVAS_WIDTH / 2 - template.width / 2) * zoom;
        const relativeToCanvasY = (CANVAS_HEIGHT / 2 - template.height / 2) * zoom;

        const newPosition = {
          x: -(left + relativeToCanvasX - clientX),
          y: -(top + relativeToCanvasY - clientY),
        };

        setMousePosRelativeToTemplate(newPosition);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [left, top, template.width, template.height, selected, setMousePosRelativeToTemplate, zoom]);

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

    if (newLeft >= 0 || newTop >= 0 || newZoom > 100) return;
    if (
      newLeft <= -(CANVAS_WIDTH * newZoom - windowW) ||
      newTop <= -(CANVAS_HEIGHT * newZoom - windowH)
    )
      return;

    setZoom(newZoom);
    setTop((t) => t + Ty);
    setLeft((l) => l + Tx);
  };

  const handleAddObject = () => {
    let count = 0;
    const newId = uuid();

    if (activeToolbar === 'text' && !spaceKey) {
      Object.values(cObjects).forEach(({ type }) => {
        if (type === 'text') count++;
      });

      setCObjects({
        ...cObjects,
        [newId]: {
          type: 'text',
          data: {
            align: 'center',
            color: '#000',
            family: 'Roboto',
            id: newId,
            size: 32,
            text: `Text-${count + 1}`,
            weight: '400',
            x: mousePosRelativeToTemplate.x,
            y: mousePosRelativeToTemplate.y - (32 * 1.2) / 2,
          },
        },
      });
    }
  };

  const handleDeselect = () => {
    if (!spaceKey) setSelected('');
  };

  if (!initialized)
    return (
      <Flex
        background="gray.100"
        height={height}
        w="calc(100% - 320px)"
        justifyContent="center"
        alignItems="center"
      >
        <Loading />
      </Flex>
    );

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
        onClick={handleAddObject}
        userSelect="none"
        onMouseOver={() => {
          setIsMouseOutsideCanvas(true);
        }}
        onMouseLeave={() => {
          setIsMouseOutsideCanvas(false);
        }}
      >
        <Box w="1%" h="1%" background="blue.200" position="absolute" top="20%" left="20%" />
        <Box
          w={widthInCanvas(template.width)}
          h={heightInCanvas(template.height)}
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          userSelect="none"
          zIndex="10"
        >
          <Image
            height="100%"
            width="100%"
            src={template.file}
            draggable={false}
            userSelect="none"
            zIndex="0"
          />
          {Object.values(cObjects).map(({ type, data }) => {
            if (type === 'text') return <CanvasText key={data.id} id={data.id} />;

            return null;
          })}

          {/* Background Layer Click Outside */}
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            zIndex="0"
            onClick={handleDeselect}
          ></Box>
        </Box>
        {/* Background Layer Click Outside */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          zIndex="0"
          onClick={handleDeselect}
        ></Box>
      </Box>

      {/* Zoom Indicator */}
      {import.meta.env.DEV ? (
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
      ) : null}
    </Box>
  );
};

export default memo(Canvas);
