import { resolve } from 'path';
import { InvalidSchemeModuleError, SchemeNameConflictError, UndefinedSchemeError } from '../errors/schemes';
import { listFilesInDirectory, loadModules } from '../helpers';
import { SchemeModule } from '../types/scheme';

type RegisteredScheme = {
  schemeClass: SchemeModule,
  type: 'built-in' | 'custom'
}

const schemes = new Map<string, RegisteredScheme>();

export function validateScheme(scheme: SchemeModule) {
  const requiredProps = ['type', 'schemeName', 'schemeClass', 'id', 'description'];
  requiredProps.forEach(prop => {
    if (Reflect.has(scheme, prop)) {
      throw new InvalidSchemeModuleError(prop);
    }
  });
  return true;
}

export function getScheme(schemeName: string, silent = false) {
  const scheme = schemes.get(schemeName);
  if (!silent && !scheme) {
    throw new UndefinedSchemeError(schemeName);
  }
  return scheme;
}

function registerScheme(scheme: RegisteredScheme) {
  validateScheme(scheme.schemeClass);
  const { id } = scheme.schemeClass;
  if (schemes.has(id)) {
    throw new SchemeNameConflictError(id);
  }
  schemes.set(id, scheme);
  return schemes.has(id);
}

export function registerCustomScheme(scheme: SchemeModule) {
  return registerScheme({
    schemeClass: scheme,
    type: 'custom',
  } as const);
}

export async function registerBuiltinSchemes() {
  const javascriptModules = await listFilesInDirectory({
    path: resolve(__dirname, 'built-in'),
    allowedExtensions: ['.js'],
    exclude: ['index.js'],
    resolvePaths: true,
  });
  const modules = await loadModules({
    paths: javascriptModules,
    pluckDefault: true,
    pluckModule: true,
  }) as SchemeModule[];
  const schemesRegistered = modules.map(module => (
    registerScheme({
      schemeClass: module,
      type: 'built-in',
    } as const)
  ));
  return schemesRegistered.every(status => status === true);
}

export async function registerCustomSchemesFromPaths(paths: string[]) {
  const modules = await loadModules({
    paths,
    pluckDefault: true,
    pluckModule: true,
  }) as SchemeModule[];
  const schemesRegistered = modules.map(registerCustomScheme);
  return schemesRegistered.every(status => status === true);
}
