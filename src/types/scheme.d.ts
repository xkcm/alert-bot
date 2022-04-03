import SchemeContext from '../contexts/SchemeContext'
import { BuiltinAlertServices, BuiltinAlertServicesPayloads } from './alert-services'

/* ola-finance */
export interface OlaFinanceSchemeConfig {
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

/* GENERAL */

export type SchemeModule<T = unknown> = {
  schemeName: string;
  id: string;
  description: string;
  create(config: T): Scheme;
}

interface SchemeSettings {
  scraping?: {
    useSharedBrowser?: boolean;
    closePageAfter?: boolean;
  };
  alert?: {
    complexPayload?: boolean;
  };
}

export type SchemeConfig = {
  [K in keyof BuiltinSchemeConfigs]: {
    id: K;
    config: BuiltinSchemeConfigs[K];
  };
}[keyof BuiltinSchemeConfigs]

export interface Scheme {
  settings: SchemeSettings;
  callback(options: SchemeContext): Promise<unknown>
  createAlertPayload?<S extends BuiltinAlertServices>(alertService: S, data: unknown): BuiltinAlertServicesPayloads[S]
}

export interface BuiltinSchemeConfigs {
  'ola-finance': OlaFinanceSchemeConfig
}
