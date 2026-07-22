import { expect, test } from '@playwright/test';

async function completeMinimalOnboarding(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByText('Solo Mode', { exact: true }).click();
  await page.getByPlaceholder('e.g. Me').fill('Settings User');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByPlaceholder('0.00').fill('5000');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Next Step' }).click();
  await page.getByRole('button', { name: 'Next Step' }).click();
  await page.getByPlaceholder('0.00').fill('250');
  await page.getByRole('button', { name: 'Complete Setup' }).click();
  await expect(page.getByText('Financial Health', { exact: false })).toBeVisible({ timeout: 30_000 });
}

function settingInput(page: import('@playwright/test').Page, label: string) {
  return page.getByText(label, { exact: true }).locator('xpath=ancestor::div[contains(@class,"space-y-2")][1]').locator('input');
}

test('editing settings persists after reload', async ({ page }) => {
  await completeMinimalOnboarding(page);

  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page.getByText('Monthly Incomes', { exact: true })).toBeVisible();

  await settingInput(page, 'Your Name').fill('Updated User');
  await settingInput(page, 'Current Balance').fill('7250');

  await page.waitForTimeout(3000);
  await page.reload({ waitUntil: 'networkidle' });

  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(settingInput(page, 'Your Name')).toHaveValue('Updated User');
  await expect(settingInput(page, 'Current Balance')).toHaveValue('7250');
});
