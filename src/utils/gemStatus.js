// 네이버 평점과 내 평점의 격차(거품/보물 여부)를 계산하는 공용 헬퍼
export function computeGemStatus(naverRating, myRating) {
  const gap = naverRating - myRating;
  const isGem = gap < 0; // 내 평점이 네이버보다 높다면 숨겨진 보물
  return { gap, isGem };
}
