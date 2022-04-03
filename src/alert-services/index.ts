import { resolve } from 'path'
import { UndefinedAlertServiceError } from '../errors/alert-services'
import { SchemeNameConflictError } from '../errors/schemes'
import { listFilesInDirectory, loadModules } from '../helpers'
import { AlertServiceModule } from '../types/alert-services'

interface RegisteredAlertService {
  alertServiceModule: AlertServiceModule
  type: 'built-in' | 'custom'
}

const alertServices = new Map<string, RegisteredAlertService>()

export function registerAlertService(alertService: RegisteredAlertService) {
  const { id } = alertService.alertServiceModule
  if (alertServices.has(id)) {
    throw new SchemeNameConflictError(id)
  }
  alertServices.set(id, alertService)
  return alertServices.has(id)
}

export function getAlertServiceModule(id: string) {
  const alertService = [...alertServices.values()].find(service => service.alertServiceModule.id === id)
  if (!alertService) {
    throw new UndefinedAlertServiceError(id)
  }
  return alertService.alertServiceModule
}

export async function registerBuiltinAlertServices() {
  const javascriptModules = await listFilesInDirectory({
    path: resolve(__dirname, 'builtin'),
    allowedExtensions: [ '.js' ],
    resolvePaths: true
  })
  const modules = await loadModules({
    paths: javascriptModules,
    pluckDefault: true,
    pluckModule: true
  }) as AlertServiceModule[]
  const servicesRegistered = modules.map(module => (
    registerAlertService({
      alertServiceModule: module,
      type: 'built-in'
    } as const)
  )).every(status => status === true)
  return servicesRegistered
}
