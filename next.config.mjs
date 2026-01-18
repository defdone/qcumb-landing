import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
  webpack: (config) => {
    config.resolve.alias['@react-native-async-storage/async-storage'] = path.join(
      __dirname,
      'features/shared/shims/async-storage.ts'
    )
    return config
  },
}

export default nextConfig
