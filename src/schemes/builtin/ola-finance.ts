import SchemeContext from '../../contexts/SchemeContext'
import { UnknownAlertService } from '../../errors/schemes'
import { BuiltinAlertServicesPayloads } from '../../types/alert-services'
import { OlaFinanceSchemeConfig, Scheme, SchemeModule, SchemeSettings } from '../../types/scheme'

interface DataEntry {
  asset: string
  apy: string
  wallet: number
  liquidity: {
    value: number
    currency: 'USD'
  }
}

interface Prepared {
  message: string
  assets: {
    asset: string
    liquidity: string
  }[]
}

const id = 'ola-finance'
const schemeName = 'Fuse Network Liquidity Scraper'
const description = ''

class OlaFinanceScheme implements Scheme {
  public constants: OlaFinanceSchemeConfig['constants'] = {
    MAX_NAVIGATION_TIMEOUT: 120_000, // 2 minutes
    SITE_URL: 'https://app.ola.finance/fuseFi/markets',
    TARGET_SELECTOR: '.jss141:nth-child(2) .jss150',
    TARGET_VALUE_SELECTOR: '.jss155',
  }

  public settings: SchemeSettings = {
    scraping: {
      closePageAfter: true,
      useSharedBrowser: true
    },
    alert: {
      complexPayload: true,
    },
  }

  private lastValues = new Map<keyof DataEntry, unknown>()

  constructor(private config: OlaFinanceSchemeConfig) {
    this.constants = {
      ...this.constants,
      ...config.constants,
    }
  }

  public async callback({ scraping, log, alert }: SchemeContext) {
    const data = await this.scrape({ scraping, log })
    const parsed = this.parse(data)
    log.info({ event: 'LIQUIDITY_LOG', message: parsed.map(({ asset, liquidity }) => `${asset}=${liquidity.value}${liquidity.currency}`).join(';') })
    this.persist(parsed)
    const filtered = this.filter(parsed)
    if (filtered.length) {
      const payload = this.prepare(filtered)
      return alert.send(payload)
    }
    return
  }

  private prepare(data: DataEntry[]): Prepared {
    const assets = data.map(({ asset, liquidity }) => ({
      asset,
      liquidity: `${liquidity.value}${liquidity.currency}`,
    }))
    const message = assets.map(({ asset, liquidity }) => `Asset ${asset} - liquidity=${liquidity}`).join('\n')
    return {
      message, assets
    }
  }

  private persist(data: DataEntry[]) {
    return data.map(entry => {
      this.lastValues.set('liquidity', entry.liquidity.value)
      return this.lastValues.has('liquidity')
    }).every(status => status === true)
  }

  private filter(data: DataEntry[]) {
    return data.filter(({ liquidity }) => (
      liquidity.value >= this.config.thresholds.liquidity && this.lastValues.get('liquidity') < this.config.thresholds.liquidity
    ))
  }

  private parse(assetValues) {
    const parseValues = ([asset, apy, wallet, liquidity]) => {
      const resolvedApy = apy.replace(/\s+/g, '')
      const resolvedAsset = asset.replace(resolvedApy, '')
      const resolvedWallet = +wallet.replace(resolvedAsset, '')
      const resolvedLiquidity = {
        value: +liquidity.replace(/^\$\s+/, ''),
        currency: 'USD' as const,
      }
      return [resolvedAsset, resolvedApy, resolvedWallet, resolvedLiquidity]
    }
    const results = assetValues.map(values => {
      const [asset, apy, wallet, liquidity] = parseValues(values)
      return {
        asset, apy, wallet, liquidity,
      }
    })
    return results as DataEntry[]
  }

  private async scrape({ scraping, log }: Pick<SchemeContext, 'scraping' | 'log'>) {
    const page = await scraping.getBrowserPage()
    await page.goto(this.constants.SITE_URL, {
      timeout: this.constants.MAX_NAVIGATION_TIMEOUT,
    })
    log.info({ event: 'END_NAVIGATION', message: 'Navigation ended' })
    await page.waitForSelector(this.constants.TARGET_SELECTOR, {
      timeout: this.constants.MAX_NAVIGATION_TIMEOUT,
    })
    log.info({ event: 'ASSETS_LOADED', message: 'Assets loaded' })
    return page.evaluate((TARGET_SELECTOR, TARGET_VALUE_SELECTOR) => {
      const els = [...document.querySelectorAll(TARGET_SELECTOR)]
      return els.map(el => (
        [...el.querySelectorAll(TARGET_VALUE_SELECTOR)]
          .map(valueEl => valueEl.textContent)
      ))
    }, this.constants.TARGET_SELECTOR, this.constants.TARGET_VALUE_SELECTOR)
  }

  public createAlertPayload<S extends keyof BuiltinAlertServicesPayloads>(alertService: S, data: Prepared): BuiltinAlertServicesPayloads[S] {
    switch (alertService) {
      case 'gmail':
        return this.createGmailPayload(data) as BuiltinAlertServicesPayloads[S]
      case 'signal':
        return this.createSignalPayload(data) as BuiltinAlertServicesPayloads[S]
      case 'telegram':
        return this.createTelegramPayload(data) as BuiltinAlertServicesPayloads[S]
      default:
        throw new UnknownAlertService(id, alertService)
    }
  }

  private createGmailPayload(data: Prepared): BuiltinAlertServicesPayloads['gmail'] {
    return {
      content: data.message,
      subject: `Liquidity Alert - Assets ${data.assets.map(({ asset }) => asset).join(', ')}`,
    }
  }

  private createSignalPayload(data: Prepared): BuiltinAlertServicesPayloads['signal'] {
    return {
      content: data.message,
    }
  }

  private createTelegramPayload(data: Prepared): BuiltinAlertServicesPayloads['telegram'] {
    return {
      content: data.message,
    }
  }
}

export default {
  create: (config) => new OlaFinanceScheme(config),
  schemeName,
  description,
  id
} as SchemeModule<OlaFinanceSchemeConfig>
