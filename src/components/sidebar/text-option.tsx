import React, { useMemo } from 'react';
import {
  Input,
  InputGroup,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  Stack,
  Box,
  Grid,
  Text,
} from '@chakra-ui/react';
import ColorPicker from 'components/color-picker';
import { selectedObject, canvasObjects } from 'gstates';
import { useAtom } from 'jotai';

const TextOption = () => {
  const [selected] = useAtom(selectedObject);
  const [cObjects, setCObjects] = useAtom(canvasObjects);

  const { data } = useMemo(() => cObjects[selected] ?? { data: {} }, [selected, cObjects]);

  if (!selected) return null;

  return (
    <>
      <Box px="4" py="3" borderBottom="1px solid" borderColor="gray.300">
        <Text fontWeight="semibold" mb="4">
          Text
        </Text>
        <Stack spacing="3">
          <Select placeholder="Select Font" size="sm"></Select>
          <Grid gap="3" gridTemplateColumns="2fr 1fr">
            <Select placeholder="Weight" size="sm"></Select>
            <Input
              type="number"
              size="sm"
              value={Number(data.size.toFixed(2).replace(',', '.'))}
              onChange={(e) =>
                setCObjects((obj) => {
                  const newObj = { ...obj };

                  newObj[selected].data.size = e.target.valueAsNumber;

                  return newObj;
                })
              }
            />
          </Grid>
          <Select size="sm" value="center">
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </Select>
        </Stack>
      </Box>
      <Box px="4" py="3">
        <Text fontWeight="semibold" mb="4">
          Fill
        </Text>
        <InputGroup size="sm">
          <Popover placement="left">
            <PopoverTrigger>
              <Box as="button" h="8" w="8" style={{ background: data.color }} />
            </PopoverTrigger>
            <PopoverContent>
              <ColorPicker
                color={data.color}
                onChange={(c) =>
                  setCObjects((obj) => {
                    const newObj = { ...obj };

                    newObj[selected].data.color = c.hex;
                    return newObj;
                  })
                }
              />
            </PopoverContent>
          </Popover>
          <Input disabled placeholder="#000" value={data.color} textTransform="uppercase" />
        </InputGroup>
      </Box>
    </>
  );
};

export default TextOption;
