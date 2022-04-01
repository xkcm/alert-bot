export class BotRuntimeError extends Error {
  public static createCatcher(...args: any) {
    return () => {
      throw new (this as any)(...args)
    }
  }
  public timestamp: number
  public date: string
  constructor(message: string) {
    super(message)
    this.timestamp = Date.now()
    this.date = new Date().toISOString()
  }
}

export class ConfigParseError extends BotRuntimeError {
  constructor(public path: string) {
    super(`Failed to parse configuration file at path "${path}".`)
  }
}

export class ConfigReadError extends BotRuntimeError {
  constructor(public path: string) {
    super(`Failed to read contents of config file at path "${path}"`)
  }
}

export class ModuleImportError extends BotRuntimeError {
  constructor(public moduleName: string, path: string) {
    super(`Failed to import module "${moduleName}" at path "${path}"`)
  }
}
