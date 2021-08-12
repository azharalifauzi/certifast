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
import { useQuery } from 'react-query';
import { useState } from 'react';
import WebFont from 'webfontloader';

const TextOption = () => {
  const [selected] = useAtom(selectedObject);
  const [cObjects, setCObjects] = useAtom(canvasObjects);
  const [weightOptions, setWeightOptions] = useState<string[]>([]);

  const { data } = useMemo(() => cObjects[selected] ?? { data: {} }, [selected, cObjects]);

  const { data: fontOptions } = useQuery<GoogleFont[]>(['fonts', selected, cObjects], async () => {
    const apiKey = import.meta.env.VITE_GOOGLE_FONTS_API_KEY;
    const res = await fetch(`https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}`);

    const data = await res.json();
    const items: GoogleFont[] = data.items;

    if (selected) {
      const font = items?.find(({ family }) => family === cObjects[selected].data.family);
      const weightOpt = font?.variants.filter((value) => !value.includes('italic'));

      setWeightOptions(weightOpt ?? []);
    }

    return items;
  });

  const handleChangeFont: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const { value } = e.target;

    const font = fontOptions?.find(({ family }) => family === value);
    const weightOpt = font?.variants.filter((value) => !value.includes('italic'));

    WebFont.load({
      google: {
        families: [value],
      },
      active: () => {
        setCObjects((obj) => {
          const newObj = { ...obj };

          newObj[selected].data.family = value;
          return newObj;
        });
      },
    });

    setWeightOptions(weightOpt ?? []);
  };

  const handleChangeFontWeight: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const { value } = e.target;

    setCObjects((obj) => {
      const newObj = { ...obj };

      newObj[selected].data.weight = value;
      return newObj;
    });
  };

  if (!selected) return null;

  return (
    <>
      <Box px="4" py="3" borderBottom="1px solid" borderColor="gray.300">
        <Text fontWeight="semibold" mb="4">
          Text
        </Text>
        <Stack spacing="3">
          <Select
            value={data.family}
            onChange={handleChangeFont}
            placeholder="Select Font"
            size="sm"
          >
            {fontOptions?.map(({ family }) => (
              <option value={family} key={family}>
                {family}
              </option>
            ))}
          </Select>
          <Grid gap="3" gridTemplateColumns="2fr 1fr">
            <Select
              onChange={handleChangeFontWeight}
              value={data.weight}
              placeholder="Weight"
              size="sm"
            >
              {weightOptions.map((value) => (
                <option key={value} value={value === 'regular' ? 400 : value}>
                  {value === 'regular' ? 400 : value}
                </option>
              ))}
            </Select>
            <Input
              type="number"
              size="sm"
              value={Number(data.size?.toFixed(2).replace(',', '.'))}
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
