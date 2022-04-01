import { loadJSONConfiguration, parseArgs } from './helpers'
import { registerBuiltinSchemes } from './schemes'
import { BotConfiguration } from './types'

// async function roundtrip() {
//   const assets = await Promise.race([
//     scrapeAssets({ onProgress: console.log }), createTimeout(TIMEOUT_MS)
//   ])
//   const mailEntries = filterAssetsByThresholds(assets, mailingList)
//   if (mailEntries.length > 0) {
//     await sendAlertMails(mailEntries, { onProgress: console.log })
//   }
// }

async function run() {
  const errorHandler = (...args) => { console.log(...args) }
  // if (!process.argv.includes('--no-test')) {
  //   await sendTestMails(mailingList, { onProgress: console.log })
  // }
  // const { stop, task } = repeatTask({
  //   timeInMs: INTERVAL_MS,
  //   task: roundtrip
  // }, { onProgress: content => console.log(`[scheduler] ${date()} ${content}`) })
  // task.catch(async (error) => {
  //   stop()
  //   console.error(createMessage('Error occured:'), error)
  //   await sendErrorMail(error, { onProgress: console.log })
  //   process.exit(0)
  // })
  await registerBuiltinSchemes()
  const { c: configFilePath } = await parseArgs(process.argv)
  const config: BotConfiguration.Root = await loadJSONConfiguration({ path: configFilePath }).catch(errorHandler)
  return start(config)
}

export async function start(config: BotConfiguration.Root) {

}

if (require.main === module)
  run().catch(console.error)

export { registerCustomScheme } from './schemes/index'
