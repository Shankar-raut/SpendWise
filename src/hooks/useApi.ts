import { useEffect, useState } from 'react';
import { ApiError } from '../api/spendwise';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseApiOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useApi<T>(
  fetchFn: () => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  const { immediate = true, onSuccess, onError } = options;
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: immediate,
    error: null
  });

  const execute = async (): Promise<T> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await fetchFn();
      setState({ data, isLoading: false, error: null });
      onSuccess?.(data);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setState((prev) => ({ ...prev, isLoading: false, error: error.message }));
      onError?.(error);
      throw error;
    }
  };

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate]);

  return { ...state, execute, refetch: execute };
}