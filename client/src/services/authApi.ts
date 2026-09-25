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
