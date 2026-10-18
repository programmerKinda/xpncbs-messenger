export interface SendCodeResponse {
  success: boolean
}

export interface VerifyCodeResponse {
  success: boolean
  exists?: boolean
  accessToken?: string
}

export interface CreateProfileResponse {
  success: boolean
  accessToken?: string
}

const AUTH_API_URL = '/api/auth'

export interface AuthSession {
  id: string
  userAgent: string | null
  ipAddress: string | null
  createdAt: string
  lastActiveAt: string
  isCurrent: boolean
}

async function authorizedRequest(path: string, method = 'GET'): Promise<Response> {
  const token = localStorage.getItem('accessToken')
  const response = await fetch(`${AUTH_API_URL}${path}`, {
    method,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  if (!response.ok) throw new Error(`Request failed with status ${response.status}`)
  return response
}

export async function getAuthSessions(): Promise<AuthSession[]> {
  const response = await authorizedRequest('/sessions')
  return response.json() as Promise<AuthSession[]>
}

export async function revokeAuthSession(sessionId: string): Promise<void> {
  await authorizedRequest(`/sessions/${encodeURIComponent(sessionId)}/revoke`, 'POST')
}

export async function sendAuthCode(phone: string): Promise<SendCodeResponse> {
  const response = await fetch(`${AUTH_API_URL}/send-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  })

  if (!response.ok) throw new Error(`Send code failed with status ${response.status}`)
  return response.json() as Promise<SendCodeResponse>
}

export async function verifyAuthCode(phone: string, code: string): Promise<VerifyCodeResponse> {
  const response = await fetch(`${AUTH_API_URL}/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code }),
  })

  if (!response.ok) throw new Error(`Verify code failed with status ${response.status}`)
  return response.json() as Promise<VerifyCodeResponse>
}

export async function createAuthProfile(data: {
  phone: string
  firstName: string
  lastName: string
  about: string
}): Promise<CreateProfileResponse> {
  const response = await fetch(`${AUTH_API_URL}/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) throw new Error(`Create profile failed with status ${response.status}`)
  return response.json() as Promise<CreateProfileResponse>
}
