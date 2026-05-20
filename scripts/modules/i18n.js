import en from './i18n/en.js';
import zhTW from './i18n/zh-TW.js';

const TRANSLATIONS = {
    en,
    'zh-TW': zhTW
};

const STORAGE_KEY = 'mermaid_editor_language';
const DEFAULT_LANGUAGE = 'en';
const LANGUAGE_LABELS = {
    en: 'English',
    'zh-TW': '繁體中文'
};

export const SUPPORTED_LANGUAGES = Object.keys(TRANSLATIONS);

let currentLanguage = DEFAULT_LANGUAGE;

function normalizeLanguage(language) {
    if (!language || typeof language !== 'string') {
        return null;
    }

    const trimmed = language.trim();
    if (!trimmed) {
        return null;
    }

    if (trimmed in TRANSLATIONS) {
        return trimmed;
    }

    const lower = trimmed.toLowerCase();
    if (lower.startsWith('zh')) {
        return 'zh-TW';
    }
    if (lower.startsWith('en')) {
        return 'en';
    }

    return null;
}

function detectBrowserLanguage() {
    const browserLanguages = Array.isArray(navigator.languages) ? navigator.languages : [];

    const candidates = [...browserLanguages, navigator.language];
    for (const candidate of candidates) {
        const normalized = normalizeLanguage(candidate);
        if (normalized) {
            return normalized;
        }
    }

    return null;
}

function resolveInitialLanguage() {
    const storedLanguage = normalizeLanguage(localStorage.getItem(STORAGE_KEY));
    if (storedLanguage) {
        return storedLanguage;
    }

    const browserLanguage = detectBrowserLanguage();
    if (browserLanguage) {
        return browserLanguage;
    }

    return DEFAULT_LANGUAGE;
}

function interpolate(template, params = {}) {
    return template.replace(/\{(\w+)\}/g, (_, key) => {
        if (Object.prototype.hasOwnProperty.call(params, key)) {
            return String(params[key]);
        }
        return `{${key}}`;
    });
}

export function t(key, params) {
    const activeLanguageMap = TRANSLATIONS[currentLanguage] || {};
    const fallbackLanguageMap = TRANSLATIONS[DEFAULT_LANGUAGE] || {};
    const message = activeLanguageMap[key] || fallbackLanguageMap[key] || key;

    if (typeof message !== 'string') {
        return key;
    }

    return interpolate(message, params);
}

function applyTextTranslations(root = document) {
    root.querySelectorAll('[data-i18n]').forEach((element) => {
        const key = element.dataset.i18n;
        if (!key) {
            return;
        }
        element.textContent = t(key);
    });

    root.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
        const key = element.dataset.i18nPlaceholder;
        if (!key) {
            return;
        }
        element.setAttribute('placeholder', t(key));
    });

    root.querySelectorAll('[data-i18n-title]').forEach((element) => {
        const key = element.dataset.i18nTitle;
        if (!key) {
            return;
        }
        element.setAttribute('title', t(key));
    });
}

function syncLanguageSelect(languageSelect) {
    if (!languageSelect) {
        return;
    }

    if (!languageSelect.options.length) {
        SUPPORTED_LANGUAGES.forEach((lang) => {
            const option = document.createElement('option');
            option.value = lang;
            option.textContent = LANGUAGE_LABELS[lang] || lang;
            languageSelect.appendChild(option);
        });
    }

    languageSelect.value = currentLanguage;
}

export function applyTranslations(root = document, languageSelect = null) {
    applyTextTranslations(root);
    document.documentElement.lang = currentLanguage;
    document.title = t('meta.title');
    syncLanguageSelect(languageSelect);
}

export function setLanguage(nextLanguage, options = {}) {
    const normalized = normalizeLanguage(nextLanguage);
    if (!normalized) {
        return currentLanguage;
    }

    currentLanguage = normalized;
    localStorage.setItem(STORAGE_KEY, currentLanguage);

    const languageSelect = options.languageSelect || document.getElementById('language-select');
    applyTranslations(document, languageSelect);

    document.dispatchEvent(new CustomEvent('i18n:language-changed', {
        detail: { language: currentLanguage }
    }));

    return currentLanguage;
}

export function initI18n(options = {}) {
    const selector = options.languageSelectSelector || '#language-select';
    const languageSelect = document.querySelector(selector);

    currentLanguage = resolveInitialLanguage();
    applyTranslations(document, languageSelect);

    if (languageSelect) {
        languageSelect.addEventListener('change', (event) => {
            setLanguage(event.target.value, { languageSelect });
        });
    }

    return currentLanguage;
}

export function getCurrentLanguage() {
    return currentLanguage;
}

export const LANGUAGE_STORAGE_KEY = STORAGE_KEY;
