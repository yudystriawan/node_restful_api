import {BindingScope, injectable} from '@loopback/core';
import {createTransport} from 'nodemailer';
import {EmailTemplate, Nodemailer, User} from '../models';
import {welcomeEmail} from '../utils/welcome-email.spec';

require('dotenv/config');

@injectable({scope: BindingScope.TRANSIENT})
export class EmailService {
  constructor() {}

  private static async setupTransporter() {
    const smtp: object = {
      host: process.env.SMTP_HOST!,
      port: process.env.SMTP_PORT!,
      auth: {
        user: process.env.SMTP_USERNAME!,
        pass: process.env.SMTP_PASSWORD!,
      },
    };
    return createTransport(smtp);
  }

  async sendConfirmationMail(user: User): Promise<Nodemailer> {
    const transporter = await EmailService.setupTransporter();
    const emailTemplate = new EmailTemplate({
      from: process.env.SMTP_EMAIL_FROM,
      to: user.email,
      subject: 'Confirm your account',
      html: welcomeEmail(user),
    });
    return transporter.sendMail(emailTemplate);
  }
}
