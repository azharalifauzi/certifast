import {
  Box,
  Stack,
  Flex,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Portal,
  PopoverArrow,
  VStack,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
} from '@chakra-ui/react';
import { useAtom } from 'jotai';
import React from 'react';
import { BsCursor, BsCursorText, BsExclamationCircle } from 'react-icons/bs';
import {
  activeToolbar as activeToolbarAtom,
  certifTemplate,
  preventToolbar as preventToolbarAtom,
  preventCanvasShortcut as preventCanvasShortcutAtom,
} from 'gstates';
import { useEffect } from 'react';
import { useAtomValue } from 'jotai/utils';
import { useUndo } from 'hooks';

const Toolbar = () => {
  const [activeToolbar, setActiveToolbar] = useAtom(activeToolbarAtom);
  const certTemplate = useAtomValue(certifTemplate);
  const preventToolbar = useAtomValue(preventToolbarAtom);
  const preventCanvasShortcut = useAtomValue(preventCanvasShortcutAtom);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { undo, redo } = useUndo();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!preventCanvasShortcut)
        switch (e.key) {
          case 'y':
            if (e.ctrlKey || e.metaKey) redo();
            break;
          case 'z':
            if (e.ctrlKey || e.metaKey) undo();
            break;
          default:
            break;
        }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: false });

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [preventToolbar, setActiveToolbar, undo, redo, preventCanvasShortcut]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!preventToolbar)
        switch (e.key) {
          case 'v':
            setActiveToolbar('move');
            break;
          case 't':
            setActiveToolbar('text');
            break;
          default:
            break;
        }
    };

    window.addEventListener('keypress', handleKeyPress, { capture: false });

    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [preventToolbar, setActiveToolbar]);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return (
    <>
      <AboutModal isOpen={isOpen} onClose={onClose} />
      <Box
        background="gray.800"
        top="0"
        left="0"
        w="14"
        height="100%"
        position="fixed"
        zIndex="100"
      >
        <Stack height="100%" spacing="0">
          <ToolbarItem
            isActive={['move', 'resize'].includes(activeToolbar)}
            label="Move (V)"
            onClick={() => setActiveToolbar('move')}
          >
            <BsCursor color="white" size="24" style={{ transform: 'rotate(-90deg)' }} />
          </ToolbarItem>
          {certTemplate.file.length > 0 ? (
            <ToolbarItem
              isActive={activeToolbar === 'text'}
              label="Dynamic Text (T)"
              onClick={() => setActiveToolbar('text')}
            >
              <BsCursorText color="white" size="24" />
            </ToolbarItem>
          ) : null}
          <Box mt="auto !important">
            <Popover offset={[-10, 5]} placement="right-end">
              <PopoverTrigger>
                <Box>
                  <ToolbarItem label="About">
                    <BsExclamationCircle color="white" size="24" />
                  </ToolbarItem>
                </Box>
              </PopoverTrigger>
              <Portal>
                <PopoverArrow />
                <PopoverContent background="gray.800" color="white" w="48">
                  <PopoverBody px="0" fontSize="xs">
                    <VStack spacing={0} py="1">
                      <Box
                        onClick={() => {
                          const url = import.meta.env.VITE_TUTORIAL_URL as string;
                          window.open(url, '_blank');
                        }}
                        pl="6"
                        pr="3"
                        py="1"
                        w="100%"
                        _hover={{ background: 'blue.400' }}
                      >
                        <Text>Tutorial</Text>
                      </Box>
                      <Box
                        onClick={onOpen}
                        pl="6"
                        py="1"
                        w="100%"
                        _hover={{ background: 'blue.400' }}
                      >
                        <Text>About</Text>
                      </Box>
                    </VStack>
                  </PopoverBody>
                </PopoverContent>
              </Portal>
            </Popover>
          </Box>
        </Stack>
      </Box>
    </>
  );
};

export default Toolbar;

interface ToolbarItemProps {
  label?: string;
  isActive?: boolean;
  onClick?(): void;
  style?: React.CSSProperties;
}

const ToolbarItem: React.FC<ToolbarItemProps> = ({ label, isActive, children, onClick, style }) => {
  return (
    <Tooltip label={label} placement="right">
      <Flex
        style={style}
        _hover={{ background: isActive ? undefined : 'black' }}
        justifyContent="center"
        alignItems="center"
        as="button"
        h="14"
        w="14"
        background={isActive ? 'blue.400' : undefined}
        onClick={onClick}
      >
        {children}
      </Flex>
    </Tooltip>
  );
};

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isCentered isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="md">About</ModalHeader>
        <ModalCloseButton />
        <ModalBody fontSize="sm" pb="8">
          <Text mb="1" fontWeight="bold">
            App version:{' '}
          </Text>
          <Text mb="4">{import.meta.env.VITE_APP_VERSION}</Text>
          <Text mb="1" fontWeight="bold">
            Contact Support:{' '}
          </Text>
          <Text>
            <a href="mailto:certifast.app@gmail.com">certifast.app@gmail.com</a>
          </Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
