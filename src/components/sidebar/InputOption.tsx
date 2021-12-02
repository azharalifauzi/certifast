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
} from '@chakra-ui/react';
import {
  canvasObjects,
  dynamicTextInput,
  preventToolbar as preventToolbarAtom,
  preventCanvasShortcut as preventCanvasShortcutAtom,
  updateV1Atom,
} from 'gstates';
import { useAtom } from 'jotai';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import React, { memo, useState, useEffect } from 'react';
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

const ManageInputSpreadSheet: React.FC<ManageInputSpreadSheetProps> = ({ isOpen, onClose }) => {
  const [inputs, setInputs] = useAtom(dynamicTextInput);
  const cObjects = useAtomValue(canvasObjects);
  const [bodyRef, { height }] = useMeasure<HTMLDivElement>();
  const [data, setData] = useState<Record<string, string>[]>([]);

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

      setData(array);
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

  return (
    <Modal size="6xl" isCentered isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent height="80%">
        <ModalHeader>Manage Input</ModalHeader>
        <ModalCloseButton />
        <ModalBody ref={bodyRef} height="100%">
          <DataSheetGrid
            height={height - 85}
            value={data}
            columns={columns}
            onChange={(value: Record<string, string>[]) => {
              const data: Record<string, string[]> = {};

              value.forEach((val) => {
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
              setData(value);
            }}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
