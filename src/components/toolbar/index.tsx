import { Box, Stack, Flex, Tooltip } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import React from 'react';
import { BsCursor, BsCursorText } from 'react-icons/bs';
import { activeToolbar as activeToolbarAtom } from 'gstates';

const Toolbar = () => {
  const [activeToolbar, setActiveToolbar] = useAtom(activeToolbarAtom);

  return (
    <Box background="gray.800" top="0" bottom="0" left="0" w="14" position="fixed" zIndex="100">
      <Stack spacing="0">
        <ToolbarItem
          isActive={activeToolbar === 'move'}
          label="Move"
          onClick={() => setActiveToolbar('move')}
        >
          <BsCursor color="white" size="24" style={{ transform: 'rotate(-90deg)' }} />
        </ToolbarItem>
        <ToolbarItem
          isActive={activeToolbar === 'text'}
          label="Add Text"
          onClick={() => setActiveToolbar('text')}
        >
          <BsCursorText color="white" size="24" />
        </ToolbarItem>
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
