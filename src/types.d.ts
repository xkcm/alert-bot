export type OnProgressHandler = (message: string) => any;

export interface Scheme {
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

export namespace BotConfiguration {
  namespace Schemes {
    type BuiltinSchemeFilter<T> = {
      [K in keyof T]: {
        name: K;
        config: T[K];
      };
    }[keyof T]
    interface SchemeConfigs {
      'ola-finance': {
        thresholds: {
          liquidity?: number;
        }
      }
    }
    export type DefinedScheme = BuiltinSchemeFilter<SchemeConfigs>
  }
  namespace AlertServiceConfigs {
    type ServiceConfigFilter<T> = {
      [K in keyof T]: {
        service: K;
        config: T[K]
      }
    }[keyof T]
    interface Gmail {
      auth: {
        user: string;
        pass: string;
      };
      to: string;
      subject: string;
    }
    interface Telegram {}
    interface Signal {}

    type All = {
      gmail: Gmail;
      telegram: Telegram;
      signal: Signal;
    }
    export type Combined = ServiceConfigFilter<All>
  }

  interface Config {
    scheme: Schemes.DefinedScheme;
    alert: Record<string, AlertServiceConfigs.Combined>
  }
  export interface Root {
    configs: Config[];
    adminAlert: Record<string, AlertServiceConfigs.Combined>
  }
}
