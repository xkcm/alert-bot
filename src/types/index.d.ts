export type OnProgressHandler = (message: string) => unknown;

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
