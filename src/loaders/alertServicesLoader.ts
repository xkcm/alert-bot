import { resolve } from 'path'
import { UndefinedAlertServiceError } from '../errors/AlertService.errors'
import { SchemeNameConflictError } from '../errors/schemes.errors'
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

export function getAlertServiceModule(id: string, silent = false) {
  const alertService = alertServices.get(id)
  if (!silent && !alertService) {
    throw new UndefinedAlertServiceError(id)
  }
  return alertService.alertServiceModule
}

export async function registerBuiltinAlertServices() {
  const modulePaths = await listFilesInDirectory({
    path: resolve(__dirname, '../builtin/alert-services'),
    resolvePaths: true
  })
  const modules = await loadModules({
    paths: modulePaths,
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

// TODO: Add registering custom alert services
