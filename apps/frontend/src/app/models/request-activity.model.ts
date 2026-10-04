export type RequestActivityView = {
  active: boolean;
  duration: number;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | null;
  visible: boolean;
};

export const requestMethodStyles: Record<
  Exclude<RequestActivityView['method'], null>,
  string
> = {
  GET: 'border-blue-200 bg-blue-50 text-blue-700',
  DELETE: 'border-red-200 bg-red-50 text-red-700',
  POST: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  PUT: 'border-amber-200 bg-amber-50 text-amber-700',
};