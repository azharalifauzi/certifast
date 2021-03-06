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
  shiftKey as shiftKeyAtom,
  isInsideCanvas as isMouseInsideCanvasAtom,
  willSnap,
  isObjectMoving as isObjectMovingAtom,
  activeEvent,
  multiSelected,
  newTextJustAddedID,
} from 'gstates';
import { v4 as uuid } from 'uuid';
import { atomWithStorage, useUpdateAtom } from 'jotai/utils';
import { debounce, measureText, SIDEBAR_WIDTH } from 'helpers';
import { useSelectionBox, useUndo } from 'hooks';
import MultiSelectBox from './MultiSelectBox';
import ScrollBar from './ScrollBar';
import cloneDeep from 'clone-deep';

const CANVAS_HEIGHT = 30_000;
const CANVAS_WIDTH = 30_000;

export const topCanvas = atom(CANVAS_HEIGHT / 2);
export const leftCanvas = atom(CANVAS_WIDTH / 2);
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
  const [activeToolbar, setActiveToolbar] = useAtom(activeToolbarAtom);
  const [selected, setSelected] = useAtom(selectedObject);
  const [ctrlKey, setCtrlKey] = useAtom(ctrlKeyAtom);
  const [spaceKey, setSpaceKey] = useAtom(spaceKeyAtom);
  const [shiftKey, setShiftKey] = useAtom(shiftKeyAtom);
  const [isMouseInsideCanvas, setIsMouseInsideCanvas] = useAtom(isMouseInsideCanvasAtom);
  const [_, setWillSnap] = useAtom(willSnap);
  const [isObjectMoving, setObjectMoving] = useAtom(isObjectMovingAtom);
  const [event, setEvent] = useAtom(activeEvent);
  const [multiSelectedObj] = useAtom(multiSelected);
  const setNewTextJustAddedID = useUpdateAtom(newTextJustAddedID);
  const { height, width } = useWindowSize();
  const [initialized, setInitialized] = useState<boolean>(false);
  const [triggerPan, setTriggerPan] = useState<boolean>(false);
  const [snapRulers, setSnapRulers] = useState<Ruler[]>([]);
  const [windowRef, { width: windowW, height: windowH }] = useMeasure<HTMLDivElement>();
  const [canvasRef, { width: canvasW, height: canvasH }] = useMeasure<HTMLDivElement>();

  const { pushToUndoStack } = useUndo();
  const { selectionBox, isSelecting } = useSelectionBox();

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
    if (!isMouseInsideCanvas) document.body.style.cursor = 'default';
    else if (activeToolbar === 'resize') document.body.style.cursor = 'nw-resize';
    else if (spaceKey && !triggerPan) document.body.style.cursor = 'grab';
    else if (spaceKey && triggerPan) document.body.style.cursor = 'grabbing';
    else if (activeToolbar === 'text') document.body.style.cursor = 'text';
    else document.body.style.cursor = 'default';
  }, [triggerPan, spaceKey, activeToolbar, isMouseInsideCanvas]);

  useEffect(() => {
    const handleMouseUp = () => {
      setTriggerPan(false);
      setEvent('idle');
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Control' || e.metaKey) setCtrlKey(true);
      if (e.key === ' ') setSpaceKey(true);
      if (e.shiftKey) setShiftKey(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control' || !e.metaKey) setCtrlKey(false);
      if (e.key === ' ') setSpaceKey(false);
      if (!e.shiftKey) setShiftKey(false);
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setCtrlKey, setSpaceKey, setShiftKey, setEvent]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isMouseInsideCanvas || (!isMouseInsideCanvas && (e.ctrlKey || e.metaKey)))
        e.preventDefault();
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => window.removeEventListener('wheel', handleWheel);
  }, [isMouseInsideCanvas]);

  // mouse position listener relative to certif template
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;

      const relativeToCanvasX = (CANVAS_WIDTH / 2 - template.width / 2) * zoom;
      const relativeToCanvasY = (CANVAS_HEIGHT / 2 - template.height / 2) * zoom;

      const newPosition = {
        x: -(left + relativeToCanvasX - clientX),
        y: -(top + relativeToCanvasY - clientY),
      };

      setMousePosRelativeToTemplate(newPosition);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [left, top, template.width, template.height, selected, setMousePosRelativeToTemplate, zoom]);

  // Effect to trigger rulers and snaps
  useEffect(() => {
    const rulers: Ruler[] = [];
    const selectedObj = cObjects[selected];
    const snapDuration = 0;
    let snapThreshold = 8;
    if (!selectedObj) return;
    if (selectedObj.data.isSnapped) snapThreshold = 0;
    const x = selectedObj.data.x / zoom;
    const y = selectedObj.data.y / zoom;
    const width = selectedObj.data.width ?? 0 / zoom;
    const height = selectedObj.data.height ?? 0 / zoom;
    const centerSelectedObj = [x + width / 2, y + height / 2];

    const snapVertical = (willSnapCondition: boolean, snapCondition: boolean, newX: number) => {
      if (!willSnapCondition) return;
      setWillSnap(true);
      if (snapCondition)
        setCObjects((obj) => {
          const newObj = { ...obj };
          newObj[selected].data.x = newX;
          newObj[selected].data.isSnapped = true;
          return newObj;
        });
      // cancel will snap so object can move again
      setTimeout(() => {
        setWillSnap(false);
      }, snapDuration);
    };

    const snapHorizontal = (willSnapCondition: boolean, snapCondition: boolean, newY: number) => {
      if (!willSnapCondition) return;
      setWillSnap(true);
      if (snapCondition)
        setCObjects((obj) => {
          const newObj = { ...obj };
          newObj[selected].data.y = newY;
          newObj[selected].data.isSnapped = true;
          return newObj;
        });
      // cancel will snap so object can move again
      setTimeout(() => {
        setWillSnap(false);
      }, snapDuration);
    };

    Object.values(cObjects).forEach((obj) => {
      if (!isObjectMoving) return;
      if (obj.data.id === selected) return;
      const _x = obj.data.x / zoom;
      const _y = obj.data.y / zoom;
      const _width = obj.data.width ?? 0 / zoom;
      const _height = obj.data.height ?? 0 / zoom;
      const centerObj = [_x + _width / 2, _y + _height / 2];

      /**
       * snap for left alignment
       */
      snapVertical(
        x - snapThreshold <= _x && x + snapThreshold >= _x,
        x.toFixed(0) !== _x.toFixed(0),
        _x * zoom
      );

      /**
       * snap for right alignment
       */
      snapVertical(
        x + width - snapThreshold <= _x + _width && x + width + snapThreshold >= _x + _width,
        (x + width).toFixed(0) !== (_x + _width).toFixed(0),
        (_x + _width - width) * zoom
      );

      /**
       * snap for center alignment
       */
      snapVertical(
        x + width / 2 - snapThreshold <= _x + _width / 2 &&
          x + width / 2 + snapThreshold >= _x + _width / 2,
        (x + width / 2).toFixed(0) !== (_x + _width / 2).toFixed(0),
        (_x + _width / 2 - width / 2) * zoom
      );

      /**
       * snap for left right alignment
       */
      snapVertical(
        x - snapThreshold <= _x + _width && x + snapThreshold >= _x + _width,
        x.toFixed(0) !== (_x + _width).toFixed(0),
        (_x + _width) * zoom
      );

      /**
       * snap for right left alignment
       */
      snapVertical(
        x + width - snapThreshold <= _x && x + width + snapThreshold >= _x,
        (x + width).toFixed(0) !== _x.toFixed(0),
        (_x - width) * zoom
      );

      /**
       * snap for left center alignment
       */
      snapVertical(
        x - snapThreshold <= _x + _width / 2 && x + snapThreshold >= _x + _width / 2,
        x.toFixed(0) !== (_x + _width / 2).toFixed(0),
        (_x + _width / 2) * zoom
      );

      /**
       * snap for right center alignment
       */
      snapVertical(
        x + width - snapThreshold <= _x + _width / 2 &&
          x + width + snapThreshold >= _x + _width / 2,
        (x + width).toFixed(0) !== (_x + _width / 2).toFixed(0),
        (_x + _width / 2 - width) * zoom
      );

      /**
       * snap for center to left alignment
       */
      snapVertical(
        x + width / 2 - snapThreshold <= _x && x + width / 2 + snapThreshold >= _x,
        (x + width / 2).toFixed(0) !== _x.toFixed(0),
        (_x - width / 2) * zoom
      );

      /**
       * snap for center to right alignment
       */
      snapVertical(
        x + width / 2 - snapThreshold <= _x + _width &&
          x + width / 2 + snapThreshold >= _x + _width,
        (x + width / 2).toFixed(0) !== (_x + _width).toFixed(0),
        (_x + _width - width / 2) * zoom
      );

      /**
       * snap for top to top alignment
       */
      snapHorizontal(
        y - snapThreshold <= _y && y + snapThreshold >= _y,
        y.toFixed(0) !== _y.toFixed(0),
        _y * zoom
      );

      /**
       * snap for top to center alignment
       */
      snapHorizontal(
        y - snapThreshold <= _y + _height / 2 && y + snapThreshold >= _y + _height / 2,
        y.toFixed(0) !== (_y + _height / 2).toFixed(0),
        (_y + _height / 2) * zoom
      );

      /**
       * snap for top to bottom alignment
       */
      snapHorizontal(
        y - snapThreshold <= _y + _height && y + snapThreshold >= _y + _height,
        y.toFixed(0) !== (_y + _height).toFixed(0),
        (_y + _height) * zoom
      );

      /**
       * snap for center to top alignment
       */
      snapHorizontal(
        y + height / 2 - snapThreshold <= _y && y + height / 2 + snapThreshold >= _y,
        (y + height / 2).toFixed(0) !== _y.toFixed(0),
        (_y - height / 2) * zoom
      );

      /**
       * snap for center to center alignment
       */
      snapHorizontal(
        y + height / 2 - snapThreshold <= _y + _height / 2 &&
          y + height / 2 + snapThreshold >= _y + _height / 2,
        (y + height / 2).toFixed(0) !== (_y + _height / 2).toFixed(0),
        (_y + _height / 2 - height / 2) * zoom
      );

      /**
       * snap for center to bottom alignment
       */
      snapHorizontal(
        y + height / 2 - snapThreshold <= _y + _height &&
          y + height / 2 + snapThreshold >= _y + _height,
        (y + height / 2).toFixed(0) !== (_y + _height).toFixed(0),
        (_y + _height - height / 2) * zoom
      );

      /**
       * snap for bottom to top alignment
       */
      snapHorizontal(
        y + height - snapThreshold <= _y && y + height + snapThreshold >= _y,
        (y + height).toFixed(0) !== _y.toFixed(0),
        (_y - height) * zoom
      );

      /**
       * snap for bottom to center alignment
       */
      snapHorizontal(
        y + height - snapThreshold <= _y + _height / 2 &&
          y + height + snapThreshold >= _y + _height / 2,
        (y + height).toFixed(0) !== (_y + _height / 2).toFixed(0),
        (_y + _height / 2 - height) * zoom
      );

      /**
       * snap for bottom to bottom alignment
       */
      snapHorizontal(
        y + height - snapThreshold <= _y + _height && y + height + snapThreshold >= _y + _height,
        (y + height).toFixed(0) !== (_y + _height).toFixed(0),
        (_y + _height - height) * zoom
      );

      /**
       * rulers for center to center, center to left, center to right vertical
       */
      if (
        centerSelectedObj[0].toFixed(0) === centerObj[0].toFixed(0) ||
        centerSelectedObj[0].toFixed(0) === _x.toFixed(0) ||
        centerSelectedObj[0].toFixed(0) === (_x + _width).toFixed(0)
      ) {
        // if selected object at the bottom of target
        if (centerSelectedObj[1] - centerObj[1] > 0) {
          rulers.push({
            x: centerSelectedObj[0] * zoom,
            y: _y * zoom,
            width: '1px',
            height: (height + _height + y - _y - _height) * zoom,
          });
        } else {
          rulers.push({
            x: centerSelectedObj[0] * zoom,
            y: y * zoom,
            width: '1px',
            height: (height + _height + _y - y - height) * zoom,
          });
        }
      }

      /**
       * rulers for left to left, left to right, left to center vertical
       */
      if (
        x.toFixed(0) === _x.toFixed(0) ||
        x.toFixed(0) === (_x + _width).toFixed(0) ||
        x.toFixed(0) === (_x + _width / 2).toFixed(0)
      ) {
        // if selected object at the bottom of target
        if (y - _y > 0) {
          rulers.push({
            x: x * zoom,
            y: _y * zoom,
            width: '1px',
            height: (height + _height + y - _y - _height) * zoom,
          });
        } else {
          rulers.push({
            x: x * zoom,
            y: y * zoom,
            width: '1px',
            height: (height + _height + _y - y - height) * zoom,
          });
        }
      }

      /**
       * rulers for right to right, right to left, right to center vertical
       */
      if (
        (x + width).toFixed(0) === (_x + _width).toFixed(0) ||
        (x + width).toFixed(0) === _x.toFixed(0) ||
        (x + width).toFixed(0) === (_x + _width / 2).toFixed(0)
      ) {
        // if selected object at the bottom of target
        if (y - _y > 0) {
          rulers.push({
            x: (x + width - 10) * zoom + 2,
            y: _y * zoom,
            width: '1px',
            height: (height + _height + y - _y - _height) * zoom,
          });
        } else {
          rulers.push({
            x: (x + width - 10) * zoom + 2,
            y: y * zoom,
            width: '1px',
            height: (height + _height + _y - y - height) * zoom,
          });
        }
      }

      /**
       * rulers for top to top, top to center, top to bottom horizontal
       */
      if (
        y.toFixed(0) === _y.toFixed(0) ||
        y.toFixed(0) == (_y + _height).toFixed(0) ||
        y.toFixed(0) === (_y + _height / 2).toFixed(0)
      ) {
        // if selected object at the right of target
        if (x - _x > 0) {
          rulers.push({
            x: _x * zoom,
            y: y * zoom,
            width: (_width + width + x - _x - _width) * zoom,
            height: '1px',
          });
        } else {
          rulers.push({
            x: x * zoom,
            y: y * zoom,
            width: (_width + width + _x - width - x) * zoom,
            height: '1px',
          });
        }
      }

      /**
       * rulers for center to top, center to center, center to bottom horizontal
       */
      if (
        (y + height / 2).toFixed(0) === _y.toFixed(0) ||
        (y + height / 2).toFixed(0) == (_y + _height).toFixed(0) ||
        (y + height / 2).toFixed(0) === (_y + _height / 2).toFixed(0)
      ) {
        // if selected object at the right of target
        if (x - _x > 0) {
          rulers.push({
            x: _x * zoom,
            y: (y + height / 2) * zoom,
            width: (_width + width + x - _x - _width) * zoom,
            height: '1px',
          });
        } else {
          rulers.push({
            x: x * zoom,
            y: (y + height / 2) * zoom,
            width: (_width + width + _x - width - x) * zoom,
            height: '1px',
          });
        }
      }

      /**
       * rulers for bottom to top, bottom to center, bottom to bottom horizontal
       */
      if (
        (y + height).toFixed(0) === _y.toFixed(0) ||
        (y + height).toFixed(0) == (_y + _height).toFixed(0) ||
        (y + height).toFixed(0) === (_y + _height / 2).toFixed(0)
      ) {
        // if selected object at the right of target
        if (x - _x > 0) {
          rulers.push({
            x: _x * zoom,
            y: (y + height - 10) * zoom + 2,
            width: (_width + width + x - _x - _width) * zoom,
            height: '1px',
          });
        } else {
          rulers.push({
            x: x * zoom,
            y: (y + height - 10) * zoom + 2,
            width: (_width + width + _x - width - x) * zoom,
            height: '1px',
          });
        }
      }
    });

    if (isObjectMoving) {
      /**
       * snap and rulers for center to center of template
       */
      if ((x + width / 2).toFixed(0) === (template.width / 2).toFixed(0)) {
        rulers.push({
          x: (template.width / 2) * zoom,
          y: 0,
          width: '1px',
          height: template.height * zoom,
        });
      }

      if ((y + height / 2).toFixed(0) === (template.height / 2).toFixed(0)) {
        rulers.push({
          x: 0,
          y: (template.height / 2) * zoom,
          width: template.width * zoom,
          height: '1px',
        });
      }

      snapVertical(
        x + width / 2 - snapThreshold <= template.width / 2 &&
          x + width / 2 + snapThreshold >= template.width / 2,
        (x + width / 2).toFixed(0) !== (template.width / 2).toFixed(0),
        (template.width / 2 - width / 2) * zoom
      );

      snapHorizontal(
        y + height / 2 - snapThreshold <= template.height / 2 &&
          y + height / 2 + snapThreshold >= template.height / 2,
        (y + height / 2).toFixed(0) !== (template.height / 2).toFixed(0),
        (template.height / 2 - height / 2) * zoom
      );
    }

    setSnapRulers(rulers);
  }, [cObjects, selected, zoom, setCObjects, setWillSnap, isObjectMoving, template]);

  // Effect for trigger moving object using arrow keys
  useEffect(() => {
    const handleMovingFalse = debounce(() => setObjectMoving(false), 800);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (selected) {
        switch (e.key) {
          case 'ArrowUp':
            setObjectMoving(true);
            setCObjects((obj) => {
              const newObj = cloneDeep(obj);
              if (e.shiftKey) newObj[selected].data.y -= 10;
              else newObj[selected].data.y--;
              return newObj;
            });
            break;
          case 'ArrowDown':
            setObjectMoving(true);
            setCObjects((obj) => {
              const newObj = cloneDeep(obj);
              if (e.shiftKey) newObj[selected].data.y += 10;
              else newObj[selected].data.y++;
              return newObj;
            });
            break;
          case 'ArrowLeft':
            setObjectMoving(true);
            setCObjects((obj) => {
              const newObj = cloneDeep(obj);
              if (e.shiftKey) newObj[selected].data.x -= 10;
              else newObj[selected].data.x--;
              return newObj;
            });
            break;
          case 'ArrowRight':
            setObjectMoving(true);
            setCObjects((obj) => {
              const newObj = cloneDeep(obj);
              if (e.shiftKey) newObj[selected].data.x += 10;
              else newObj[selected].data.x++;
              return newObj;
            });
            break;
          default:
            break;
        }
        handleMovingFalse();
        return;
      }

      if (multiSelectedObj.length > 1) {
        switch (e.key) {
          case 'ArrowUp':
            setObjectMoving(true);
            setCObjects((obj) => {
              const newObj = cloneDeep(obj);
              multiSelectedObj.forEach((id) => {
                if (e.shiftKey) newObj[id].data.y -= 10;
                else newObj[id].data.y--;
              });
              return newObj;
            });
            break;
          case 'ArrowDown':
            setObjectMoving(true);
            setCObjects((obj) => {
              const newObj = cloneDeep(obj);
              multiSelectedObj.forEach((id) => {
                if (e.shiftKey) newObj[id].data.y += 10;
                else newObj[id].data.y++;
              });
              return newObj;
            });
            break;
          case 'ArrowLeft':
            setObjectMoving(true);
            setCObjects((obj) => {
              const newObj = cloneDeep(obj);
              multiSelectedObj.forEach((id) => {
                if (e.shiftKey) newObj[id].data.x -= 10;
                else newObj[id].data.x--;
              });
              return newObj;
            });
            break;
          case 'ArrowRight':
            setObjectMoving(true);
            setCObjects((obj) => {
              const newObj = cloneDeep(obj);
              multiSelectedObj.forEach((id) => {
                if (e.shiftKey) newObj[id].data.x += 10;
                else newObj[id].data.x++;
              });
              return newObj;
            });
            break;
          default:
            break;
        }
        handleMovingFalse();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: false });

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selected, setCObjects, setObjectMoving, multiSelectedObj]);

  const handleWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    const { clientX, clientY, deltaY, deltaX } = e;

    // Zoom
    if (e.ctrlKey || ctrlKey) {
      // Track point mouse
      const xf = clientX - left;
      const yf = clientY - top;

      // scale
      const delta = deltaY;
      const add = Math.abs(deltaY) > 100 ? deltaY * 0.001 : deltaY * 0.01;
      let scaleIn = 1 + Math.abs(add);

      if (scaleIn > 2) {
        scaleIn = 1.5;
      }

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

      return;
    }
    // Scroll Y
    const newY = top - deltaY;
    if (newY <= 0 && newY >= -(canvasH - windowH)) setTop(newY);

    // Scroll X
    const newX = left - deltaX;
    if (newX <= 0 && newX >= -(canvasW - windowW)) setLeft((l) => l - deltaX);
  };

  const handleAddObject = () => {
    let count = 0;
    const newId = uuid();

    if (activeToolbar === 'text' && !spaceKey) {
      Object.values(cObjects).forEach(({ type }) => {
        if (type === 'text') count++;
      });
      pushToUndoStack(cObjects);
      const text = `Text-${count + 1}`;
      const weight = '400';
      const family = 'Roboto';
      const size = 32;
      const { height, width } = measureText(text, family, size, weight);
      setCObjects({
        ...cObjects,
        [newId]: {
          type: 'text',
          data: {
            text,
            weight,
            family,
            size,
            height,
            width,
            align: 'center',
            color: '#000',
            id: newId,
            x: mousePosRelativeToTemplate.x,
            y: mousePosRelativeToTemplate.y - (32 * 1.2) / 2,
            isSnapped: false,
          },
        },
      });
      setNewTextJustAddedID(newId);
      setActiveToolbar('move');
      setSelected(newId);
    }
  };

  const handleDeselect = () => {
    if (!spaceKey) {
      // setSelected('');
      setSnapRulers([]);
    }
  };

  if (!initialized)
    return (
      <Flex
        background="gray.100"
        height={height}
        w={`calc(100% - ${SIDEBAR_WIDTH}px)`}
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
        if (spaceKey) setEvent('pan');
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
          setIsMouseInsideCanvas(true);
        }}
        onMouseLeave={() => {
          setIsMouseInsideCanvas(false);
        }}
      >
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
            alt="Certificate Template"
            id="certif-template"
          />
          {Object.values(cObjects).map(({ type, data }) => {
            if (type === 'text') return <CanvasText key={data.id} id={data.id} />;

            return null;
          })}

          {/* Snap Ruler Component */}
          {snapRulers?.map(({ x, y, width, height }, i) => (
            <Box
              key={`rulers-${i}`}
              position="absolute"
              top={y}
              left={x}
              width={width}
              height={height}
              background="purple.600"
            />
          ))}

          {/* Selection Box */}
          {isSelecting && !spaceKey && event === 'multiselect' ? (
            <Box
              style={{
                height: selectionBox.height,
                width: selectionBox.width,
                top: selectionBox.y,
                left: selectionBox.x,
              }}
              position="absolute"
              background="blue.400"
              border="2px solid"
              borderColor="blue.600"
              opacity={0.4}
            />
          ) : null}

          {/* Multi Select Box */}
          {multiSelectedObj.length > 0 ? <MultiSelectBox /> : null}

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

      {/* ScrollBar Component */}
      {zoom > 0.35 ? (
        <ScrollBar
          windowH={windowH}
          windowW={windowW}
          canvasH={CANVAS_HEIGHT * zoom}
          canvasW={CANVAS_WIDTH * zoom}
        />
      ) : null}

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
