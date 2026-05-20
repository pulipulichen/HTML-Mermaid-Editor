import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
import { initI18n, t } from './modules/i18n.js';

// 初始化 Mermaid 配置，強制設定透明背景
mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    themeVariables: {
        background: 'transparent'
    }
});

// 綁定 DOM 元素
const input = document.getElementById('mermaid-input');
const output = document.getElementById('mermaid-output');
const errorMsg = document.getElementById('error-msg');
const btnRender = document.getElementById('btn-render');
const btnSvg = document.getElementById('btn-svg');
const btnPng = document.getElementById('btn-png');
const previewContainer = document.getElementById('preview-container');

// 讀取 localStorage 中暫存的語法
const savedCode = localStorage.getItem('mermaid_code_backup');
if (savedCode !== null) {
    input.value = savedCode;
}

// 若沒有既有內容，從範例檔載入預設 Mermaid 語法
async function loadDefaultCodeIfEmpty() {
    if (input.value.trim()) return;

    try {
        const response = await fetch('./mermaid_example.md');
        if (!response.ok) {
            throw new Error(t('errors.loadExampleFailed', { status: response.status }));
        }

        input.value = await response.text();
    } catch (err) {
        console.error(err);
    }
}

let pzInstance = null;
let typingTimer = null;
let isRenderingDiagram = false;
let renderAgainAfterCurrent = false;

// 初始化 Panzoom 拖曳與縮放
function initPanzoom() {
    if (!pzInstance) {
        // 將事件綁定在外部容器上，但將縮放形變應用於內部的 output 容器
        pzInstance = window.Panzoom(previewContainer, {
            maxScale: 20,
            minScale: 0.1,
            step: 0.2,
            setTransform: (elem, { scale, x, y }) => {
                output.style.transform = `scale(${scale}) translate(${x}px, ${y}px)`;
            }
        });

        // 綁定滑鼠滾輪縮放 (加上 passive: false 以允許 preventDefault 防止頁面跟著滾動)
        previewContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            pzInstance.zoomWithWheel(e);
        }, { passive: false });

        // 綁定控制按鈕
        document.getElementById('btn-zoom-in').addEventListener('click', () => pzInstance.zoomIn());
        document.getElementById('btn-zoom-out').addEventListener('click', () => pzInstance.zoomOut());
        document.getElementById('btn-zoom-reset').addEventListener('click', () => pzInstance.reset());
    }
}

// 更新按鈕狀態
function updateButtonState(disabled) {
    btnSvg.disabled = disabled;
    btnPng.disabled = disabled;
}

// 產生動態檔名 (結合節點名稱與 YYYYMMDD-HHmmSS)
function generateFilename(extension) {
    const code = input.value.trim();
    let prefix = "mermaid";
    
    // 策略 1: 尋找括號內的節點文字 (適用於 flowchart/stateDiagram 等，例如 A[使用者])
    const nodeMatch = code.match(/[\[\(\{\>"]([^\[\]\(\)\{\}\>\n"]+)[\]\)\}\>"]/);
    
    // 策略 2: 抓取非宣告關鍵字的第一行文字 (適用於 sequenceDiagram 等)
    const lines = code.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('graph') && !l.startsWith('sequenceDiagram') && !l.startsWith('gantt') && !l.startsWith('classDiagram') && !l.startsWith('pie') && !l.startsWith('flowchart'));
    
    if (nodeMatch && nodeMatch[1] && nodeMatch[1].trim().length > 0) {
        prefix = nodeMatch[1];
    } else if (lines.length > 0) {
        // 取第一行的前幾個字作為備案
        prefix = lines[0].split(/[>:\s-]/)[0]; 
    }

    // 清理檔名，只保留中英數字與底線，並限制長度以防過長
    prefix = prefix.replace(/["']/g, '').trim().replace(/\s+/g, '_');
    prefix = prefix.replace(/[^\w\u4e00-\u9fa5_-]/g, '').substring(0, 15);
    
    if (!prefix) prefix = "mermaid";

    // 取得當前時間 YYYYMMDD-HHmmSS
    const now = new Date();
    const yyyy = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const HH = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const timestamp = `${yyyy}${MM}${dd}-${HH}${mm}${ss}`;

    return `${prefix}_${timestamp}.${extension}`;
}

// Mermaid 10 的 render 流程會使用暫存 DOM，同時執行多次可能互相干擾。
async function renderDiagram() {
    if (isRenderingDiagram) {
        renderAgainAfterCurrent = true;
        return;
    }

    isRenderingDiagram = true;
    try {
        do {
            renderAgainAfterCurrent = false;
            await renderDiagramOnce();
        } while (renderAgainAfterCurrent);
    } finally {
        isRenderingDiagram = false;
    }
}

// 渲染圖表函數
async function renderDiagramOnce() {
    // 自動過濾掉可能導致 Mermaid 報錯的特殊空白字元 (如 NBSP 不換行空白、零寬字元)
    const code = input.value.replace(/[\u00A0\u200B]/g, ' ').trim();
    if (!code) {
        output.innerHTML = '';
        return;
    }

    // 將 ID 移到 try 區塊外，以確保 finally 區塊能讀取到
    const id = `mermaid-svg-${Date.now()}`;

    try {
        // 隱藏錯誤訊息
        errorMsg.classList.add('hidden');
        updateButtonState(true);

        // 使用 mermaid.render 取得 SVG 碼
        const { svg } = await mermaid.render(id, code);
        
        // 注入 SVG 到容器中
        output.innerHTML = svg;

        // 確保 SVG 元素本身背景是透明的
        const svgEl = output.querySelector('svg');
        if (svgEl) {
            svgEl.style.backgroundColor = 'transparent';
            // 確保包含 xmlns 屬性，這對轉圖很重要
            if (!svgEl.getAttribute('xmlns')) {
                svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            }
        }

        // 成功渲染後更新按鈕
        updateButtonState(false);
    } catch (err) {
        console.error(err);
        // 顯示錯誤訊息 (發生錯誤時不再清空畫面，保留上一次的圖表，編輯體驗更好)
        errorMsg.textContent = err.message || t('errors.syntaxInvalid');
        errorMsg.classList.remove('hidden');
        updateButtonState(true);
    } finally {
        // 【關鍵修復】清除 Mermaid 渲染錯誤時，遺留在網頁底層的暫存「炸彈 SVG」容器
        const tempDiv = document.getElementById(`d${id}`);
        if (tempDiv) tempDiv.remove();
        
        // 保險起見：清除頁面上所有可能殘留的幽靈炸彈圖示
        document.querySelectorAll('div[id^="dmermaid-svg-"]').forEach(el => el.remove());
    }
}

// 觸發下載的通用函數
function triggerDownload(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// 下載 SVG 函數 (取得不受 Panzoom 影響的原始 SVG)
function downloadSvg() {
    const svgEl = output.querySelector('svg');
    if (!svgEl) return;

    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgEl);

    if (!source.match(/^<\?xml[^>]+>/mi)) {
        source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
    }

    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    // 使用動態產生的檔名
    triggerDownload(url, generateFilename('svg'));
    
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

// 下載 PNG 函數
function downloadPng() {
    const svgEl = output.querySelector('svg');
    if (!svgEl) return;

    // 取得 SVG 的原始尺寸
    let width = 800;
    let height = 600;
    const viewBox = svgEl.getAttribute('viewBox');
    
    if (viewBox) {
        const [, , w, h] = viewBox.split(' ').map(parseFloat);
        width = w;
        height = h;
    } else {
        const rect = svgEl.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
    }

    const canvas = document.createElement('canvas');
    const scale = 2; // 提升輸出畫質
    canvas.width = width * scale;
    canvas.height = height * scale;
    
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgEl);

    const img = new Image();
    
    img.onload = function() {
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const pngUrl = canvas.toDataURL('image/png');
        
        // 使用動態產生的檔名
        triggerDownload(pngUrl, generateFilename('png'));
    };

    img.onerror = function(err) {
        alert(t('errors.convertPngFailed'));
        console.error(err);
    };

    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);
}

// 綁定事件監聽器
btnRender.addEventListener('click', () => {
    clearTimeout(typingTimer);
    renderDiagram();
});
btnSvg.addEventListener('click', downloadSvg);
btnPng.addEventListener('click', downloadPng);

// 支援即時預覽防抖動 (停止輸入 0.5 秒後自動渲染)
input.addEventListener('input', () => {
    // 自動保存當前語法到 localStorage
    localStorage.setItem('mermaid_code_backup', input.value);

    clearTimeout(typingTimer);
    typingTimer = setTimeout(renderDiagram, 500); 
});

// 啟動工具
async function startApp() {
    initI18n();
    initPanzoom();
    await loadDefaultCodeIfEmpty();
    renderDiagram();
}

startApp();
