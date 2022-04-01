export type OnProgressHandler = (message: string) => any;

export interface Strategy {
  name: string;
  roundtrip: () => any;
  type: 'built-in' | 'custom';
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
