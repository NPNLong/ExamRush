import type {
  AttemptDetail,
  AttemptListItem,
  AuthResponse,
  ExamDetailFull,
  ExamDetailPublic,
  ExamListItem,
  ExamPayload,
  User,
} from './types'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const TOKEN_KEY = 'examrush_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}
export function setToken(t: string) {
  localStorage.setItem(TOKEN_KEY, t)
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function request<T>(method: string, path: string, data?: unknown): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: data !== undefined ? JSON.stringify(data) : undefined,
  })

  if (res.status === 204) return null as T

  const json = await res.json().catch(() => null)
  if (!res.ok) {
    let msg = json?.detail ?? `Lỗi (${res.status})`
    if (Array.isArray(msg)) {
      msg = msg.map((e: any) => e.msg).join('; ')
    } else if (typeof msg === 'object') {
      msg = JSON.stringify(msg)
    }
    const err = new Error(String(msg)) as Error & { status?: number }
    err.status = res.status
    throw err
  }
  return json as T
}

const http = {
  get: <T>(p: string) => request<T>('GET', p),
  post: <T>(p: string, d?: unknown) => request<T>('POST', p, d),
  put: <T>(p: string, d?: unknown) => request<T>('PUT', p, d),
  delete: <T>(p: string) => request<T>('DELETE', p),
}

export const authApi = {
  login: (body: { username: string; password: string }) =>
    http.post<AuthResponse>('/auth/login', body),
  register: (body: { username: string; password: string; display_name?: string }) =>
    http.post<AuthResponse>('/auth/register', body),
  me: () => http.get<User>('/auth/me'),
}

export const examsApi = {
  list: () => http.get<ExamListItem[]>('/exams'),
  get: (id: number) => http.get<ExamDetailPublic>(`/exams/${id}`),
  getFull: (id: number) => http.get<ExamDetailFull>(`/exams/${id}/full`),
  create: (body: ExamPayload) => http.post<ExamDetailFull>('/exams', body),
  update: (id: number, body: Partial<ExamPayload>) =>
    http.put<ExamDetailFull>(`/exams/${id}`, body),
  remove: (id: number) => http.delete<null>(`/exams/${id}`),
  submit: (id: number, body: { answers: { question_id: number; selected: string[] }[]; duration_seconds: number }) =>
    http.post<AttemptDetail>(`/exams/${id}/submit`, body),
}

export const attemptsApi = {
  list: () => http.get<AttemptListItem[]>('/attempts'),
  get: (id: number) => http.get<AttemptDetail>(`/attempts/${id}`),
}
