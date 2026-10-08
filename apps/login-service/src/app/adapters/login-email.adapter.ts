import { Injectable } from '@nestjs/common';
import { EmailAdapter, type EmailMessage } from 'geometry-sdk/adapters';

@Injectable()
export class LoginEmailAdapter extends EmailAdapter {
  constructor(
    private readonly adapter: EmailAdapter,
  ) {
    super();
  }

  public send(message: EmailMessage): Promise<void> {
    return this.adapter.send(message);
  }
}
