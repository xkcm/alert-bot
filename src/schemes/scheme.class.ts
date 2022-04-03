import { BuiltinAlertServices, BuiltinAlertServicesPayloads } from '../types/alert-services';
import { SchemeSettings, SchemeCallbackOptions } from '../types/scheme';

export default abstract class SchemeClass {
  public abstract settings: SchemeSettings;

  public abstract callback(options: SchemeCallbackOptions): void

  public abstract createAlertPayload?<S extends BuiltinAlertServices>(alertService: S, data: unknown): BuiltinAlertServicesPayloads[S]
}
