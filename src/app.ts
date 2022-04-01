import { loadJSONConfiguration, parseArgs } from './helpers'
import { registerBuiltinStrategies } from './strategies'

// async function roundtrip() {
//   const assets = await Promise.race([
//     scrapeAssets({ onProgress: console.log }), createTimeout(TIMEOUT_MS)
//   ])
//   const mailEntries = filterAssetsByThresholds(assets, mailingList)
//   if (mailEntries.length > 0) {
//     await sendAlertMails(mailEntries, { onProgress: console.log })
//   }
// }

export async function run() {
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
  await registerBuiltinStrategies()
  const { c: configFilePath } = await parseArgs(process.argv)
  const config = await loadJSONConfiguration({ path: configFilePath }).catch(errorHandler)
}

if (require.main === module)
  run().catch(console.error)

export { registerCustomStrategy } from './strategies/index'