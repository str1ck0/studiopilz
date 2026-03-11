/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Project {
  _id: string
  title: string
  slug: string
  category: string
  description?: string
  longDescription?: any[] // Portable Text block array
  mainImage: any
  gallery?: any[]
  year: number
  tags?: string[]
  link?: string
  featured?: boolean
}

export interface TeamMember {
  name: string
  role: string
  image: any
  bio?: string
}

export interface Exhibition {
  name: string
  year: string
  location: string
}

export interface SocialLink {
  platform: string
  url: string
}

export interface About {
  title: string
  philosophy?: any[]
  artistStatement?: any[]
  exhibitions?: Exhibition[]
  team?: TeamMember[]
  contactEmail?: string
  socialLinks?: SocialLink[]
}

export interface Homepage {
  heroSubtitle?: string
  heroTitle?: string
  heroDescription?: string
  workSectionTitle?: string
  workSectionSubtitle?: string
}

export interface GuestbookEntry {
  _id: string
  _createdAt: string
  authorName?: string
  message?: string
  drawingData?: string
  paperColor: string
}
