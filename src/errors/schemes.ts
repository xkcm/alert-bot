import { BotRuntimeError } from '.'

export class SchemeNameConflictError extends BotRuntimeError {
  constructor(public schemeName: string) {
    super(`Scheme with name "${schemeName}" is already defined.`)
  }
}

export class InvalidSchemeModuleError extends BotRuntimeError {
  constructor(public missingProperty: string) {
    super(`Scheme module is missing "${missingProperty}" property.`)
  }
}

export class UndefinedSchemeError extends BotRuntimeError {
  constructor(public schemeName: string) {
    super(`Scheme with name "${schemeName}" is undefined.`)
  }
}
