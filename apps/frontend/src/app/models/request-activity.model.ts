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
  GET: 'border-[#0000FF]/30 bg-[#0000FF]/10 text-[#0000FF] dark:border-[#ADD8E6]/40 dark:bg-[#ADD8E6]/10 dark:text-[#ADD8E6]',
  DELETE: 'border-[#B22222]/30 bg-[#B22222]/10 text-[#B22222] dark:border-[#F08080]/40 dark:bg-[#F08080]/10 dark:text-[#F08080]',
  POST: 'border-[#008000]/30 bg-[#008000]/10 text-[#008000] dark:border-[#90EE90]/40 dark:bg-[#90EE90]/10 dark:text-[#90EE90]',
  PUT: 'border-[#8B4513]/30 bg-[#8B4513]/10 text-[#8B4513] dark:border-[#FFD700]/40 dark:bg-[#FFD700]/10 dark:text-[#FFD700]',
};
