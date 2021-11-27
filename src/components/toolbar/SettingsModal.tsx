import React, { useState } from 'react';
import {
  Box,
  Stack,
  Flex,
  VStack,
  Grid,
  Text,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  useToast,
} from '@chakra-ui/react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, isOpen }) => {
  const [isActve, setActive] = useState<'custom-fonts' | 'about'>('custom-fonts');

  return (
    <Modal size="6xl" isCentered isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent height="80%">
        <ModalHeader fontSize="md">Settings</ModalHeader>
        <ModalCloseButton />
        <ModalBody p="0" fontSize="sm">
          <Grid h="100%" gridTemplateColumns="200px 1fr">
            <Box borderRight="1px solid" borderColor="blackAlpha.300">
              <SidebarItem
                isActive={isActve === 'custom-fonts'}
                onClick={() => setActive('custom-fonts')}
              >
                Custom Fonts
              </SidebarItem>
              <SidebarItem isActive={isActve === 'about'} onClick={() => setActive('about')}>
                About
              </SidebarItem>
            </Box>
            <Box px="3" pt="3" overflowY="auto">
              {isActve === 'custom-fonts' ? <CustomFontsSetting /> : null}
            </Box>
          </Grid>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SettingsModal;

interface SidebarItemProps {
  isActive?: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ isActive, children, onClick }) => {
  return (
    <Box
      background={isActive ? 'blue.200' : undefined}
      _hover={{ background: 'blue.200' }}
      cursor="pointer"
      pl="6"
      pr="3"
      py="1.5"
      fontWeight={isActive ? 'semibold' : undefined}
      onClick={onClick}
    >
      {children}
    </Box>
  );
};

const CustomFontsSetting = () => {
  const toast = useToast();

  const handleAddFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    const format = file.name.split('.')[1];

    if (!['ttf', 'woff', 'woff2'].includes(format)) {
      toast({
        title: 'Invalid file format. Only accept file with ttf, woff, woff2 format.',
        status: 'error',
        position: 'top',
        duration: 3000,
      });
    }

    // clear input file
    const htmlInput = document.getElementById('addCustomFont') as HTMLInputElement;
    htmlInput.value = '';
  };

  return (
    <Box>
      <Flex px="4" justifyContent="flex-start">
        <Box pos="relative">
          <input
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 0,
              height: 0,
              opacity: 0,
              userSelect: 'none',
            }}
            type="file"
            id="addCustomFont"
            onChange={handleAddFile}
            accept=".ttf,.woff,.woff2"
          />
          <Button
            as="label"
            htmlFor="addCustomFont"
            cursor="pointer"
            w="150px"
            mb="4"
            colorScheme="blue"
            size="sm"
          >
            Add Font
          </Button>
        </Box>
      </Flex>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Fonts</Th>
            <Th>Weight</Th>
            <Th textAlign="right"></Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>inches</Td>
            <Td>millimetres (mm)</Td>
            <Td isNumeric>
              <Button size="sm" colorScheme="red" variant="outline">
                Delete
              </Button>
            </Td>
          </Tr>
          <Tr>
            <Td>feet</Td>
            <Td>centimetres (cm)</Td>
            <Td isNumeric>30.48</Td>
          </Tr>
          <Tr>
            <Td>yards</Td>
            <Td>metres (m)</Td>
            <Td isNumeric>0.91444</Td>
          </Tr>
        </Tbody>
        <Tfoot>
          <Tr>
            <Th>To convert</Th>
            <Th>into</Th>
            <Th isNumeric>multiply by</Th>
          </Tr>
        </Tfoot>
      </Table>
    </Box>
  );
};
