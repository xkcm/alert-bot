import { BotRuntimeError } from '.'

export class SchemeNameConflictError extends BotRuntimeError {
  constructor(public schemeId: string) {
    super(`Scheme with id "${schemeId}" is already defined.`)
  }
}

export class InvalidSchemeModuleError extends BotRuntimeError {
  constructor(public missingProperty: string) {
    super(`Scheme module is missing "${missingProperty}" property.`)
  }
}

export class UndefinedSchemeError extends BotRuntimeError {
  constructor(public schemeId: string) {
    super(`Scheme with id "${schemeId}" is undefined.`)
  }
}

export class UnknownAlertService extends BotRuntimeError {
  constructor(public schemeId: string, public alertService: string) {
    super(`Scheme with id "${schemeId}" has no defined payload function for alert service "${alertService}".`)
  }
}
