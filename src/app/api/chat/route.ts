import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// System prompt for the chatbot
const SYSTEM_PROMPT = `You are a helpful travel assistant for GoFly Travel Agency. Your role is to assist customers with:
- Information about tours and travel packages (you have access to current tour data)
- Booking inquiries and procedures
- Travel recommendations based on available tours
- General travel-related questions

IMPORTANT RULES:
- You have access to tour information from the database - use this data to answer questions accurately
- Only provide information about published tours that are available
- Never share personal information (user emails, names, payment details, booking IDs)
- Never share secret information (API keys, passwords, internal system details)
- If asked about specific tours, locations, or prices, use the tour data provided
- Be friendly, professional, and concise
- If you don't have specific information, suggest they contact support or check the website`

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    success: true, 
    message: 'Chat API is working. Use POST to send messages.' 
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, conversationHistory } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      )
    }

    // Get Gemini API key from settings
    const geminiSetting = await prisma.settings.findUnique({
      where: { key: 'geminiApiKey' },
    })

    let apiKey = (geminiSetting?.value as string) || process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Gemini API key not configured. Please configure it in Admin Settings.',
        },
        { status: 500 }
      )
    }

    // Trim whitespace from API key
    apiKey = apiKey.trim()
    
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Gemini API key is empty. Please configure it in Admin Settings.',
        },
        { status: 500 }
      )
    }

    // Fetch available tours from database (only published, no personal data)
    const tours = await prisma.tour.findMany({
      where: {
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        locationCity: true,
        locationCountry: true,
        category: true,
        basePrice: true,
        discountPrice: true,
        durationDays: true,
        maxGroupSize: true,
        // Exclude personal/secret data - no user info, no internal IDs, no payment info
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit to 50 most recent tours to avoid token limits
    })

    // Format tours data for AI context
    let toursData = 'AVAILABLE TOURS:\n'
    if (tours.length > 0) {
      tours.forEach((tour) => {
        toursData += `- ${tour.title} (${tour.locationCity}, ${tour.locationCountry})\n`
        toursData += `  Category: ${tour.category}\n`
        toursData += `  Duration: ${tour.durationDays} days\n`
        toursData += `  Price: ${tour.discountPrice ? `₹${tour.discountPrice} (was ₹${tour.basePrice})` : `₹${tour.basePrice}`}\n`
        if (tour.maxGroupSize) {
          toursData += `  Max Group Size: ${tour.maxGroupSize}\n`
        }
        toursData += `  Description: ${tour.description.substring(0, 150)}${tour.description.length > 150 ? '...' : ''}\n`
        toursData += `  View at: /tours/${tour.slug}\n\n`
      })
    } else {
      toursData += 'No tours currently available.\n\n'
    }

    // Prepare conversation history for Gemini
    const history = conversationHistory || []
    
    // Build the conversation context - Gemini expects alternating user/model messages
    const contents: any[] = []
    
    // Build conversation with system prompt and tour data included
    let conversationText = SYSTEM_PROMPT + '\n\n'
    conversationText += toursData + '\n'
    
    // Add conversation history (last 10 messages)
    history.slice(-10).forEach((msg: { role: string; content: string }) => {
      if (msg.role === 'user') {
        conversationText += `User: ${msg.content}\n\n`
      } else {
        conversationText += `Assistant: ${msg.content}\n\n`
      }
    })
    
    // Add current message
    conversationText += `User: ${message}`
    
    // Create a single user message with full context
    contents.push({
      role: 'user',
      parts: [{ text: conversationText }],
    })

    // Call Gemini API - Using Gemini 2.0 Flash (free model)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey.trim()}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.text()
      let errorMessage = 'Failed to get response from AI. Please try again.'
      
      try {
        const errorJson = JSON.parse(errorData)
        errorMessage = errorJson.error?.message || errorMessage
        console.error('Gemini API error:', errorJson)
      } catch {
        console.error('Gemini API error (raw):', errorData)
      }
      
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: response.status }
      )
    }

    const data = await response.json()

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Invalid Gemini response:', JSON.stringify(data, null, 2))
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid response from AI service. Please check the API key configuration.',
        },
        { status: 500 }
      )
    }

    if (!data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      console.error('Invalid Gemini response structure:', JSON.stringify(data, null, 2))
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid response format from AI service.',
        },
        { status: 500 }
      )
    }

    const aiResponse = data.candidates[0].content.parts[0].text

    return NextResponse.json({
      success: true,
      response: aiResponse,
    })
  } catch (error: any) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process chat message',
      },
      { status: 500 }
    )
  }
}

