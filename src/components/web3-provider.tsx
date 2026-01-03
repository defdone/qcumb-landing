import React from 'react'
import { createConfig, WagmiProvider } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectKitProvider, getDefaultConfig } from 'connectkit'

const queryClient = new QueryClient()

const defaultConnectKitCfg = getDefaultConfig({
  // Prefer Base Sepolia testnet for this app
  chains: [baseSepolia],
  walletConnectProjectId: (import.meta as any).env?.VITE_WALLETCONNECT_PROJECT_ID ?? '',
  appName: 'x402 Payment Demo',
})

const config = createConfig({
  ...(defaultConnectKitCfg as any),
  autoConnect: false
})

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default Web3Provider


