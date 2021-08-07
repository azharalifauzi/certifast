import { Box, Stack, Flex } from '@chakra-ui/react';
import React from 'react';
import { BsCursor, BsCursorText } from 'react-icons/bs';

const Toolbar = () => {
  return (
    <Box background="gray.800" top="0" bottom="0" left="0" w="14" position="fixed" zIndex="100">
      <Stack spacing="0">
        <Flex
          _hover={{ background: 'black' }}
          justifyContent="center"
          alignItems="center"
          as="button"
          h="14"
          w="14"
          background="blue.400"
        >
          <BsCursor color="white" size="24" style={{ transform: 'rotate(-90deg)' }} />
        </Flex>
        <Flex
          _hover={{ background: 'black' }}
          justifyContent="center"
          alignItems="center"
          as="button"
          h="14"
          w="14"
        >
          <BsCursorText color="white" size="24" />
        </Flex>
      </Stack>
    </Box>
  );
};

export default Toolbar;
