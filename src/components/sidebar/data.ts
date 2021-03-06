import { COMPONENT_ID } from 'helpers';
import * as gtag from 'libs/gtag';
import { Tutorial } from './TutorialPopup';

export type TutorialDataItem<T> = {
  data: T;
  id: string;
  onFinish?: () => void;
  onClose?: () => void;
};

export interface TutorialData {
  basic: (setStyle: any) => TutorialDataItem<Tutorial[]>;
  customFont: (setStyle: any) => TutorialDataItem<Tutorial[]>;
}

export const tutorialData: TutorialData = {
  basic: (setStyle) => ({
    id: 'create_multiple_certificates',
    data: [
      {
        title: 'Import your template',
        description: 'Drag & Drop your certificate template to drop zone.',
        videoSrc: '/video/tutorials/create-multiple-certificates/step-1.mp4',
      },
      {
        title: 'Dynamic Text',
        description:
          'Pick dynamic text on toolbar, and type something as identifier, then put it on the position you want.',
        videoSrc: '/video/tutorials/create-multiple-certificates/step-2.mp4',
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
        videoSrc: '/video/tutorials/create-multiple-certificates/step-3.mp4',
      },
      {
        title: 'Magic happens here',
        description:
          'Go to General on sidebar and then choose Generate Certificate. Choose format you want. Then click generate.',
        videoSrc: '/video/tutorials/create-multiple-certificates/step-4.mp4',
      },
    ],
    onFinish: () => {
      gtag.event({
        action: 'finish_tutorial',
        label: 'create multiple certificates',
        category: 'engagement',
        value: 1,
      });
    },
  }),
  customFont: (setStyle) => ({
    id: 'add_custom_font',
    data: [
      {
        title: 'Open Settings',
        description: 'Go to settings on toolbar and go to Custom Fonts menu',
        videoSrc: '/video/tutorials/add-custom-font/step-1.mp4',
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
        videoSrc: '/video/tutorials/add-custom-font/step-2.mp4',
      },
      {
        title: 'See your favourite font',
        description: 'Now you can use your favourite font to generate certificates.',
        videoSrc: '/video/tutorials/add-custom-font/step-3.mp4',
      },
    ],
    onFinish: () => {
      gtag.event({
        action: 'finish_tutorial',
        label: 'add custom font',
        category: 'engagement',
        value: 1,
      });
    },
  }),
};
