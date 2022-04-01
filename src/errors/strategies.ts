import { BotRuntimeError } from '.'

export class StrategyNameConflictError extends BotRuntimeError {
  constructor(public strategyName: string) {
    super(`Strategy with name "${strategyName}" is already defined.`)
  }
}

export class InvalidStrategyModuleError extends BotRuntimeError {
  constructor(public missingProperty: string) {
    super(`Strategy module is missing "${missingProperty}" property.`)
  }
}

export class UndefinedStrategyError extends BotRuntimeError {
  constructor(public strategyName: string) {
    super(`Strategy with name "${strategyName}" is undefined.`)
  }
}
