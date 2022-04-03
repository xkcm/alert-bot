import { AlertServiceConfig } from './alert-services'
import { SchemeConfig } from './scheme'

export namespace BotConfiguration {
  export interface TaskConfig {
    scheme: SchemeConfig;
    alert: Record<string, AlertServiceConfig>;
    config?: {
      interval?: number;
      timeout?: number;
    };
  }
  export interface Root {
    tasks: TaskConfig[];
    adminAlert?: Record<string, AlertServiceConfig>;
    customSchemes?: string[];
  }
}
