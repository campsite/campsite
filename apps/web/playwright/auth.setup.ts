import { test as setup } from '@playwright/test'

import { ORG_PATH } from './consts'

const authFile = 'playwright/.auth/user.json'

/**
 * Logs into the site and store session information in a JSON file to be loaded by other tests.
 */
setup('authenticate', async ({ page }) => {
  await page.goto(ORG_PATH)
  await page.getByLabel('Email').fill('ranger.rick@demo.campsite.com')
  await page.getByLabel('Password').fill('CampsiteDesign!')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('http://app.campsite.test:3000/frontier-forest')
  await page.context().storageState({ path: authFile })
})
