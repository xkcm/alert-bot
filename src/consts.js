const SCRAPED_SITE_URL = 'https://app.ola.finance/fuseFi/markets'
const TARGET_SELECTOR = '.jss136 .jss137:nth-child(2) .jss145.jss146'
const TARGET_VALUE_SELECTOR = '.jss151'

const MAILING_LIST_NOT_PROVIDED_ERROR_MESSAGE = 'Mailing list filepath not provided.'
const INCORRECT_MAIL_CONFIG_ERROR_MESSAGE = 'Mail configuration is invalid.'

const INTERVAL_MS = 15_000
const TIMEOUT_MS = 60_000

module.exports = {
  SCRAPED_SITE_URL,
  TARGET_SELECTOR,
  TARGET_VALUE_SELECTOR,
  MAILING_LIST_NOT_PROVIDED_ERROR_MESSAGE,
  INCORRECT_MAIL_CONFIG_ERROR_MESSAGE,
  INTERVAL_MS,
  TIMEOUT_MS
}
