// 支出カテゴリ（固定）。順序は表示順・グラフの色順そのもの。
export const CATEGORIES = [
  { id: 'super', label: 'スーパー', hint: 'スーパーで買った物はスイーツでも弁当でもここ' },
  { id: 'eatout', label: '外食', hint: '' },
  { id: 'cafe_weekday', label: 'カフェ(平日)', hint: '' },
  { id: 'cafe_holiday', label: 'カフェ(休日)', hint: '' },
  { id: 'snack', label: '買い食い', hint: 'シャトレーゼ等、スーパー以外で買ったスイーツ' },
]

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]))
export const CATEGORY_BY_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.label, c]))

export function categoryLabel(id) {
  return CATEGORY_BY_ID[id]?.label ?? id
}
