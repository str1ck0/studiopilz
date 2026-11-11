import HomeJourney from '@/components/HomeJourney'
import { getProjects } from '@/sanity/lib/api'

export const revalidate = 60;

export default async function Home() {
  const projects = await getProjects()

  return (
    <main className="min-h-screen">
      <HomeJourney projects={projects} />
    </main>
  );
}
