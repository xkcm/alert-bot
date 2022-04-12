import * as puppeteer from 'puppeteer'
import { CannotCloseSharedBrowserError } from '../errors/ScrapingContext.errors'
import { defaultValue } from '../helpers'
import { ContextConstructorOptions } from '../types'
import { SchemeSettings } from '../types/scheme'

type ScrapingSettings = SchemeSettings['scraping']

export class ScrapingContext {
  public static DEFAULT_CLOSE_PAGE_AFTER = true
  public static DEFAULT_USE_SHARED_BROWSER = true
  private static SharedBrowser: puppeteer.Browser

  public settings: Required<ScrapingSettings>

  private openedPage: puppeteer.Page
  
  constructor(options: ContextConstructorOptions) {
    this.settings = {
      closePageAfter: defaultValue(options.scheme.settings.scraping.closePageAfter, ScrapingContext.DEFAULT_CLOSE_PAGE_AFTER),
      useSharedBrowser: defaultValue(options.scheme.settings.scraping.useSharedBrowser, ScrapingContext.DEFAULT_USE_SHARED_BROWSER)
    }
  }

  private launchBrowser(): Promise<puppeteer.Browser> {
    return puppeteer.launch({
      headless: false
    })
  }

  private async getSharedBrowser() {
    if (!ScrapingContext.SharedBrowser) {
      ScrapingContext.SharedBrowser = await this.launchBrowser()
    }
    return ScrapingContext.SharedBrowser
  }

  private async getBrowser(): Promise<puppeteer.Browser> {
    if (this.settings.useSharedBrowser) {
      const browser = await this.getSharedBrowser()
      return Object.assign(Object.create(browser), {
        async close(force: boolean) {
          if (force) {
            return browser.close()
          }
          throw new CannotCloseSharedBrowserError()
        }
      })
    }
    return this.launchBrowser()
  }

  public async getBrowserPage() {
    if (!this.openedPage) {
      const browser = await this.getBrowser()
      this.openedPage = await browser.newPage()
    }
    return this.openedPage
  }

  public async postExecute() {
    if (this.settings.closePageAfter) {
      await this.openedPage.close()
      this.openedPage = null
    }
  }

  public async terminate() {
    if (this.openedPage) {
      try { await this.openedPage.close() }
      catch {}
      this.openedPage = null
    }
    if (ScrapingContext.SharedBrowser) {
      try { await (ScrapingContext.SharedBrowser.close as any)(true) }
      catch {}
      ScrapingContext.SharedBrowser = null
    }
  }
}