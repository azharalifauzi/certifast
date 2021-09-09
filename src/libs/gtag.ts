export const GA_TRACKING_ID = import.meta.env.VITE_GTAG_ID as string;

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  if (typeof window !== 'undefined')
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
};

type GTagEvent = {
  action: string;
  category: string;
  label: string;
  value: number;
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }: GTagEvent) => {
  if (typeof window !== 'undefined')
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
};

const CustomMap = <const>['download_size', 'certificates_count'];

const CUSTOM_DIMENSIONS_MAP: Record<typeof CustomMap[number], string> = {
  download_size: 'dimension1',
  certificates_count: 'dimension2',
};

export function customDimension<T extends Record<typeof CustomMap[number], string | number>>(
  customMap: Array<typeof CustomMap[number]>,
  action: string,
  customParams: T
) {
  if (typeof window !== 'undefined') {
    const custom_map: Record<string, string> = {};

    customMap.forEach((val) => {
      custom_map[CUSTOM_DIMENSIONS_MAP[val]] = val;
    });

    window.gtag('config', GA_TRACKING_ID, {
      custom_map,
    });

    window.gtag('event', action, customParams);
  }
}
