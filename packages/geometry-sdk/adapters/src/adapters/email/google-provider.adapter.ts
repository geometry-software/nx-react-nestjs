import nodemailer, { type Transporter } from 'nodemailer';
import { EmailAdapter, type EmailMessage } from './email-adapter.js';

export type GoogleProviderAdapterConfiguration = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
};

/** Sends messages through Google SMTP with STARTTLS or implicit TLS. */
export class GoogleProviderAdapter extends EmailAdapter {
  private readonly transporter: Transporter;

  constructor(private readonly configuration: GoogleProviderAdapterConfiguration) {
    super();
    if (!configuration.host || !configuration.user || !configuration.password || !configuration.from ||
        !Number.isInteger(configuration.port) || configuration.port < 1 || configuration.port > 65535) {
      throw new Error('Google SMTP configuration is incomplete');
    }
    this.transporter = nodemailer.createTransport({
      host: configuration.host,
      port: configuration.port,
      secure: configuration.secure,
      requireTLS: !configuration.secure,
      auth: {
        user: configuration.user,
        pass: configuration.password.replace(/\s+/g, ''),
      },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
  }

  /** Sends an email message through the configured transport. */
  public async send(message: EmailMessage): Promise<void> {
    await this.transporter.sendMail({
      from: { name: this.configuration.from, address: this.configuration.user },
      to: message.to,
      subject: message.subject,
      text: message.text,
      ...(message.metadata?.language
        ? { headers: { 'Content-Language': message.metadata.language } } : {}),
    });
  }
}
