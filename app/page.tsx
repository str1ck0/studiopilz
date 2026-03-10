import ProjectGrid from '@/components/ProjectGrid'
import HomeHero from '@/components/HomeHero'
import { getProjects } from '@/sanity/lib/api'

export const revalidate = 60;

export default async function Home() {
  const projects = await getProjects()

  return (
    <main className="min-h-screen">
      <HomeHero />
      <div id="work" className="pt-24 pb-12 relative z-20">
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-12 px-6 flex items-baseline justify-between border-b border-foreground/10 pb-4">
            <h2 className="text-3xl font-bold tracking-tighter">Selected Works</h2>
            <span className="font-mono text-xs uppercase tracking-widest opacity-50">2021—Present</span>
          </div>
          <ProjectGrid projects={projects} />
        </div>
      </div>
    </main>
  );
}
