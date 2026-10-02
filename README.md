# 202610-Kakeibo

ブラウザだけで動く家計簿アプリ。データは端末の localStorage にのみ保存され、CSV で入出力できます。

- 公開先: GitHub Pages（`main` への push で自動デプロイ）
- 技術: Vue 3 (SFC) / Vite / Tailwind CSS v4 + daisyUI 5 / Vitest

## 開発

```sh
npm install
npm run dev      # http://localhost:5173/202610-Kakeibo/
npm test         # ロジックのユニットテスト
npm run build    # dist/ に出力
```

## ブランチ運用

`develop` で作業し、`main` へ PR で取り込みます。`main` への push をトリガーに GitHub Actions が Pages へデプロイします。
初回のみ、リポジトリの Settings > Pages で Source を "GitHub Actions" に設定してください。

## CSV 形式

UTF-8（BOM 付き）、見出し行は `日付,カテゴリ,金額,メモ`。日付は `YYYY-MM-DD`、カテゴリは画面表示名（スーパー / 外食 / カフェ(平日) / カフェ(休日) / 買い食い）。
