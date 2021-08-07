import React from 'react';
import { Box } from '@chakra-ui/layout';
import { CSSProperties, forwardRef } from 'react';
import { ChromePicker, Color, ColorChangeHandler, HuePicker, TwitterPicker } from 'react-color';

interface ColorPickerProps {
  color?: Color;
  onChange?: ColorChangeHandler;
  style?: CSSProperties;
}
// eslint-disable-next-line
const ColorPicker = forwardRef<HTMLDivElement, ColorPickerProps>(
  ({ color, onChange, style }, ref) => {
    return (
      <Box
        userSelect="none"
        style={style}
        ref={ref}
        p="2"
        borderRadius="4"
        boxShadow="md"
        bg="white"
      >
        <ChromePicker
          styles={{
            default: {
              picker: {
                width: '100%',
                boxShadow: 'none',
              },
              body: {
                display: 'none',
              },
            },
          }}
          color={color}
          onChange={onChange}
          disableAlpha
        />
        <Box userSelect="none" mt="4">
          <HuePicker
            styles={{
              default: {
                picker: {
                  width: '90%',
                  margin: '0 auto',
                },
              },
            }}
            color={color}
            onChange={onChange}
          />
        </Box>
        <Box mt="3">
          <TwitterPicker
            color={color}
            onChange={onChange}
            triangle="hide"
            styles={{
              default: {
                card: {
                  boxShadow: 'none',
                },
              },
            }}
          />
        </Box>
      </Box>
    );
  }
);

export default ColorPicker;
