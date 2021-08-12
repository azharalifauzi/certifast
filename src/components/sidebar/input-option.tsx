import { Box, Flex, HStack, Input, VStack } from '@chakra-ui/react';
import { canvasObjects, CanvasTextMeta, dynamicTextInput } from 'gstates';
import { useAtom } from 'jotai';
import { useAtomValue } from 'jotai/utils';
import React from 'react';
import { useMemo } from 'react';
import { AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai';
import { BsGrid } from 'react-icons/bs';

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

  const input = useMemo(() => inputs[data.id] ?? [], [inputs, data.id]);

  return (
    <Box borderBottom="1px solid" borderColor="gray.300" px="4" pb="4">
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
          <Box p="2" _hover={{ background: 'rgba(0,0,0,0.15)' }} as="button">
            <BsGrid size={16} />
          </Box>
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
      <VStack alignItems="flex-start" spacing="2">
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
