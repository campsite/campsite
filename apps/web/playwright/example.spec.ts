import { expect, test } from '@playwright/test'

import { ORG_PATH } from '../playwright/consts'

test('loads the dashboard', async ({ page }) => {
  await page.goto(ORG_PATH)
  await page.waitForURL(ORG_PATH)
  await expect(page.locator('body')).toHaveText(/Inbox/)
})

test.skip('creates a post with a poll', async ({ page }) => {
  await page.goto(ORG_PATH)
  await page.locator('p[data-placeholder="What would you like to share?"]').click()
  await page.locator('.tiptap.editing').fill('Hello from Playwright!')

  // add a poll
  await page.getByLabel('Add poll').click()
  await page.getByPlaceholder('First option').fill('Option 1')
  await page.getByPlaceholder('Second option').click()
  await page.getByPlaceholder('Second option').fill('Option 2')
  await page.getByRole('button', { name: 'Add option' }).click()
  await page.getByPlaceholder('Third option').click()
  await page.getByPlaceholder('Third option').fill('Option 3')

  // remove the middle option
  await page.getByLabel('Remove option').nth(1).click()

  // create the post
  await page.getByRole('button', { name: 'Post', exact: true }).click()

  // wait for a post to appear with the text and assign the post to a variable so we can interact with it
  const post = page.locator('div:first-child:has-text("Hello from Playwright!")')

  // should have two poll options
  expect(post.locator('text=Option 1')).toBeVisible()
  expect(post.locator('text=Option 3')).toBeVisible()
  // should not have the removed option
  expect(post.locator('text=Option 2')).not.toBeVisible()

  // click button in post with title "Post actions dropdown"
  await post.locator('button[aria-label="Post actions dropdown"]').click()
  // click menuitem with text "Delete post"
  await page.locator('div[role="menuitem"] >> text=Delete post').click()
  // press button in a div[role="dialog"] with text "Delete post"
  await page.locator('div[role="dialog"] button:has-text("Delete post")').click()

  // TODO: this doesn't work if there are other "hello from playwright!" posts remaining in the feed
  expect(post).not.toBeVisible()
})
