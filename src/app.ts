import { dirname } from 'path'
import { registerBuiltinAlertServices } from './loaders/alertServicesLoader'
import { loadJSONConfiguration, parseArgs, resolveRelativePaths } from './helpers'
import { registerBuiltinSchemes, registerCustomSchemesFromPaths } from './loaders/schemesLoader'
import Task from './Task'
import { BotConfiguration } from './types/config'

async function cliRun() {
  const { c: configFilePath } = await parseArgs(process.argv)
  const config = await loadJSONConfiguration<BotConfiguration.Root>({ path: configFilePath })
  if (config.customSchemes) {
    await registerCustomSchemesFromPaths(
      resolveRelativePaths(dirname(configFilePath), config.customSchemes)
    )
  }
  return start(config)
}

export async function start(config: BotConfiguration.Root) {
  await registerBuiltinAlertServices()
  await registerBuiltinSchemes()
  const tasks = Task.createTasksFromConfig(config.tasks, {
    start: true
  })
  console.log(tasks)
  // TODO: Add admin alerts
}

if (require.main === module) cliRun().catch(console.error)
