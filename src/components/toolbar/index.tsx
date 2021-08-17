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
} from '@chakra-ui/react';
import { useAtom } from 'jotai';
import React from 'react';
import { BsCursor, BsCursorText, BsExclamationCircle } from 'react-icons/bs';
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
    <Box background="gray.800" top="0" left="0" w="14" height="100%" position="fixed" zIndex="100">
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
                    <Box pl="6" py="1" w="100%" _hover={{ background: 'blue.400' }}>
                      <Text>Tutorial</Text>
                    </Box>
                    <Box pl="6" py="1" w="100%" _hover={{ background: 'blue.400' }}>
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
