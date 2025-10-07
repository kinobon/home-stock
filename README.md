# 🏠 Home Stock Manager

> **備品在庫管理アプリ** - SolidJS + TailwindCSS + PWA  
> 家の備品（入浴剤など）の在庫をローカルで管理。完全オフライン対応。

[![Deploy to GitHub Pages](https://github.com/[username]/home-stock/actions/workflows/deploy.yml/badge.svg)](https://github.com/[username]/home-stock/actions/workflows/deploy.yml)

---

## ✨ Features

- 📦 **備品管理**: 名前・数量・写真・メモで備品を管理
- ➕➖ **数量調整**: ワンタップで在庫の増減
- 🔍 **検索・ソート**: 名前/数量で検索・並び替え
- 📸 **画像圧縮**: 自動で写真を最適化して保存
- 💾 **オフライン対応**: IndexedDB でローカル保存
- 📥 **エクスポート**: JSON 形式でデータをバックアップ
- 📱 **PWA 対応**: ホーム画面に追加してアプリのように使える
- 🍎 **iOS 最適化**: スクロール・タップ操作を高速化

---

## 🚀 Tech Stack

| Category      | Technology                                               |
| ------------- | -------------------------------------------------------- |
| **Framework** | [SolidJS](https://www.solidjs.com/)                      |
| **Styling**   | TailwindCSS v4                                           |
| **State**     | Solid Store                                              |
| **Database**  | IndexedDB (via [idb](https://www.npmjs.com/package/idb)) |
| **Image**     | browser-image-compression                                |
| **Build**     | Vite                                                     |
| **PWA**       | Vite Plugin PWA + Workbox                                |
| **Deploy**    | GitHub Pages                                             |
| **Tooling**   | ESLint + Prettier + Husky                                |

---

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/[username]/home-stock.git
cd home-stock

# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

---

## 🛠️ Development

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Lint
pnpm lint

# Format
pnpm format

# Format check
pnpm format:check
```

---

## 📱 PWA Setup

1. **アイコン準備**: `public/` に `pwa-192x192.png` と `pwa-512x512.png` を配置
2. **ビルド**: `pnpm build`
3. **デプロイ**: GitHub Pages または任意のホスティング

---

## 🏗️ Project Structure

```
home-stock/
├── src/
│   ├── components/
│   │   ├── Header.tsx          # ヘッダー・検索・ソート
│   │   ├── ItemCard.tsx        # アイテムカード
│   │   ├── ItemList.tsx        # アイテム一覧
│   │   └── EditorModal.tsx     # 編集/新規追加モーダル
│   ├── state/
│   │   ├── store.ts            # Solid Store (状態管理)
│   │   └── db.ts               # IndexedDB 操作
│   ├── utils/
│   │   ├── scroll.ts           # iOS スクロール最適化
│   │   └── image.ts            # 画像圧縮
│   ├── types/
│   │   └── index.ts            # 型定義
│   ├── App.tsx                 # メインアプリ
│   └── index.css               # グローバルスタイル
├── public/
│   ├── manifest.json           # PWA マニフェスト
│   └── *.png                   # PWA アイコン
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions
└── vite.config.ts              # Vite + PWA 設定
```

---

## 📊 Data Model

```typescript
interface Item {
  id: string; // nanoid()
  name: string; // 備品名
  quantity: number; // 在庫数
  photo?: string; // Base64 画像
  memo?: string; // メモ
  createdAt: number; // 作成日時
  updatedAt: number; // 更新日時
}
```

---

## 🔧 iOS Optimization

iOS Safari でのスクロール・タップ操作を最適化:

- `passive: true` でスクロールブロッキングを回避
- `requestAnimationFrame` ベースのデバウンス
- ±ボタン連打時の再レンダリング抑制

詳細: [`src/utils/scroll.ts`](src/utils/scroll.ts)

---

## 📥 Export / Import

### Export

1. 「📥 エクスポート」ボタンをクリック
2. JSON ファイルがダウンロードされます

### Import

現在は手動インポート機能は未実装。将来的に対応予定。

---

## 🚀 Deployment

GitHub Actions で自動デプロイされます:

1. `main` ブランチにプッシュ
2. 自動ビルド → GitHub Pages にデプロイ
3. `https://[username].github.io/home-stock/` で公開

### 初回設定

1. GitHub リポジトリの Settings → Pages
2. Source を "GitHub Actions" に設定

---

## 📄 License

MIT

---

## 🙏 Acknowledgments

- [SolidJS](https://www.solidjs.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Vite Plugin PWA](https://vite-pwa-org.netlify.app/)
- [idb](https://github.com/jakearchibald/idb)
- [browser-image-compression](https://github.com/Donaldcwl/browser-image-compression)
