import React from 'react';
import { Box } from '@chakra-ui/react';
import AdsenseCard from './adsense-card';

const AdsenseBar = () => {
  return (
    <Box
      zIndex={100}
      w="320px"
      p="2.5"
      position="fixed"
      right="0"
      top="0"
      bottom="0"
      bg="white"
      gridTemplateRows="repeat(3, 250px)"
      display="grid"
      gridGap="5"
      overflowY="auto"
    >
      <AdsenseCard />
      <AdsenseCard />
      <AdsenseCard />
    </Box>
  );
};

export default AdsenseBar;
