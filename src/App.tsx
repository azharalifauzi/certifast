import React from 'react';
import { Canvas, Fonts, Sidebar, Toolbar } from 'components';
import './App.css';
import { useAtom } from 'jotai';
import { certifTemplate } from 'gstates';
import { Box, Flex, Text, useToast, useMediaQuery } from '@chakra-ui/react';
import { FileDrop } from 'react-file-drop';
import { BsCardImage } from 'react-icons/bs';
import { ILMobile } from 'assets';
import { useWindowSize } from 'react-use';
import * as gtag from 'libs/gtag';
import 'react-select/dist/react-select.css';
import 'react-virtualized/styles.css';
import 'react-virtualized-select/styles.css';
import 'react-color-palette/lib/css/styles.css';

function App() {
  const [template, setTemplate] = useAtom(certifTemplate);
  const toast = useToast();
  const [isMobile] = useMediaQuery('(max-width: 550px)');
  const { height } = useWindowSize();

  const handleFileDrop = async (files: FileList | null, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (files) {
      if (!files[0].type.includes('png')) {
        toast({
          title: 'Wrong Format File',
          description:
            'Unfortunately, for now we only support PNG file format. Please convert your file to PNG format first :)',
          status: 'error',
          position: 'top',
          duration: 3000,
        });
        return;
      }

      const imgBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function () {
          resolve(reader.result);
        };

        reader.onerror = () => {
          reject('');
        };

        reader.readAsDataURL(files[0]);
      });

      const img = new Image();

      img.onload = function () {
        setTemplate({
          file: imgBase64 as string,
          // @ts-ignore
          height: this.height,
          // @ts-ignore
          width: this.width,
        });
        gtag.event({
          action: 'upload_template',
          category: 'engagement',
          label: 'method',
          value: 0,
        });
      };

      img.src = imgBase64 as string;
    }
  };

  return (
    <>
      <Fonts />
      {isMobile ? (
        <Flex flexDir="column" px="6" h={height} justifyContent="center" alignItems="center">
          <Box mb="6" as="img" src={ILMobile} />
          <Text fontWeight="semibold" textAlign="center">
            We&apos;re really sorry, Certifast is not available on phone. Please use a bigger screen
            size such as laptop / PC.
          </Text>
        </Flex>
      ) : (
        <div className="App">
          {template.file.length > 0 ? (
            <Canvas />
          ) : (
            <Box background="gray.100" position="fixed" top="0" bottom="0" right="72" left="14">
              <FileDrop onDrop={handleFileDrop}>
                <Flex justifyContent="center" alignItems="center" flexDir="column" height="100%">
                  <Box mb="2">
                    <BsCardImage color="#000" size={64} />
                  </Box>
                  <Text mb="1" fontWeight="semibold">
                    Drop Certificate Template Here!
                  </Text>
                  <Text fontSize="xs">Support only PNG Format</Text>
                </Flex>
              </FileDrop>
            </Box>
          )}
          <Sidebar />
          <Toolbar />
        </div>
      )}
    </>
  );
}

export default App;
