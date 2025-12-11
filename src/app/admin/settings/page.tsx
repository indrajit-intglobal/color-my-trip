'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'

export default function AdminSettingsPage() {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [settings, setSettings] = useState({
    // General
    defaultCurrency: 'INR',
    defaultCountry: 'IN',
    supportEmail: 'support@gofly.com',
    SMTP_FROM_NAME: 'GoFly Travel Agency',
    
    // Razorpay
    RAZORPAY_KEY_ID: '',
    RAZORPAY_SECRET_KEY: '',
    
    // SMTP
    SMTP_HOST: 'smtp.gmail.com',
    SMTP_PORT: '587',
    SMTP_EMAIL: '',
    SMTP_PASSWORD: '',
    SMTP_ENABLED: true,
    
    // Cloudinary
    cloudinaryCloudName: '',
    cloudinaryApiKey: '',
    cloudinaryApiSecret: '',
    
    // reCAPTCHA v3
    recaptchaSiteKey: '',
    recaptchaSecretKey: '',
    
    // Gemini AI Chatbot
    geminiApiKey: '',
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings')
      const data = await res.json()
      
      if (data.success) {
        setSettings((prev) => ({
          ...prev,
          ...data.data,
        }))
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setFetching(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })

      const data = await res.json()

      if (data.success) {
        showToast('Settings saved successfully!', 'success')
      } else {
        const errorMessage = data.error || 'Failed to save settings'
        console.error('Settings save error:', data)
        showToast(errorMessage, 'error')
      }
    } catch (error: any) {
      console.error('Settings save exception:', error)
      showToast(error.message || 'Failed to save settings', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading settings...</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Default Currency</label>
              <Input
                value={settings.defaultCurrency}
                onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                placeholder="INR"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Default Country</label>
              <Input
                value={settings.defaultCountry}
                onChange={(e) => setSettings({ ...settings, defaultCountry: e.target.value })}
                placeholder="IN"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Support Email</label>
              <Input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                placeholder="support@gofly.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email From Name</label>
              <Input
                value={settings.SMTP_FROM_NAME}
                onChange={(e) => setSettings({ ...settings, SMTP_FROM_NAME: e.target.value })}
                placeholder="GoFly Travel Agency"
              />
            </div>
          </CardContent>
        </Card>

        {/* Razorpay Payment Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Razorpay Payment Gateway</CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Configure your Razorpay credentials. Get your keys from{' '}
              <a href="https://dashboard.razorpay.com" target="_blank" rel="noopener noreferrer" className="text-brand-green hover:underline">
                Razorpay Dashboard
              </a>
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Razorpay Key ID</label>
              <Input
                type="text"
                value={settings.RAZORPAY_KEY_ID}
                onChange={(e) => setSettings({ ...settings, RAZORPAY_KEY_ID: e.target.value })}
                placeholder="rzp_test_..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Your Razorpay Key ID (starts with rzp_test_ for test mode or rzp_live_ for live mode)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Razorpay Secret Key</label>
              <Input
                type="password"
                value={settings.RAZORPAY_SECRET_KEY}
                onChange={(e) => setSettings({ ...settings, RAZORPAY_SECRET_KEY: e.target.value })}
                placeholder="Enter your secret key"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your Razorpay Secret Key (keep this secure and never share it)
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Razorpay supports Cards, UPI, Net Banking, Wallets, and more. 
                All payment methods will be available to customers automatically.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Email/SMTP Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Email Settings (Gmail SMTP)</CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Configure Gmail SMTP for sending transactional emails (booking confirmations, password resets, etc.)
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="smtpEnabled"
                checked={settings.SMTP_ENABLED}
                onChange={(e) => setSettings({ ...settings, SMTP_ENABLED: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="smtpEnabled" className="text-sm font-medium">
                Enable Email Notifications
              </label>
            </div>

            {settings.SMTP_ENABLED && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">SMTP Host</label>
                  <Input
                    value={settings.SMTP_HOST}
                    onChange={(e) => setSettings({ ...settings, SMTP_HOST: e.target.value })}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">SMTP Port</label>
                  <Input
                    type="number"
                    value={settings.SMTP_PORT}
                    onChange={(e) => setSettings({ ...settings, SMTP_PORT: e.target.value })}
                    placeholder="587"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <Input
                    type="email"
                    value={settings.SMTP_EMAIL}
                    onChange={(e) => setSettings({ ...settings, SMTP_EMAIL: e.target.value })}
                    placeholder="your-email@gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">App Password</label>
                  <Input
                    type="password"
                    value={settings.SMTP_PASSWORD}
                    onChange={(e) => setSettings({ ...settings, SMTP_PASSWORD: e.target.value })}
                    placeholder="Enter Gmail App Password"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    For Gmail, you need to use an{' '}
                    <a
                      href="https://support.google.com/accounts/answer/185833"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-green hover:underline"
                    >
                      App Password
                    </a>
                    {' '}instead of your regular password. Enable 2-Step Verification first.
                  </p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Gmail Setup:</strong>
                  </p>
                  <ol className="text-xs text-yellow-700 mt-2 list-decimal list-inside space-y-1">
                    <li>Enable 2-Step Verification on your Google Account</li>
                    <li>Generate an App Password: Google Account → Security → App Passwords</li>
                    <li>Use the generated 16-character password above</li>
                  </ol>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Cloudinary Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Cloudinary Configuration</CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Configure Cloudinary for image uploads and management
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Cloud Name</label>
              <Input
                value={settings.cloudinaryCloudName}
                onChange={(e) => setSettings({ ...settings, cloudinaryCloudName: e.target.value })}
                placeholder="your-cloud-name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">API Key</label>
              <Input
                type="password"
                value={settings.cloudinaryApiKey}
                onChange={(e) => setSettings({ ...settings, cloudinaryApiKey: e.target.value })}
                placeholder="Enter API Key"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">API Secret</label>
              <Input
                type="password"
                value={settings.cloudinaryApiSecret}
                onChange={(e) => setSettings({ ...settings, cloudinaryApiSecret: e.target.value })}
                placeholder="Enter API Secret"
              />
            </div>
          </CardContent>
        </Card>

        {/* reCAPTCHA v3 Settings */}
        <Card>
          <CardHeader>
            <CardTitle>reCAPTCHA v3 Configuration</CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Configure Google reCAPTCHA v3 for spam protection. Get your keys from{' '}
              <a href="https://www.google.com/recaptcha/admin" target="_blank" rel="noopener noreferrer" className="text-brand-green hover:underline">
                Google reCAPTCHA Admin
              </a>
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Site Key</label>
              <Input
                value={settings.recaptchaSiteKey}
                onChange={(e) => setSettings({ ...settings, recaptchaSiteKey: e.target.value })}
                placeholder="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your reCAPTCHA v3 Site Key (public key, visible to users)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Secret Key</label>
              <Input
                type="password"
                value={settings.recaptchaSecretKey}
                onChange={(e) => setSettings({ ...settings, recaptchaSecretKey: e.target.value })}
                placeholder="Enter your secret key"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your reCAPTCHA v3 Secret Key (private key, keep secure)
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> reCAPTCHA v3 runs in the background and doesn't interrupt user experience. 
                It provides a risk score (0.0 to 1.0) for each interaction. Lower scores indicate suspicious activity.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Gemini AI Chatbot Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Gemini AI Chatbot Configuration</CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Configure Google Gemini AI for the customer support chatbot. Get your API key from{' '}
              <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-brand-green hover:underline">
                Google AI Studio
              </a>
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Gemini API Key</label>
              <Input
                type="password"
                value={settings.geminiApiKey}
                onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                placeholder="Enter your Gemini API key"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your Google Gemini API key (keep this secure and never share it)
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The chatbot will help customers with travel-related questions, booking inquiries, 
                and general information about tours and packages. Make sure to enable the Gemini API in your Google Cloud Console.
              </p>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={loading} size="lg" className="w-full bg-brand-green hover:bg-green-800">
          {loading ? (
            <span className="flex items-center gap-2">
              <i className="fa-solid fa-spinner fa-spin"></i>
              Saving...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <i className="fa-solid fa-save"></i>
              Save All Settings
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}
