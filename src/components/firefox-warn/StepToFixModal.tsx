import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Text,
  Code,
  Image,
} from '@chakra-ui/react';

interface StepToFixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StepToFixModal: React.FC<StepToFixModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal size="2xl" isCentered isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Step to Fix Text Accuracy on Firefox</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb="8">
          <Text mb="2">
            1. Open <Code>about:config</Code>,
          </Text>
          <Image src="/firefox-warn/step-1.png" />
          <Text mb="2">2. Accept Risk and Continue,</Text>
          <Image src="/firefox-warn/step-2.png" />
          <Text mb="2">
            3. Find <Code>fontBoundingBox</Code> on search bar,
          </Text>
          <Image src="/firefox-warn/step-3.png" />
          <Text mb="2">
            4. Set the value to <Code>true</Code> using double click or press the toggle button,
          </Text>
          <Image src="/firefox-warn/step-4.png" />
          <Text mt="2">5. Finish, you are good to go.</Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default StepToFixModal;
