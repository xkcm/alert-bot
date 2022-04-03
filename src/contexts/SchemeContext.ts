import { ContextConstructorOptions, LogHandler } from '../types'
import { Scheme } from '../types/scheme'
import { AlertContext } from './AlertContext'
import { ScrapingContext } from './ScrapingContext'

export default class SchemeContext {

  public scraping: ScrapingContext
  public alert: AlertContext
  public adminAlert: AlertContext
  public log: LogHandler
  private scheme: Scheme

  constructor(options: ContextConstructorOptions) {
    this.scheme = options.scheme
    this.scraping = new ScrapingContext(options)
    this.alert = new AlertContext(options)
    this.log = {
      warn: console.warn,
      error: console.error,
      info: console.info
    }
  }

  public async postExecute(result: unknown){
    await Promise.all([
      this.scraping.postExecute(),
      this.alert.postExecute()
    ])
  }
}
