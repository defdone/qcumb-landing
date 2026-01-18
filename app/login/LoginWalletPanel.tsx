"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAccount } from "wagmi"
import { ConnectKitButton } from "connectkit"
import Web3Provider from "../../features/auth/components/web3-provider"
import { useWalletSession } from "../../features/auth/hooks/use-wallet-session"

function LoginWalletPanelContent() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { isAuthenticated, isAuthenticating, isVerifyingSession, authenticate, error } = useWalletSession()
  const [authRequested, setAuthRequested] = useState(false)

  useEffect(() => {
    if (isAuthenticated && authRequested) {
      router.push("/home")
    }
  }, [isAuthenticated, authRequested, address, router])

  const handleLogin = async () => {
    setAuthRequested(true)
    if (!isConnected || !address || isAuthenticating || isVerifyingSession) return
    const ok = await authenticate(address)
    if (ok) {
      router.push("/home")
    }
  }

  return (
    <div className="space-y-4 mb-6">
        <ConnectKitButton.Custom>
          {({ isConnected, show, truncatedAddress }) => (
            <button
              onClick={show}
              className="w-full py-3.5 px-4 rounded-lg bg-[#00E088] hover:bg-[#00C9A7] text-white font-medium transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {isConnected ? truncatedAddress : "CONNECT WALLET"}
            </button>
          )}
        </ConnectKitButton.Custom>

        {isConnected && (
          <button
            onClick={handleLogin}
            disabled={isAuthenticating}
            className="w-full py-3.5 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all disabled:opacity-50"
          >
            {isAuthenticating ? "Signing..." : "SIGN IN"}
          </button>
        )}
      {error && <p className="text-sm text-red-500 mt-4">{error}</p>}

      {!isConnected && authRequested && (
        <p className="text-sm text-gray-500 mt-4">Connect your wallet first.</p>
      )}
    </div>
  )
}

export default function LoginWalletPanel() {
  return (
    <Web3Provider>
      <LoginWalletPanelContent />
    </Web3Provider>
  )
}
