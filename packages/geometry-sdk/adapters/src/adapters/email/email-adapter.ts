export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  metadata?: Readonly<Record<string, string>>;
};

/** Transport-independent contract for sending an email. */
export abstract class EmailAdapter {
  /** Sends an email message through the configured transport. */
  public abstract send(message: EmailMessage): Promise<void>;
}
