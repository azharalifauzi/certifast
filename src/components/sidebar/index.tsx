import { Box, Grid, GridItem } from '@chakra-ui/react';
import React, { useState } from 'react';
import TextOption from './text-option';

const Sidebar = () => {
  const [active, setActive] = useState<'general' | 'input'>('general');

  return (
    <Box
      background="white"
      top={0}
      bottom={0}
      right={0}
      w="72"
      position="fixed"
      zIndex="100"
      boxShadow="sm"
      fontSize="sm"
    >
      <Grid
        gridAutoColumns="max-content"
        gap="3"
        px="4"
        py="3"
        gridAutoFlow="column"
        fontWeight="semibold"
        borderBottom="1px solid"
        borderColor="gray.300"
      >
        <GridItem
          onClick={() => setActive('general')}
          _hover={{ color: 'black' }}
          color={active === 'general' ? 'black' : 'gray.400'}
        >
          General
        </GridItem>
        <GridItem
          onClick={() => setActive('input')}
          _hover={{ color: 'black' }}
          color={active === 'input' ? 'black' : 'gray.400'}
        >
          Input
        </GridItem>
      </Grid>
      {active === 'general' ? <TextOption /> : null}
      {active === 'input' ? (
        <Box px="4" py="3" fontStyle="italic">
          You don&apos;t have any input, please add input using the toolbar on the left side.
        </Box>
      ) : null}
    </Box>
  );
};

export default Sidebar;
