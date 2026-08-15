import { useState, useMemo } from 'react';
import { Search, Compass, Flame, PenTool, Sun, Moon, AlertCircle, ArrowUpRight } from 'lucide-react';
import { computeGemStatus } from '../utils/gemStatus';
import './Sidebar.css';

export default function Sidebar({
  restaurants,
  selectedId,
  onSelectRestaurant,
  theme,
  toggleTheme,
  onOpenAddModal
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [sortBy, setSortBy] = useState('rating'); // 'rating', 'naverRating', 'gapDesc', 'gemDesc', 'revisitRate'

  // 카테고리 종류 추출
  const categories = useMemo(() => {
    const allCats = new Set(['전체']);
    restaurants.forEach((r) => {
      if (r.category && r.category[0]) {
        allCats.add(r.category[0]);
      }
    });
    return Array.from(allCats);
  }, [restaurants]);

  // 필터링 및 정렬 연산
  const filteredAndSortedRestaurants = useMemo(() => {
    return restaurants
      .filter((r) => {
        // 검색 필터 (상호명, 주소, 설명 및 대표 지역 태그까지 포괄)
        const matchesSearch =
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (r.region && r.region.toLowerCase().includes(searchQuery.toLowerCase())) ||
          r.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        // 카테고리 필터
        const matchesCategory =
          selectedCategory === '전체' || (r.category && r.category[0] === selectedCategory);

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') {
          return b.rating - a.rating;
        }
        if (sortBy === 'naverRating') {
          return b.naverRating - a.naverRating;
        }
        if (sortBy === 'gapDesc') {
          // 거품 격차 높은 순 (네이버 평점 - 내 평점 격차가 큰 순)
          const gapA = a.naverRating - a.rating;
          const gapB = b.naverRating - b.rating;
          return gapB - gapA;
        }
        if (sortBy === 'gemDesc') {
          // 숨겨진 보물 순 (내 평점 - 네이버 평점 격차가 큰 순)
          const gapA = a.rating - a.naverRating;
          const gapB = b.rating - b.naverRating;
          return gapB - gapA;
        }
        if (sortBy === 'revisitRate') {
          return b.revisitRate - a.revisitRate;
        }
        if (sortBy === 'regionAsc') {
          // 지역명 기준 한글 가나다순 정렬
          const regionA = a.region || '서울';
          const regionB = b.region || '서울';
          return regionA.localeCompare(regionB, 'ko');
        }
        return 0;
      });
  }, [restaurants, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="sidebar-container">
      {/* Header — 대표 사진 히어로 배너 (제목 오버레이형) */}
      <div className="sidebar-header">
        <div className="header-banner">
          <button
            className="theme-toggle-btn banner-toggle"
            onClick={toggleTheme}
            title={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <div className="header-banner-content">
            <h1 className="logo-title">
              <Compass size={22} className="logo-icon" style={{ color: 'var(--accent-gold)' }} />
              내 입맛지도
            </h1>
            <p className="logo-sub">Personal Taste Map</p>
          </div>
        </div>
      </div>


      {/* Search & Filters */}
      <div className="search-filter-section">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="상호명, 주소, 설명 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Chips */}
        <div className="category-chips-wrapper">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sorting Dropdown */}
        <div className="sort-section">
          <span>{filteredAndSortedRestaurants.length}개의 맛집</span>
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="rating">★ 내 평점 높은 순</option>
            <option value="naverRating">N 네이버 평점 높은 순</option>
            <option value="gapDesc">⚠️ 네이버 거품 심한 순 (Gap)</option>
            <option value="gemDesc">💎 숨겨진 나의 보물 맛집 순</option>
            <option value="revisitRate">🔥 재방문 의사 높은 순</option>
            <option value="regionAsc">📍 지역별 가나다순</option>
          </select>
        </div>
      </div>

      {/* Restaurant Cards List */}
      <div className="restaurant-list">
        {filteredAndSortedRestaurants.length > 0 ? (
          filteredAndSortedRestaurants.map((restaurant) => {
            const { gap, isGem } = computeGemStatus(restaurant.naverRating, restaurant.rating);
            
            return (
              <div
                key={restaurant.id}
                className={`restaurant-card fade-in ${selectedId === restaurant.id ? 'selected' : ''}`}
                onClick={() => onSelectRestaurant(restaurant.id)}
              >
                <div className="card-top">
                  <h3 className="card-title">
                    <span style={{ color: 'var(--accent-gold)', marginRight: 4 }}>[{restaurant.region || '서울'}]</span>
                    {restaurant.name}
                  </h3>
                  <span className="revisit-badge">재방문 {restaurant.revisitRate}%</span>
                </div>

                <div className="card-category-list">
                  {restaurant.category.map((cat, idx) => (
                    <span key={idx} className="card-category-tag">
                      {idx > 0 ? `> ${cat}` : cat}
                    </span>
                  ))}
                </div>

                <p className="card-description">{restaurant.description}</p>

                {/* Gap Chart Section */}
                <div className="card-gap-section">
                  <div className="card-gap-ratings">
                    <div className="rating-badge-item">
                      <span className="label">MY</span>
                      <span className="val" style={{ color: 'var(--accent-gold)' }}>
                        ★{restaurant.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="rating-badge-item">
                      <span className="label">네이버</span>
                      <span className="val">★{restaurant.naverRating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Gap indicator */}
                  <div className={`rating-gap-result ${isGem ? 'hidden-gem' : 'bubble-high'}`}>
                    {isGem ? (
                      <>
                        <ArrowUpRight size={14} />
                        <span>보물 (+{Math.abs(gap).toFixed(2)})</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={14} />
                        <span>거품 (-{gap.toFixed(2)})</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-results">
            검색 결과에 맞는 맛집이 없습니다.
          </div>
        )}
      </div>

      {/* Write Button */}
      <div className="write-btn-wrapper">
        <button className="write-btn" onClick={onOpenAddModal}>
          <PenTool size={18} />
          나만의 미식기록 등록하기
        </button>
      </div>

      {/* Footer — 출처·제작자 표기 */}
      <footer className="site-footer">
        <p className="ft-src">
          자료 출처:{' '}
          <a href="https://apis.map.kakao.com" target="_blank" rel="noopener">
            카카오맵 API
          </a>
          ,{' '}
          <a href="https://unsplash.com" target="_blank" rel="noopener">
            Unsplash
          </a>
        </p>
        <p className="ft-legal">
          원본 자료가 필요하시면 위 링크의 제공기관에서 직접 받으시기 바랍니다 — 이 사이트는 원자료를 그대로 내려받는 기능을 두지 않습니다.
        </p>
        <p className="ft-legal">음식점 사진은 각 권리자에게 권리가 있으며 해당 지역을 안내할 목적으로만 표시합니다.</p>
        <p className="ft-made">
          만든 사람 Park Sung Jun ·{' '}
          <a href="mailto:sungjunpark350@gmail.com?subject=%5B%EB%82%B4%20%EC%9E%85%EB%A7%9B%EC%A7%80%EB%8F%84%5D%20%EB%AC%B8%EC%9D%98">
            sungjunpark350@gmail.com
          </a>
        </p>
        <p className="ft-legal">틀린 내용이나 자료 표시에 관한 의견은 알려주시면 확인해 고치겠습니다.</p>
      </footer>
    </div>
  );
}
