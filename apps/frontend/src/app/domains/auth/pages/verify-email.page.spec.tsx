import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { VerifyEmailPage } from './verify-email.page';

vi.mock('@/app/utils/i18n', () => ({ useI18n: () => ({ translate: (key: string) => key }) }));
vi.mock('../service/auth.service', () => ({ useVerifyEmailMutation: () => [vi.fn()] }));

describe('email verification landing page', () => {
  it('shows an expired-link state when the token is missing', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/verify-email']}><VerifyEmailPage /></MemoryRouter>,
    );
    expect(markup).toContain('auth.verificationFailed');
    expect(markup).toContain('href="/login"');
  });

  it('shows a pending state while a token is being verified', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/verify-email?token=sample']}><VerifyEmailPage /></MemoryRouter>,
    );
    expect(markup).toContain('auth.confirmingEmail');
    expect(markup).not.toContain('auth.backToSignIn');
  });
});
