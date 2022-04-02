import { resolve } from 'path'
import nodemailer from 'nodemailer'
import { MAILING_LIST_NOT_PROVIDED_ERROR_MESSAGE, INCORRECT_MAIL_CONFIG_ERROR_MESSAGE } from './consts'
import { loadEnv, date } from './helpers'
import { OnProgressHandler } from './types'

const createMessage = content => `[mailer] ${date()} ${content}`

export function loadMailingList() {
  const argIndex = process.argv.findIndex(arg => arg === '-u')
  if (argIndex === -1) throw new Error(MAILING_LIST_NOT_PROVIDED_ERROR_MESSAGE)
  const filePath = process.argv.at(argIndex+1)
  if (!filePath) throw new Error(MAILING_LIST_NOT_PROVIDED_ERROR_MESSAGE)
  const path = resolve(process.cwd(), filePath)
  return require(path)
}

export function getTransport() {
  const env = loadEnv()
  if (!env.MAIL_SERVICE || !env.MAIL_USER || !env.MAIL_PASS) {
    throw new Error(INCORRECT_MAIL_CONFIG_ERROR_MESSAGE)
  }
  return nodemailer.createTransport({
    service: env.MAIL_SERVICE,
    auth: {
      user: env.MAIL_USER,
      pass: env.MAIL_PASS
    }
  })
}

export function sendMail(mailOptions) {
  const transport = getTransport()
  return transport.sendMail({
    ...mailOptions,
    from: loadEnv().MAIL_USER
  })
}

export function sendTestMails(mailingList, { onProgress }: { onProgress?: OnProgressHandler }) {
  return Promise.all(mailingList.map(entry => {
    const mailOptions = {
      to: entry.mail,
      subject: 'Liquidity Alert - Test message',
      text: `This is a test message from Liquidity Alert Bot.\nYour threshold is set at ${entry.threshold}.\nMessage generated on ${date()}`
    }
    onProgress(createMessage(`Sending test mail to ${mailOptions.to}`))
    return sendMail(mailOptions).then(() => onProgress(createMessage(`Mail sent to ${mailOptions.to}`)))
  }))
}

export function sendAlertMails(mailEntries, { onProgress }: { onProgress: OnProgressHandler }) {
  const createMailMessage = entry => {
    return entry.assets.map(({ asset, liquidity }) => (
      `\nAsset: ${asset}\nLiquidity: ${liquidity.value} ${liquidity.currency}\n`
    )).join('\n')
  }
  return Promise.all(mailEntries.map(entry => {
    const mailOptions = {
      to: entry.mailEntry.mail,
      subject: 'Liquidity Alert - Threshold exceeded',
      text: createMailMessage(entry)
    }
    onProgress(createMessage(`Sending threshold exceeded message to ${mailOptions.to}`))
    return sendMail(mailOptions)
      .then(() => onProgress(createMessage(`Mail sent to ${mailOptions.to}`)))
  }))
}

export function sendErrorMail(error, { onProgress }: { onProgress: OnProgressHandler }) {
  const mailOptions = {
    to: loadEnv().ADMIN_MAIL,
    subject: 'Liquidity Alert - Error occurred',
    text: `Error occurred, bot stopped working. Error:\n${error}`
  }
  onProgress(createMessage(`Sending error message to ${mailOptions.to}`))
  return sendMail(mailOptions).then(() => onProgress(createMessage(`Mail sent to ${mailOptions.to}`)))
}
