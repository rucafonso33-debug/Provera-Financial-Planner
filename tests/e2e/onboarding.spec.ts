import { expect, test } from '@playwright/test';

test('completes onboarding and reaches the financial dashboard', async ({ page }) => {
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
  await page.getByPlaceholder('0.00').fill('5000');
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByText('Step 3: Monthly Incomes', { exact: true })).toBeVisible();
  await page.getByPlaceholder('Income Name (e.g. Salary)').fill('Salary');
  await page.getByPlaceholder('Amount').fill('4000');
  await page.getByPlaceholder('Day (1-31)').fill('25');
  await page.getByRole('button', { name: /Add Income/i }).click();
  await expect(page.getByText('Salary', { exact: true })).toHaveCount(1);
  await page.getByRole('button', { name: 'Next Step' }).click();

  await expect(page.getByText('Step 4: Fixed Expenses', { exact: true })).toBeVisible();
  await page.getByPlaceholder('Expense Name (e.g. Rent)').fill('Rent');
  await page.getByPlaceholder('Amount').fill('1200');
  await page.getByPlaceholder('Day (1-31)').fill('1');
  await page.getByRole('button', { name: /Add Expense/i }).click();
  await expect(page.getByText('Rent', { exact: true })).toHaveCount(1);
  await page.getByRole('button', { name: 'Next Step' }).click();

  await expect(page.getByText('Step 5: Weekly Spending', { exact: true })).toBeVisible();
  await page.getByPlaceholder('0.00').fill('250');
  await page.getByRole('button', { name: 'Complete Setup' }).click();

  await expect(page.getByText('Financial Health', { exact: false })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText('Step 5: Weekly Spending', { exact: true })).toHaveCount(0);
  expect(browserErrors, browserErrors.join('\n')).toEqual([]);
});
