import React, { useEffect, useState } from 'react';
import { Box, Button, Text, Flex, HStack } from '@chakra-ui/react';
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
  const { title, description, videoSrc, onBack, onMount, onNext, onUnMount } =
    data[currentIndex] ?? {};

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
      <Box w="400px" minH="500px" background="white" boxShadow="lg" borderRadius="2xl" p="6">
        <Box
          _hover={{ background: 'blackAlpha.200' }}
          position="absolute"
          top="2"
          right="3"
          as="button"
          borderRadius="md"
          p="1"
          onClick={onClose}
        >
          <BsX size="24" />
        </Box>
        <Text fontSize="lg" fontWeight="semibold" mb="1.5">
          {title}
        </Text>
        <Text>{description}</Text>
        <Box mt="6" background="blackAlpha.300" h="300px" borderRadius="xl" mb="6"></Box>
        <Flex alignItems="center" justifyContent="space-between">
          <StepIndicator length={data.length} currentStep={currentIndex} />
          <Flex justifyContent="flex-end" alignItems="center" gridGap="3">
            {currentIndex > 0 ? (
              <Button onClick={handleBack} variant="ghost">
                Back
              </Button>
            ) : null}
            <Button onClick={handleNext} colorScheme="blue">
              {currentIndex === data.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </Flex>
        </Flex>
      </Box>
    </motion.div>
  );
};

export default TutorialPopup;

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
