import React from 'react';
import { Box, Skeleton, Flex } from '@chakra-ui/react';
import { SIDEBAR_WIDTH } from 'helpers';
import { Loading } from 'components';

const linearBackground = (deg: number) => `linear-gradient(
  ${deg}deg,
  rgba(255, 255, 255, 1) 0%,
  rgba(246, 246, 246, 1) 14%,
  rgba(236, 236, 236, 1) 31%,
  rgba(214, 214, 214, 1) 43%,
  rgba(235, 235, 235, 1) 53%,
  rgba(252, 252, 252, 1) 89%,
  rgba(255, 255, 255, 1) 100%
)`;

const SidebarToolbarFallback = () => {
  return (
    <>
      {' '}
      <Skeleton
        position="fixed"
        right="0"
        top="0"
        bottom="0"
        width={SIDEBAR_WIDTH}
        zIndex="100"
        startColor="white"
        endColor="#ebebeb"
      />
      <Box
        top="3"
        left="3"
        height="14"
        position="fixed"
        zIndex="100"
        borderRadius="md"
        boxShadow="lg"
        px="4"
        w="500px"
        animation="gradientFallbackX 4s ease infinite"
        background={linearBackground(130)}
        backgroundSize="400% 400%"
      />
      <Box
        top="50%"
        transform="translateY(-50%)"
        left="3"
        w="14"
        height="160px"
        position="fixed"
        zIndex="100"
        borderRadius="md"
        boxShadow="lg"
        background={linearBackground(170)}
        animation="gradientFallbackY 4s ease infinite"
        backgroundSize="400% 400%"
      />
      <Flex
        background="gray.100"
        w={`calc(100% - ${SIDEBAR_WIDTH}px)`}
        justifyContent="center"
        alignItems="center"
        position="fixed"
        top="0"
        left="0"
        bottom="0"
      >
        <Loading />
      </Flex>
    </>
  );
};

export default SidebarToolbarFallback;
