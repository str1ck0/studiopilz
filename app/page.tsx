import ProjectGrid from '@/components/ProjectGrid'
import HomeHero from '@/components/HomeHero'
import { getProjects, getHomepageData } from '@/sanity/lib/api'

export const revalidate = 60;

export default async function Home() {
  const projects = await getProjects()
  const homepageContent = await getHomepageData()

  const heroVideo = homepageContent?.heroVideo
  const workSectionTitle = homepageContent?.workSectionTitle || 'Selected Works'

  return (
    <main className="min-h-screen">
      <HomeHero videoUrl={heroVideo} />
      <div id="work" className="pt-24 pb-12 relative z-20">
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-12 px-6 flex items-center justify-between border-b border-foreground/10 pb-4">
            <h2 className="text-3xl font-bold tracking-tighter">{workSectionTitle}</h2>
            <span className="font-mono text-xs uppercase tracking-widest opacity-40 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
              Scroll
            </span>
          </div>
          <ProjectGrid projects={projects} />
        </div>
      </div>
    </main>
  );
}
