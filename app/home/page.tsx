import dynamicImport from 'next/dynamic'

export const dynamic = 'force-dynamic'

const AppClient = dynamicImport(() => import('./AppClient'), { ssr: false })

export default function HomePage() {
  return <AppClient />
}
