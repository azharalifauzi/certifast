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
} from '@chakra-ui/react';
import React, { useState } from 'react';
import {
  canvasObjects,
  certifTemplate as certifTemplateAtom,
  dynamicTextInput as dynamicTextInputAtom,
  selectedObject,
} from 'gstates';
import TextOption from './text-option';
import { useAtom } from 'jotai';
import InputOption from './input-option';
import { zoomCanvas } from 'components/canvas';
import { decode, encode } from 'base64-arraybuffer';
import { useQueryClient } from 'react-query';
import { measureText } from 'helpers';
import hexRgb from 'hex-rgb';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import Loading from 'components/loading';

const Sidebar = () => {
  const queryClient = useQueryClient();

  const [certifTemplate, setCertifTemplate] = useAtom(certifTemplateAtom);
  const [cObjects, setCObjects] = useAtom(canvasObjects);
  const [zoom, setZoom] = useAtom(zoomCanvas);
  const dynamicTextInput = useAtomValue(dynamicTextInputAtom);
  const setSelected = useUpdateAtom(selectedObject);
  const [active, setActive] = useState<'general' | 'input'>('general');
  const [isProgressModalOpen, setIsProgressModalOpen] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [totalProgress, setTotalProgress] = useState<number>(0);
  const [progressState, setProgressState] = useState<
    'init' | 'load image' | 'printing' | 'archiving' | 'end'
  >('init');

  const handleGenerateCertificate = async () => {
    const worker = new Worker('/worker.js');

    worker.postMessage({ type: 'init', wasm_uri: '/abi/core_certifast_bg.wasm' });
    setProgressState('init');

    const dynamicTextData = Object.values(cObjects);
    const certificateInput: any[][] = [];

    const loop = dynamicTextData.map(async ({ data }) => {
      const inputs = dynamicTextInput[data.id];
      const widthTextTempalte = measureText(data.text, data.family, data.size).width;
      const color = hexRgb(data.color);
      const { red, green, blue, alpha } = color;

      const arrayOfFonts = queryClient.getQueriesData<GoogleFont[]>('fonts');
      const fonts = arrayOfFonts[arrayOfFonts.length - 1][1];
      const font = fonts.find(({ family }) => data.family === family);
      let fontWeight = data.weight;
      if (fontWeight === '400') fontWeight = 'regular';
      let fontFileUrl = font?.files[fontWeight];
      if (import.meta.env.PROD) fontFileUrl = fontFileUrl?.replace('http', 'https');
      const fontFile = await fetch(fontFileUrl ?? '');
      const fontArrayBuff = await fontFile.arrayBuffer();
      const fontBase64 = encode(fontArrayBuff);

      inputs?.forEach((val, index) => {
        const textWidth = measureText(val, data.family, data.size).width;
        const Tx = (textWidth - widthTextTempalte) / 2;

        const x = data.x / zoom - Tx;
        const y = data.y / zoom;

        if (!certificateInput[index]) certificateInput[index] = [];

        certificateInput[index].push({
          y,
          text: val,
          x: x + textWidth * 0.06,
          font_size: data.size * 1.067,
          font_fam: fontBase64,
          color: [red, green, blue, alpha],
        });
      });
    });

    await Promise.all(loop);
    setIsProgressModalOpen(true);
    setTotalProgress(certificateInput.length);

    const imgBase64 = certifTemplate.file.split(',')[1];
    const arrBuff = decode(imgBase64);
    const imgUnitArr = new Uint8Array(arrBuff);

    worker.postMessage({ type: 'print', texts: certificateInput, certif_template: imgUnitArr });

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
      }

      if (msg.type === 'progress') {
        if (msg.data === 'load image') setProgressState('load image');
        else if (typeof msg.data === 'number') {
          setProgressState('printing');
          setProgress(msg.data + 1);
        } else setProgressState('archiving');
      }
    });

    setProgressState('end');
  };

  return (
    <>
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
            {progressState === 'printing' || progressState === 'archiving' ? (
              <Box mt="12">
                <Text fontWeight="medium" mb="6">
                  Progress
                </Text>
                <Progress mb="2" value={(progress / totalProgress) * 100} />
                {progressState === 'archiving' ? (
                  <Text fontWeight="medium">Downloading your files</Text>
                ) : (
                  <Text fontWeight="medium">
                    Generating Certificate {progress} of {totalProgress}
                  </Text>
                )}
              </Box>
            ) : null}
          </ModalBody>
        </ModalContent>
      </Modal>
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
          gap="3"
          px="4"
          py="3"
          gridAutoFlow="column"
          fontWeight="semibold"
          borderBottom="1px solid"
          borderColor="gray.300"
        >
          <GridItem
            userSelect="none"
            onClick={() => setActive('general')}
            _hover={{ color: 'black' }}
            color={active === 'general' ? 'black' : 'gray.400'}
          >
            General
          </GridItem>
          <GridItem
            userSelect="none"
            onClick={() => setActive('input')}
            _hover={{ color: 'black' }}
            color={active === 'input' ? 'black' : 'gray.400'}
          >
            Input
          </GridItem>
        </Grid>
        {active === 'general' ? (
          <>
            {certifTemplate.file.length > 0 ? (
              <Box borderBottom="1px solid" borderColor="gray.300" p="4">
                <Button
                  onClick={() => {
                    setCObjects({});
                    setCertifTemplate({
                      ...certifTemplate,
                      file: '',
                    });
                    setSelected('');
                    setZoom(1.0);
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
            <TextOption />
            {certifTemplate.file.length > 0 ? (
              <Box borderBottom="1px solid" borderColor="gray.300" p="4">
                <Text fontWeight="medium" mb="4">
                  Export
                </Text>
                <Button
                  onClick={handleGenerateCertificate}
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
      </Box>
    </>
  );
};

export default Sidebar;
