import { useEffect, useRef, useState } from 'react';
import { useKakaoMapLoader } from '../hooks/useKakaoMapLoader';
import './KakaoMap.css';

export default function KakaoMap({ restaurants, selectedId, onSelectRestaurant }) {
  const { isLoaded, error } = useKakaoMapLoader();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const overlaysRef = useRef({}); // restaurantId -> CustomOverlay mapping

  // 지도 인스턴스 초기화
  useEffect(() => {
    if (!isLoaded || mapInstanceRef.current || !mapContainerRef.current) return;

    const kakao = window.kakao;
    // 서울 평균 중심 좌표 설정 (맛집들이 모인 성수/중구 일대의 평균)
    const options = {
      center: new kakao.maps.LatLng(37.548, 127.01),
      level: 6
    };

    const map = new kakao.maps.Map(mapContainerRef.current, options);
    mapInstanceRef.current = map;

    // 지도 줌 컨트롤 추가
    const zoomControl = new kakao.maps.ZoomControl();
    map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
  }, [isLoaded]);

  // 마커(커스텀 오버레이) 추가 및 업데이트
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    const kakao = window.kakao;
    const map = mapInstanceRef.current;

    // 기존 오버레이 모두 제거
    Object.values(overlaysRef.current).forEach((overlay) => overlay.setMap(null));
    overlaysRef.current = {};

    // 동일 및 초인접한 마커 겹침 방지용 좌표 기록
    const renderedCoords = [];

    restaurants.forEach((restaurant) => {
      let lat = restaurant.coords.lat;
      let lng = restaurant.coords.lng;

      // 대략 25m 이내에 이미 배치된 마커가 있다면 겹침으로 취급
      const threshold = 0.00025;
      const overlaps = renderedCoords.filter(
        (c) => Math.abs(c.lat - lat) < threshold && Math.abs(c.lng - lng) < threshold
      );

      if (overlaps.length > 0) {
        // 나란히 분산되도록 꽃잎 분포(Spiderfying) 각도 및 반경 가중치 연산
        const angle = (overlaps.length * 2 * Math.PI) / 8; // 8개 방향 고르게 분포
        const distance = 0.00018 * (Math.floor(overlaps.length / 8) + 1); // 다중 겹침 시 외곽 분포
        lat += distance * Math.sin(angle);
        lng += distance * Math.cos(angle);
      }

      renderedCoords.push({ lat, lng });
      const position = new kakao.maps.LatLng(lat, lng);

      // 커스텀 오버레이 엘리먼트 동적 생성
      const element = document.createElement('div');
      element.className = `custom-map-marker ${selectedId === restaurant.id ? 'active' : ''}`;
      element.innerHTML = `
        <span>${restaurant.name}</span>
        <span class="star-icon">★</span>
        <span class="rating-text">${restaurant.rating.toFixed(1)}</span>
      `;

      // 클릭 이벤트 연결
      element.addEventListener('click', () => {
        onSelectRestaurant(restaurant.id);
      });

      const customOverlay = new kakao.maps.CustomOverlay({
        position: position,
        content: element,
        yAnchor: 1.2 // 마커 아래쪽 끝이 좌표에 맞물리도록 조정
      });

      customOverlay.setMap(map);
      overlaysRef.current[restaurant.id] = customOverlay;
    });
  }, [isLoaded, restaurants, onSelectRestaurant]);

  // selectedId 변경에 대응하여 마커 active 클래스 전환 및 지도 중심 이동
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    const kakao = window.kakao;
    const map = mapInstanceRef.current;

    restaurants.forEach((restaurant) => {
      const overlay = overlaysRef.current[restaurant.id];
      if (overlay) {
        const contentElement = overlay.getContent();
        if (contentElement) {
          if (restaurant.id === selectedId) {
            contentElement.classList.add('active');
            
            // 겹침 방지가 적용된 마커의 실제 물리 좌표로 지도 초점 이동
            const moveLatLng = overlay.getPosition();
            map.panTo(moveLatLng);
          } else {
            contentElement.classList.remove('active');
          }
        }
      }
    });
  }, [selectedId, isLoaded, restaurants]);

  if (error) {
    return (
      <div className="map-error-placeholder">
        <p>⚠️ 지도를 로드하는 중 오류가 발생했습니다.</p>
        <p className="error-detail">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="map-wrapper" style={{ width: '100%', height: '100%', position: 'relative' }}>
      {!isLoaded && (
        <div className="map-loading-overlay">
          <div className="loading-spinner"></div>
          <p>지도를 불러오는 중입니다...</p>
        </div>
      )}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
