import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@chakra-ui/layout';
import { SIDEBAR_WIDTH } from 'helpers';
import isFirefox from '@braintree/browser-detection/dist/is-firefox';
import { useDisclosure } from '@chakra-ui/react';
import StepToFixModal from './StepToFixModal';

const FirefoxWarn = () => {
  const [isFontBoundingBoxEnabled, setFontBoundingBoxEnabled] = useState<boolean>(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');

      if (ctx) {
        const { fontBoundingBoxAscent } = ctx.measureText('test');
        setFontBoundingBoxEnabled(typeof fontBoundingBoxAscent !== 'undefined');
      }
    }
  }, []);

  return (
    <>
      {!isFontBoundingBoxEnabled && (
        <canvas style={{ zIndex: 0, position: 'fixed' }} ref={canvasRef} />
      )}
      <StepToFixModal isOpen={isOpen} onClose={onClose} />
      {isFirefox() && !isFontBoundingBoxEnabled && (
        <Box
          position="fixed"
          bottom="8"
          left={`calc(50% - ${SIDEBAR_WIDTH / 2}px)`}
          transform="translateX(-50%)"
          background="yellow.200"
          zIndex="100"
          py="3"
          borderRadius="md"
          px="6"
        >
          Seems you are using Firefox, currently Firefox has some issue with text placement
          accuracy. Please use Google Chrome to get best experience. Or if you insist to use Firefox
          please follow this{' '}
          <Box onClick={onOpen} as="button" color="blue.500" textDecoration="underline">
            step
          </Box>
          .
        </Box>
      )}
    </>
  );
};

export default FirefoxWarn;
