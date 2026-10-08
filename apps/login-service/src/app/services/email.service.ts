import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginEmailAdapter } from '../adapters/login-email.adapter';
import { verificationEmailConfiguration } from '../utils/verification-email-templates';

@Injectable()
export class EmailService {
  constructor(
    private readonly adapter: LoginEmailAdapter,
    private readonly config: ConfigService,
  ) {}

  public sendRegistrationEmail(email: string, token: string, language: string): Promise<void> {
    const { defaultLanguage, templates } = verificationEmailConfiguration;
    const selectedLanguage = templates[language] ? language : defaultLanguage;
    const template = templates[selectedLanguage];
    if (!template) throw new Error('Verification email template is not configured');
    const baseUrl = this.config.get<string>('FRONTEND_PUBLIC_URL') ?? 'http://localhost:4201';
    const link = new URL('/verify-email', baseUrl);
    link.searchParams.set('token', token);
    return this.adapter.send({
      to: email,
      subject: template.subject,
      text: [template.title, '', template.description, '', `${template.actionLabel}: ${link}`].join('\n'),
      metadata: { language: selectedLanguage },
    });
  }
}
