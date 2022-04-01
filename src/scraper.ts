import * as puppeteer from 'puppeteer'
import { SCRAPED_SITE_URL, TARGET_SELECTOR, TARGET_VALUE_SELECTOR } from './consts'
import { date } from './helpers'

const createMessage = (content) => `[scraper] ${date()} ${content}`

export async function scrapeAssets({ onProgress }) {
  const browser = await puppeteer.launch({
    ...(process.env.IS_DOCKER ? {
      executablePath: '/usr/bin/google-chrome',
      args: ['--no-sandbox'],
    } : {}),
    headless: false
  })
  onProgress(createMessage('Browser opened'))
  const page = await browser.newPage()
  onProgress(createMessage('Opened new page'))
  await page.goto(SCRAPED_SITE_URL)
  await page.waitForSelector(TARGET_SELECTOR)
  onProgress(createMessage('Assets loaded'))
  const result = await page.evaluate((TARGET_SELECTOR, TARGET_VALUE_SELECTOR) => {
    const els = [...document.querySelectorAll(TARGET_SELECTOR)]
    return els.map(el => {
      let [
        asset, apy, wallet, liquidity
      ] = [
        ...el.querySelectorAll(TARGET_VALUE_SELECTOR)
      ].map(valueEl => valueEl.textContent)
      apy = apy.replace(/\s+/g, '')
      asset = asset.replace(apy, '')
      wallet = {
        value: +wallet.replace(asset, '').trim(),
        asset
      }
      liquidity = {
        value: +liquidity.replace(/^\$\s+/, ''),
        currency: 'USD'
      }
      return {
        asset, apy, wallet, liquidity
      }
    })
  }, TARGET_SELECTOR, TARGET_VALUE_SELECTOR)
  onProgress(createMessage('Values scraped'))
  await browser.close()
  onProgress(createMessage('Browser closed'))
  return result
}
