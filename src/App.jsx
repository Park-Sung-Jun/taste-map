import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import KakaoMap from './components/KakaoMap';
import BlogDrawer from './components/BlogDrawer';
import AddPostModal from './components/AddPostModal';
import { sampleRestaurants } from './data/restaurants';
import './App.css';

export default function App() {
  // 테마 초기 상태 (첫 화면부터 극도의 미니멀리즘이 돋보이도록 라이트로 설정)
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('taste-map-theme');
    return saved || 'light';
  });

  const [restaurants, setRestaurants] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showMobileList, setShowMobileList] = useState(false); // 모바일용 리스트 토글 상태

  // 로컬스토리지 저장된 맛집 불러오기 및 기본 Mock 데이터와 합치기
  useEffect(() => {
    const saved = localStorage.getItem('taste-map-restaurants');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const combined = [...parsed];
        sampleRestaurants.forEach((mock) => {
          if (!combined.some((item) => item.id === mock.id)) {
            combined.push(mock);
          }
        });
        setRestaurants(combined);
      } catch (e) {
        console.error('Failed to parse saved restaurants', e);
        setRestaurants(sampleRestaurants);
      }
    } else {
      setRestaurants(sampleRestaurants);
    }
  }, []);

  // 테마 변경 시 HTML 어트리뷰트 주입
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('taste-map-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // 신규 맛집 정보 제출 핸들러
  const handleAddRestaurant = (newRestaurant) => {
    const updated = [newRestaurant, ...restaurants];
    setRestaurants(updated);
    localStorage.setItem('taste-map-restaurants', JSON.stringify(updated));
    setSelectedId(newRestaurant.id);
    setShowMobileList(false); // 등록 후 목록 닫고 바로 지도로 핀 확인 가능하게 닫기
  };

  const handleSelectRestaurant = (id) => {
    if (selectedId === id) {
      setSelectedId(null);
    } else {
      setSelectedId(id);
      setShowMobileList(false); // 마커/리스트 아이템 선택 시 지도를 보거나 상세를 보게 하기 위해 목록 숨김
    }
  };

  // 선택된 레스토랑 상세 정보
  const selectedRestaurant = restaurants.find((r) => r.id === selectedId) || null;

  return (
    <div className="app-container">
      {/* Sidebar Section (모바일 열림 상태 클래스 부여) */}
      <div className={`sidebar-wrapper-outer ${showMobileList ? 'mobile-open' : ''}`}>
        <Sidebar
          restaurants={restaurants}
          selectedId={selectedId}
          onSelectRestaurant={handleSelectRestaurant}
          theme={theme}
          toggleTheme={toggleTheme}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />
      </div>

      {/* Interactive Kakao Map Section */}
      <div className="map-container-area">
        <KakaoMap
          restaurants={restaurants}
          selectedId={selectedId}
          onSelectRestaurant={handleSelectRestaurant}
        />
        
        {/* 모바일 전용 목록/지도 플로팅 전환 토글 버튼 */}
        <button 
          className="mobile-view-toggle-btn"
          onClick={() => setShowMobileList(prev => !prev)}
        >
          {showMobileList ? '🗺️ 지도 보기' : '📋 맛집 목록'}
        </button>
      </div>


      {/* slide-out Blog Drawer */}
      {selectedId && (
        <BlogDrawer
          restaurant={selectedRestaurant}
          onClose={() => setSelectedId(null)}
        />
      )}

      {/* Add New Restaurant & Blog Post Modal */}
      <AddPostModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddRestaurant}
      />
    </div>
  );
}
