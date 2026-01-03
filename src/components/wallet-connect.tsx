import React from 'react'
import { ConnectKitButton } from 'connectkit'
import { useAccount, useDisconnect, useConnect } from 'wagmi'

interface WalletConnectProps {
  walletAddress: string | null
  onConnect: () => void
  onDisconnect: () => void
  isConnecting: boolean
}

const WalletConnect: React.FC<WalletConnectProps> = ({
  walletAddress,
  onConnect,
  onDisconnect,
  isConnecting
}) => {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { connectors } = useConnect()

  // Notify parent only on transitions to avoid render loops
  const previousConnectedRef = React.useRef<boolean | null>(isConnected)
  React.useEffect(() => {
    const prev = previousConnectedRef.current
    if (!prev && isConnected) {
      //onConnect && onConnect()
    }
    if (prev && !isConnected) {
      onDisconnect && onDisconnect()
    }
    previousConnectedRef.current = isConnected
  }, [isConnected, onConnect, onDisconnect])

  const displayedAddress = address || walletAddress
  const formatAddress = (addr: string): string => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  if (isConnected && displayedAddress) {
    return (
      <div className="wallet-connected">
        <span className="wallet-address">{formatAddress(displayedAddress)}</span>
        <button
          className="disconnect-btn"
          onClick={async () => {
            try {
              sessionStorage.setItem('x402_disconnected', 'true')
              const rawFlag2 = sessionStorage.getItem('x402_disconnected')
              console.log('[x402] x402_disconnected:', rawFlag2)

            } catch (e) {
              console.log('[x402] Error setting x402_disconnected:', e)
            }

            try {
              for (const connector of connectors) {
                try {
                  await (connector.disconnect?.() ?? Promise.resolve())
                } catch (err) {
                  console.log('[x402] Error disconnecting connector:', err)
                }
              }
            } catch (err) {
              console.log('[x402] Error disconnecting connectors:', err)
            }

            await disconnect()

            // Clear persistent wagmi/connectkit storage to avoid automatic reconnects
            try {
              const keysToRemove: string[] = []
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                if (!key) continue
                if (key.includes('wagmi') || key.toLowerCase().includes('connectkit')) {
                  keysToRemove.push(key)
                }
              }
              keysToRemove.forEach(k => localStorage.removeItem(k))
            } catch (e) {
              console.log('[x402] Error clearing persistent wagmi/connectkit storage:', e)
            }

            onDisconnect && onDisconnect()
          }}
        >
          Disconnect
        </button>
      </div>
    )
  }

  if (isConnecting) {
    console.log('isConnecting:', isConnecting)
    console.log('[x402] Connecting...')
    return (
      <button className="connect-wallet-btn" disabled>
        <span className="spinner"></span>
        Connecting...
      </button>
    )
  }

  return (
    <div>
      <ConnectKitButton />
    </div>
  )
}

export default WalletConnect