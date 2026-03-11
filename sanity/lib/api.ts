import { client } from './client'
import { Project, About, Homepage } from '../../types'

export async function getHomepageData(): Promise<Homepage> {
  return client.fetch(`
    *[_type == "homepage"][0] {
      heroSubtitle,
      heroTitle,
      heroDescription,
      workSectionTitle,
      workSectionSubtitle
    }
  `)
}

export async function getProjects(): Promise<Project[]> {
  return client.fetch(`
    *[_type == "project"] | order(year desc) {
      _id,
      title,
      "slug": slug.current,
      category,
      description,
      year,
      mainImage,
      featured
    }
  `)
}

export async function getProjectBySlug(slug: string): Promise<Project> {
  return client.fetch(
    `
    *[_type == "project" && slug.current == $slug][0] {
      _id,
      title,
      "slug": slug.current,
      category,
      description,
      longDescription,
      gallery[]{..., "url": asset->url},
      year,
      tags,
      link,
      mainImage
    }
  `,
    { slug }
  )
}

export async function getAboutData(): Promise<About> {
  return client.fetch(`
    *[_type == "about"][0] {
      title,
      philosophy,
      artistStatement,
      exhibitions,
      team,
      contactEmail,
      socialLinks
    }
  `)
}

export async function getGuestbookEntries(): Promise<import('../../types').GuestbookEntry[]> {
  return client.fetch(`
    *[_type == "guestbookEntry"] | order(_createdAt desc) {
      _id,
      _createdAt,
      authorName,
      message,
      drawingData,
      paperColor
    }
  `)
}
