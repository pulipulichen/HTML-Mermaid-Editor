# CHANGELOG

## 0.0.1

- Added the online demo link to the README.
- Added a sample Mermaid diagram for testing the editor workflow.
- Added local editor draft persistence with `localStorage`.
- Added dynamic SVG and PNG export filenames based on diagram content and timestamps.
- Improved Mermaid rendering by sanitizing problematic whitespace, preserving the last successful preview on errors, and cleaning up temporary render artifacts.
- Moved the default Mermaid example loading into the app startup flow so empty editors load sample content from `mermaid_example.md`.
- Added PWA metadata, a web app manifest, theme color settings, and favicon links for installable browser support.
- Added Docker-based Playwright end-to-end testing with a GitHub Actions workflow and test artifacts for failed runs.
- Fixed a Mermaid rendering concurrency issue by serializing render requests and canceling pending debounce renders on manual render clicks.
- Fixed the Playwright e2e test input to use a real newline in the Mermaid sample (`graph TD\nA-->B`) to prevent parser false failures.
- Reworked the documentation into a bilingual README setup with synchronized `README.md` (English) and `README_zh_tw.md` (Traditional Chinese).
- Added language switch links to both README files for quick cross-language navigation.
