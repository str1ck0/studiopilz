import { client } from './client'
import { Project, About } from '../../types'

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
