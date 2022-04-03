export class BotRuntimeError extends Error {
  public static createCatcher(...args: unknown[]) {
    return (originalError) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      throw new (this as any)(...args, originalError)
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
  constructor(public moduleName: string, path: string, public originalError: Error) {
    super(`Failed to import module "${moduleName}" at path "${path}"`)
  }
}
