'use client'

import { useEffect, useCallback } from 'react'

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}

interface RecaptchaProps {
  siteKey: string
  onLoad?: () => void
}

export function Recaptcha({ siteKey, onLoad }: RecaptchaProps) {
  useEffect(() => {
    if (!siteKey) return

    // Check if script is already loaded
    if (window.grecaptcha) {
      onLoad?.()
      return
    }

    // Load reCAPTCHA script
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
    script.async = true
    script.defer = true
    script.onload = () => {
      onLoad?.()
    }
    document.head.appendChild(script)

    return () => {
      // Cleanup: remove script if component unmounts
      const existingScript = document.querySelector(`script[src*="recaptcha/api.js"]`)
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [siteKey, onLoad])

  return null
}

// Hook to execute reCAPTCHA
export function useRecaptcha(siteKey: string) {
  const executeRecaptcha = useCallback(async (action: string = 'submit'): Promise<string | null> => {
    if (!siteKey || !window.grecaptcha) {
      console.warn('reCAPTCHA not loaded or site key missing')
      return null
    }

    try {
      return await window.grecaptcha.execute(siteKey, { action })
    } catch (error) {
      console.error('reCAPTCHA execution error:', error)
      return null
    }
  }, [siteKey])

  return { executeRecaptcha }
}

