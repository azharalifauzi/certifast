import { Box, Stack, Flex, Tooltip, useDisclosure, Button, Text } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import React from 'react';
import { BsCursor, BsCursorText, BsGear } from 'react-icons/bs';
import {
  activeToolbar as activeToolbarAtom,
  certifTemplate,
  preventToolbar as preventToolbarAtom,
  preventCanvasShortcut as preventCanvasShortcutAtom,
} from 'gstates';
import { useEffect } from 'react';
import { useAtomValue } from 'jotai/utils';
import { useUndo } from 'hooks';
import { LogoCertifastFull } from 'assets';
import { COMPONENT_ID } from 'helpers';
import * as gtag from 'libs/gtag';
import SettingsModal from './SettingsModal';

const Toolbar = () => {
  const [activeToolbar, setActiveToolbar] = useAtom(activeToolbarAtom);
  const certTemplate = useAtomValue(certifTemplate);
  const preventToolbar = useAtomValue(preventToolbarAtom);
  const preventCanvasShortcut = useAtomValue(preventCanvasShortcutAtom);
  const {
    isOpen: isSettingsModalOpen,
    onOpen: onOpenSettingsModal,
    onClose: onCloseSettingsModal,
  } = useDisclosure();
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
          case 's':
            onOpenSettingsModal();
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
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => {
          onCloseSettingsModal();
        }}
      />
      <Box
        background="white"
        top="3"
        left="3"
        height="14"
        position="fixed"
        zIndex="100"
        borderRadius="md"
        overflow="hidden"
        boxShadow="lg"
        px="4"
        display="flex"
        alignItems="center"
      >
        <Box maxW="28">
          <LogoCertifastFull width="100%" />
        </Box>
        <Box h="6" w="2px" background="blackAlpha.300" mx="2" />
        <Text fontWeight="semibold" mx="2">
          Make Certificate Faster
        </Text>
        <Box h="6" w="2px" background="blackAlpha.300" ml="2" mr="4" />
        <Button
          onClick={() => {
            gtag.event({
              action: 'checkout_donate',
              label: 'karya karsa',
              category: 'engagement',
              value: 0,
            });
          }}
          zIndex="100"
          colorScheme="whatsapp"
          w="32"
          size="sm"
        >
          Donate
        </Button>
      </Box>

      <Box
        background="white"
        top="50%"
        transform="translateY(-50%)"
        left="3"
        w="14"
        height="auto"
        position="fixed"
        zIndex="100"
        borderRadius="md"
        overflow="hidden"
        boxShadow="lg"
      >
        <Stack height="100%" spacing="0">
          <ToolbarItem
            isActive={['move', 'resize'].includes(activeToolbar)}
            label="Move (V)"
            onClick={() => setActiveToolbar('move')}
          >
            <BsCursor color="black" size="24" style={{ transform: 'rotate(-90deg)' }} />
          </ToolbarItem>
          {certTemplate.file.length > 0 ? (
            <ToolbarItem
              isActive={activeToolbar === 'text'}
              label="Dynamic Text (T)"
              onClick={() => setActiveToolbar('text')}
              id={COMPONENT_ID.DYNAMIC_TEXT}
            >
              <BsCursorText color="black" size="24" />
            </ToolbarItem>
          ) : null}
          <ToolbarItem
            id={COMPONENT_ID.SETTINGS}
            label="Settings (S)"
            onClick={() => onOpenSettingsModal()}
          >
            <BsGear color="black" size="24" />
          </ToolbarItem>
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
  id?: string;
}

// eslint-disable-next-line react/display-name
const ToolbarItem: React.FC<ToolbarItemProps> = ({
  label,
  isActive,
  children,
  onClick,
  style,
  id,
}) => {
  return (
    <Tooltip closeOnMouseDown openDelay={500} label={label} placement="right">
      <Flex
        style={style}
        _hover={{ background: isActive ? undefined : 'blue.200' }}
        justifyContent="center"
        alignItems="center"
        as="button"
        h="14"
        w="14"
        background={isActive ? 'blue.200' : undefined}
        onClick={onClick}
        id={id}
      >
        {children}
      </Flex>
    </Tooltip>
  );
};
