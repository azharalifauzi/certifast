import React, { useState } from 'react';
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

const TextOption = () => {
  const [color, setColor] = useState<string>('#000');
  const [fontSize, setFontSize] = useState<number>(12);

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
              value={fontSize}
              onChange={(e) => setFontSize(e.target.valueAsNumber)}
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
              <Box as="button" h="8" w="8" style={{ background: color }} />
            </PopoverTrigger>
            <PopoverContent>
              <ColorPicker color={color} onChange={(c) => setColor(c.hex)} />
            </PopoverContent>
          </Popover>
          <Input disabled placeholder="#000" value={color} textTransform="uppercase" />
        </InputGroup>
      </Box>
    </>
  );
};

export default TextOption;
