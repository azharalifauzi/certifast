import { Box, Stack, Flex, Tooltip } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import React from 'react';
import { BsCursor, BsCursorText } from 'react-icons/bs';
import {
  activeToolbar as activeToolbarAtom,
  certifTemplate,
  preventToolbar as preventToolbarAtom,
} from 'gstates';
import { useEffect } from 'react';
import { useAtomValue } from 'jotai/utils';

const Toolbar = () => {
  const [activeToolbar, setActiveToolbar] = useAtom(activeToolbarAtom);
  const certTemplate = useAtomValue(certifTemplate);
  const preventToolbar = useAtomValue(preventToolbarAtom);

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

    window.addEventListener('keypress', handleKeyPress);

    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [preventToolbar]);

  return (
    <Box background="gray.800" top="0" bottom="0" left="0" w="14" position="fixed" zIndex="100">
      <Stack spacing="0">
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
      </Stack>
    </Box>
  );
};

export default Toolbar;

interface ToolbarItemProps {
  label?: string;
  isActive?: boolean;
  onClick?(): void;
}

const ToolbarItem: React.FC<ToolbarItemProps> = ({ label, isActive, children, onClick }) => {
  return (
    <Tooltip label={label} placement="right">
      <Flex
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
