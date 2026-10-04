import { useEffect, useState } from 'react';

export function useRowSelection(resetKey: string) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelectedIds(new Set());
  }, [resetKey]);

  const clearSelection = () => setSelectedIds(new Set());

  const removeSelectedId = (id: string) => {
    setSelectedIds((current) => {
      if (!current.has(id)) return current;

      const next = new Set(current);
      next.delete(id);
      return next;
    });
  };

  return {
    selectedIds,
    setSelectedIds,
    clearSelection,
    removeSelectedId,
  };
}
