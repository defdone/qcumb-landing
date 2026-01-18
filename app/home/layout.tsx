import '../../features/app/src/index.css'
import type { ReactNode } from 'react'
import Web3Provider from '../../features/auth/components/web3-provider'

export default function HomeLayout({ children }: { children: ReactNode }) {
  return <Web3Provider>{children}</Web3Provider>
}
