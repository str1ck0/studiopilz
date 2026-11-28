/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import { getProjectBySlug } from '@/sanity/lib/api'
import { notFound } from 'next/navigation'
import { PortableText } from '@portabletext/react'
import { urlForImage } from '@/sanity/lib/image'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatedSection } from '@/components/AnimatedSection'
import { ProjectGallery } from '@/components/ProjectGallery'
import ScrollBloom from '@/components/ScrollBloom'

export const revalidate = 60

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)

  if (!project) {
    notFound()
  }

  // Custom components for Sanity PortableText
  const components = {
    types: {
      image: ({ value }: any) => {
        if (!value?.asset?._ref) {
          return null
        }
        return (
          <ScrollBloom seed={value._key || value.asset._ref} className="my-8">
            <img
              alt={value.alt || ' '}
              loading="lazy"
              src={urlForImage(value).width(1600).quality(85).url()}
              className="w-full bg-black/5 dark:bg-white/5 object-cover rounded"
            />
          </ScrollBloom>
        )
      },
    },
    block: {
      normal: ({ children }: any) => <p className="mb-6 leading-relaxed text-lg text-zinc-800 dark:text-zinc-300">{children}</p>,
      h2: ({ children }: any) => <h2 className="text-3xl font-bold mt-12 mb-6">{children}</h2>,
      h3: ({ children }: any) => <h3 className="text-2xl font-bold mt-8 mb-4">{children}</h3>,
      blockquote: ({ children }: any) => (
        <blockquote className="border-l-4 border-black dark:border-white pl-6 my-8 italic text-xl">
          {children}
        </blockquote>
      ),
    },
    marks: {
      link: ({ value, children }: any) => {
        const target = (value?.href || '').startsWith('http') ? '_blank' : undefined
        return (
          <a href={value?.href} target={target} rel={target === '_blank' ? 'noindex nofollow' : ''} className="underline underline-offset-4 decoration-black/30 dark:decoration-white/30 hover:decoration-black dark:hover:decoration-white transition-colors">
            {children}
          </a>
        )
      },
    },
  }

  return (
    <article className="min-h-screen pt-32 pb-24 px-6 max-w-5xl mx-auto overflow-hidden">
      <AnimatedSection className="mb-12">
        <Link
          href="/work"
          className="mb-8 inline-flex min-h-11 items-center font-mono text-sm lowercase tracking-wide opacity-60 underline-offset-4 transition-opacity hover:underline hover:opacity-100"
        >
          ← back to work
        </Link>
        <h1 className="mb-6 font-semibold lowercase leading-[0.9] tracking-[-0.05em] break-words" style={{ fontSize: 'clamp(3rem, 9vw, 8rem)' }}>
          {project.title}
        </h1>
        
        <div className="flex flex-wrap gap-8 py-6 border-y border-black/10 dark:border-white/10 mt-8 font-mono text-sm uppercase tracking-widest">
          <div>
            <span className="block opacity-50 mb-1">Category</span>
            {project.category.replace('-', ' ')}
          </div>
          <div>
            <span className="block opacity-50 mb-1">Year</span>
            {project.year}
          </div>
          {project.link && (
            <div>
              <span className="block opacity-50 mb-1">Link</span>
              <a href={project.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                View Live ↗
              </a>
            </div>
          )}
        </div>
      </AnimatedSection>

      {/* Main Image */}
      {project.mainImage && (
        <AnimatedSection delay={0.1} className="aspect-[16/9] md:aspect-[21/9] w-full mb-16 overflow-hidden bg-black/5 dark:bg-white/5 relative group rounded">
          <ScrollBloom seed={project._id} leaveOnly className="absolute inset-0">
            <Image
              src={urlForImage(project.mainImage).width(2400).quality(90).url()}
              alt={project.mainImage.alt || project.title}
              fill
              sizes="100vw"
              priority
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </ScrollBloom>
        </AnimatedSection>
      )}

      {/* Description Content */}
      <AnimatedSection delay={0.2} className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-12 mb-24">
        <div>
           <h3 className="text-xl font-bold mb-4">About the Project</h3>
           <p className="text-lg text-foreground/70">
             {project.description}
           </p>
           
           {project.tags && project.tags.length > 0 && (
              <div className="mt-8">
                <h4 className="font-mono text-xs uppercase tracking-widest opacity-50 mb-3">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-black/5 dark:bg-white/10 rounded-full text-xs font-mono">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
           )}
        </div>
        
        <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/80">
          {project.longDescription ? (
            <PortableText value={project.longDescription as any} components={components} />
          ) : (
            <div className="space-y-6 text-lg text-foreground/80">
             {project.description}
            </div>
          )}

          {/* New Case Study Fields */}
          {project.conceptAndContext && (
            <div className="mt-16">
              <h3 className="text-2xl font-bold mb-6 text-foreground">Concept & Context</h3>
              <PortableText value={project.conceptAndContext as any} components={components} />
            </div>
          )}
          {project.technicalApproach && (
            <div className="mt-16">
              <h3 className="text-2xl font-bold mb-6 text-foreground">Technical Approach</h3>
              <PortableText value={project.technicalApproach as any} components={components} />
            </div>
          )}
          {project.collaborators && (
            <div className="mt-16">
              <h3 className="text-2xl font-bold mb-6 text-foreground">Collaborators</h3>
              <PortableText value={project.collaborators as any} components={components} />
            </div>
          )}
          {project.outcome && (
            <div className="mt-16">
              <h3 className="text-2xl font-bold mb-6 text-foreground">Outcome & Reception</h3>
              <PortableText value={project.outcome as any} components={components} />
            </div>
          )}
        </div>
      </AnimatedSection>

      {/* Gallery */}
      {project.gallery && project.gallery.length > 0 && (
        <AnimatedSection delay={0.3}>
          <ProjectGallery items={project.gallery} />
        </AnimatedSection>
      )}
    </article>
  )
}

