# HTML Mermaid Editor

[English](./README.md) | [繁體中文](./README_zh_tw.md)

HTML Mermaid Editor is a frontend-only Mermaid diagram editor with real-time preview, pan/zoom interactions, and SVG/PNG export for technical documentation workflows.

## Online Demo

[https://pulipulichen.github.io/HTML-Mermaid-Editor/](https://pulipulichen.github.io/HTML-Mermaid-Editor/)

## Features

- Real-time Mermaid preview (auto-render after 0.5 seconds of inactivity).
- Manual `Render` button with render queue protection to avoid conflicts.
- Preview area supports mouse-wheel zoom, drag-to-pan, and reset view.
- Export as original SVG or transparent-background PNG.
- Export filename includes diagram keywords and timestamp (`YYYYMMDD-HHmmSS`).
- Mermaid source is auto-saved to `localStorage` for draft recovery.
- Auto-loads `mermaid_example.md` when the editor is initially empty.
- Includes basic PWA settings (`manifest.json`, icon, theme color).

## Tech Stack

- `Mermaid.js`: diagram parsing and SVG rendering.
- `Panzoom`: interactive pan and zoom in preview area.
- `Tailwind CSS` (CDN): UI styling.
- Vanilla `HTML/CSS/JavaScript`: app logic and export flow.
- `Playwright` + `Docker Compose`: end-to-end testing.

## Local Usage

This project is a static web app, so any HTTP server works.

### Option 1: Quick Start (Python)

```bash
python3 -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080).

### Option 2: Use Any HTTP Server

Opening `index.html` directly from the file system is not supported. Please run the app through an HTTP server so all features (including sample file loading) work correctly.

## E2E Testing

Dockerized Playwright test flow:

```bash
sudo docker compose up --build --exit-code-from test-runner
```

Or run the existing script:

```bash
npm run start
```

## Project Structure

```text
.
├─ index.html                # Main page
├─ scripts/main.js           # Mermaid rendering, interactions, export logic
├─ styles/main.css           # Custom styles
├─ mermaid_example.md        # Default Mermaid sample
├─ manifest.json             # PWA manifest
├─ e2e/mermaid.spec.js       # Playwright E2E test
├─ Dockerfile.test           # Test container
└─ docker-compose.yml        # Test orchestration
```
