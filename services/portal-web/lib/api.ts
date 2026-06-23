import { getMockResponse } from './mock-data';

const BFF_URL = process.env.NEXT_PUBLIC_BFF_URL ?? 'http://localhost:3000';
const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function doFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${BFF_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
}

export async function bff<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  // Mock mode: retorna dados locais sem chamar o BFF
  if (MOCK_MODE) {
    const mock = getMockResponse(path, init);
    if (mock !== null) return mock as T;
  }

  let res = await doFetch(path, init);

  // access_token expirado — tenta renovar com o refresh_token
  if (res.status === 401 && path !== '/auth/login' && path !== '/auth/refresh') {
    const refreshRes = await doFetch('/auth/refresh', { method: 'POST' });

    if (refreshRes.ok) {
      // token renovado — repete a chamada original
      res = await doFetch(path, init);
    } else {
      // refresh também falhou — sessão encerrada
      if (typeof window !== 'undefined') window.location.href = '/login';
      throw new ApiError(401, 'Sessão expirada. Faça login novamente.');
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.message ?? 'Erro inesperado');
  }

  if (res.status === 204) return undefined as T;
  return res.json() as T;
}
