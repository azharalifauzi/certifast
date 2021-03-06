import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  Text,
} from '@chakra-ui/react';
import { whatsNewData } from './data';
import { useAtom } from 'jotai';
import { updateV1Atom } from 'gstates';

const WhatsNew = () => {
  const [updateV1, setUpdateV1] = useAtom(updateV1Atom);

  return (
    <Modal
      size="2xl"
      isCentered
      isOpen={updateV1.whatsnew}
      onClose={() => setUpdateV1({ ...updateV1, whatsnew: false })}
    >
      <ModalOverlay />
      <ModalContent height="80%">
        <ModalHeader borderBottom="1px solid" borderColor="blackAlpha.300">
          What&apos;s New
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pt="4" pb="6" pr="8" overflowY="auto">
          {whatsNewData.map(({ content, date, title }) => (
            <Box ml="6" key={title}>
              <Text mb="1" fontSize="xs" color="blackAlpha.700">
                {date}
              </Text>
              <Box mb="2" position="relative">
                <Box
                  position="absolute"
                  left="-5"
                  top="50%"
                  transform="translateY(-50%)"
                  h="2"
                  w="2"
                  borderRadius="50%"
                  background="blackAlpha.500"
                />
                <Text fontSize="lg" fontWeight="semibold">
                  {title}
                </Text>
              </Box>
              {content}
            </Box>
          ))}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default WhatsNew;
