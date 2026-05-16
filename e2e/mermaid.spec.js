import { test, expect } from '@playwright/test';

test('Render a simple mermaid diagram', async ({ page }) => {
  // 1. Navigate to the app
  await page.goto('http://localhost:8080');

  // 2. Setup console error tracking
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // 3. Perform actions
  // Fill the textarea with a basic mermaid chart
  const input = page.locator('#mermaid-input');
  await input.fill('graph TD\\nA-->B');
  
  // Click the render button
  await page.locator('#btn-render').click();

  // 4. Assertions
  // Wait for the SVG to be rendered in the output div
  const output = page.locator('#mermaid-output svg');
  await output.waitFor();
  await expect(output).toBeVisible({ timeout: 60000 });

  // 5. Final checks
  await page.waitForLoadState('networkidle');
  expect(consoleErrors).toHaveLength(0);
});