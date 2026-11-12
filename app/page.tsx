import HomeJourney from '@/components/HomeJourney'
import { getProjects } from '@/sanity/lib/api'

export const revalidate = 60;

export default async function Home() {
  const projects = await getProjects()
  // the home journey is a short teaser: only projects marked "featured" in Studio.
  // Until any are, it shows them all so the journey is never empty.
  const featured = projects.filter((project) => project.featured)

  return (
    <main className="min-h-screen">
      <HomeJourney projects={featured.length > 0 ? featured : projects} />
    </main>
  );
}
