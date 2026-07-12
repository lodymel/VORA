'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { CloudSky } from '../cloud-sky'

export function SignupScreen({
  onComplete,
  onBack,
}: {
  onComplete: () => void
  onBack: () => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div className="absolute inset-0 z-[60] flex flex-col overflow-hidden">
      <CloudSky />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex h-full flex-col px-8 pb-16 pt-20"
      >
        <button type="button" onClick={onBack} className="vora-text-link self-start py-2">
          Back
        </button>

        <div className="flex flex-1 flex-col justify-center">
          <h1 className="vora-display-lg text-foreground">Create account</h1>
          <p className="vora-caption mt-4 max-w-[16rem] leading-relaxed">
            Save your lights and return to your sky anytime.
          </p>

          <form
            className="mt-12 space-y-6"
            onSubmit={(e) => {
              e.preventDefault()
              if (email.trim() && password.trim()) onComplete()
            }}
          >
            <label className="block text-left">
              <span className="vora-eyebrow">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="mt-3 w-full border-0 border-b border-border bg-transparent py-2.5 text-[15px] text-foreground outline-none placeholder:text-muted-foreground/40 focus:border-foreground/25"
                placeholder="you@email.com"
              />
            </label>

            <label className="block text-left">
              <span className="vora-eyebrow">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={6}
                className="mt-3 w-full border-0 border-b border-border bg-transparent py-2.5 text-[15px] text-foreground outline-none placeholder:text-muted-foreground/40 focus:border-foreground/25"
                placeholder="At least 6 characters"
              />
            </label>

            <button type="submit" className="vora-pill vora-pill--solid mt-10 w-full">
              Create account
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
