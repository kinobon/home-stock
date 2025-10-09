# 🏠 home-stock(備品管理)

> SolidJS + TailwindCSS + PWA  
> 家の備品(入浴剤など)の在庫をローカルで管理するアプリ。  
> CSRオンリー・IndexedDB保存・完全オフライン対応。

---

## 🚀 Stack

- **Framework**: [SolidJS](https://www.solidjs.com/)
- **Styling**: TailwindCSS
- **Persistence**: IndexedDB (via [idb](https://www.npmjs.com/package/idb))
- **Image Handling**: browser-image-compression
- **Build Tool**: Vite
- **PWA**: Workbox / Vite Plugin PWA
- **Deployment**: GitHub Pages (via GitHub Actions)
- **Tooling**: ESLint + Prettier + Husky

---

## 📦 Data Model

```ts
type ItemID = string; // nanoid()
type Timestamp = number; // Date.now()

export interface Item {
  id: ItemID;
  name: string;
  quantity: number;
  photo?: string;
  memo?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AppState {
  items: Item[];
  searchQuery: string;
  sortBy: "name" | "quantity";
  isAscending: boolean;
  selectedItemId?: ItemID;
  view: "list" | "editor";
}

export interface ExportData {
  version: string;
  exportedAt: Timestamp;
  items: Item[];
}
```

---

## ⚙️ GitHub Actions (Deploy to GitHub Pages)

`.github/workflows/deploy.yml`

このワークフローは**パブリックリポジトリとプライベートリポジトリの両方**で動作します。

**プライベートリポジトリの要件:**
- GitHub Pro、GitHub Team、GitHub Enterprise Cloud、または GitHub Enterprise Server のいずれかが必要
- GitHub Free では、GitHub Pages はパブリックリポジトリでのみ利用可能

**機能:**
- `main` ブランチへのプッシュで自動デプロイ
- 手動デプロイ (`workflow_dispatch`) にも対応

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch: # 手動デプロイを許可

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## 📱 iOSスクロール・デバウンス対策

### 問題

iOS Safari では `touchmove` / `scroll` イベントが**高頻度で発火**し、
特に在庫リストの ± ボタン操作時に **パフォーマンス低下やスクロールの引っかかり**が起きる。

### 対策

- `passive: true` オプションを使用(スクロールのブロッキング回避)
- SolidJS のリアクティブシステムとは別に、**requestAnimationFrameベースのデバウンス**を導入
- スクロール中は±ボタンの連打イベントを一時的に抑制する

```ts
// utils/scroll.ts
export function useIOSScrollDebounce(callback: () => void, delay = 100) {
  let ticking = false;
  let lastCall = 0;

  const handler = () => {
    const now = performance.now();
    if (now - lastCall < delay) return;
    lastCall = now;
    if (!ticking) {
      requestAnimationFrame(() => {
        callback();
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener("scroll", handler, { passive: true });

  return () => {
    window.removeEventListener("scroll", handler);
  };
}
```

上記を `App` ルートに登録して、iOSでのリスト操作時に再レンダリングやUI更新を抑制。

---

## 🧹 ESLint / Prettier / Husky 設定

### `eslint.config.js`

```js
import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import solidPlugin from "eslint-plugin-solid";
import prettierPlugin from "eslint-plugin-prettier";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      solid: solidPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...solidPlugin.configs.typescript.rules,
      "prettier/prettier": "error",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
];
```

### `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### Husky Hooks

`package.json` に追加:

```json
{
  "scripts": {
    "prepare": "husky install"
  }
}
```

`pnpm husky add .husky/pre-commit "pnpm run lint && pnpm run format:check"`

### `package.json` 内の関連スクリプト例

```json
{
  "scripts": {
    "lint": "eslint src --ext .ts,.tsx",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

---

## 🧩 Directory Structure

```
src/
  App.tsx
  components/
    Header.tsx
    ItemCard.tsx
    ItemList.tsx
    EditorModal.tsx
  state/
    store.ts
    db.ts
  utils/
    scroll.ts
    image.ts
  types/
    index.ts
  styles/
    index.css
public/
  manifest.json
  icons/
.github/
  workflows/
    deploy.yml
.husky/
  pre-commit
eslint.config.js
.prettierrc
```

---

## ✅ TODO (Next Steps)

- [x] Solid Store 実装
- [x] IndexedDB 永続化処理
- [x] 画像圧縮/リサイズ(`browser-image-compression`)
- [x] JSON+ZIP エクスポート機能
- [ ] オフライン確認・PWAテスト(Lighthouse)

---

> **Author:** @you  
> **Project:** home-stock  
> **License:** MIT
