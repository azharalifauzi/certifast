import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Progress,
  Text,
  useToast,
  ModalFooter,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from '@chakra-ui/react';
import React, { useState, memo, useRef } from 'react';
import VirtualizedSelect from 'react-virtualized-select';
import {
  canvasObjects,
  certifTemplate as certifTemplateAtom,
  dynamicTextInput as dynamicTextInputAtom,
  selectedObject,
} from 'gstates';
import TextOption from './TextOption';
import { useAtom } from 'jotai';
import InputOption from './InputOption';
import { zoomCanvas } from 'components/canvas';
import { measureText } from 'helpers';
import hexRgb from 'hex-rgb';
import Loading from 'components/loading';
import * as gtag from 'libs/gtag';
import { supabase } from 'libs/supabase';
import TutorialOption from './TutorialOption';
import TutorialWrapper from './TutorialWrapper';
import { printCertif } from 'helpers/printCertif';

const Sidebar = () => {
  const [certifTemplate, setCertifTemplate] = useAtom(certifTemplateAtom);
  const [cObjects, setCObjects] = useAtom(canvasObjects);
  const [zoom, setZoom] = useAtom(zoomCanvas);
  const [dynamicTextInput, setDynamicTextInput] = useAtom(dynamicTextInputAtom);
  const [selected, setSelected] = useAtom(selectedObject);
  const [active, setActive] = useState<'general' | 'input' | 'tutorial'>('general');
  const [isProgressModalOpen, setIsProgressModalOpen] = useState<boolean>(false);
  const [confirmGenerateCert, setConfirmGenerateCert] = useState<boolean>(false);
  const [confirmResetProject, setConfirmResetProject] = useState<boolean>(false);
  const [certificateInputs, setCertificateInputs] = useState<any[][]>([]);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [inputMetaData, setInputMetaData] = useState<Record<string, number>>({});
  const [progress, setProgress] = useState<number>(0);
  const [totalProgress, setTotalProgress] = useState<number>(0);
  const [progressState, setProgressState] = useState<
    'init' | 'load image' | 'printing' | 'archiving' | 'end' | 'convertPdf'
  >('init');
  const [fileFormat, setFileFormat] = useState<'jpg' | 'pdf'>('jpg');
  const toast = useToast();

  const handleProcessData = async () => {
    const dynamicTextData = Object.values(cObjects);
    const certificateInput: any[][] = [];

    const inputMetaData: Record<string, number> = {};

    const loop = dynamicTextData.map(async ({ data }, idx) => {
      inputMetaData[data.id] = idx;
      const inputs = dynamicTextInput[data.id];
      const widthTextTempalte = measureText(data.text, data.family, data.size, data.weight).width;
      const color = hexRgb(data.color);
      const { red, green, blue, alpha } = color;

      inputs?.forEach((val, index) => {
        const { width: textWidth } = measureText(val, data.family, data.size, data.weight);
        let x = data.x / zoom;

        if (data.align === 'center') {
          const Tx = (textWidth - widthTextTempalte) / 2;
          x = data.x / zoom - Tx;
        }

        if (data.align === 'right') {
          const Tx = textWidth - widthTextTempalte;
          x = data.x / zoom - Tx;
        }

        const y = data.y / zoom;

        if (!certificateInput[index]) certificateInput[index] = [];

        // FIXME text not sync
        // notes : font size not sync with wasm -> Zen Kurenaido

        certificateInput[index].push({
          x,
          y,
          fontWeight: data.weight,
          fontName: data.family,
          text: val?.toString(),
          font_size: data.size,
          color: [red, green, blue, alpha],
        });
      });
    });

    try {
      await Promise.all(loop);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Something went wrong',
        status: 'error',
        position: 'top',
        duration: 3000,
      });
      return;
    }

    setInputMetaData(inputMetaData);
    setTotalProgress(certificateInput.length);
    setCertificateInputs(certificateInput);
    setConfirmGenerateCert(true);
    gtag.event({
      action: 'init_generate_certificate',
      label: 'method',
      category: 'engagement',
      value: 0,
    });
  };

  const handleGenerateCertificate = async () => {
    const worker = new Worker('/worker.js');

    worker.postMessage({ type: 'init', wasm_uri: '/abi/core_certifast_bg.wasm' });
    setIsProgressModalOpen(true);
    setProgressState('init');
    const certificateInput: any[][] = [...certificateInputs];

    let selectedName = selectedFileName;

    if (!selectedFileName) selectedName = Object.keys(cObjects)[0];

    if (selectedName) {
      const index = inputMetaData[selectedName];

      certificateInput.forEach((_, idx) => {
        const temp = certificateInput[idx][0];
        certificateInput[idx][0] = certificateInput[idx][index];
        certificateInput[idx][index] = temp;
      });
    }

    setConfirmGenerateCert(false);
    setProgressState('printing');

    const getCertificates = (): Promise<{ certificates: Uint8Array[]; file_names: string[] }> =>
      new Promise((resolve) => {
        const certificates: Uint8Array[] = [];
        const file_names: string[] = [];
        certificateInput.forEach((textData, i) => {
          setTimeout(() => {
            setProgress(i + 1);
            const result = printCertif(certifTemplate, textData, fileFormat);
            certificates.push(result);
            file_names.push(certificateInput[i][0].text.toString());
            if (certificates.length === certificateInput.length)
              resolve({ certificates, file_names });
          }, 100);
        });
      });

    const { certificates, file_names } = await getCertificates();

    worker.postMessage({
      file_names,
      type: 'archive',
      files: certificates,
      file_format: fileFormat,
    });

    worker.addEventListener('message', (e) => {
      const msg = e.data;

      if (msg.type === 'print') {
        const blob = new Blob([msg.data.buffer]);

        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.setAttribute('download', `Certificates.zip`);
        a.setAttribute('href', url);
        a.style.display = 'none';
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        setIsProgressModalOpen(false);
        setProgressState('end');
        const fileSize = (blob.size / 1024 ** 2).toFixed(2); // send data in megabytes unit
        gtag.customDimension(['certificates_count', 'download_size'], 'generate_certificate', {
          certificates_count: certificateInput.length,
          download_size: fileSize,
        });
        // send analytics to supabase only in prod
        if (import.meta.env.PROD)
          supabase
            .from('analytics')
            .insert([
              {
                certificate_count: certificateInput.length,
                certificate_file_size: parseFloat(fileSize),
              },
            ])
            .then((res) =>
              console.log(
                res.status.toString().startsWith('2') ? 'Send Analytics' : 'Analytics failed'
              )
            );
      }

      if (msg.type === 'error') {
        toast({
          title: 'Something went wrong, try to change input format from excel to "TEXT"',
          status: 'error',
          position: 'top',
          duration: 3000,
        });

        setProgressState('end');
        setIsProgressModalOpen(false);
      }
    });
  };

  const handleReset = () => {
    setCObjects({});
    setCertifTemplate({
      ...certifTemplate,
      file: '',
    });
    setSelected('');
    setDynamicTextInput({});
    setZoom(1.0);
  };

  return (
    <>
      <TutorialWrapper />
      <Modal
        closeOnEsc={false}
        closeOnOverlayClick={false}
        isCentered
        isOpen={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
      >
        <ModalOverlay />
        <ModalContent h="56">
          <ModalBody fontSize="sm">
            {progressState === 'load image' ||
            progressState === 'init' ||
            progressState === 'end' ? (
              <>
                <Flex mt="12" mb="4" justifyContent="center">
                  <Loading />
                </Flex>
                <Text fontWeight="medium" textAlign="center">
                  Loading certificate template
                </Text>{' '}
              </>
            ) : null}
            {progressState === 'printing' ||
            progressState === 'archiving' ||
            progressState === 'convertPdf' ? (
              <Box mt="12">
                <Text fontWeight="medium" mb="6">
                  Progress
                </Text>
                <Progress mb="2" value={(progress / totalProgress) * 100} />
                {progressState === 'archiving' ? (
                  <Text fontWeight="medium">Downloading your files</Text>
                ) : (
                  <Text fontWeight="medium">
                    {progressState === 'convertPdf'
                      ? 'Converting Image to PDF'
                      : 'Generating Certificate'}{' '}
                    {progress} of {totalProgress}
                  </Text>
                )}
              </Box>
            ) : null}
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal isCentered isOpen={confirmGenerateCert} onClose={() => setConfirmGenerateCert(false)}>
        <ModalOverlay />
        <ModalContent h="72">
          <ModalBody pt="9" fontSize="sm">
            <Box mb="4">
              <Text fontWeight="semibold" mb="4">
                Choose which input that will become a file name:
              </Text>
              <VirtualizedSelect
                searchable={false}
                clearable={false}
                options={Object.values(cObjects).map(({ data }) => ({
                  label: data.text,
                  value: data.id,
                }))}
                value={selectedFileName || Object.keys(cObjects)[0]}
                // @ts-ignore
                onChange={({ value }) => {
                  setSelectedFileName(value);
                }}
              />
            </Box>
            <Box>
              <Text fontWeight="semibold" mb="4">
                Choose file format:
              </Text>
              <VirtualizedSelect
                searchable={false}
                clearable={false}
                options={[
                  {
                    value: 'jpg',
                    label: 'JPG',
                  },
                  {
                    value: 'pdf',
                    label: 'PDF',
                  },
                ]}
                value={fileFormat}
                // @ts-ignore
                onChange={({ value }) => {
                  setFileFormat(value);
                }}
              />
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={() => setConfirmGenerateCert(false)}
              colorScheme="black"
              variant="outline"
              size="sm"
              mr="2"
            >
              Cancel
            </Button>
            <Button onClick={handleGenerateCertificate} colorScheme="blue" size="sm">
              Generate
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <ResetModal
        isOpen={confirmResetProject}
        onClose={() => setConfirmResetProject(false)}
        onReset={handleReset}
      />
      <Box
        background="white"
        top={0}
        bottom={0}
        right={0}
        w="72"
        position="fixed"
        zIndex="100"
        boxShadow="sm"
        fontSize="sm"
      >
        <Grid
          gridAutoColumns="max-content"
          gap="5"
          px="4"
          gridAutoFlow="column"
          fontWeight="semibold"
          borderBottom="1px solid"
          borderColor="gray.300"
        >
          <SideBarNav onClick={() => setActive('general')} isActive={active === 'general'}>
            General
          </SideBarNav>
          <SideBarNav
            onClick={() => {
              setActive('input');
            }}
            isActive={active === 'input'}
          >
            Input
          </SideBarNav>
          <SideBarNav onClick={() => setActive('tutorial')} isActive={active === 'tutorial'}>
            Tutorial
          </SideBarNav>
        </Grid>
        {active === 'general' ? (
          <>
            {certifTemplate.file.length > 0 ? (
              <Box borderBottom="1px solid" borderColor="gray.300" p="4">
                <Button
                  onClick={() => {
                    setConfirmResetProject(true);
                  }}
                  variant="outline"
                  colorScheme="red"
                  w="100%"
                  size="sm"
                >
                  Reset Project
                </Button>
              </Box>
            ) : null}
            {selected.length > 0 ? <TextOption /> : null}
            {certifTemplate.file.length > 0 ? (
              <Box borderBottom="1px solid" borderColor="gray.300" p="4">
                <Text fontWeight="medium" mb="4">
                  Export
                </Text>
                <Button
                  onClick={handleProcessData}
                  variant="outline"
                  colorScheme="black"
                  w="100%"
                  size="sm"
                >
                  Generate Certificate
                </Button>
              </Box>
            ) : null}
          </>
        ) : null}
        {active === 'input' ? (
          <>
            {Object.values(cObjects).reduce(
              (prev, curr) => prev + (curr.type === 'text' ? 1 : 0),
              0
            ) > 0 ? (
              <InputOption />
            ) : (
              <Box px="4" py="3" fontStyle="italic">
                You don&apos;t have any input, please add input using the toolbar on the left side.
              </Box>
            )}
          </>
        ) : null}
        {active === 'tutorial' ? <TutorialOption /> : null}
      </Box>
    </>
  );
};

export default memo(Sidebar);

interface SidebarNavProps {
  onClick?: () => void;
  isActive?: boolean;
}

const SideBarNav: React.FC<SidebarNavProps> = ({ onClick, isActive, children }) => {
  return (
    <GridItem
      userSelect="none"
      onClick={onClick}
      _hover={{ color: 'black' }}
      color={isActive ? 'black' : 'gray.400'}
      borderBottom="2px solid"
      borderColor={isActive ? 'blue.400' : 'transparent'}
      py="4"
    >
      {children}
    </GridItem>
  );
};

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
}

const ResetModal: React.FC<ResetModalProps> = ({ isOpen, onClose, onReset }) => {
  const cancelRef = useRef(null);

  return (
    <AlertDialog isCentered isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
      <AlertDialogOverlay>
        <AlertDialogContent fontSize="sm">
          <AlertDialogHeader fontSize="md" fontWeight="bold">
            Reset Project
          </AlertDialogHeader>
          <AlertDialogBody>
            Are you sure? You can&apos;t undo this action afterwards.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              variant="outline"
              colorScheme="black"
              size="sm"
              ref={cancelRef}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              colorScheme="red"
              variant="outline"
              onClick={() => {
                onReset();
                onClose();
              }}
              ml={3}
            >
              Reset
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};
