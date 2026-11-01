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

UTF-8（BOM 付き）、見出し行は `日付,カテゴリ,金額,メモ`。日付は `YYYY-MM-DD`、カテゴリは画面表示名。読み込み時、まだ無いカテゴリ名は新しいカテゴリとして追加します。

## カテゴリ

画面右上の「カテゴリの編集」から、追加・名前と説明と色の変更・並べ替え・削除ができます。明細のあるカテゴリを削除するときは、明細を別のカテゴリに移します。カテゴリの一覧は localStorage の `kakeibo.categories.v1` に保存し、未保存の端末では初期カテゴリ（スーパー / 外食 / カフェ(平日) / カフェ(休日) / 買い食い）を使います。
