import { client } from './client'
import { Project, About, Homepage, SiteSettings } from '../../types'

export async function getHomepageData(): Promise<Homepage> {
  return client.fetch(`
    *[_type == "homepage"][0] {
      "heroVideo": heroVideo.asset->url,
      workSectionTitle
    }
  `)
}

export async function getProjects(): Promise<Project[]> {
  return client.fetch(`
    *[_type == "project"] | order(projectDate desc, year desc) {
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
      conceptAndContext,
      technicalApproach,
      collaborators,
      outcome,
      gallery[]{..., "url": asset->url, previewPosition},
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
      "philosophyImage": philosophyImage{..., "url": asset->url},
      artistStatement,
      "artistStatementImage": artistStatementImage{..., "url": asset->url},
      exhibitions,
      team[]{..., cvEntries[]},
      skills,
contactEmail,
      socialLinks
    }
  `)
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return client.fetch(`
    *[_type == "siteSettings"][0] {
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
