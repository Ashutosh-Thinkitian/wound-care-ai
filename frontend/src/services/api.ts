import axios from 'axios'
import type { Session, WoundAssessment } from '@/types'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
  timeout: 60_000,
})

http.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.status, error.response?.data)
    return Promise.reject(error)
  }
)

export const sessionsApi = {
  create: (patientRef?: string) =>
    http.post<Session>('/api/v1/sessions', { patientRef }).then(r => r.data),
  get: (sessionId: string) =>
    http.get<Session>(`/api/v1/sessions/${sessionId}`).then(r => r.data),
  poll: (sessionId: string) =>
    http.get<Session>(`/api/v1/sessions/${sessionId}/status`).then(r => r.data),
  list: () =>
    http.get<Session[]>('/api/v1/sessions').then(r => r.data),
}

export const captureApi = {
  uploadImage: (sessionId: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return http.post<{ message: string }>(
      `/api/v1/capture/${sessionId}`,
      form
    ).then(r => r.data)
  },
}

export const assessmentApi = {
  getBySession: (sessionId: string) =>
    http.get<WoundAssessment>(`/api/v1/assessments/session/${sessionId}`).then(r => r.data),
  getById: (assessmentId: string) =>
    http.get<WoundAssessment>(`/api/v1/assessments/${assessmentId}`).then(r => r.data),
}
