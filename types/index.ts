/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Project {
  _id: string
  title: string
  slug: string
  category: string
  description?: string
  longDescription?: any[] // Portable Text block array
  conceptAndContext?: any[]
  technicalApproach?: any[]
  collaborators?: any[]
  outcome?: any[]
  mainImage: any
  gallery?: any[]
  year: number
  tags?: string[]
  link?: string
  featured?: boolean
}

export interface CvEntry {
  year: string
  description: string
}

export interface TeamMember {
  name: string
  role: string
  image: any
  bio?: any[]
  cvEntries?: CvEntry[]
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

export interface SiteSettings {
  contactEmail?: string
  socialLinks?: SocialLink[]
}

export interface About {
  title: string
  philosophy?: any[]
  philosophyImage?: any
  artistStatement?: any[]
  artistStatementImage?: any
  exhibitions?: Exhibition[]
  team?: TeamMember[]
  skills?: string[]
contactEmail?: string
  socialLinks?: SocialLink[]
}

export interface Homepage {
  heroVideo?: any
  workSectionTitle?: string
}

export interface GuestbookEntry {
  _id: string
  _createdAt: string
  authorName?: string
  message?: string
  drawingData?: string
  paperColor: string
}
