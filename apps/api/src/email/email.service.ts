import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: ConfigService) {}

  async sendVerificationCode(email: string, code: string) {
    const host = this.config.get<string>('SMTP_HOST');
    const port = Number(this.config.get<string>('SMTP_PORT'));
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    const from = this.config.get<string>('MAIL_FROM');

    if (!host || !port || !user || !pass || !from) {
      throw new ServiceUnavailableException(
        'Email delivery is not configured.',
      );
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure:
        this.config.get<string>('SMTP_SECURE') === 'true',
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 10_000,
      auth: {
        user,
        pass,
      },
    });

    try {
      await transporter.sendMail({
        from,
        to: email,
        subject: 'Verify your LingoRoots account',
        text: [
          `Your LingoRoots verification code is: ${code}`,
          '',
          'This code expires in 10 minutes.',
          'If you did not create this account, you can ignore this email.',
        ].join('\n'),
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
            <h2>Verify your LingoRoots account</h2>
            <p>Enter this code to verify your email address:</p>
            <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px;">
              ${code}
            </p>
            <p>This code expires in 10 minutes.</p>
            <p>If you did not create this account, you can ignore this email.</p>
          </div>
        `,
      });
    } catch (error) {
      this.logger.error(
        'Verification email delivery failed.',
        error instanceof Error ? error.stack : String(error),
      );

      throw new ServiceUnavailableException(
        'Unable to send the verification email. Please try again later.',
        { cause: error },
      );
    }
  }

  async verifyConnection() {
  const transporter = nodemailer.createTransport({
    host: this.config.getOrThrow<string>('SMTP_HOST'),
    port: Number(this.config.getOrThrow<string>('SMTP_PORT')),
    secure: this.config.get<string>('SMTP_SECURE') === 'true',
    auth: {
      user: this.config.getOrThrow<string>('SMTP_USER'),
      pass: this.config.getOrThrow<string>('SMTP_PASS'),
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  await transporter.verify();

  return 'SMTP connection and authentication successful';
}
}