import { Box, Grid, Text } from '@chakra-ui/react';
import { useUpdateAtom } from 'jotai/utils';
import React from 'react';
import { HiOutlineDocumentDuplicate } from 'react-icons/hi';
import { ImFont } from 'react-icons/im';
import { activeTutorialAtom, arrowStyleAtom, isPopupOpenAtom } from './atoms';
import { tutorialData } from './data';
import './tutorial-option.css';

const TutorialOption = () => {
  const setArrowStyle = useUpdateAtom(arrowStyleAtom);
  const setActiveTutorial = useUpdateAtom(activeTutorialAtom);
  const setPopupOpen = useUpdateAtom(isPopupOpenAtom);

  return (
    <Box>
      <TutorialItem
        Icon={<HiOutlineDocumentDuplicate size="32" />}
        title="Generate Many Certificates"
        description="The most basic way to create many certificates in no time."
        onClick={() => {
          setActiveTutorial(tutorialData.basic(setArrowStyle));
          setPopupOpen('basic');
        }}
      />
      <TutorialItem
        Icon={<ImFont size="32" />}
        title="Add Custom Font"
        description="Add your favourite font to your certificate."
        onClick={() => {
          setActiveTutorial(tutorialData.customFont(setArrowStyle));
          setPopupOpen('customFont');
        }}
      />
    </Box>
  );
};

export default TutorialOption;

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
      as="button"
    >
      <Box>{Icon}</Box>
      <Box textAlign="left">
        <Text fontSize="md" fontWeight="semibold" mb="1">
          {title}
        </Text>
        <Text color="blackAlpha.700">{description}</Text>
      </Box>
    </Grid>
  );
};
