import { expect, test } from '@playwright/test';

async function completeOnboarding(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByText('Solo Mode', { exact: true }).click();
  await page.getByPlaceholder('e.g. Me').fill('Persistence User');
  await page.getByRole('button', { name: 'Continue' }).click();

  await page.getByPlaceholder('0.00').fill('5000');
  await page.getByRole('button', { name: 'Continue' }).click();

  await page.getByPlaceholder('Income Name (e.g. Salary)').fill('Persistent Salary');
  await page.getByPlaceholder('Amount').fill('4000');
  await page.getByPlaceholder('Day (1-31)').fill('25');
  await page.getByRole('button', { name: /Add Income/i }).click();
  await page.getByRole('button', { name: 'Next Step' }).click();

  await page.getByPlaceholder('Expense Name (e.g. Rent)').fill('Persistent Rent');
  await page.getByPlaceholder('Amount').fill('1200');
  await page.getByPlaceholder('Day (1-31)').fill('1');
  await page.getByRole('button', { name: /Add Expense/i }).click();
  await page.getByRole('button', { name: 'Next Step' }).click();

  await page.getByPlaceholder('0.00').fill('250');
  await page.getByRole('button', { name: 'Complete Setup' }).click();
  await expect(page.getByText('Financial Health', { exact: false })).toBeVisible({ timeout: 30_000 });
}

test('onboarding completion persists after reload', async ({ page }) => {
  await completeOnboarding(page);

  await page.reload();

  await expect(page.getByText('Financial Health', { exact: false })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText('Solo Mode', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Step 5: Weekly Spending', { exact: true })).toHaveCount(0);
});
