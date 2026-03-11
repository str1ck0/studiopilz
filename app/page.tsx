import ProjectGrid from '@/components/ProjectGrid'
import HomeHero from '@/components/HomeHero'
import { getProjects, getHomepageData } from '@/sanity/lib/api'

export const revalidate = 60;

export default async function Home() {
  const projects = await getProjects()
  const homepageContent = await getHomepageData()

  // Setting sensible fallbacks
  const heroSubtitle = homepageContent?.heroSubtitle || 'Creative Technology & Design'
  const heroTitle = homepageContent?.heroTitle || 'We build\n<span className="italic font-light opacity-80">digital</span> spaces.'
  const heroDescription = homepageContent?.heroDescription || 'Studio Pilz is a contemporary full-service creative agency operating in the spaces between technology, art, design, and physical installations. We are a mycelial network of artists, musicians, scientists, and explorers.'
  const workSectionTitle = homepageContent?.workSectionTitle || 'Selected Works'
  const workSectionSubtitle = homepageContent?.workSectionSubtitle || '2021—Present'

  return (
    <main className="min-h-screen">
      <HomeHero 
        subtitle={heroSubtitle} 
        title={heroTitle} 
        description={heroDescription} 
      />
      <div id="work" className="pt-24 pb-12 relative z-20">
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-12 px-6 flex items-baseline justify-between border-b border-foreground/10 pb-4">
            <h2 className="text-3xl font-bold tracking-tighter">{workSectionTitle}</h2>
            <span className="font-mono text-xs uppercase tracking-widest opacity-50">{workSectionSubtitle}</span>
          </div>
          <ProjectGrid projects={projects} />
        </div>
      </div>
    </main>
  );
}
