import { useEffect, useState } from 'react';
import { X, ArrowRight, CheckCircle2, AlertTriangle, User, Calendar } from 'lucide-react';
import { computeGemStatus } from '../utils/gemStatus';
import './BlogDrawer.css';

export default function BlogDrawer({ restaurant, onClose }) {
  const [animateProgress, setAnimateProgress] = useState(false);

  useEffect(() => {
    if (restaurant) {
      // 컴포넌트 마운트 혹은 데이터 로드 시 게이지 애니메이션을 지연 작동시킵니다.
      setAnimateProgress(false);
      const timer = setTimeout(() => {
        setAnimateProgress(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [restaurant]);

  if (!restaurant) return null;

  const { scores } = restaurant;
  const { gap, isGem } = computeGemStatus(restaurant.naverRating, restaurant.rating);

  // 5대 평가 지표 키 매핑 및 국문 명칭
  const scoreMetrics = [
    { key: 'taste', label: '맛 (Flavor)' },
    { key: 'costPerformance', label: '가성비 (Value)' },
    { key: 'atmosphere', label: '분위기 (Vibe)' },
    { key: 'service', label: '서비스 (Service)' },
    { key: 'waiting', label: '예약/대기 (Access)' }
  ];

  // SVG 원형 차트 계산
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = animateProgress
    ? circumference - (restaurant.revisitRate / 100) * circumference
    : circumference;

  return (
    <div className="blog-drawer-overlay" onClick={onClose}>
      <div className="blog-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-header">
          <h2 className="drawer-header-title">미식 탐방 보고서</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {/* Content Body */}
        <div className="drawer-body">
          {/* Cover Image */}
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="drawer-cover-image"
          />

          {/* Core Restaurant Info */}
          <div className="drawer-main-info">
            <div className="drawer-title-row">
              <h1 className="drawer-restaurant-name">{restaurant.name}</h1>
            </div>
            <div className="card-category-list">
              {restaurant.category.map((cat, idx) => (
                <span key={idx} className="category-chip active" style={{ cursor: 'default' }}>
                  {cat}
                </span>
              ))}
            </div>
            <p className="drawer-address">{restaurant.address}</p>
          </div>

          {/* 5차원 내 입맛 평가 대시보드 */}
          <div className="ratings-dashboard">
            <h3 className="dashboard-title">내 입맛 평가</h3>

            {/* 5대 평점 게이지 바 */}
            <div className="metrics-gauges">
              {scoreMetrics.map((metric) => {
                const scoreValue = scores[metric.key] || 0.0;
                // 퍼센트 계산 (5점 만점 기준)
                const fillPercent = animateProgress ? (scoreValue / 5.0) * 100 : 0;
                return (
                  <div key={metric.key} className="rating-bar-container">
                    <span className="rating-bar-label">{metric.label}</span>
                    <div className="rating-bar-bg">
                      <div
                        className="rating-bar-fill"
                        style={{ width: `${fillPercent}%` }}
                      ></div>
                    </div>
                    <span className="rating-bar-value">{scoreValue.toFixed(1)}</span>
                  </div>
                );
              })}
            </div>

            {/* 평점 격차 지수 분석 (Value Gap) */}
            <div className="gap-analysis-container">
              <div className="gap-metric-item">
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>내 평점</div>
                <div className="gap-metric-val" style={{ color: 'var(--accent-gold)' }}>
                  ★{restaurant.rating.toFixed(1)}
                </div>
              </div>
              
              <ArrowRight className="gap-compare-icon" size={16} />

              <div className="gap-metric-item">
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>네이버 평점</div>
                <div className="gap-metric-val" style={{ color: 'var(--text-secondary)' }}>
                  ★{restaurant.naverRating.toFixed(1)}
                </div>
              </div>

              {/* 거품 혹은 보물 진단 배지 */}
              <div className={`gap-badge-detail ${isGem ? 'gem' : 'bubble'}`}>
                <span>{isGem ? '💎 숨겨진 보물' : '⚠️ 네이버 거품'}</span>
                <span className="score-text">
                  {isGem ? `+${Math.abs(gap).toFixed(2)}` : `-${gap.toFixed(2)}`}
                </span>
                <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>
                  {isGem ? '대외 평점보다 맛이 뛰어남' : '광고 거품 걷어낸 평정'}
                </span>
              </div>
            </div>

            {/* 재방문율 서클 게이지 */}
            <div className="revisit-indicator-section">
              <div className="revisit-gauge-container">
                <svg className="revisit-gauge-svg">
                  <circle className="revisit-gauge-circle-bg" cx="45" cy="45" r={radius} />
                  <circle
                    className="revisit-gauge-circle-fill"
                    cx="45"
                    cy="45"
                    r={radius}
                    style={{
                      strokeDasharray: circumference,
                      strokeDashoffset: strokeDashoffset
                    }}
                  />
                </svg>
                <span className="revisit-gauge-text">{restaurant.revisitRate}%</span>
              </div>
              <div className="revisit-meta-info">
                <h4 className="revisit-meta-heading">재방문 의사</h4>
                <p className="revisit-meta-desc">
                  {restaurant.revisitRate >= 90
                    ? '묻지도 따지지도 않고 언제나 재방문할 극찬의 맛집입니다.'
                    : restaurant.revisitRate >= 80
                    ? '가치가 충분하며 근처에 갈 일이 생기면 기꺼이 들릴 만합니다.'
                    : '호기심 삼아 1번쯤은 가볼 만하지만, 두 번 갈지는 미지수입니다.'}
                </p>
              </div>
            </div>
          </div>

          {/* 블로그 포스팅 아티클 */}
          {restaurant.blogPost && (
            <article className="blog-post-article">
              <h2 className="blog-post-title">{restaurant.blogPost.title}</h2>
              <div className="blog-meta-row">
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <User size={14} /> 미식가 기록단
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={14} /> {restaurant.blogPost.publishDate}
                </span>
              </div>
              <div className="blog-post-body">
                {restaurant.blogPost.content}
              </div>
            </article>
          )}
        </div>
      </div>
    </div>
  );
}
