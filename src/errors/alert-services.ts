import { BotRuntimeError } from '.'

export class AlertServiceNameConflictError extends BotRuntimeError {
  constructor(public alertServiceId: string) {
    super(`Alert Service with id "${alertServiceId}" is already defined.`)
  }
}

export class UndefinedAlertServiceError extends BotRuntimeError {
  constructor(public alertServiceId: string) {
    super(`Alert Service with id "${alertServiceId}" is undefined.`)
  }
}
