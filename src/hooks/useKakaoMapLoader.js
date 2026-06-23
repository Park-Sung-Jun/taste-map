import { useEffect, useState } from 'react';

let isScriptLoading = false;
let isScriptLoaded = false;
let loadCallbacks = [];

export function useKakaoMapLoader() {
  const [isLoaded, setIsLoaded] = useState(isScriptLoaded);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isScriptLoaded) {
      setIsLoaded(true);
      return;
    }

    const onScriptLoad = () => {
      isScriptLoaded = true;
      isScriptLoading = false;
      setIsLoaded(true);
      const callbacks = loadCallbacks;
      loadCallbacks = [];
      callbacks.forEach((cb) => cb());
    };

    if (isScriptLoading) {
      loadCallbacks.push(onScriptLoad);
      return;
    }

    if (window.kakao && window.kakao.maps) {
      isScriptLoaded = true;
      setIsLoaded(true);
      return;
    }

    const apiKey = import.meta.env.VITE_KAKAO_MAP_API_KEY;
    if (!apiKey) {
      const err = new Error('Kakao Map API key (VITE_KAKAO_MAP_API_KEY) is missing in .env');
      setError(err);
      console.error(err);
      return;
    }

    isScriptLoading = true;
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false&libraries=services,clusterer`;
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        onScriptLoad();
      });
    };

    script.onerror = (err) => {
      isScriptLoading = false;
      setError(err);
      console.error('Failed to load Kakao Maps script:', err);
    };

    document.head.appendChild(script);

    return () => {
      // 싱글톤 상태이므로 마운트 해제 시 스크립트를 제거하지 않고 그대로 유지합니다.
    };
  }, []);

  return { isLoaded, error };
}
