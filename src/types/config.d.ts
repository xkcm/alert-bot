import { BuiltinAlertServicesConfigs } from './alert-services'

export namespace BotConfiguration {
  namespace Schemes {
    type BuiltinSchemeFilter<T> = {
      [K in keyof T]: {
        id: K;
        config: T[K];
      };
    }[keyof T]
    interface SchemeConfigs {
      'ola-finance': {
        thresholds: {
          liquidity?: number;
        },
        constants?: {
          MAX_NAVIGATION_TIMEOUT?: number;
          SITE_URL?: string;
          TARGET_SELECTOR?: string;
          TARGET_VALUE_SELECTOR?: string;
        }
      }
    }
    export type DefinedScheme = BuiltinSchemeFilter<SchemeConfigs>
  }
  type AlertServiceConfig = {
    [K in keyof BuiltinAlertServicesConfigs]: {
      service: K;
      config: BuiltinAlertServicesConfigs[K]
    }
  }[keyof BuiltinAlertServicesConfigs]

  interface Config {
    scheme: Schemes.DefinedScheme;
    alert: Record<string, AlertServiceConfig>
  }
  export interface Root {
    configs: Config[];
    adminAlert: Record<string, AlertServiceConfig>;
    customSchemes: string[];
  }
}