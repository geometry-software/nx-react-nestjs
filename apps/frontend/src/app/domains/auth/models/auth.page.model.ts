import type { SubmitEvent } from 'react';
import type { Translate } from '@/app/locales/locale';
import type { useAuthFeature } from '../feature/auth.feature';

type AuthFeature = ReturnType<typeof useAuthFeature>;
type AuthMode = 'login' | 'register';

export interface AuthPageModel {
  readonly busy: boolean;
  readonly invalidFields: ReadonlySet<string>;
  readonly message: string;
  readonly mode: AuthMode;
  readonly success: boolean;
  readonly translate: Translate;

  changeMode(mode: AuthMode): void;
  submit(event: SubmitEvent<HTMLFormElement>): Promise<void>;
}

export class AuthPageModelInstance implements AuthPageModel {
  public constructor(private readonly feature: AuthFeature) {}

  public get busy() { return this.feature.busy; }
  public get invalidFields() { return this.feature.invalidFields; }
  public get message() { return this.feature.message; }
  public get mode() { return this.feature.mode; }
  public get success() { return this.feature.success; }
  public get translate() { return this.feature.translate; }

  public changeMode = (mode: AuthMode) => this.feature.changeMode(mode);
  public submit = (event: SubmitEvent<HTMLFormElement>) =>
    this.feature.submit(event);
}
