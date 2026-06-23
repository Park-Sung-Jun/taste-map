import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import './AddPostModal.css';

export default function AddPostModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    categoryMain: '',
    categorySub: '',
    region: '', // 지역 속성 추가
    description: '',
    address: '',
    naverRating: '4.5',
    revisitRate: '85',
    image: '',
    // 5D Scores
    taste: '4.0',
    costPerformance: '4.0',
    atmosphere: '4.0',
    service: '4.0',
    waiting: '4.0',
    // Blog Info
    blogTitle: '',
    blogContent: ''
  });

  // 슬라이더 변경 시 최종 평균 나의 평점 자동 계산
  const calculatedRating = (() => {
    const sum = 
      parseFloat(formData.taste) +
      parseFloat(formData.costPerformance) +
      parseFloat(formData.atmosphere) +
      parseFloat(formData.service) +
      parseFloat(formData.waiting);
    return (sum / 5.0).toFixed(1);
  })();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // 주소 입력 시 두 번째 어구(구/동 단위)를 파싱해 대표 지역명을 자동으로 추천 채우기
    if (name === 'address' && value) {
      const parts = value.trim().split(/\s+/);
      if (parts.length >= 2 && !formData.region) {
        const guessedRegion = parts[1].replace(/구$/, '').replace(/동$/, '');
        setFormData((prev) => ({
          ...prev,
          address: value,
          region: guessedRegion
        }));
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value).toFixed(1)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.address || !formData.categoryMain) {
      alert('상호명, 주소, 대표 카테고리는 필수 입력 항목입니다.');
      return;
    }

    const savePost = (coords) => {
      const newRestaurant = {
        id: String(Date.now()),
        name: formData.name,
        category: [formData.categoryMain, formData.categorySub].filter(Boolean),
        region: formData.region || '서울', // 저장 병합
        description: formData.description || `${formData.name} 방문기`,
        address: formData.address,
        coords: coords,
        rating: parseFloat(calculatedRating),
        naverRating: parseFloat(formData.naverRating) || 4.5,
        scores: {
          taste: parseFloat(formData.taste),
          costPerformance: parseFloat(formData.costPerformance),
          atmosphere: parseFloat(formData.atmosphere),
          service: parseFloat(formData.service),
          waiting: parseFloat(formData.waiting)
        },
        revisitRate: parseInt(formData.revisitRate, 10),
        image: formData.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
        blogPost: {
          title: formData.blogTitle || `[${formData.categoryMain}] ${formData.name} 솔직 담백 방문 보고서`,
          publishDate: new Date().toISOString().split('T')[0],
          content: formData.blogContent || '상세 리뷰가 아직 작성되지 않았습니다.'
        }
      };

      onSubmit(newRestaurant);
      onClose();
    };

    // 카카오맵 Geocoder를 활용한 정밀 주소 좌표 변환 시도
    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(formData.address, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const coords = {
            lat: parseFloat(result[0].y),
            lng: parseFloat(result[0].x)
          };
          savePost(coords);
        } else {
          // 주소 변환 실패 시 맵의 기본 중심 근처에 약간의 랜덤 편차를 주어 Fallback 처리
          console.warn('Geocoder failed. Using fallback random coordinates.');
          const fallbackCoords = {
            lat: 37.54 + (Math.random() - 0.5) * 0.05,
            lng: 127.02 + (Math.random() - 0.5) * 0.05
          };
          savePost(fallbackCoords);
        }
      });
    } else {
      // 카카오 맵 로드 전이거나 API 미지원 시 Fallback
      const fallbackCoords = {
        lat: 37.54 + (Math.random() - 0.5) * 0.05,
        lng: 127.02 + (Math.random() - 0.5) * 0.05
      };
      savePost(fallbackCoords);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">새로운 미식 포스팅 등록</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="modal-body">
            {/* 맛집 기본 정보 */}
            <div>
              <h3 className="modal-section-title">맛집 기본 정보</h3>
              <div className="form-group-grid" style={{ marginBottom: 12 }}>
                <div className="form-group">
                  <label className="form-label">상호명 *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    placeholder="예: 스시 오오모토"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">대표 이미지 URL</label>
                  <input
                    type="text"
                    name="image"
                    className="form-input"
                    placeholder="이미지 주소를 링크해주세요"
                    value={formData.image}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group-grid" style={{ marginBottom: 12 }}>
                <div className="form-group">
                  <label className="form-label">대분류 카테고리 *</label>
                  <input
                    type="text"
                    name="categoryMain"
                    className="form-input"
                    placeholder="예: 일식, 한식, 양식, 카페"
                    value={formData.categoryMain}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">소분류 카테고리</label>
                  <input
                    type="text"
                    name="categorySub"
                    className="form-input"
                    placeholder="예: 스시, 우동, 라멘, 디저트"
                    value={formData.categorySub}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group-grid" style={{ marginBottom: 12 }}>
                <div className="form-group">
                  <label className="form-label">식당 주소 (실제 주소를 치면 지도에 핀이 자동 생성됩니다) *</label>
                  <input
                    type="text"
                    name="address"
                    className="form-input"
                    placeholder="예: 서울 성동구 아차산로 107"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">대표 지역명 (주소 입력 시 자동 유추) *</label>
                  <input
                    type="text"
                    name="region"
                    className="form-input"
                    placeholder="예: 성수, 역삼, 합정, 구의"
                    value={formData.region}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">맛집 한줄 요약평</label>
                <input
                  type="text"
                  name="description"
                  className="form-input"
                  placeholder="카드의 리스트 요약 글에 표시됩니다."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* 내 입맛 평점 입력 */}
            <div>
              <h3 className="modal-section-title">내 입맛 평가</h3>
              <div className="sliders-grid">
                <div className="slider-item-control">
                  <div className="slider-label-row">
                    <span>맛 (Flavor)</span>
                    <span className="slider-val-preview">{formData.taste}</span>
                  </div>
                  <input
                    type="range"
                    name="taste"
                    min="1"
                    max="5"
                    step="0.1"
                    className="slider-input-range"
                    value={formData.taste}
                    onChange={handleSliderChange}
                  />
                </div>
                <div className="slider-item-control">
                  <div className="slider-label-row">
                    <span>가성비 (Value)</span>
                    <span className="slider-val-preview">{formData.costPerformance}</span>
                  </div>
                  <input
                    type="range"
                    name="costPerformance"
                    min="1"
                    max="5"
                    step="0.1"
                    className="slider-input-range"
                    value={formData.costPerformance}
                    onChange={handleSliderChange}
                  />
                </div>
                <div className="slider-item-control">
                  <div className="slider-label-row">
                    <span>분위기 (Vibe)</span>
                    <span className="slider-val-preview">{formData.atmosphere}</span>
                  </div>
                  <input
                    type="range"
                    name="atmosphere"
                    min="1"
                    max="5"
                    step="0.1"
                    className="slider-input-range"
                    value={formData.atmosphere}
                    onChange={handleSliderChange}
                  />
                </div>
                <div className="slider-item-control">
                  <div className="slider-label-row">
                    <span>서비스 (Service)</span>
                    <span className="slider-val-preview">{formData.service}</span>
                  </div>
                  <input
                    type="range"
                    name="service"
                    min="1"
                    max="5"
                    step="0.1"
                    className="slider-input-range"
                    value={formData.service}
                    onChange={handleSliderChange}
                  />
                </div>
                <div className="slider-item-control">
                  <div className="slider-label-row">
                    <span>예약/대기 편의성 (Access)</span>
                    <span className="slider-val-preview">{formData.waiting}</span>
                  </div>
                  <input
                    type="range"
                    name="waiting"
                    min="1"
                    max="5"
                    step="0.1"
                    className="slider-input-range"
                    value={formData.waiting}
                    onChange={handleSliderChange}
                  />
                </div>
                <div className="slider-item-control">
                  <div className="slider-label-row">
                    <span>재방문 의향 (%)</span>
                    <span className="slider-val-preview">{formData.revisitRate}%</span>
                  </div>
                  <input
                    type="range"
                    name="revisitRate"
                    min="0"
                    max="100"
                    step="1"
                    className="slider-input-range"
                    value={formData.revisitRate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group-grid" style={{ marginTop: 12 }}>
                <div className="form-group">
                  <label className="form-label">네이버 포털 평균 평점 (거품 Gap 계산용)</label>
                  <input
                    type="number"
                    name="naverRating"
                    min="1"
                    max="5"
                    step="0.01"
                    className="form-input"
                    placeholder="예: 4.8"
                    value={formData.naverRating}
                    onChange={handleChange}
                  />
                </div>
                <div className="calculated-rating-banner">
                  <span>입체 점수 기반 최종 나의 평점:</span>
                  <strong style={{ fontSize: '1.2rem', color: 'var(--accent-gold)' }}>
                    ★{calculatedRating}
                  </strong>
                </div>
              </div>
            </div>

            {/* 블로그 포스트 작성 */}
            <div>
              <h3 className="modal-section-title">연동 미식 블로그 기록</h3>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">블로그 제목</label>
                <input
                  type="text"
                  name="blogTitle"
                  className="form-input"
                  placeholder="예: [성수] 맛에 감탄한 수제 스시 탐방기"
                  value={formData.blogTitle}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">상세 시식 일기 (블로그 본문)</label>
                <textarea
                  name="blogContent"
                  className="form-input form-textarea"
                  placeholder="맛의 밸런스, 비주얼, 디테일한 방문 경험을 자유롭게 작성해 보세요."
                  value={formData.blogContent}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="modal-footer">
            <button type="button" className="modal-btn modal-btn-cancel" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="modal-btn modal-btn-submit">
              포스팅 발행하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
