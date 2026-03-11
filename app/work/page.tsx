import { getProjects } from '@/sanity/lib/api'
import ProjectList from '@/components/ProjectList'

export const revalidate = 60

export const metadata = {
  title: 'Work | Studio Pilz',
  description: 'Selected creative technology and design projects by Studio Pilz.',
}

export default async function WorkPage() {
  const projects = await getProjects()

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-16 border-b border-foreground/10 pb-8 flex flex-col md:flex-row items-baseline justify-between gap-4">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter">Projects</h1>
          <span className="font-mono text-sm tracking-widest uppercase opacity-50">Selected Works — 2021-Present</span>
        </div>
        
        <ProjectList projects={projects} />
      </div>
    </main>
  )
}
