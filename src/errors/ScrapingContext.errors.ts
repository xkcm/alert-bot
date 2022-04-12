import { BotRuntimeError } from './index.errors'

export class ScrapingContextError extends BotRuntimeError {}

export class CannotCloseSharedBrowserError extends ScrapingContextError {
  constructor() {
    super('Cannot close shared browser.')
  }
}
