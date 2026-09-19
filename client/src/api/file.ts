export interface BackendHealth {
	status: string
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

export async function getBackendHealth(): Promise<BackendHealth> {
	const response = await fetch(`${API_BASE_URL}/health`)

	if (!response.ok) {
		throw new Error(`Backend request failed with status ${response.status}`)
	}

	return response.json() as Promise<BackendHealth>
}

export async function getBackendMessage(): Promise<string> {
	const response = await fetch(API_BASE_URL)

	if (!response.ok) {
		throw new Error(`Backend request failed with status ${response.status}`)
	}

	return response.text()
}
