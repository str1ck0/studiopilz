import { client } from '@/lib/sanity.client'
import ProjectCard from '@/components/ProjectCard'

async function getProjects() {
  const query = `*[_type == "project"] | order(year desc, _createdAt desc) {
    _id,
    title,
    slug,
    category,
    year,
    mainImage,
    description
  }`

  return client.fetch(query)
}

export default async function WorkPage() {
  const projects = await getProjects()

  return (
    <main className="min-h-screen pt-32 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-16">
          Selected Work
        </h1>

        {projects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-zinc-500">
              No projects yet. Add your first project in{' '}
              <a href="/studio" className="underline">
                Sanity Studio
              </a>
              .
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {projects.map((project: any, index: number) => (
              <ProjectCard
                key={project._id}
                title={project.title}
                slug={project.slug.current}
                category={project.category}
                year={project.year}
                mainImage={project.mainImage}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export const revalidate = 60
