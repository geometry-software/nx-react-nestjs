export type RequestResult<TResult> =
  | { ok: true; data: TResult }
  | { ok: false; error: unknown };

export async function executeRequest<TResult>(
  request: () => Promise<TResult>,
): Promise<RequestResult<TResult>> {
  try {
    return { ok: true, data: await request() };
  } catch (error) {
    return { ok: false, error };
  }
}
