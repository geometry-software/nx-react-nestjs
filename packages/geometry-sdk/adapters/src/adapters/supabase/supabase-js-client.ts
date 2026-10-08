import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type SupabaseJsProviderAuthOptions = {
  persistSession?: boolean;
  autoRefreshToken?: boolean;
};

export class SupabaseJsClient {
  readonly client: SupabaseClient;

  constructor(
    url: string,
    publishableKey: string,
    { persistSession = false, autoRefreshToken = false }: SupabaseJsProviderAuthOptions = {},
  ) {
    this.client = createClient(url, publishableKey, {
      auth: { persistSession, autoRefreshToken },
    });
  }
}
