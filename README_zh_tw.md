# HTML Mermaid Editor

[English](./README.md) | [繁體中文](./README_zh_tw.md)

HTML Mermaid Editor 是一個純前端的 Mermaid 圖表編輯工具，提供即時預覽、拖曳縮放與 SVG/PNG 匯出，適合快速製作技術文件中的流程圖與時序圖。

## 線上示範

[https://pulipulichen.github.io/HTML-Mermaid-Editor/](https://pulipulichen.github.io/HTML-Mermaid-Editor/)

## 功能重點

- Mermaid 語法即時預覽（輸入停止 0.5 秒後自動渲染）。
- 支援手動 `Render` 按鈕，並避免重複渲染衝突。
- 預覽區支援滑鼠滾輪縮放、拖曳平移與視角重置。
- 可下載原始 SVG 與透明背景 PNG。
- 匯出檔名會帶入圖表關鍵字與時間戳記（`YYYYMMDD-HHmmSS`）。
- 語法會自動儲存到 `localStorage`，重整頁面後可續編。
- 首次開啟且編輯器為空時，會自動載入 `mermaid_example.md` 範例。
- 支援 PWA 基本設定（`manifest.json`、icon、theme color）。

## 技術堆疊

- `Mermaid.js`：圖表語法解析與 SVG 渲染。
- `Panzoom`：預覽區拖曳與縮放互動。
- `Tailwind CSS`（CDN）：介面樣式。
- 原生 `HTML/CSS/JavaScript`：應用邏輯與匯出流程。
- `Playwright` + `Docker Compose`：E2E 自動化測試。

## 本機使用

此專案為靜態網頁，可用任一 HTTP server 啟動。

### 方式 1：快速啟動（Python）

```bash
python3 -m http.server 8080
```

開啟 [http://localhost:8080](http://localhost:8080)。

### 方式 2：直接開啟

可直接用瀏覽器開啟 `index.html`。若要確保行為一致（特別是範例檔讀取），仍建議使用 HTTP server。

## E2E 測試

Docker 化 Playwright 測試流程：

```bash
sudo docker compose up --build --exit-code-from test-runner
```

或使用既有 script：

```bash
npm run start
```

## 專案結構

```text
.
├─ index.html                # 主頁面
├─ scripts/main.js           # Mermaid 渲染、互動、下載邏輯
├─ styles/main.css           # 自訂樣式
├─ mermaid_example.md        # 預設範例語法
├─ manifest.json             # PWA manifest
├─ e2e/mermaid.spec.js       # Playwright E2E 測試
├─ Dockerfile.test           # 測試容器
└─ docker-compose.yml        # 測試編排
```
