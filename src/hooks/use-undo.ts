import cloneDeep from 'clone-deep';
import { CanvasObject, canvasObjects } from 'gstates';
import { atom, useAtom } from 'jotai';
import { useCallback } from 'react';

const undoStackAtom = atom<Record<string, CanvasObject>[]>([]);
const redoStackAtom = atom<Record<string, CanvasObject>[]>([]);

export const useUndo = () => {
  const [cObjects, setCObjects] = useAtom(canvasObjects);
  const [undoStack, setUndoStack] = useAtom(undoStackAtom);
  const [redoStack, setRedoStack] = useAtom(redoStackAtom);

  const pushToUndoStack = useCallback(
    function (newObj: Record<string, CanvasObject>) {
      setUndoStack((stack) => {
        const newStack = cloneDeep(stack);
        newStack.push(newObj);
        if (newStack.length >= 50) newStack.shift();
        return newStack;
      });
      setRedoStack([]);
    },
    [setRedoStack, setUndoStack]
  );

  const undo = useCallback(
    function () {
      if (!undoStack.length) return;
      const newUndoStack = cloneDeep(undoStack);
      const newRedoStack = cloneDeep(redoStack);

      const newCObjects = newUndoStack.pop();
      if (newCObjects) {
        newRedoStack.push(cObjects);
        setCObjects(newCObjects);
      }

      setUndoStack(newUndoStack);
      setRedoStack(newRedoStack);
    },
    [undoStack, redoStack, setCObjects, setUndoStack, setRedoStack, cObjects]
  );

  const redo = useCallback(
    function () {
      if (!redoStack.length) return;
      const newUndoStack = cloneDeep(undoStack);
      const newRedoStack = cloneDeep(redoStack);

      const newCObjects = newRedoStack.pop();
      if (newCObjects) {
        newUndoStack.push(cObjects);
        setCObjects(newCObjects);
      }

      setUndoStack(newUndoStack);
      setRedoStack(newRedoStack);
    },
    [undoStack, redoStack, setCObjects, setUndoStack, setRedoStack, cObjects]
  );

  return { pushToUndoStack, undoStack, redoStack, undo, redo };
};
