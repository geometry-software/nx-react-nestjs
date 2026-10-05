type FulfilledQueryResult<TData> = PromiseLike<{ data: TData }>;

export async function handleQueryFulfilled<TData>(
  queryFulfilled: FulfilledQueryResult<TData>,
  onFulfilled: (data: TData) => void | Promise<void>,
): Promise<boolean> {
  let data: TData;

  try {
    ({ data } = await queryFulfilled);
  } catch {
    return false;
  }

  await onFulfilled(data);
  return true;
}
