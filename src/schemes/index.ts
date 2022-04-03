import { resolve } from 'path'
import { InvalidSchemeModuleError, SchemeNameConflictError, UndefinedSchemeError } from '../errors/schemes'
import { listFilesInDirectory, loadModules } from '../helpers'
import { BotConfiguration } from '../types/config'
import { SchemeModule } from '../types/scheme'

type RegisteredScheme = {
  schemeModule: SchemeModule,
  type: 'built-in' | 'custom'
}

const schemes = new Map<string, RegisteredScheme>()

export function validateScheme(scheme: SchemeModule) {
  const requiredProps = ['schemeName', 'create', 'id', 'description']
  requiredProps.forEach(prop => {
    if (!Reflect.has(scheme, prop)) {
      throw new InvalidSchemeModuleError(prop)
    }
  })
  return true
}

export function getSchemeModule(schemeId: string, silent = false) {
  const scheme = schemes.get(schemeId)
  if (!silent && !scheme) {
    throw new UndefinedSchemeError(schemeId)
  }
  return scheme.schemeModule
}

function registerScheme(scheme: RegisteredScheme) {
  validateScheme(scheme.schemeModule)
  const { id } = scheme.schemeModule
  if (schemes.has(id)) {
    throw new SchemeNameConflictError(id)
  }
  schemes.set(id, scheme)
  return schemes.has(id)
}

export function registerCustomScheme(scheme: SchemeModule) {
  return registerScheme({
    schemeModule: scheme,
    type: 'custom',
  } as const)
}

export async function registerBuiltinSchemes() {
  const javascriptModules = await listFilesInDirectory({
    path: resolve(__dirname, 'builtin'),
    allowedExtensions: ['.js'],
    resolvePaths: true,
  })
  const modules = await loadModules({
    paths: javascriptModules,
    pluckDefault: true,
    pluckModule: true,
  }) as SchemeModule[]
  const schemesRegistered = modules.map(module => (
    registerScheme({
      schemeModule: module,
      type: 'built-in',
    } as const)
  ))
  return schemesRegistered.every(status => status === true)
}

export async function registerCustomSchemesFromPaths(paths: string[]) {
  const modules = await loadModules({
    paths,
    pluckDefault: true,
    pluckModule: true,
  }) as SchemeModule[]
  const schemesRegistered = modules.map(registerCustomScheme)
  return schemesRegistered.every(status => status === true)
}
