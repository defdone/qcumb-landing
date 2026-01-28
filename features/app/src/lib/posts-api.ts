const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

type WalletProfile = {
  walletAddress: string
  role: 'fan' | 'creator' | 'admin'
  displayName?: string | null
}

type PurchasesResponse = {
  walletAddress: string
  active: { assetId: string; planType: string; expiresAt: string }[]
  expired: { assetId: string; planType: string; expiresAt: string }[]
}

const getSessionHeader = (): Record<string, string> => {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem('x402_wallet_session')
    if (!raw) return {}
    const parsed = JSON.parse(raw) as { sessionToken?: string }
    if (!parsed?.sessionToken) return {}
    return { 'X-Wallet-Session': parsed.sessionToken }
  } catch {
    return {}
  }
}

export type FeedPost = {
  id: string
  title: string
  description: string | null
  mediaType: 'video' | 'image'
  previewUrl: string
  mimeType: string
  pricing: {
    '24h': { price: number; priceFormatted: string }
    '7d': { price: number; priceFormatted: string }
  }
  creatorWallet: string | null
  isActive: boolean
  createdAt: string
}

export type StreamAccessResponse = {
  success: boolean
  url?: string
  ownerAccess?: boolean
  entitlement?: unknown | null
  mediaType?: string
  mimeType?: string
}

const streamAccessCache = new Map<string, { url: string; expiresAt: number }>()
const streamAccessInFlight = new Map<string, Promise<StreamAccessResponse>>()
const STREAM_ACCESS_TTL_MS = 2 * 60_000

export async function fetchPosts(params?: {
  active?: boolean
  limit?: number
  offset?: number
}) {
  const query = new URLSearchParams()
  if (params?.active !== undefined) query.set('active', String(params.active))
  if (params?.limit) query.set('limit', String(params.limit))
  if (params?.offset) query.set('offset', String(params.offset))

  const res = await fetch(`${API_URL}/posts?${query.toString()}`)
  if (!res.ok) throw new Error(`Failed to fetch posts: ${res.status}`)
  const data = await res.json()
  return data.posts as FeedPost[]
}

export async function fetchPost(id: string) {
  const res = await fetch(`${API_URL}/posts/${id}`)
  if (!res.ok) throw new Error(`Failed to fetch post: ${res.status}`)
  const data = await res.json()
  return data.post as FeedPost
}

export async function fetchStreamAccess(assetId: string) {
  const sessionHeader = getSessionHeader()
  if (!sessionHeader['X-Wallet-Session']) {
    throw new Error('Wallet authentication required')
  }

  const cached = streamAccessCache.get(assetId)
  if (cached && cached.expiresAt > Date.now()) {
    return { success: true, url: cached.url } satisfies StreamAccessResponse
  }

  const existing = streamAccessInFlight.get(assetId)
  if (existing) return existing

  const request = (async () => {
  const res = await fetch(`${API_URL}/stream/access/${assetId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...sessionHeader,
    },
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || `Stream access failed: ${res.status}`)
  }

  const data = (await res.json()) as StreamAccessResponse
  if (data.url) {
    streamAccessCache.set(assetId, { url: data.url, expiresAt: Date.now() + STREAM_ACCESS_TTL_MS })
  }
  return data
  })()

  streamAccessInFlight.set(assetId, request)
  try {
    return await request
  } finally {
    streamAccessInFlight.delete(assetId)
  }
}

export async function fetchProfile() {
  const sessionHeader = getSessionHeader()
  if (!sessionHeader['X-Wallet-Session']) {
    throw new Error('No wallet session')
  }

  const res = await fetch(`${API_URL}/profiles/me`, {
    headers: { ...sessionHeader },
    credentials: 'include',
  })
  if (!res.ok) throw new Error(`Failed to fetch profile: ${res.status}`)
  const data = await res.json()
  return data as WalletProfile
}

export async function setRole(role: 'fan' | 'creator' | 'admin') {
  const sessionHeader = getSessionHeader()
  if (!sessionHeader['X-Wallet-Session']) {
    throw new Error('No wallet session')
  }

  const res = await fetch(`${API_URL}/profiles/role`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...sessionHeader,
    },
    credentials: 'include',
    body: JSON.stringify({ role }),
  })
  if (!res.ok) throw new Error(`Failed to set role: ${res.status}`)
  const data = await res.json()
  return data as WalletProfile
}

export async function fetchPurchases() {
  const res = await fetch(`${API_URL}/purchases`, {
    headers: { ...getSessionHeader() },
    credentials: 'include',
  })
  if (!res.ok) throw new Error(`Failed to fetch purchases: ${res.status}`)
  const data = await res.json()
  return data as PurchasesResponse
}

export async function createPost(payload: {
  id: string
  title: string
  description: string
  mediaType: 'video' | 'image'
  previewUrl: string
  protectedPath: string
  mimeType: string
  priceUsd?: number
  priceUsd24h?: number
  priceUsd7d?: number
}) {
  const res = await fetch(`${API_URL}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getSessionHeader(),
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Failed to create post: ${res.status}`)
  const data = await res.json()
  return data.post as FeedPost
}

export async function uploadCreatorPost(payload: {
  id?: string
  title: string
  description?: string
  type: 'video' | 'image'
  priceUsd24h: number
  priceUsd7d: number
  protectedFile: File
}) {
  const sessionHeader = getSessionHeader()
  if (!sessionHeader['X-Wallet-Session']) {
    throw new Error('Wallet authentication required')
  }

  const formData = new FormData()
  if (payload.id) formData.append('id', payload.id)
  formData.append('title', payload.title)
  if (payload.description) formData.append('description', payload.description)
  formData.append('type', payload.type)
  formData.append('priceUsd24h', String(payload.priceUsd24h))
  formData.append('priceUsd7d', String(payload.priceUsd7d))
  formData.append('protected', payload.protectedFile)

  const res = await fetch(`${API_URL}/posts/upload`, {
    method: 'POST',
    headers: {
      ...sessionHeader,
    },
    body: formData,
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || `Upload failed: ${res.status}`)
  }

  const data = await res.json()
  return data.post as FeedPost
}
