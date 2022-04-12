import { BotRuntimeError } from './index.errors'

export class AlertServiceError extends BotRuntimeError {}

export class AlertServiceNameConflictError extends AlertServiceError {
  constructor(public alertServiceId: string) {
    super(`Alert Service with id "${alertServiceId}" is already defined.`)
  }
}

export class UndefinedAlertServiceError extends AlertServiceError {
  constructor(public alertServiceId: string) {
    super(`Alert Service with id "${alertServiceId}" is undefined.`)
  }
}
