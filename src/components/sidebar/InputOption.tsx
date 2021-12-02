import {
  Box,
  Button,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  PopoverArrow,
  PopoverFooter,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Badge,
  ModalFooter,
  useToast,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from '@chakra-ui/react';
import {
  canvasObjects,
  dynamicTextInput,
  preventToolbar as preventToolbarAtom,
  preventCanvasShortcut as preventCanvasShortcutAtom,
  updateV1Atom,
} from 'gstates';
import { atom, useAtom } from 'jotai';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import React, { memo, useState, useEffect, useRef } from 'react';
import { textColumn, DataSheetGrid, keyColumn, Column } from 'react-datasheet-grid';
import { useMeasure } from 'react-use';
import cloneDeep from 'clone-deep';

const InputOption = () => {
  const [updateV1, setUpdateV1] = useAtom(updateV1Atom);
  const setPreventToolbar = useUpdateAtom(preventToolbarAtom);
  const setPreventCanvasShortcut = useUpdateAtom(preventCanvasShortcutAtom);
  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <>
      <ManageInputSpreadSheet
        isOpen={isOpen}
        onClose={() => {
          setPreventToolbar(false);
          setPreventCanvasShortcut(false);
          onClose();
        }}
      />
      <Box h="calc(100% - 45.8px)" overflowY="auto">
        <Box p="4">
          <Popover
            isOpen={updateV1.manageInputPopover}
            onClose={() => setUpdateV1({ ...updateV1, manageInputPopover: false })}
            placement="bottom"
            offset={[-30, 15]}
            closeOnBlur={false}
          >
            <PopoverTrigger>
              <Button
                onClick={() => {
                  setPreventToolbar(true);
                  setPreventCanvasShortcut(true);
                  onOpen();
                }}
                w="100%"
                size="sm"
                variant="outline"
                colorScheme="whatsapp"
              >
                Manage Input
              </Button>
            </PopoverTrigger>
            <PopoverContent bg="whatsapp.500" color="white">
              <PopoverArrow bg="whatsapp.500" />
              <PopoverHeader fontWeight="semibold">New way managing input</PopoverHeader>
              <PopoverBody>
                We have a new way to manage input. Feel the experience editing in spreadsheet. Try
                it!
              </PopoverBody>
              <PopoverFooter border="none" display="flex" justifyContent="flex-end" mt="4">
                <Button
                  onClick={() => setUpdateV1({ ...updateV1, manageInputPopover: false })}
                  size="sm"
                  colorScheme="white"
                  bg="white"
                  color="whatsapp.500"
                  px="6"
                >
                  Oke
                </Button>
              </PopoverFooter>
            </PopoverContent>
          </Popover>
        </Box>
      </Box>
    </>
  );
};

export default memo(InputOption);

interface ManageInputSpreadSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const isSpreadSheetSavedAtom = atom<boolean>(true);

const ManageInputSpreadSheet: React.FC<ManageInputSpreadSheetProps> = ({ isOpen, onClose }) => {
  const [inputs, setInputs] = useAtom(dynamicTextInput);
  const cObjects = useAtomValue(canvasObjects);
  const [bodyRef, { height }] = useMeasure<HTMLDivElement>();
  const [draft, setDraft] = useState<Record<string, string>[]>([]);
  const [isSaved, setSaved] = useAtom(isSpreadSheetSavedAtom);
  const { isOpen: isAlertOpen, onOpen: onOpenAlert, onClose: onCloseAlert } = useDisclosure();

  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      const array = [];
      let maxLength = Math.max(...Object.values(inputs).map((val) => val.length));

      if (Object.keys(inputs).length === 0) maxLength = 0;

      for (let i = 0; i < maxLength; i++) {
        const arrayData: Record<string, string> = {};
        Object.keys(inputs).forEach((key) => {
          arrayData[key] = inputs[key][i];
        });

        array.push(arrayData);
      }

      if (maxLength < 100) {
        const length = 100 - maxLength;

        for (let i = 0; i < length; i++) {
          const arrayData: Record<string, string> = {};

          Object.keys(inputs).forEach((key) => {
            arrayData[key] = '';
          });

          array.push(arrayData);
        }
      }

      setDraft(array);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen)
      setInputs((inputs) => {
        const newInputs = cloneDeep(inputs);
        const maxLength = Math.max(...Object.values(inputs).map((val) => val.length));

        for (let i = 0; i < maxLength; i++) {
          const condition: boolean[] = [];

          Object.keys(inputs).forEach((key) => {
            if (inputs[key][i]) condition.push(false);
            else condition.push(true);
          });

          if (condition.every((val) => val)) {
            Object.keys(newInputs).forEach((key) => {
              delete newInputs[key][i];
            });
          }
        }

        Object.keys(newInputs).forEach((key) => {
          const newInput = newInputs[key].filter((val) => val !== undefined);
          newInputs[key] = newInput;
        });

        return newInputs;
      });
  }, [isOpen, setInputs]);

  const columns: Column[] = Object.values(cObjects)
    .map(({ type, data }) =>
      type === 'text' ? { ...keyColumn(data.id, textColumn), title: data.text, minWidth: 200 } : {}
    )
    .filter((val) => Object.keys(val).length > 0);

  const handleChange = (value: Record<string, string>[]) => {
    setDraft(value);
    setSaved(false);
  };

  const handleSave = () => {
    const data: Record<string, string[]> = {};

    draft.forEach((val) => {
      if (Object.keys(val).length === 0) {
        Object.keys(cObjects).forEach((key) => {
          val[key] = '';
        });
      }

      Object.keys(val).forEach((key) => {
        if (typeof data[key] === 'undefined') data[key] = [];

        data[key].push(val[key]);
      });
    });

    setInputs(data);
    setSaved(true);
    toast({
      position: 'top',
      status: 'success',
      description: 'Your input has been saved.',
    });
  };

  const handleClose = () => {
    if (isSaved) onClose();
    else onOpenAlert();
  };

  return (
    <>
      <SaveAlertModal
        onClose={onCloseAlert}
        isOpen={isAlertOpen}
        onForceExit={() => {
          onClose();
          setSaved(true);
        }}
      />
      <Modal size="6xl" isCentered isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent height="80%">
          <ModalHeader>
            <Box>
              Manage Input
              <Badge colorScheme={isSaved ? 'whatsapp' : 'red'} ml="2">
                {isSaved ? 'Saved' : 'Unsaved'}
              </Badge>
            </Box>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody ref={bodyRef} height="100%">
            <DataSheetGrid
              height={height - 70}
              value={draft}
              columns={columns}
              onChange={handleChange}
            />
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleClose} size="sm" mr="2" variant="outline" colorScheme="black">
              Cancel
            </Button>
            <Button onClick={handleSave} size="sm" colorScheme="blue">
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

interface SaveAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onForceExit: () => void;
}

const SaveAlertModal: React.FC<SaveAlertModalProps> = ({ isOpen, onClose, onForceExit }) => {
  const cancelRef = useRef(null);

  return (
    <AlertDialog isCentered isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
      <AlertDialogContent fontSize="sm">
        <AlertDialogHeader fontSize="md" fontWeight="bold">
          Cancel Without Saving
        </AlertDialogHeader>
        <AlertDialogBody>Are you sure? You can&apos;t undo this action afterwards.</AlertDialogBody>
        <AlertDialogFooter>
          <Button variant="outline" colorScheme="black" size="sm" ref={cancelRef} onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            colorScheme="red"
            variant="outline"
            onClick={() => {
              onForceExit();
              onClose();
            }}
            ml={3}
          >
            Don&apos;t Save
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
