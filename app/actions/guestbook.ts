'use server'

import { createClient } from 'next-sanity'
import { revalidatePath } from 'next/cache'

// Using the same config as sanity/lib/client.ts but WITH a token for write access
const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false, // Don't use CDN for writes
  token: process.env.SANITY_API_TOKEN,
})

export async function submitGuestbookEntry(formData: {
  authorName?: string;
  message?: string;
  drawingData?: string;
  paperColor: string;
}) {
  try {
    const { authorName, message, drawingData, paperColor } = formData

    // Basic validation: must have either a message or a drawing
    if (!message?.trim() && !drawingData) {
      return { success: false, error: 'Please leave a message or a drawing.' }
    }

    const doc = {
      _type: 'guestbookEntry',
      authorName: authorName?.trim() || 'Anonymous',
      message: message?.trim(),
      drawingData,
      paperColor,
    }

    await writeClient.create(doc)

    // Revalidate the about page so the new entry shows up immediately
    revalidatePath('/about')

    return { success: true }
  } catch (error) {
    console.error('Error submitting guestbook entry:', error)
    return { success: false, error: 'Failed to submit entry. Please try again later.' }
  }
}
