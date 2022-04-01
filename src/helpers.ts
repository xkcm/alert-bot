import * as dotenv from 'dotenv'
import { readFile, readdir } from 'fs/promises'
import { resolve, extname, basename } from 'path'
import * as yargs from 'yargs'
import { ConfigParseError, ConfigReadError, ModuleImportError } from './errors'
import { ListFilesInDirectoryOptions, LoadJSONConfigurationOptions, LoadModuleOptions, LoadModulesOptions } from './types'

const assetMap = new Map()

export function filterAssetsByThresholds(results, mailingList) {
  return mailingList.map(entry => {
    const { threshold } = entry
    const filtered = results.filter(({ asset, liquidity: { value } }) => (
      value >= threshold && (assetMap.get(asset) || 0) < threshold
    ))
    results.forEach(({ asset, liquidity: { value }}) => assetMap.set(asset, value))
    return {
      assets: filtered,
      mailEntry: entry
    }
  }).filter(({ assets }) => assets.length > 0)
}

export function loadEnv() {
  return dotenv.config({
    path: resolve(__dirname, '..', '.env')
  }).parsed
}

export function createTimeout(ms) {
  return new Promise((res, rej) => setTimeout(() => rej(`Timeout of ${ms}ms exceeded.`), ms))
}

export const date = () => new Date().toISOString()

export async function loadJSONConfiguration({ path }: LoadJSONConfigurationOptions) {
  const content = await readFile(path).catch(ConfigReadError.createCatcher(path))
  try {
    return JSON.parse(content.toString())
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
      type: 'string'
    })
    .option('b', {
      alias: 'bootup-alert',
      demandOption: false,
      describe: 'Send bootup alert to the admin',
      type: 'string'
    })
    .argv
}

export async function listFilesInDirectory({ path, allowedExtensions = [], exclude = [], resolvePaths = false }: ListFilesInDirectoryOptions) {
  console.log(path)
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
  const module = await import(path).catch(ModuleImportError.createCatcher(moduleName, path))
  return pluckModule ? module as T : {
    module: (pluckDefault ? module.default : module) as T,
    name: moduleName
  }
}

export function loadModules({ paths, ...rest }: LoadModulesOptions) {
  return Promise.all(paths.map(path => loadModule({ path, ...rest })))
}
