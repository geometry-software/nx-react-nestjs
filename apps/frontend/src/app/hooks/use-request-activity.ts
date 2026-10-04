import { useEffect, useState, useSyncExternalStore } from 'react';
import { dataService } from '@/app/services/data.service';

const { requestActivityService } = dataService;

export function useRequestActivity() {
  const activity = useSyncExternalStore(
    requestActivityService.subscribe,
    requestActivityService.getSnapshot,
    requestActivityService.getSnapshot,
  );
  const [duration, setDuration] = useState(activity.lastDuration);

  useEffect(() => {
    const startedAt = activity.activeStartedAt;
    if (!activity.active || startedAt === null) {
      setDuration(activity.lastDuration);
      return undefined;
    }

    const update = () =>
      setDuration(Math.max(1, Math.round(performance.now() - startedAt)));
    update();
    const interval = window.setInterval(update, 50);
    return () => window.clearInterval(interval);
  }, [activity.active, activity.activeStartedAt, activity.lastDuration]);

  return { ...activity, duration };
}
