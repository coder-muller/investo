import { useEffect, useState } from 'react';
import { sendGetRequest } from './fetchFunctions';

interface QueryResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook personalizado que simula a funcionalidade do useQuery
 * @param queryFn - Função que executa a requisição e retorna uma Promise
 * @param dependencies - Array de dependências para reexecutar a query
 * @returns Objeto contendo data, loading, error e função refetch
 */
export function useQuery<T>(
  queryFn: () => Promise<T>,
  dependencies: unknown[] = []
): QueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await queryFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Ocorreu um erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  const refetch = async () => {
    await fetchData();
  };

  return { data, loading, error, refetch };
}

/**
 * Hook para executar queries com método GET
 * @param url - URL para requisição
 * @param dependencies - Array de dependências para reexecutar a query
 * @returns Objeto contendo data, loading, error e função refetch
 */
export function useGetQuery<T>(
  url: string,
  dependencies: unknown[] = []
): QueryResult<T> {
  return useQuery<T>(
    () => sendGetRequest<T>(url),
    dependencies
  );
}

/**
 * Hook para fazer mutações (POST, PUT, DELETE)
 * @returns Objeto contendo função mutate, dados, loading e error
 */
export function useMutation<T, D = unknown>(
  mutationFn: (data: D) => Promise<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (mutationData: D) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await mutationFn(mutationData);
      setData(result);
      return result;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Ocorreu um erro desconhecido');
      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, data, loading, error };
} 