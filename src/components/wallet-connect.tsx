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
  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (walletAddress) {
    return (
      <div className="wallet-connected">
        <span className="wallet-address">{formatAddress(walletAddress)}</span>
        <button className="disconnect-btn" onClick={onDisconnect}>
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button 
      className="connect-wallet-btn"
      onClick={onConnect}
      disabled={isConnecting}
    >
      {isConnecting ? (
        <>
          <span className="spinner"></span>
          Connecting...
        </>
      ) : (
        'Connect Wallet'
      )}
    </button>
  )
}

export default WalletConnect