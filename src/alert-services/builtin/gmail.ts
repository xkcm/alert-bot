import * as nodemailer from 'nodemailer';
import { GmailAlertServiceConfig, GmailAlertServicePayload } from '../../types/alert-services';
import AlertServiceClass from '../alert-service.class';

export default class GmailAlertService extends AlertServiceClass {
  public static id = 'gmail';

  constructor(protected config: GmailAlertServiceConfig) {
    super();
  }

  sendError(): void {
    return
  }

  sendAlert(payload: GmailAlertServicePayload) {
    const mailPromises = this.config.to.map(address => this.getTransport().sendMail({
      to: address,
      from: this.config.auth.user,
      subject: payload.subject,
      text: payload.content,
    }));
    return Promise.all(mailPromises);
  }

  protected getTransport() {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: this.config.auth,
    });
  }
}
