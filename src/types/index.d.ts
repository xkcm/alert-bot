import { BotConfiguration } from './config'
import { Scheme } from './scheme'

export type OnProgressHandler = (message: string) => unknown;
export type LogHandler = {
  [key in 'info' | 'error' | 'warn']: (logObject: { event: string, message: string }) => void
}
export interface ListFilesInDirectoryOptions {
  path: string;
  allowedExtensions?: string[];
  exclude?: string[];
  resolvePaths?: boolean;
}
export interface LoadModuleOptions {
  path: string;
  pluckDefault?: boolean;
  pluckModule?: boolean;
}

export interface LoadModulesOptions extends Omit<LoadModuleOptions, 'path'> {
  paths: string[];
}

export interface LoadJSONConfigurationOptions {
  path: string;
}

export interface TaskConstructorOptions {
  config: BotConfiguration.TaskConfig;
  start?: boolean;
}

export interface ContextConstructorOptions {
  scheme: Scheme;
  config: BotConfiguration.TaskConfig;
}
