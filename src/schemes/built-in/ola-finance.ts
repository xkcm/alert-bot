import { BotConfiguration, Scheme, SchemeScrapeOptions } from '../../types'

type Config = BotConfiguration.Schemes.SchemeConfigs['ola-finance']

export class OlaFinanceScheme implements Scheme {
  public constants: Config['constants'] = {
    MAX_NAVIGATION_TIMEOUT: 120_000, // 2 minutes
    SITE_URL: 'https://app.ola.finance/fuseFi/markets',
    TARGET_SELECTOR: '.jss141:nth-child(2) .jss150',
    TARGET_VALUE_SELECTOR: '.jss155'
  }

  public schemeName = 'Fuse Network Liquidity Scraper'
  public description = ''
  public id = 'ola-finance'

  constructor(private config: Config) {
    this.constants = {
      ...this.constants,
      ...config.constants
    }
  }

  public get settings() {
    return {
      scraper: {
        closePageAfter: false,
        sharedWindow: true
      }
    }
  }

  public async scrape({ browserPage, log }: SchemeScrapeOptions) {
    await browserPage.goto(this.constants.SITE_URL, {
      timeout: this.constants.MAX_NAVIGATION_TIMEOUT
    })
    log.info({ event: 'END_NAVIGATION', message: 'Navigation ended' })
    await browserPage.waitForSelector(this.constants.TARGET_SELECTOR, {
      timeout: this.constants.MAX_NAVIGATION_TIMEOUT
    })
    log.info({ event: 'ASSETS_LOADED', message: 'Assets loaded' })
    const assetValues = await browserPage.evaluate((TARGET_SELECTOR, TARGET_VALUE_SELECTOR) => {
      const els = [...document.querySelectorAll(TARGET_SELECTOR)]
      return els.map(el => [...el.querySelectorAll(TARGET_VALUE_SELECTOR)].map(valueEl => valueEl.textContent))
    }, this.constants.TARGET_SELECTOR, this.constants.TARGET_VALUE_SELECTOR)
    const parseValues = ([ asset, apy, wallet, liquidity ]) => {
      const resolvedApy = apy.replace(/\s+/g, '')
      const resolvedAsset = asset.replace(resolvedApy, '')
      const resolvedWallet = +wallet.replace(resolvedAsset, '')
      const resolvedLiquidity = {
        value: +liquidity.replace(/^\$\s+/, ''),
        currency: 'USD'
      }
      return [resolvedAsset, resolvedApy, resolvedWallet, resolvedLiquidity]
    }
    const results = assetValues.map((values: [any, any, any, any]) => {
      const [asset, apy, wallet, liquidity] = parseValues(values)
      return { asset, apy, wallet, liquidity }
    })
    return results
  }
}


export default OlaFinanceScheme
