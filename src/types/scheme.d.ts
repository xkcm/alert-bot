import { Page } from 'puppeteer';
import SchemeClass from '../schemes/scheme.class';
import { BuiltinAlertServices, BuiltinAlertServicesPayloads } from './alert-services';

export interface Scheme {
  settings: SchemeSettings;
  callback(options: SchemeCallbackOptions): void
  createAlertPayload?<S extends BuiltinAlertServices>(alertService: S, data: unknown): BuiltinAlertServicesPayloads[S]
}

export type SchemeModule<T = SchemeClass> = {
  schemeName: string;
  id: string;
  description: string;
  schemeClass: T;
}

interface SchemeSettings {
  scraper?: {
    sharedWindow?: boolean;
    closePageAfter?: boolean;
  };
  alert?: {
    complexPayload?: boolean;
  };
}

interface SchemeCallbackOptions<S = unknown> {
  browserPage: Page;
  sendAlert(payload: S): void;
  log: {
    [key in 'info' | 'error' | 'warning']: (logObject: { event: string, message: string }) => void
  }
}

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

export interface BuiltinSchemeConfigs {
  'ola-finance': OlaFinanceSchemeConfig
}
