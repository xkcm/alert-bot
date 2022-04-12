import { readdir, readFile } from 'fs/promises'
import { basename, extname, resolve } from 'path'
import * as yargs from 'yargs'
import { ConfigParseError, ConfigReadError, ModuleImportError } from './errors/index.errors'
import {
  ListFilesInDirectoryOptions, LoadJSONConfigurationOptions, LoadModuleOptions, LoadModulesOptions
} from './types'

export function createTimeout(ms) {
  let timeoutId
  return Object.assign(new Promise((res, rej) => timeoutId = setTimeout(() => rej(`Timeout of ${ms}ms exceeded.`), ms)), { timeoutId })
}

export const date = () => new Date().toISOString()

export async function loadJSONConfiguration<T>({ path }: LoadJSONConfigurationOptions) {
  const content = await readFile(path).catch(ConfigReadError.createCatcher(path))
  try {
    return JSON.parse(content.toString()) as T
  } catch {
    throw new ConfigParseError(path)
  }
}

export function parseArgs(argv: string[]) {
  return yargs(argv)
    .option('c', {
      alias: 'config',
      demandOption: true,
      describe: 'Path to the config file',
      type: 'string',
    })
    .option('b', {
      alias: 'bootup-alert',
      demandOption: false,
      describe: 'Send bootup alert to the admin',
      type: 'string',
    })
    .argv
}

export function resolveRelativePaths(base: string, paths: string[]) {
  return paths.map(path => resolve(base, path))
}

export async function listFilesInDirectory({
  path, allowedExtensions = [], exclude = [], resolvePaths = false,
}: ListFilesInDirectoryOptions) {
  let files = await readdir(path)
  files = allowedExtensions.length > 0
    ? files.filter(file => allowedExtensions.includes(extname(file)))
    : files
  files = exclude.length > 0
    ? files.filter(file => !exclude.includes(file))
    : files
  files = resolvePaths
    ? files.map(file => resolve(path, file))
    : files
  return files
}

export async function loadModule<T>({ path, pluckModule = false, pluckDefault = false }: LoadModuleOptions) {
  const moduleName = basename(path)
  let module = await import(path).catch(ModuleImportError.createCatcher(moduleName, path))
  module = pluckDefault ? module.default : module
  return pluckModule ? module as T : {
    module,
    name: moduleName,
  }
}

export function loadModules({ paths, ...rest }: LoadModulesOptions) {
  return Promise.all(paths.map(path => loadModule({ path, ...rest })))
}

export function randomId() {
  return Math.random().toString(36).slice(2)
}

export function defaultValue(v, d) {
  return v === undefined || v === null ? d : v 
}

export function delay(ms: number) {
  let timeoutId
  return Object.assign(new Promise(res => timeoutId = setTimeout(res, ms)), { timeoutId })
}

export function createErrorIgnoringHandler(...instances: any[]) {
  return (error: Error) => {
    const isIgnored = instances.some(instance => error instanceof instance)
    if (!isIgnored) throw error
  }
}
