import { sendDeleteRequest, sendPostRequest, sendPutRequest } from './fetchFunctions';
import { useMutation } from './useQuery';

/**
 * Hook para executar requisições POST
 * @param url - URL para a requisição POST
 * @returns Objeto contendo mutate, data, loading e error
 */
export function usePostMutation<T, D = unknown>(url: string) {
  return useMutation<T, D>((data) => sendPostRequest<T>(url, data));
}

/**
 * Hook para executar requisições PUT
 * @param url - URL para a requisição PUT
 * @returns Objeto contendo mutate, data, loading e error
 */
export function usePutMutation<T, D = unknown>(url: string) {
  return useMutation<T, D>((data) => sendPutRequest<T>(url, data));
}

/**
 * Hook para executar requisições DELETE
 * @param url - URL para a requisição DELETE
 * @returns Objeto contendo mutate, data, loading e error
 */
export function useDeleteMutation<T>(url: string) {
  return useMutation<T, void>(() => sendDeleteRequest<T>(url));
} 