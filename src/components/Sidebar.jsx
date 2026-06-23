import React, { useState, useMemo } from 'react';
import { Search, Compass, Flame, PenTool, Sun, Moon, AlertCircle, ArrowUpRight } from 'lucide-react';
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
      {/* Header */}
      <div className="sidebar-header">
        <div className="logo-section">
          <div>
            <h1 className="logo-title">
              <Compass size={24} className="logo-icon" style={{ color: 'var(--accent-gold)' }} />
              입맛 지도
            </h1>
            <p className="logo-sub">My Taste Registry</p>
          </div>
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
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
            const gap = restaurant.naverRating - restaurant.rating;
            const isGem = gap < 0; // 내 평점이 네이버보다 높다면 숨겨진 보물
            
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
    </div>
  );
}
