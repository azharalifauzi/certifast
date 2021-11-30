import React, { useEffect, useState } from 'react';
import { Box, Button, Text, Flex, Grid } from '@chakra-ui/react';
import { BsArrowLeft, BsX } from 'react-icons/bs';
import { HiOutlineDocumentDuplicate } from 'react-icons/hi';
import './tutorial-option.css';

type Tutorial = {
  title: string;
  description: string;
  videoSrc?: string;
  onNext?: () => void;
  onBack?: () => void;
  onMount?: () => void;
  onUnMount?: () => void;
};

const TutorialOption = () => {
  const [style, setStyle] = useState({});

  const testTutorial: Tutorial[] = [
    {
      title: 'Step 1',
      description: 'lorem ipsum sit dolor amet',
    },
    {
      title: 'Step 2',
      description: 'lorem ipsum sit dolor amet',
      onMount: () => {
        const target = document.getElementById('test-dynamic-text');

        if (target) {
          const { top, left, width, height } = target.getBoundingClientRect();

          setStyle({
            top: top + height / 2 - 16,
            left: left + width + 10,
            width,
            height,
          });
        }
      },
    },
    {
      title: 'Step 3',
      description: 'lorem ipsum sit dolor amet',
    },
  ];

  return (
    <Box>
      <TutorialPopup data={testTutorial} />
      <Box
        id="test-trigger"
        position="fixed"
        top={style.top}
        left={style.left}
        animation="arrowMove 2s infinite ease"
        transition="all 0.5s ease"
      >
        <BsArrowLeft color="#00509D" size="32" />
      </Box>
      <TutorialItem
        Icon={<HiOutlineDocumentDuplicate size="32" />}
        title="Generate Many Certificates"
        description="The most basic way to create many certificates in no time."
      />
      <TutorialItem
        Icon={<HiOutlineDocumentDuplicate size="32" />}
        title="Generate Many Certificates"
        description="The most basic way to create many certificates in no time."
      />
    </Box>
  );
};

export default TutorialOption;

interface TutorialPopupProps {
  data: Tutorial[];
  onClose?: () => void;
  onFinish?: () => void;
}

const TutorialPopup: React.FC<TutorialPopupProps> = ({ data, onClose, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { title, description, videoSrc, onBack, onMount, onNext, onUnMount } = data[currentIndex];

  useEffect(() => {
    if (onMount) onMount();
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
    <Box
      background="white"
      boxShadow="lg"
      position="fixed"
      bottom="10"
      right="340px"
      w="400px"
      minH="500px"
      borderRadius="2xl"
      p="6"
    >
      <Box
        _hover={{ background: 'blackAlpha.200' }}
        position="absolute"
        top="2"
        right="3"
        as="button"
        borderRadius="md"
        p="1"
      >
        <BsX size="24" />
      </Box>
      <Text fontSize="lg" fontWeight="semibold" mb="1.5">
        {title}
      </Text>
      <Text>{description}</Text>
      <Box mt="6" background="blackAlpha.300" h="300px" borderRadius="2xl" mb="6"></Box>
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
    </Box>
  );
};

interface TutorialItemProps {
  title?: string;
  description?: string;
  Icon?: React.ReactNode;
  onClick?: () => void;
}

const TutorialItem: React.FC<TutorialItemProps> = ({ title, description, Icon, onClick }) => {
  return (
    <Grid
      gridTemplateColumns="48px 1fr"
      _hover={{ background: 'blackAlpha.200' }}
      minH="24"
      cursor="pointer"
      p="3"
      alignItems="center"
      borderBottom="1px solid"
      borderColor="blackAlpha.300"
      onClick={onClick}
    >
      <Box>{Icon}</Box>
      <Box>
        <Text fontSize="md" fontWeight="semibold" mb="1">
          {title}
        </Text>
        <Text color="blackAlpha.700">{description}</Text>
      </Box>
    </Grid>
  );
};
