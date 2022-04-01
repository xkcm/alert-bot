const { scrapeAssets } = require('./scraper')
import { repeatTask } from './scheduler'
import { loadMailingList, sendAlertMails, sendTestMails, sendErrorMail } from './mailer'
const { filterAssetsByThresholds, createTimeout, date } = require('./helpers')
const { INTERVAL_MS, TIMEOUT_MS } = require('./consts')

const mailingList = loadMailingList()

const createMessage = content => `[app] ${date()} ${content}`

async function roundtrip() {
  const assets = await Promise.race([
    scrapeAssets({ onProgress: console.log }), createTimeout(TIMEOUT_MS)
  ])
  const mailEntries = filterAssetsByThresholds(assets, mailingList)
  if (mailEntries.length > 0) {
    await sendAlertMails(mailEntries, { onProgress: console.log })
  }
}

async function main() {
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
}

main()