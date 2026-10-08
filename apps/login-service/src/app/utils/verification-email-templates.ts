export type VerificationEmailTemplate = {
  subject: string;
  title: string;
  description: string;
  actionLabel: string;
};

export const verificationEmailConfiguration: {
  defaultLanguage: string;
  templates: Readonly<Record<string, VerificationEmailTemplate>>;
} = {
  defaultLanguage: 'en',
  templates: {
    en: {
      subject: 'Confirm your email address',
      title: 'Welcome',
      description: 'Confirm your email address to complete your registration.',
      actionLabel: 'Confirm email',
    },
    es: {
      subject: 'Confirma tu correo electrónico',
      title: 'Bienvenido',
      description: 'Confirma tu correo electrónico para completar el registro.',
      actionLabel: 'Confirmar correo',
    },
    pt: {
      subject: 'Confirme seu endereço de e-mail',
      title: 'Boas-vindas',
      description: 'Confirme seu endereço de e-mail para concluir o cadastro.',
      actionLabel: 'Confirmar e-mail',
    },
  },
};
