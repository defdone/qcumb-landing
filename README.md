# x402 Payment Flow - Frontend

Frontend application demonstrating the x402 payment protocol with real on-chain USDC payments via EIP-3009 (TransferWithAuthorization).

## Architecture

This frontend connects to an x402-server backend that handles:
- HTTP 402 responses with payment requirements
- Payment verification via EIP-712 signatures
- Settlement through the x402 facilitator
- Media file serving with token-based access

### Payment Flow

1. User clicks on locked content
2. Frontend sends POST to `/media/:id/access`
3. Backend returns HTTP 402 with `paymentRequired` object
4. User signs EIP-712 authorization (EIP-3009)
5. Frontend sends signed payload to backend
6. Backend verifies and settles via facilitator
7. Backend returns `mediaUrl` with access token
8. Content is unlocked

### Protocol Details

- **x402 Version**: 2
- **Signature**: EIP-712 typed data (TransferWithAuthorization)
- **Asset**: USDC (6 decimals)
- **Network**: Base Sepolia (testnet) / Base (mainnet)
- **Price**: $0.01 USDC per media item

## Features

### Server Status Indicator
- Real-time server connection status (online/offline)
- Displays network name (Base Sepolia / Base Mainnet)
- Auto-refreshes media when server comes back online

### Wallet Management
- Connect/disconnect wallet functionality
- Persists connection state across page refreshes
- Manual disconnect prevents auto-reconnect until user clicks Connect again
- Supports account switching in wallet extension

### Media Preview Security
- Preview images/videos served from `/media/preview/:id` (server-side blur recommended)
- Full content served with token after payment: `/media/:file?token=...`
- Placeholder shown when server is offline

### Payment Modal
- Step-by-step progress indicator (Request → Sign → Settle → Done)
- Real-time status updates during transaction
- Explorer link after successful payment
- Manual close - user controls when to dismiss

### Per-Wallet Content Access
- Unlocked content stored per wallet address in sessionStorage
- Different wallets have separate unlock states
- Switching wallets shows appropriate locked/unlocked state

## Setup

### Prerequisites

- Node.js 18+
- MetaMask or Coinbase Wallet
- USDC on Base Sepolia (for testing)
- ETH on Base Sepolia (for gas)

### Installation

```bash
npm install
cp .env.example .env
```

### Configuration

Edit `.env`:

```env
# Backend API URL
VITE_API_URL=http://localhost:3000
```

### Running

Start the x402-server backend first (in another terminal):

```bash
# In x402-server directory
npm run dev
```

Then start this frontend:

```bash
npm run dev
```

Open http://localhost:5173

## Project Structure

```
src/
  config/
    x402-config.ts       # API config, types, formatters
  hooks/
    use-x402-payment.ts  # Payment logic, EIP-712 signing, wallet management
  components/
    video-player.tsx     # Video with paywall and server status handling
    image-viewer.tsx     # Image with paywall and server status handling
    payment-modal.tsx    # Payment UI with progress steps
    payment-modal.css    # Payment modal styles
    wallet-connect.tsx   # Wallet connection UI
  App.tsx                # Main application
  App.css                # Application styles
```

## API Endpoints

### Preview (no auth required)
```
GET /media/preview/video
GET /media/preview/image
```

### Request Payment Requirements
```
POST /media/video/access
POST /media/image/access
```

### Response (HTTP 402)

```json
{
  "success": false,
  "error": "Payment Required",
  "media": {
    "id": "video",
    "title": "Premium Video",
    "type": "video",
    "priceUsd": 0.01
  },
  "paymentRequired": {
    "x402Version": 2,
    "accepts": [{
      "scheme": "exact",
      "network": "eip155:84532",
      "asset": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      "payTo": "0x...",
      "amount": "10000"
    }]
  }
}
```

### Submit Payment

```json
POST /media/video/access
{
  "message": {
    "metadata": {
      "x402.payment.payload": {
        "x402Version": 2,
        "resource": { ... },
        "accepted": { ... },
        "payload": {
          "signature": "0x...",
          "authorization": {
            "from": "0x...",
            "to": "0x...",
            "value": "10000",
            "validAfter": "0",
            "validBefore": "...",
            "nonce": "0x..."
          }
        }
      },
      "x402.payment.status": "payment-submitted"
    }
  }
}
```

### Success Response

```json
{
  "success": true,
  "mediaUrl": "http://localhost:3000/media/video.mp4?token=...",
  "mediaType": "video",
  "grant": {
    "id": "grant-...",
    "mediaId": "video",
    "payer": "0x...",
    "expiresAt": 1234567890
  },
  "settlement": {
    "success": true,
    "transaction": "0x...",
    "network": "eip155:84532"
  }
}
```

### Protected Media (with token)
```
GET /media/video.mp4?token=...
GET /media/image.jpg?token=...
```

## Testnet Resources

- Base Sepolia Faucet: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
- USDC Faucet: https://faucet.circle.com/
- Block Explorer: https://sepolia.basescan.org

Wszelkie prawa zastrzeżone. 2025 Defdone.