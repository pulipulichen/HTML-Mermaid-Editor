import { test, expect } from '@playwright/test';

test('i18n initializes, switches, and persists language', async ({ page }) => {
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  await page.goto('http://localhost:8080');

  const languageSelect = page.locator('#language-select');
  const heading = page.locator('h1');

  await expect(languageSelect).toHaveValue('en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(heading).toContainText('Mermaid Editor');

  await languageSelect.selectOption('zh-TW');
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-TW');
  await expect(heading).toContainText('Mermaid 編輯器');

  const storedLanguage = await page.evaluate(() => localStorage.getItem('mermaid_editor_language'));
  expect(storedLanguage).toBe('zh-TW');

  await page.reload();
  await expect(languageSelect).toHaveValue('zh-TW');
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-TW');
  await expect(heading).toContainText('Mermaid 編輯器');

  await page.waitForLoadState('networkidle');
  expect(consoleErrors).toHaveLength(0);
});

test('Render a simple mermaid diagram', async ({ page }) => {
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  await page.goto('http://localhost:8080');

  const input = page.locator('#mermaid-input');
  await input.fill('graph TD\nA-->B');

  await page.locator('#btn-render').click();

  const output = page.locator('#mermaid-output svg');
  await output.waitFor();
  await expect(output).toBeVisible({ timeout: 60000 });

  await page.waitForLoadState('networkidle');
  expect(consoleErrors).toHaveLength(0);
});
