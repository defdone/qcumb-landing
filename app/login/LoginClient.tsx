"use client"

import dynamic from "next/dynamic"
import Image from "next/image"

const LoginWalletPanel = dynamic(() => import("./LoginWalletPanel"), {
  ssr: false,
  loading: () => (
    <div className="w-full py-3.5 px-4 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center gap-3">
      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
        />
      </svg>
      Loading wallet...
    </div>
  ),
})

export default function LoginClient() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Brand panel */}
      <div className="lg:w-1/2 bg-gradient-to-br from-[#00E088] via-[#00C9A7] to-[#00B4D8] relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute inset-0">
          <svg
            className="absolute w-[800px] h-[800px] -bottom-40 -left-40 text-white/10"
            viewBox="0 0 200 200"
            fill="currentColor"
          >
            <circle cx="100" cy="100" r="100" />
          </svg>
          <svg
            className="absolute w-[600px] h-[600px] -top-20 -right-20 text-white/10"
            viewBox="0 0 200 200"
            fill="currentColor"
          >
            <circle cx="100" cy="100" r="100" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-center p-12 lg:p-20">
          <div className="mb-8">
            <Image
              src="/logoQC - base.png"
              alt="qcumb"
              width={180}
              height={60}
              className="h-auto w-auto max-w-[180px] brightness-0 invert"
              priority
            />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">
            Support your favorite<br />creators with crypto
          </h1>
          <p className="text-white/80 text-lg max-w-md">
            No banks. No middlemen. Just direct creator-to-fan payments secured on-chain.
          </p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="lg:w-1/2 bg-white flex flex-col">
        <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
          <div className="w-full max-w-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-8">Log in</h2>

            <LoginWalletPanel />

            {/* Terms */}
            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              By logging in and using qcumb, you agree to our{' '}
              <a href="#" className="text-[#00E088] hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-[#00E088] hover:underline">Privacy Policy</a>
              , and confirm that you are at least 18 years old.
            </p>
          </div>
        </div>

        {/* Featured posts teaser */}
        <div className="border-t border-gray-100 p-8 lg:px-16">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest featured posts</h3>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00E088] to-[#00B4D8] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">qcumb</span>
                <svg className="w-4 h-4 text-[#00E088]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-400 text-sm">@qcumb</span>
              </div>
              <p className="text-sm text-gray-500 truncate">Sign in to see exclusive content from top creators...</p>
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap">just now</span>
          </div>
        </div>
      </div>
    </div>
  )
}
