import { COMPONENT_ID } from 'helpers';
import { Tutorial } from './TutorialPopup';

export interface TutorialData {
  basic: (setStyle: any) => Tutorial[];
  customFont: (setStyle: any) => Tutorial[];
}

export const tutorialData: TutorialData = {
  basic: (setStyle) => [
    {
      title: 'Import your template',
      description: 'Drag & Drop your certificate template to drop zone.',
    },
    {
      title: 'Dynamic Text',
      description:
        'Pick dynamic text on toolbar, and type something as identifier, then put it on the canvas',
      onMount: () => {
        const target = document.getElementById(COMPONENT_ID.DYNAMIC_TEXT);
        const arrow = document.getElementById(COMPONENT_ID.ARROW_TUTORIAL);

        if (target && arrow) {
          const { top, left, width, height } = target.getBoundingClientRect();
          const { height: arrowHeight } = arrow.getBoundingClientRect();

          setStyle({
            top: top + height / 2 - arrowHeight / 2,
            left: left + width + 10,
            display: 'block',
          });
        }
      },
      onUnMount: () => {
        setStyle({
          top: 0,
          left: 0,
          display: 'none',
        });
      },
    },
    {
      title: 'Manage the data that you want to print',
      description:
        'Go to input on sidebar and then choose manage input, and manage your spreadsheet.',
    },
    {
      title: 'Magic happens here',
      description:
        'Go to General on sidebar and then choose Generate Certificate. Choose format you want.',
    },
  ],
  customFont: (setStyle) => [
    {
      title: 'Open Settings',
      description: 'Go to settings on toolbar and go to Custom Fonts menu',
      onMount: () => {
        const target = document.getElementById(COMPONENT_ID.SETTINGS);
        const arrow = document.getElementById(COMPONENT_ID.ARROW_TUTORIAL);

        if (target && arrow) {
          const { top, left, width, height } = target.getBoundingClientRect();
          const { height: arrowHeight } = arrow.getBoundingClientRect();

          setStyle({
            top: top + height / 2 - arrowHeight / 2,
            left: left + width + 10,
            display: 'block',
          });
        }
      },
      onUnMount: () => {
        setStyle({
          top: 0,
          left: 0,
          display: 'none',
        });
      },
    },
    {
      title: 'Add your favourite Font',
      description: 'Click Add Font button and choose your font with otf or ttf format.',
    },
    {
      title: 'See your favourite font',
      description: 'Now you can use your favourite font to generate certificates.',
    },
  ],
};
