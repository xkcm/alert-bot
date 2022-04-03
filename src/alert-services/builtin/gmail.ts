import * as nodemailer from 'nodemailer'
import { AlertService, AlertServiceModule, GmailAlertServiceConfig, GmailAlertServicePayload } from '../../types/alert-services'

class GmailAlertService implements AlertService {
  constructor(protected config: GmailAlertServiceConfig) {}

  sendError(): void {
    return
  }

  sendAlert(payload: GmailAlertServicePayload) {
    const mailPromises = this.config.to.map(address => this.getTransport().sendMail({
      to: address,
      from: this.config.auth.user,
      subject: payload.subject,
      text: payload.content,
    }))
    return Promise.all(mailPromises)
  }

  protected getTransport() {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: this.config.auth,
    })
  }
}

export default {
  id: 'gmail',
  create: config => new GmailAlertService(config)
} as AlertServiceModule<GmailAlertServiceConfig>
