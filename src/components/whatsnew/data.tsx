import React from 'react';
import { Box, Text, UnorderedList, ListItem, AspectRatio } from '@chakra-ui/react';

type WhatsNewData = {
  title?: string;
  date?: string;
  content?: React.ReactNode;
};

export const whatsNewData: WhatsNewData[] = [
  {
    title: 'Certifast Official Version 1.0',
    date: '1 Jan, 2022',
    content: (
      <Box>
        <Text mb="2">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti doloribus ipsam nihil
          aliquid at, eligendi reprehenderit, neque consectetur perspiciatis esse numquam quasi
          soluta minima inventore illo. Doloribus provident magni architecto!
        </Text>
        <UnorderedList pl="4" mb="6">
          <ListItem>New UI, hope you like it 😉.</ListItem>
          <ListItem>
            New way to manage input. Now you have spreadsheet experience when editing your inputs.
          </ListItem>
          <ListItem>Adding a tutorials, so you won&apos;t get lost.</ListItem>
          <ListItem>Feature you want it so bad. Export PDF yaaay 🎉.</ListItem>
        </UnorderedList>
        <AspectRatio ratio={4 / 3}>
          <Box background="blackAlpha.400" h="100%" />
        </AspectRatio>
      </Box>
    ),
  },
];
