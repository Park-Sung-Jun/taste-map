# 내 입맛지도 — 디자인 가이드라인

> 입맛은 사람마다 다르니까. 나만의 기준으로 만드는 개인 미식 지도.
> 톤: **Warm Minimalism — 차콜 · 골드 · 크림**

스타일링은 CSS 프레임워크 없이 **순수 CSS + CSS 커스텀 프로퍼티**로 구현한다.
모든 토큰의 정본은 `src/index.css`다. 새 컴포넌트는 아래 토큰만 사용하고 색상/폰트 값을 새로 만들지 않는다.

---

## 1. 색상 체계 (Color Palette)

### 브랜드 핵심 (테마 독립)
| 토큰 | HEX | 용도 |
|---|---|---|
| `--brand-charcoal` | `#2C241E` | 차콜 — 메인 텍스트 / 딥 뉴트럴 |
| `--brand-charcoal-soft` | `#63564A` | 보조 텍스트 (다크 토프) |
| `--brand-gold` | `#C28E53` | 골드 — 핵심 액센트 (버튼·활성·하이라이트) |
| `--brand-gold-light` | `#E5BA73` | 다크 테마 골드 |
| `--brand-cream` | `#FAF8F5` | 크림 — 기본 배경 |
| `--brand-cream-deep` | `#F3EFE6` | 크림 딥 — 보조 배경 |

### 시맨틱 토큰 (라이트 / 다크 자동 전환)
| 토큰 | Light | Dark | 용도 |
|---|---|---|---|
| `--bg-primary` | `#FAF8F5` | `#12100E` | 기본 배경 |
| `--bg-secondary` | `#F3EFE6` | `#1C1916` | 카드·패널 배경 |
| `--bg-tertiary` | `#E8E1D3` | `#27231F` | 비활성·트랙 |
| `--text-primary` | `#2C241E` | `#EDE8DF` | 본문 텍스트 |
| `--text-secondary` | `#63564A` | `#A69E92` | 보조 텍스트 |
| `--text-muted` | `#9E9182` | `#736B5F` | 캡션·라벨 |
| `--accent-gold` | `#C28E53` | `#E5BA73` | 핵심 액센트 |
| `--accent-green` | `#40694B` | `#5F8F6E` | 긍정(히든젬) |
| `--accent-red` | `#B85042` | `#E07A5F` | 경고(거품) |
| `--border-color` | `#EAE1D2` | `#302B26` | 얇은 보더 |

다크 테마는 `[data-theme='dark']`로 전환된다.

---

## 2. 타이포그래피 (Typography)

| 토큰 | 폰트 스택 | 용도 |
|---|---|---|
| `--font-display` | `'Playfair Display', 'Nanum Myeongjo', 'Noto Sans KR', serif` | **제목** (h1–h4) — 우아한 세리프 |
| `--font-body` | `'Montserrat', 'Noto Sans KR', sans-serif` | **본문 / UI** — 세련된 산세리프 |

- Playfair Display는 라틴 전용이라 한글 제목은 자동으로 **Nanum Myeongjo**(명조)로 폴백 → 한·영 모두 세리프 우아함 유지.
- 본문 라틴은 **Montserrat**, 한글은 **Noto Sans KR**.
- 베이스 스케일: `html { font-size: 14px }`, 본문 `0.85rem`, 자간 `-0.03em`(제목은 `-0.01em`로 완화).
- 제목 크기: `h1 1.15rem / h2 1.0rem / h3 0.9rem / h4 0.82rem`.

---

## 3. 레이아웃 구성 (Layout)

대화면 지도가 중심. **CSS Grid 2-컬럼 고정**.

```css
.app-container {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr; /* 사이드바 고정 + 지도 가변 */
  grid-template-rows: 100vh;
}
```

| 토큰 | 값 | 의미 |
|---|---|---|
| `--sidebar-width` | `320px` | 사이드바 고정 폭 |
| 메인 지도 | `1fr` | 남은 영역 전부 |

- **데스크톱**: 사이드바(320px) + 지도(나머지). 사이드바는 `width:100%`로 그리드 트랙을 채움.
- **모바일 (≤768px)**: `grid-template-columns: 1fr` 단일 컬럼, 사이드바는 `position:absolute` 오버레이로 슬라이드 인.

---

## 4. 형태 규칙 (Form)

- **반경**: 4px 기준(버튼·카드·인풋), 칩 등 작은 요소는 2–4px.
- **그림자**: 거의 사용 안 함(`--shadow-sm/md: none`). 깊이는 보더와 배경 톤차로 표현.
- **보더**: `1px solid var(--border-color)` — 얇은 웜 톤 라인.
- **전환**: `--transition-speed: 0.2s`, easing `cubic-bezier(0.16, 1, 0.3, 1)`.
- **액센트 사용 절제**: 골드는 핵심 액션·활성 상태에만. 면적을 넓게 칠하지 않는다.
