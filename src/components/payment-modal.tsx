import { X402PaymentRequest, formatUsdcAmount, getCurrentNetwork } from '../config/x402-config'
import { PaymentStatus } from '../hooks/use-x402-payment'

interface PaymentModalProps {
  show: boolean
  paymentRequest: X402PaymentRequest | null
  paymentStatus: PaymentStatus
  walletAddress: string | null
  transactionHash: string | null
  error: string | null
  onPayment: () => void
  onCancel: () => void
  onConnectWallet: () => void
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  show,
  paymentRequest,
  paymentStatus,
  walletAddress,
  transactionHash,
  error,
  onPayment,
  onCancel,
  onConnectWallet
}) => {
  if (!show) return null

  const network = getCurrentNetwork()
  const explorerUrl = network.name === 'base-mainnet' 
    ? 'https://basescan.org' 
    : 'https://sepolia.basescan.org'

  const getStatusMessage = (): string => {
    switch (paymentStatus) {
      case 'connecting':
        return 'Connecting to wallet...'
      case 'requesting':
        return 'Preparing payment request...'
      case 'signing':
        return 'Please sign the transaction in your wallet'
      case 'confirming':
        return 'Confirming transaction...'
      case 'success':
        return 'Payment successful'
      case 'error':
        return error || 'An error occurred'
      default:
        return ''
    }
  }

  const isProcessing = ['connecting', 'requesting', 'signing', 'confirming'].includes(paymentStatus)

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <div className="modal-header">
          <h3>
            <span className="http-badge">402</span>
            Payment Required
          </h3>
          <button className="close-btn" onClick={onCancel} disabled={isProcessing}>
            ×
          </button>
        </div>

        {paymentRequest && (
          <div className="payment-details">
            <div className="payment-amount">
              {formatUsdcAmount(paymentRequest.maxAmountRequired)}
              <span className="currency">USDC</span>
            </div>

            <p className="payment-description">{paymentRequest.description}</p>

            <div className="payment-info">
              <div className="info-row">
                <span className="label">Resource</span>
                <span className="value">{paymentRequest.resource}</span>
              </div>
              <div className="info-row">
                <span className="label">Network</span>
                <span className="value network-value">
                  <span className={`network-dot ${network.name === 'base-sepolia' ? 'testnet' : 'mainnet'}`}></span>
                  {network.name === 'base-sepolia' ? 'Base Sepolia' : 'Base'}
                </span>
              </div>
              <div className="info-row">
                <span className="label">Token</span>
                <span className="value">USDC</span>
              </div>
              <div className="info-row">
                <span className="label">Recipient</span>
                <span className="value address">
                  {paymentRequest.paymentAddress.slice(0, 10)}...{paymentRequest.paymentAddress.slice(-8)}
                </span>
              </div>
            </div>
          </div>
        )}

        {paymentStatus !== 'idle' && (
          <div className={`status-message ${paymentStatus}`}>
            {isProcessing && <span className="spinner"></span>}
            {getStatusMessage()}
          </div>
        )}

        {transactionHash && (
          <div className="transaction-info">
            <span className="label">Transaction:</span>
            <a 
              href={`${explorerUrl}/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="tx-link"
            >
              {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
            </a>
          </div>
        )}

        <div className="payment-actions">
          {!walletAddress ? (
            <button
              className="connect-btn"
              onClick={onConnectWallet}
              disabled={isProcessing}
            >
              Connect Wallet
            </button>
          ) : (
            <button
              className="pay-button"
              onClick={onPayment}
              disabled={isProcessing || paymentStatus === 'success'}
            >
              {isProcessing ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : paymentStatus === 'success' ? (
                'Paid'
              ) : (
                `Pay ${paymentRequest && formatUsdcAmount(paymentRequest.maxAmountRequired)} USDC`
              )}
            </button>
          )}
          
          <button
            className="cancel-button"
            onClick={onCancel}
            disabled={isProcessing}
          >
            Cancel
          </button>
        </div>

        <div className="x402-footer">
          <small>
            Payment via <a href="https://x402.org" target="_blank" rel="noopener noreferrer">x402</a> on <a href="https://base.org" target="_blank" rel="noopener noreferrer">Base</a>
          </small>
        </div>
      </div>
    </div>
  )
}

export default PaymentModal