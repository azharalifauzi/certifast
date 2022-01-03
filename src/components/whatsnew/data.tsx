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
    date: '3 Jan, 2022',
    content: (
      <Box>
        <Text mb="2">
          We are really excited to announce that version 1.0 is now released 🎉. We&apos;ve worked
          so hard to bring better User Experience, just for you. Now, you&apos;ll able to manage
          input easier than before, clearer way to add dynamic text, and fix some bugs 😅. Here are
          the lists of update for version 1.0 :
        </Text>
        <UnorderedList pl="4" mb="6">
          <ListItem>New UI, hope you like it 😉.</ListItem>
          <ListItem>
            New way to manage input. Now you have spreadsheet experience when editing your inputs.
          </ListItem>
          <ListItem>Adding a tutorials, so you won&apos;t get lost.</ListItem>
          <ListItem>Feature you want it so bad. Export PDF yaaay 🎉.</ListItem>
          <ListItem>Improve font placement accuracy on the document.</ListItem>
        </UnorderedList>
        <AspectRatio ratio={4 / 3}>
          <video autoPlay muted playsInline loop>
            <source src="/video/whatsnew/1.0.mp4" type="video/mp4" />
          </video>
        </AspectRatio>
      </Box>
    ),
  },
];
