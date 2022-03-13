import React, { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

const AdsenseCard = () => {
  useEffect(() => {
    setTimeout(() => {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    }, 1000);
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block', height: '250px' }}
      data-ad-client="ca-pub-1569240148192328"
      data-ad-slot="1569240148192328"
      data-ad-format="rectangle"
      data-adtest={import.meta.env.DEV ? 'on' : 'off'}
    />
  );
};

export default AdsenseCard;
