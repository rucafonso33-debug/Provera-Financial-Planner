import { expect, test } from '@playwright/test';

test('rapid clicks do not duplicate an onboarding income', async ({ page }) => {
  await page.goto('/');

  await page.getByText('Solo Mode', { exact: true }).click();
  await page.getByPlaceholder('e.g. Me').fill('Test User');
  await page.getByRole('button', { name: 'Continue' }).click();

  await page.getByPlaceholder('0.00').fill('5000');
  await page.getByRole('button', { name: 'Continue' }).click();

  await page.getByPlaceholder('Income Name (e.g. Salary)').fill('Salary');
  await page.getByPlaceholder('Amount').fill('4000');
  await page.getByPlaceholder('Day (1-31)').fill('25');

  const addIncome = page.getByRole('button', { name: /Add Income/i });
  await addIncome.dblclick();

  await expect(page.getByText('Salary', { exact: true })).toHaveCount(1);
});
