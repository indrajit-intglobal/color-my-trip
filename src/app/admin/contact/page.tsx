'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'

interface ContactMessage {
  id: string
  name: string
  email: string
  message: string
  status: 'NEW' | 'READ' | 'ARCHIVED'
  createdAt: string
}

export default function AdminContactPage() {
  const { showToast } = useToast()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'NEW' | 'READ' | 'ARCHIVED'>('all')
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    fetchMessages()
  }, [filter])

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') {
        params.append('status', filter)
      }

      const res = await fetch(`/api/admin/contact?${params.toString()}`)
      const data = await res.json()

      if (data.success) {
        setMessages(data.data)
      } else {
        showToast('Failed to load messages', 'error')
      }
    } catch (error) {
      showToast('An error occurred', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (messageId: string, newStatus: 'NEW' | 'READ' | 'ARCHIVED') => {
    setProcessing(messageId)
    try {
      const res = await fetch(`/api/admin/contact/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await res.json()

      if (data.success) {
        showToast('Message status updated', 'success')
        fetchMessages()
      } else {
        showToast(data.error || 'Failed to update message', 'error')
      }
    } catch (error) {
      showToast('An error occurred', 'error')
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading messages...</p>
      </div>
    )
  }

  const newCount = messages.filter((m) => m.status === 'NEW').length

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Contact Messages</h1>
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            All ({messages.length})
          </Button>
          <Button
            variant={filter === 'NEW' ? 'default' : 'outline'}
            onClick={() => setFilter('NEW')}
            size="sm"
            className="relative"
          >
            New
            {newCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {newCount}
              </span>
            )}
          </Button>
          <Button
            variant={filter === 'READ' ? 'default' : 'outline'}
            onClick={() => setFilter('READ')}
            size="sm"
          >
            Read
          </Button>
          <Button
            variant={filter === 'ARCHIVED' ? 'default' : 'outline'}
            onClick={() => setFilter('ARCHIVED')}
            size="sm"
          >
            Archived
          </Button>
        </div>
      </div>

      {messages.length === 0 ? (
        <Card>
          <CardContent className="!p-6 !pt-6">
            <div className="text-center py-12">
              <i className="fa-solid fa-inbox text-gray-300 text-6xl mb-4"></i>
              <p className="text-gray-500 text-lg">No messages found</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <Card
              key={message.id}
              className={`hover:shadow-lg transition-shadow ${
                message.status === 'NEW' ? 'border-l-4 border-blue-500' : ''
              }`}
            >
              <CardContent className="!p-6 !pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge
                        variant={
                          message.status === 'NEW'
                            ? 'default'
                            : message.status === 'READ'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {message.status}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(message.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="mb-3">
                      <p className="font-semibold text-gray-900 mb-1">
                        <i className="fa-solid fa-user mr-2 text-brand-green"></i>
                        {message.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        <i className="fa-solid fa-envelope mr-2"></i>
                        <a
                          href={`mailto:${message.email}`}
                          className="text-brand-green hover:underline"
                        >
                          {message.email}
                        </a>
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-brand-green">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {message.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {message.status === 'NEW' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(message.id, 'READ')}
                        disabled={processing === message.id}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {processing === message.id ? (
                          <i className="fa-solid fa-spinner fa-spin"></i>
                        ) : (
                          <>
                            <i className="fa-solid fa-check mr-1"></i>
                            Mark Read
                          </>
                        )}
                      </Button>
                    )}
                    {message.status !== 'ARCHIVED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(message.id, 'ARCHIVED')}
                        disabled={processing === message.id}
                      >
                        {processing === message.id ? (
                          <i className="fa-solid fa-spinner fa-spin"></i>
                        ) : (
                          <>
                            <i className="fa-solid fa-archive mr-1"></i>
                            Archive
                          </>
                        )}
                      </Button>
                    )}
                    {message.status === 'ARCHIVED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(message.id, 'READ')}
                        disabled={processing === message.id}
                      >
                        {processing === message.id ? (
                          <i className="fa-solid fa-spinner fa-spin"></i>
                        ) : (
                          <>
                            <i className="fa-solid fa-undo mr-1"></i>
                            Unarchive
                          </>
                        )}
                      </Button>
                    )}
                    <a
                      href={`mailto:${message.email}?subject=Re: Your inquiry&body=Dear ${message.name},%0D%0A%0D%0A`}
                      className="text-center"
                    >
                      <Button size="sm" variant="outline" className="w-full">
                        <i className="fa-solid fa-reply mr-1"></i>
                        Reply
                      </Button>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

