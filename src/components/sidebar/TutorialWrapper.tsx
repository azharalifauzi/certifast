import { Box } from '@chakra-ui/layout';
import { useAtom } from 'jotai';
import React from 'react';
import { BsArrowLeft } from 'react-icons/bs';
import TutorialPopup from './TutorialPopup';
import { activeTutorialAtom, arrowStyleAtom, isPopupOpenAtom } from './atoms';
import { useAtomValue } from 'jotai/utils';
import { COMPONENT_ID } from 'helpers';
import { AnimatePresence } from 'framer-motion';
import { tutorialData } from './data';

const TutorialWrapper = () => {
  const [isPopupOpen, setPopupOpen] = useAtom(isPopupOpenAtom);
  const popupData = useAtomValue(activeTutorialAtom);
  const arrowStyle = useAtomValue(arrowStyleAtom);

  const handleClose = () => {
    setPopupOpen('');
    if (popupData.onClose) popupData.onClose();
  };

  const handleFinish = () => {
    setPopupOpen('');
    if (popupData.onFinish) popupData.onFinish();
  };

  return (
    <>
      {Object.keys(tutorialData).map((key) => (
        <AnimatePresence key={key}>
          {isPopupOpen === key && (
            <TutorialPopup data={popupData.data} onClose={handleClose} onFinish={handleFinish} />
          )}
        </AnimatePresence>
      ))}
      <TutorialPointer top={arrowStyle.top} left={arrowStyle.left} display={arrowStyle.display} />
    </>
  );
};

export default TutorialWrapper;

interface TutorialPointerProps {
  top?: number;
  left?: number;
  display?: string;
}

const TutorialPointer: React.FC<TutorialPointerProps> = ({ top, left, display = 'none' }) => {
  return (
    <Box
      id={COMPONENT_ID.ARROW_TUTORIAL}
      position="fixed"
      top={top}
      left={left}
      animation="arrowMove 2s infinite ease"
      visibility={display === 'none' ? 'hidden' : 'visible'}
      zIndex={display === 'none' ? -1 : 999}
    >
      <BsArrowLeft color="#00509D" size="32" />
    </Box>
  );
};
