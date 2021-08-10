import React from 'react';
import { Canvas, Sidebar, Toolbar } from 'components';
import './App.css';
import { useAtom } from 'jotai';
import { certifTemplate } from 'gstates';
import { Box, Flex, Text, useToast } from '@chakra-ui/react';
import { FileDrop } from 'react-file-drop';
import { BsCardImage } from 'react-icons/bs';

function App() {
  const [template, setTemplate] = useAtom(certifTemplate);
  const toast = useToast();

  const handleFileDrop = (files: FileList | null, e: React.DragEvent<HTMLDivElement>) => {
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

      const img = new Image();
      const objectUrl = URL.createObjectURL(files[0]);

      img.onload = function () {
        setTemplate({
          file: files[0],
          // @ts-ignore
          height: this.height,
          // @ts-ignore
          width: this.width,
          url: objectUrl,
        });
      };

      img.src = objectUrl;
    }
  };

  return (
    <div className="App">
      {template.file ? (
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
  );
}

export default App;
