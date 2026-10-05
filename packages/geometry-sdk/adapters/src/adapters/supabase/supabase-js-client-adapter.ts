import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export class SupabaseJsClientAdapter {
  readonly client: SupabaseClient;

  constructor(url: string, publishableKey: string) {
    this.client = createClient(url, publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
}
