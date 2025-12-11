'use client'

import { useEffect, useState } from 'react'
import { Recaptcha } from './recaptcha'

export function RecaptchaProvider() {
  const [siteKey, setSiteKey] = useState<string>('')

  useEffect(() => {
    // Fetch reCAPTCHA site key from API
    fetch('/api/recaptcha/config')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.siteKey) {
          setSiteKey(data.siteKey)
        }
      })
      .catch(err => {
        console.error('Failed to load reCAPTCHA config:', err)
      })
  }, [])

  if (!siteKey) {
    return null
  }

  return <Recaptcha siteKey={siteKey} />
}

