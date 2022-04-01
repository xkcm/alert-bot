import { Scheme } from '../types'
import { listFilesInDirectory, loadModules } from '../helpers'
import { InvalidSchemeModuleError, SchemeNameConflictError, UndefinedSchemeError } from '../errors/schemes'

const schemes = new Map<string, Scheme>()

export function validateScheme(scheme: Scheme) {
  for (let prop of ['type', 'name', 'roundtrip']) {
    if (Reflect.has(scheme, prop)) {
      throw new InvalidSchemeModuleError(prop)
    }
  }
  return true
}

export function getScheme(schemeName: string, silent: boolean = false) {
  const scheme = schemes.get(schemeName)
  if (!silent && !scheme) {
    throw new UndefinedSchemeError(schemeName)
  }
  return scheme
}

function registerScheme(scheme: Scheme) {
  validateScheme(scheme)
  const { name } = scheme
  if (schemes.has(name)) {
    throw new SchemeNameConflictError(name)
  }
  schemes.set(name, scheme)
  return schemes.has(name)
}

export function registerCustomScheme(scheme: Omit<Scheme, 'type'>) {
  return registerScheme(Object.assign(scheme, {
    type: 'custom'
  } as const))
}

export async function registerBuiltinSchemes() {
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
  }) as Omit<Scheme, 'type'>[]
  const schemesRegistered = modules.map(module => (
    registerScheme(Object.assign(module, {
      type: 'built-in'
    } as const))
  ))
  return schemesRegistered.every(status => status === true)
}
