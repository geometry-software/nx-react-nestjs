import { RepositoryConnectionError } from '../../core/errors.js';

/** Extracts the publishable key without forwarding it in the project URL. */
export function parseSupabaseJsConnectionString(connectionString: string): {
  url: string;
  publishableKey: string;
} {
  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    throw new RepositoryConnectionError('Invalid Supabase JS connection string');
  }
  const publishableKey = url.searchParams.get('apikey');
  if (!publishableKey) {
    throw new RepositoryConnectionError('Supabase JS connection string requires an apikey parameter');
  }
  url.searchParams.delete('apikey');
  url.hash = '';
  return { url: url.toString(), publishableKey };
}
