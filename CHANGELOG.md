# Changelog

## 0.0.1

- Added the online demo link to the README.
- Added a sample Mermaid diagram for testing the editor workflow.
- Added local editor draft persistence with `localStorage`.
- Added dynamic SVG and PNG export filenames based on diagram content and timestamps.
- Improved Mermaid rendering by sanitizing problematic whitespace, preserving the last successful preview on errors, and cleaning up temporary render artifacts.
- Moved the default Mermaid example loading into the app startup flow so empty editors load sample content from `mermaid_example.md`.
- Added PWA metadata, a web app manifest, theme color settings, and favicon links for installable browser support.
- Added Docker-based Playwright end-to-end testing with a GitHub Actions workflow and test artifacts for failed runs.
