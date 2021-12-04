import React, { useEffect, useState } from 'react';
import { Box, Button, Text, Flex, HStack, AspectRatio } from '@chakra-ui/react';
import { BsX } from 'react-icons/bs';
import { motion } from 'framer-motion';

export type Tutorial = {
  title: string;
  description: string;
  videoSrc?: string;
  onNext?: () => void;
  onBack?: () => void;
  onMount?: () => void;
  onUnMount?: () => void;
};

interface TutorialPopupProps {
  data: Tutorial[];
  onClose?: () => void;
  onFinish?: () => void;
}

const TutorialPopup: React.FC<TutorialPopupProps> = ({ data = [], onClose, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { onBack, onMount, onNext, onUnMount } = data[currentIndex] ?? {};

  useEffect(() => {
    if (onMount) onMount();

    return () => {
      if (onUnMount) onUnMount();
    };
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < data.length - 1) setCurrentIndex(currentIndex + 1);
    else {
      if (onClose) onClose();
      if (onFinish) onFinish();
    }

    if (onNext) onNext();
    if (onUnMount) onUnMount();
  };

  const handleBack = () => {
    setCurrentIndex(currentIndex - 1);
    if (onBack) onBack();
    if (onUnMount) onUnMount();
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ ease: 'easeOut' }}
      style={{ position: 'fixed', bottom: '40px', right: '340px', zIndex: 999 }}
    >
      <Box
        position="absolute"
        right="0"
        bottom="0"
        w="400px"
        minH="500px"
        background="white"
        boxShadow="lg"
        borderRadius="2xl"
      >
        <Box
          _hover={{ background: 'blackAlpha.200' }}
          position="absolute"
          top="2"
          right="3"
          as="button"
          borderRadius="md"
          p="1"
          onClick={onClose}
          zIndex="100"
        >
          <BsX size="24" />
        </Box>
        {data.map(({ description, title, videoSrc }, i) => (
          <Box key={`tutorial-step-${i}`}>
            {currentIndex === i && (
              <TutorialStep
                title={title}
                description={description}
                onBack={handleBack}
                onNext={handleNext}
                length={data.length}
                currentIndex={currentIndex}
                videoSrc={videoSrc}
              />
            )}
          </Box>
        ))}
      </Box>
    </motion.div>
  );
};

export default TutorialPopup;

interface TutorialStepProps {
  onBack: () => void;
  onNext: () => void;
  title: string;
  description: string;
  videoSrc?: string;
  currentIndex: number;
  length: number;
}

const TutorialStep: React.FC<TutorialStepProps> = ({
  title,
  description,
  onBack,
  onNext,
  currentIndex,
  videoSrc,
  length,
}) => {
  return (
    <Flex
      position="absolute"
      top="0"
      left="0"
      p="6"
      flexDirection="column"
      justifyContent="flex-end"
    >
      <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
        <Text fontSize="lg" fontWeight="semibold" mb="1.5">
          {title}
        </Text>
        <Text>{description}</Text>
        <AspectRatio ratio={4 / 3} mt="6" borderRadius="xl" mb="6" overflow="hidden">
          {videoSrc ? (
            <video autoPlay muted playsInline loop>
              <source src={videoSrc} type="video/mp4" />
            </video>
          ) : (
            <Box />
          )}
        </AspectRatio>
      </motion.div>
      <Flex alignItems="center" justifyContent="space-between">
        <StepIndicator length={length} currentStep={currentIndex} />
        <Flex justifyContent="flex-end" alignItems="center" gridGap="3">
          {currentIndex > 0 ? (
            <Button onClick={onBack} variant="ghost">
              Back
            </Button>
          ) : null}
          <Button onClick={onNext} colorScheme="blue">
            {currentIndex === length - 1 ? 'Finish' : 'Next'}
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

interface StepIndicatorProps {
  length: number;
  currentStep: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ length, currentStep }) => {
  return (
    <HStack spacing="2">
      {Array.from(Array(length)).map((_, i) => (
        <Box
          key={`array-indicator-${i}`}
          borderRadius="50%"
          h="2"
          w="2"
          background={currentStep === i ? 'blue.400' : 'blackAlpha.300'}
        />
      ))}
    </HStack>
  );
};
