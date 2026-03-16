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

      {/* Dictionary Section */}
      <div className="relative z-20 border-t border-foreground/10 py-12 px-6 md:px-16">
        <div className="max-w-5xl mx-auto flex flex-col gap-6">
          <p className="flex-1 text-base md:text-lg leading-relaxed">
            <span className="font-bold">stu·di·o</span>{' '}
            <span className="font-mono text-sm opacity-60">/ˈstjuːdɪəʊ/</span>{' '}
            <em className="opacity-70">noun</em>{' '}
            A place where people make things. Ideas come in, get pulled apart, rebuilt, and eventually leave as something real.
          </p>
          <p className="flex-1 text-base md:text-lg leading-relaxed">
            <span className="font-bold">Pilz</span>{' '}
            <span className="font-mono text-sm opacity-60">/pɪlts/</span>{' '}
            <em className="opacity-70">noun,</em>{' '}
            German for mushroom. A fruiting body that emerges when the conditions are right. Beneath the surface, a vast network connecting separate organisms, passing signals and nutrients between them. No centre, no hierarchy. Grows by connecting.
          </p>
        </div>
      </div>

      <div id="work" className="pt-24 pb-12 relative z-20">
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-12 px-6 border-b border-foreground/10 pb-4">
            <h2 className="text-3xl font-bold tracking-tighter">{workSectionTitle}</h2>
          </div>
          <ProjectGrid projects={projects} />
        </div>
      </div>
    </main>
  );
}
