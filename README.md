# qcumb

Wallet-native premium content platform with x402 payments (EIP-3009 TransferWithAuthorization) and session-based access control.

## Overview

qcumb is a Next.js app that combines:

- wallet-based authentication (no passwords)
- x402 paywall for premium media
- entitlement-aware content access
- creator/fan flows driven by a real backend

The UI lives in `/home` (app feed). The landing page is served from `/` via the business layout.

## What Works

- Wallet login via nonce/sign/verify flow
- Session persistence and entitlement refresh
- Feed, creator profiles, post view, purchases
- x402 payment modal and on-chain USDC authorization
- Protected media access via backend-signed URLs
- Role-based routes (fan/creator/admin)

## Current Limitations

- Creator dashboard is read-only (upload/edit coming later)
- Settings are read-only (role/wallet only)

## Architecture

### High-level

```text
Next.js App Router
├── /(business)         -> Landing page
└── /home/*             -> App (Wouter inside)
```

### App shell

```text
/home/*
  -> app/home/AppClient.tsx
     -> features/app/src/App.tsx (Wouter router)
        -> pages/* (fan-home, creator-profile, post-view, etc.)
```

## Flow Diagrams

### Auth Flow (wallet session)

1) User connects wallet when unlocking premium content (x402 modal)
2) Frontend requests nonce from backend (`POST /wallet/nonce`)
3) User signs message in wallet
4) Frontend verifies signature (`POST /wallet/verify`)
5) Backend returns `sessionToken` stored as `X-Wallet-Session`

### Payment Flow (x402)

1) User opens locked post
2) Frontend calls `POST /media/:id/access`
3) Backend returns `402 Payment Required` with payment requirements
4) User signs EIP-712 authorization (EIP-3009)
5) Frontend submits signed payload to backend
6) Backend verifies and returns `mediaUrl` + `grant`
7) Frontend unlocks content

## Payment Details

- **Protocol**: x402 v2
- **Signature**: EIP-712 typed data (TransferWithAuthorization, EIP-3009)
- **Asset**: USDC (6 decimals)
- **Network**: Base Sepolia / Base
- **Session header**: `X-Wallet-Session` (from localStorage)

### Minimal payload (accepted by backend)

```json
{
  "x402Version": 2,
  "resource": {
    "description": "string",
    "mimeType": "string"
  },
  "accepted": {
    "scheme": "exact",
    "network": "eip155:84532",
    "payTo": "0x...",
    "asset": "0x...",
    "amount": "10000",
    "maxTimeoutSeconds": 300,
    "extra": { "name": "USDC", "version": "2" }
  },
  "payload": {
    "signature": "0x...",
    "authorization": {
      "from": "0x...",
      "to": "0x...",
      "value": "10000",
      "validAfter": "0",
      "validBefore": "1712345678",
      "nonce": "0x..."
    }
  }
}
```

## Routes

- `/`            -> landing page (business)
- `/home`        -> app feed
- `/home/*`      -> internal app routes (Wouter)

## API Endpoints (frontend usage)

- `POST /wallet/nonce`
- `POST /wallet/verify`
- `GET /wallet/entitlements`
- `GET /profiles/me`
- `POST /profiles/role`
- `GET /posts`
- `GET /posts/:id`
- `GET /purchases`
- `POST /media/:id/access` (x402)
- `POST /stream/access/:assetId`

## Tech Stack

- Next.js App Router (React 18)
- Wouter for in-app routing
- Tailwind CSS + shadcn UI components
- wagmi + connectkit for wallet connection
- TanStack Query for API caching

## Project Structure

```text
app/
  (business)/            Landing page
  home/                  App entry (AppClient)
features/
  app/                   Wouter app + UI
  auth/                  Wallet session + x402 config
  business/              Landing page sections
  shared/                Shared styles/shims
```

## Environment

Create `.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Local Development

1) Start the backend (x402 server):

```bash
# in backend repo
npm run dev
```

1) Start frontend:

```bash
npm install
npm run dev
```

Open <http://localhost:3000>

## Troubleshooting

- **429 Too Many Requests**: backend rate-limit; frontend has cooldowns but retry after a few seconds.
- **No wallet detected**: ensure MetaMask/Coinbase Wallet is installed.
- **Payment fails**: check network (Base Sepolia) and USDC balance.

---

Copyright © 2026 Defdone
