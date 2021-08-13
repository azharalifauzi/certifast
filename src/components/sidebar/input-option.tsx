import {
  Box,
  Button,
  Flex,
  HStack,
  Input,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Portal,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { canvasObjects, CanvasTextMeta, dynamicTextInput } from 'gstates';
import { useAtom } from 'jotai';
import { useAtomValue } from 'jotai/utils';
import React, { useMemo } from 'react';
import { AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai';
import { BsGrid } from 'react-icons/bs';
import XLSX from 'xlsx';

const InputOption = () => {
  const cObjects = useAtomValue(canvasObjects);

  return (
    <Box h="calc(100% - 45.8px)" overflowY="auto">
      {Object.values(cObjects).map(({ type, data }) => {
        if (type === 'text') {
          return <TextInput key={data.id} data={data} />;
        }

        return null;
      })}
    </Box>
  );
};

export default InputOption;

interface TextInputProps {
  data: CanvasTextMeta;
}

const TextInput: React.FC<TextInputProps> = ({ data }) => {
  const [inputs, setInputs] = useAtom(dynamicTextInput);

  const toast = useToast();

  const input = useMemo(() => inputs[data.id] ?? [], [inputs, data.id]);

  const handleDownloadTemplate = () => {
    const workbook = XLSX.utils.book_new();

    const worksheet = XLSX.utils.aoa_to_sheet([
      [`(Don't Delete This and Put Everything Below)`],
      ['Sebastian Wilder'],
      ['Tony Stark'],
      ['Steve Roger'],
      ['Kamado Tanjiro'],
      ['Muzan Kibutsuchi'],
      ['Alfred'],
    ]);

    XLSX.utils.book_append_sheet(workbook, worksheet, data.text);

    XLSX.writeFile(workbook, `${data.text}.xlsx`);
  };

  const handleUploadCSV: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const { files } = e.target;

    if (!files) return;

    if (
      ![
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ].includes(files[0].type)
    ) {
      toast({
        title: 'Wrong Format File',
        description: 'Please upload either csv or xslx file format only',
        status: 'error',
        position: 'top',
        duration: 5000,
      });
      return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
      const result = e.target?.result;

      if (!result) return;

      const csvData = new Uint8Array(result as ArrayBuffer);
      const workbook = XLSX.read(csvData, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      const inputFromCSV = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
      // remove value at A1
      inputFromCSV.shift();

      const newInput = inputFromCSV.map((val) => val[0]);

      setInputs({
        ...inputs,
        [data.id]: [...input, ...newInput],
      });

      // clear input file
      const htmlInput = document.getElementById(data.id) as HTMLInputElement;
      htmlInput.value = '';
    };

    reader.readAsArrayBuffer(files[0]);
  };

  return (
    <Box borderBottom="1px solid" borderColor="gray.300" px="4">
      <Flex
        position="sticky"
        top="0"
        justifyContent="space-between"
        alignItems="center"
        fontWeight="600"
        py="3"
        background="white"
        zIndex="5"
      >
        {data.text}
        <HStack spacing="1">
          <Popover placement="bottom" offset={[-80, 10]}>
            <PopoverTrigger>
              <Box p="2" _hover={{ background: 'rgba(0,0,0,0.15)' }} as="button">
                <BsGrid size={16} />
              </Box>
            </PopoverTrigger>
            <Portal>
              <PopoverContent fontSize="sm" w="64">
                <PopoverHeader fontWeight="600">Upload CSV</PopoverHeader>
                <PopoverBody py="4">
                  <Box position="relative">
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
                      id={data.id}
                      onChange={handleUploadCSV}
                      accept=".csv,.xlsx,.xls"
                    />
                    <Button
                      cursor="pointer"
                      htmlFor={data.id}
                      as="label"
                      w="100%"
                      variant="outline"
                      colorScheme="green"
                      size="sm"
                    >
                      Upload File
                    </Button>
                  </Box>
                  <Text textAlign="center" my="4">
                    Not sure with excel template looks like?
                  </Text>
                  <Button
                    onClick={handleDownloadTemplate}
                    w="100%"
                    variant="outline"
                    colorScheme="blue"
                    size="sm"
                  >
                    Download Excel Template
                  </Button>
                </PopoverBody>
              </PopoverContent>
            </Portal>
          </Popover>
          <Box
            onClick={() =>
              setInputs({
                ...inputs,
                [data.id]: ['', ...input],
              })
            }
            p="2"
            _hover={{ background: 'rgba(0,0,0,0.15)' }}
            as="button"
          >
            <AiOutlinePlus size={16} />
          </Box>
        </HStack>
      </Flex>
      <VStack py={input.length > 0 ? '2' : '0'} alignItems="flex-start" spacing="2">
        {input.map((value, index) => {
          return (
            <TextInputForm
              key={index}
              value={value}
              onChange={(e) => {
                const copyInputs = [...input];
                copyInputs[index] = e.target.value;
                setInputs({ ...inputs, [data.id]: copyInputs });
              }}
              onDelete={() => {
                const copyInputs = [...input];
                copyInputs.splice(index, 1);
                setInputs({ ...inputs, [data.id]: copyInputs });
              }}
            />
          );
        })}
      </VStack>
    </Box>
  );
};

interface TextInputFormProps {
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onDelete?: () => void;
}

const TextInputForm: React.FC<TextInputFormProps> = ({ value, onChange, onDelete }) => {
  return (
    <Flex w="100%" justifyContent="space-between" alignItems="center">
      <Box w="80%">
        <Input placeholder="Text" size="sm" value={value} onChange={onChange} />
      </Box>
      <Box
        tabIndex={1}
        _hover={{ background: 'rgba(0,0,0,0.15)' }}
        onClick={onDelete}
        as="button"
        p="2"
      >
        <AiOutlineMinus />
      </Box>
    </Flex>
  );
};
