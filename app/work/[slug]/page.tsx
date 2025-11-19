import { client } from '@/lib/sanity.client'
import { urlForImage } from '@/lib/sanity.image'
import Image from 'next/image'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'

async function getProject(slug: string) {
  const query = `*[_type == "project" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    category,
    year,
    description,
    longDescription,
    mainImage,
    gallery,
    tags,
    link
  }`

  return client.fetch(query, { slug })
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = await getProject(slug)

  if (!project) {
    return (
      <main className="min-h-screen pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Project not found</h1>
          <Link href="/work" className="underline">
            Back to work
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen pt-32 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/work"
          className="inline-block mb-8 text-sm tracking-wider opacity-50 hover:opacity-100 transition-opacity"
        >
          ← Back to Work
        </Link>

        <div className="space-y-8 mb-12">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4">
                {project.title}
              </h1>
              <p className="text-lg uppercase tracking-wider text-zinc-500">
                {project.category} • {project.year}
              </p>
            </div>
          </div>

          {project.description && (
            <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl">
              {project.description}
            </p>
          )}

          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
            >
              Visit Project →
            </a>
          )}
        </div>

        {project.mainImage && (
          <div className="relative w-full aspect-[16/9] mb-12 bg-zinc-100 dark:bg-zinc-900">
            <Image
              src={urlForImage(project.mainImage).width(1920).height(1080).url()}
              alt={project.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {project.longDescription && (
          <div className="prose prose-lg dark:prose-invert max-w-3xl mb-12">
            <PortableText value={project.longDescription} />
          </div>
        )}

        {project.gallery && project.gallery.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {project.gallery.map((image: any, index: number) => (
              <div
                key={index}
                className="relative w-full aspect-[4/3] bg-zinc-100 dark:bg-zinc-900"
              >
                <Image
                  src={urlForImage(image).width(1200).height(900).url()}
                  alt={image.alt || `${project.title} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {project.tags && project.tags.length > 0 && (
          <div className="mt-12 flex flex-wrap gap-2">
            {project.tags.map((tag: string) => (
              <span
                key={tag}
                className="px-4 py-2 text-sm border border-zinc-300 dark:border-zinc-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export const revalidate = 60
