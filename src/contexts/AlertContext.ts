import { getAlertServiceModule } from '../alert-services'
import { defaultValue } from '../helpers'
import { ContextConstructorOptions } from '../types'
import { AlertService, AlertServiceConfig, BuiltinAlertServices } from '../types/alert-services'
import { Scheme, SchemeSettings } from '../types/scheme'

type AlertSettings = SchemeSettings['alert']

export class AlertContext {
  public static DEFAULT_COMPLEX_PAYLOAD = true

  private settings: Required<AlertSettings>
  private scheme: Scheme
  private alertServices: Map<string, { instance: AlertService, id: BuiltinAlertServices }>

  constructor(options: ContextConstructorOptions) {
    this.settings = {
      complexPayload: defaultValue(options.scheme.settings.alert.complexPayload, AlertContext.DEFAULT_COMPLEX_PAYLOAD)
    }
    this.scheme = options.scheme
    this.createAlertServices(options.config.alert)
  }

  private createAlertServices(config: Record<string, AlertServiceConfig>) {
    this.alertServices = new Map()
    const allSet = Object.entries(config).map(([key, v]) => {
      this.alertServices.set(key, {
        instance: getAlertServiceModule(v.service).create(v.config as any),
        id: v.service
      })
      return this.alertServices.has(key)
    })
    return allSet
  }

  public async send(payload: unknown) {
    const promises = [...this.alertServices.entries()].map(([key, alertService]) => {
      const resolvedPayload = this.settings.complexPayload ? this.scheme.createAlertPayload(alertService.id, payload) : payload
      return alertService.instance.sendAlert(resolvedPayload)
    })
    return Promise.all(promises)
  }

  public async postExecute() {
    
  }
}
