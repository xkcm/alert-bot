import { Strategy } from '../types.d'
import { listFilesInDirectory, loadModules } from '../helpers'
import { InvalidStrategyModuleError, StrategyNameConflictError, UndefinedStrategyError } from '../errors/strategies'

const strategies = new Map<string, Strategy>()

export function validateStrategy(strategy: Strategy) {
  for (let prop of ['type', 'name', 'roundtrip']) {
    if (Reflect.has(strategy, prop)) {
      throw new InvalidStrategyModuleError(prop)
    }
  }
  return true
}

export function getStrategy(strategyName: string, silent: boolean = false) {
  const strategy = strategies.get(strategyName)
  if (!silent && !strategy) {
    throw new UndefinedStrategyError(strategyName)
  }
  return strategy
}

function registerStrategy(strategy: Strategy) {
  validateStrategy(strategy)
  const { name } = strategy
  if (strategies.has(name)) {
    throw new StrategyNameConflictError(name)
  }
  strategies.set(name, strategy)
  return strategies.has(name)
}

export function registerCustomStrategy(strategy: Omit<Strategy, 'type'>) {
  return registerStrategy(Object.assign(strategy, {
    type: 'custom'
  } as const))
}

export async function registerBuiltinStrategies() {
  const javascriptModules = await listFilesInDirectory({
    path: __dirname,
    allowedExtensions: [ '.js' ],
    exclude: [ 'index.js' ],
    resolvePaths: true
  })
  const modules = await loadModules({
    paths: javascriptModules,
    pluckDefault: true,
    pluckModule: true
  }) as Omit<Strategy, 'type'>[]
  const modulesRegistered = modules.map(module => (
    registerStrategy(Object.assign(module, {
      type: 'built-in'
    } as const))
  ))
  return modulesRegistered.every(status => status === true)
}
