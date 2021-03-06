import React, { useMemo, memo, useEffect } from 'react';
import {
  Input,
  InputGroup,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Stack,
  Box,
  Grid,
  Text,
} from '@chakra-ui/react';
import {
  selectedObject,
  canvasObjects,
  preventToolbar,
  customFonts as customFontsAtom,
  preventCanvasShortcut,
} from 'gstates';
import { useAtom } from 'jotai';
import { useQuery } from 'react-query';
import { useState } from 'react';
import WebFont from 'webfontloader';
import VirtualizedSelect from 'react-virtualized-select';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import { ColorPicker, useColor } from 'react-color-palette';
import cloneDeep from 'clone-deep';

const TextOption = () => {
  const [selected] = useAtom(selectedObject);
  const [cObjects, setCObjects] = useAtom(canvasObjects);
  const customFonts = useAtomValue(customFontsAtom);
  const [weightOptions, setWeightOptions] = useState<string[]>([]);
  const setPreventToolbar = useUpdateAtom(preventToolbar);
  const setPreventCanvasShortcut = useUpdateAtom(preventCanvasShortcut);
  const [color, setColor] = useColor('hex', cObjects[selected]?.data?.color ?? '#000');

  const { data } = useMemo(() => cObjects[selected] ?? { data: {} }, [selected, cObjects]);

  const { data: fontOptions } = useQuery<Array<CustomFont | GoogleFont>>(
    ['fonts', selected, customFonts],
    async () => {
      const apiKey = import.meta.env.VITE_GOOGLE_FONTS_API_KEY;
      const res = await fetch(`https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}`);

      const data = await res.json();
      const items: Array<CustomFont | GoogleFont> = [...data.items, ...customFonts];

      return items;
    },
    {
      keepPreviousData: true,
      initialData: [],
      onSuccess: (items) => {
        if (selected) {
          if (cObjects[selected]) {
            const font = items?.find(({ family }) => family === cObjects[selected].data.family);
            const weightOpt = font?.variants.filter((value) => !value.includes('italic'));

            setWeightOptions(weightOpt ?? []);
          }
        }
      },
    }
  );

  const handleChangeFont = (value: string) => {
    const font = fontOptions?.find(({ family }) => family === value);
    const weightOpt = font?.variants.filter((value) => !value.includes('italic'));

    if (font?.kind === 'custom') {
      setWeightOptions([]);

      WebFont.load({
        custom: {
          families: [font.family],
        },
        active: () => {
          setCObjects((obj) => {
            const newObj = { ...obj };

            newObj[selected].data.family = value;
            newObj[selected].data.weight = 'opentype';
            return newObj;
          });
        },
      });
    } else {
      WebFont.load({
        google: {
          families: [value],
        },
        active: () => {
          setCObjects((obj) => {
            const newObj = { ...obj };

            newObj[selected].data.family = value;
            newObj[selected].data.weight = '400';
            return newObj;
          });
        },
      });
      setWeightOptions(weightOpt ?? []);
    }
  };

  const handleChangeFontWeight = (value: string) => {
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
          <VirtualizedSelect
            options={fontOptions?.map(({ family }) => ({
              label: family,
              value: family,
            }))}
            // @ts-ignore
            onChange={({ value }) => {
              handleChangeFont(value);
            }}
            value={data.family}
            onFocus={() => {
              setPreventToolbar(true);
              setPreventCanvasShortcut(true);
            }}
            onBlur={() => {
              setPreventToolbar(false);
              setPreventCanvasShortcut(false);
            }}
            clearable={false}
          />
          <Grid gap="3" gridTemplateColumns="2fr 1fr">
            <VirtualizedSelect
              options={weightOptions.map((value) => ({
                label: value === 'regular' ? '400' : value,
                value: value === 'regular' ? '400' : value,
              }))}
              value={data.weight}
              // @ts-ignore
              onChange={({ value }) => {
                handleChangeFontWeight(value);
              }}
              searchable={false}
              placeholder="Weight"
              clearable={false}
              disabled={weightOptions.length === 0}
            />
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
          <VirtualizedSelect
            options={[
              { label: 'Left', value: 'left' },
              { label: 'Center', value: 'center' },
              { label: 'Right', value: 'right' },
            ]}
            value={data.align}
            // @ts-ignore
            onChange={({ value }) => {
              setCObjects((obj) => {
                const newObj = { ...obj };

                newObj[selected].data.align = value as 'center' | 'left' | 'right';

                return newObj;
              });
            }}
            searchable={false}
            placeholder="Align"
            clearable={false}
          />
        </Stack>
      </Box>
      <Box borderBottom="1px solid" borderColor="gray.300" px="4" py="3">
        <Text fontWeight="semibold" mb="4">
          Fill
        </Text>
        <InputGroup size="sm">
          <Popover lazyBehavior="unmount" isLazy placement="left">
            <PopoverTrigger>
              <Box as="button" h="8" w="8" background={data.color} />
            </PopoverTrigger>
            <PopoverContent>
              <ColorPicker
                hideHSV
                hideRGB
                width={320}
                height={200}
                color={color}
                onChange={(c) => {
                  setCObjects((obj) => {
                    const newObj = { ...obj };

                    // @ts-ignore
                    newObj[selected].data.color = c.hex;
                    return newObj;
                  });

                  return setColor;
                }}
              />
            </PopoverContent>
          </Popover>
          <Input disabled placeholder="#000" value={data.color} textTransform="uppercase" />
        </InputGroup>
      </Box>
    </>
  );
};

export default memo(TextOption);
