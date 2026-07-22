import { expect, test } from '@playwright/test';

test('completes the first onboarding stages without browser errors', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });

  await page.goto('/');

  await expect(page.getByText('Solo Mode', { exact: true })).toBeVisible();
  await page.getByText('Solo Mode', { exact: true }).click();

  await expect(page.getByText('Who are we?', { exact: true })).toBeVisible();
  await page.getByPlaceholder('e.g. Me').fill('Test User');
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByText('Step 2: Current Balance', { exact: true })).toBeVisible();
  const balanceInput = page.locator('input').filter({ has: page.locator('[placeholder="0.00"]') });
  if (await balanceInput.count()) {
    await balanceInput.first().fill('5000');
  } else {
    await page.getByPlaceholder('0.00').fill('5000');
  }
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByText('Step 3: Monthly Incomes', { exact: true })).toBeVisible();
  await page.getByPlaceholder('Income Name (e.g. Salary)').fill('Salary');
  await page.getByPlaceholder('Amount').fill('4000');
  await page.getByPlaceholder('Day (1-31)').fill('25');
  await page.getByRole('button', { name: /Add Income/i }).click();

  await expect(page.getByText('Salary', { exact: true })).toBeVisible();
  expect(browserErrors, browserErrors.join('\n')).toEqual([]);
});
