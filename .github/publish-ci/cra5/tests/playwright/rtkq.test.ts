import { test, expect } from '@playwright/test'

test('RTK / RTKQ Interactions', async ({ page }) => {
  await page.goto('http://localhost:3000')

  const counterValue = page.getByTestId('counter-value')
  const counterText = await counterValue.innerText({ timeout: 0 })
  expect(counterText).toBe('0')

  const increment = page.getByRole('button', { name: 'Increment value' })
  await increment.click()

  const counterText2 = await counterValue.innerText({ timeout: 0 })
  expect(counterText2).toBe('1')

  const timeValue = page.getByTestId('time-value')
  const postValue = page.getByTestId('post-value')

  await expect(timeValue).toHaveText(/\d+:\d+:\d+\s+(A|P)M/, { timeout: 10000 })
  await expect(postValue).toHaveText('A sample post', { timeout: 10000 })
})
