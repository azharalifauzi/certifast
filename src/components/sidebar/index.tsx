import { Box, Button, Grid, GridItem, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import { canvasObjects, certifTemplate as certifTemplateAtom } from 'gstates';
import TextOption from './text-option';
import { useAtom } from 'jotai';
import InputOption from './input-option';
import { useUpdateAtom } from 'jotai/utils';
import { zoomCanvas } from 'components/canvas';

const Sidebar = () => {
  const [certifTemplate, setCertifTemplate] = useAtom(certifTemplateAtom);
  const [cObjects, setCObjects] = useAtom(canvasObjects);
  const setZoom = useUpdateAtom(zoomCanvas);
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
      {active === 'general' ? (
        <>
          <Box borderBottom="1px solid" borderColor="gray.300" p="4">
            <Button
              onClick={() => {
                setCObjects({});
                setCertifTemplate({
                  ...certifTemplate,
                  file: '',
                });
                setZoom(1.0);
              }}
              variant="outline"
              colorScheme="red"
              w="100%"
              size="sm"
            >
              Reset Project
            </Button>
          </Box>
          <TextOption />
          <Box borderBottom="1px solid" borderColor="gray.300" p="4">
            <Text fontWeight="medium" mb="4">
              Export
            </Text>
            <Button variant="outline" colorScheme="black" w="100%" size="sm">
              Generate Certificate
            </Button>
          </Box>
        </>
      ) : null}
      {active === 'input' ? (
        <>
          {Object.values(cObjects).reduce(
            (prev, curr) => prev + (curr.type === 'text' ? 1 : 0),
            0
          ) > 0 ? (
            <InputOption />
          ) : (
            <Box px="4" py="3" fontStyle="italic">
              You don&apos;t have any input, please add input using the toolbar on the left side.
            </Box>
          )}
        </>
      ) : null}
    </Box>
  );
};

export default Sidebar;
