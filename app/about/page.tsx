/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import { getAboutData, getGuestbookEntries } from '@/sanity/lib/api'
import { urlForImage } from '@/sanity/lib/image'
import { PortableText } from '@portabletext/react'
import { AnimatedSection } from '@/components/AnimatedSection'
import DrawingPad from '@/components/DrawingPad'
import GuestbookGallery from '@/components/GuestbookGallery'

export const revalidate = 60

export default async function AboutPage() {
  const about = await getAboutData()
  const guestbookEntries = await getGuestbookEntries()

  const title = about?.title || 'About Studio Pilz'
  const email = about?.contactEmail || 'hello@studiopilz.com'

  const components = {
    block: {
      normal: ({ children }: any) => <p className="mb-6 leading-relaxed text-lg text-zinc-800 dark:text-zinc-300">{children}</p>,
    }
  }

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 max-w-5xl mx-auto overflow-hidden">

      {/* Header */}
      <AnimatedSection className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-black/10 dark:border-white/10 pb-12">
        <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-none">
          {title}
        </h1>
        <a
          href={`mailto:${email}`}
          className="font-mono text-sm tracking-widest uppercase hover:underline underline-offset-4"
        >
          {email} ↗
        </a>
      </AnimatedSection>

      <div className="flex flex-col gap-y-24">

        {/* Philosophy */}
        <AnimatedSection className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-x-12 gap-y-8">
          <div>
            <h2 className="text-xl font-bold tracking-tight mb-2">Philosophy</h2>
            <div className="w-12 h-px bg-black dark:bg-white opacity-20"></div>
          </div>
          <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/80">
            {about?.philosophy ? (
              <PortableText value={about.philosophy} components={components} />
            ) : (
              <>
                <p className="mb-6 leading-relaxed text-lg">
                  Studio Pilz is a contemporary full-service creative agency that operates in the elusive spaces between technology, art, design, and physical installations. We refuse to be boxed into a single medium.
                </p>
                <p className="mb-6 leading-relaxed text-lg">
                  Collaboration is central to our process. We function as a creative <strong>mycelial network</strong>—constantly connecting, sharing nutrients, and growing alongside a diverse ecosystem of artists, musicians, scientists, builders, and explorers.
                </p>
              </>
            )}
          </div>
        </AnimatedSection>

        {/* Artist Statement */}
        <AnimatedSection delay={0.1} className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-x-12 gap-y-8">
          <div>
            <h2 className="text-xl font-bold tracking-tight mb-2">Artist Statement</h2>
            <div className="w-12 h-px bg-black dark:bg-white opacity-20"></div>
          </div>
          <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/80">
            {about?.artistStatement ? (
              <PortableText value={about.artistStatement} components={components} />
            ) : (
              <p className="mb-6 leading-relaxed text-lg">
                We believe that the most profound digital and physical experiences are those that seamlessly blur the lines between reality and imagination. By integrating cutting-edge frontend web technologies with immersive hardware, our works attempt to provoke awe and invite playful interaction, acting as a bridge to the surreal.
              </p>
            )}
          </div>
        </AnimatedSection>

        {/* Exhibitions & Events */}
        <AnimatedSection delay={0.2} className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-x-12 gap-y-8">
          <div>
            <h2 className="text-xl font-bold tracking-tight mb-2">Exhibitions & Events</h2>
            <div className="w-12 h-px bg-black dark:bg-white opacity-20"></div>
          </div>
          <div className="space-y-4 font-mono text-sm tracking-wide">
            {about?.exhibitions && about.exhibitions.length > 0 ? (
              about.exhibitions.map((ex, i) => (
                <div key={i} className="flex justify-between items-baseline border-b border-black/5 dark:border-white/5 pb-4">
                  <div>
                    <span className="opacity-50 mr-4">{ex.year}</span>
                    <span className="font-semibold uppercase">{ex.name}</span>
                  </div>
                  <span className="opacity-70">{ex.location}</span>
                </div>
              ))
            ) : (
              <>
                <div className="flex justify-between items-baseline border-b border-black/5 dark:border-white/5 pb-4">
                  <div><span className="opacity-50 mr-4">2024</span><span className="font-semibold uppercase">Lumina Festival of Lights</span></div>
                  <span className="opacity-70">Berlin, DE</span>
                </div>
                <div className="flex justify-between items-baseline border-b border-black/5 dark:border-white/5 pb-4">
                  <div><span className="opacity-50 mr-4">2023</span><span className="font-semibold uppercase">Digital Mycology</span></div>
                  <span className="opacity-70">London, UK</span>
                </div>
                <div className="flex justify-between items-baseline border-b border-black/5 dark:border-white/5 pb-4">
                  <div><span className="opacity-50 mr-4">2022</span><span className="font-semibold uppercase">Echoes of the Network</span></div>
                  <span className="opacity-70">New York, NY</span>
                </div>
              </>
            )}
          </div>
        </AnimatedSection>

        {/* Team Section */}
        <AnimatedSection delay={0.3} className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-x-12 gap-y-8 border-t border-black/10 dark:border-white/10 pt-24">
          <div>
            <h2 className="text-xl font-bold tracking-tight mb-2">The Network</h2>
            <div className="w-12 h-px bg-black dark:bg-white opacity-20"></div>
            <p className="mt-4 text-sm opacity-60">Key nodes in the Studio Pilz ecosystem.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {about?.team && about.team.length > 0 ? (
              about.team.map((member, i) => (
                <div key={i} className="group">
                  <div className="aspect-square w-full mb-4 overflow-hidden bg-black/5 dark:bg-white/5">
                    {member.image && (
                      <img
                        src={urlForImage(member.image).url()}
                        alt={member.name}
                        className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                      />
                    )}
                  </div>
                  <h3 className="text-lg font-bold">{member.name}</h3>
                  <p className="font-mono text-xs tracking-widest uppercase opacity-50 mb-3">{member.role}</p>
                  {member.bio && <p className="text-sm opacity-80 leading-relaxed">{member.bio}</p>}
                </div>
              ))
            ) : (
              <>
                <div className="group">
                  <div className="aspect-[4/5] w-full mb-4 overflow-hidden bg-black/10 dark:bg-white/10"></div>
                  <h3 className="text-lg font-bold">Node 01</h3>
                  <p className="font-mono text-xs tracking-widest uppercase opacity-50 mb-3">Creative Technologist</p>
                  <p className="text-sm opacity-80 leading-relaxed">Specialising in real-time graphics and web experiences.</p>
                </div>
                <div className="group">
                  <div className="aspect-[4/5] w-full mb-4 overflow-hidden bg-black/10 dark:bg-white/10"></div>
                  <h3 className="text-lg font-bold">Node 02</h3>
                  <p className="font-mono text-xs tracking-widest uppercase opacity-50 mb-3">Experience Designer</p>
                  <p className="text-sm opacity-80 leading-relaxed">Translating conceptual networks into physical spaces.</p>
                </div>
              </>
            )}
          </div>
        </AnimatedSection>

      </div>

      {/* Team Photos */}
      {about?.teamPhotos && about.teamPhotos.length > 0 && (
        <AnimatedSection delay={0.35} className="mt-24 pt-16 border-t border-black/10 dark:border-white/10">
          <h2 className="text-xl font-bold tracking-tight mb-8">The Crew</h2>
          <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory -mx-6 px-6">
            {about.teamPhotos.map((photo: any, i: number) => (
              <div
                key={i}
                className="flex-none w-[75vw] sm:w-[45vw] md:w-[35vw] lg:w-[28vw] snap-start aspect-[4/3] overflow-hidden rounded-2xl bg-black/5 dark:bg-white/5 relative group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.alt || `Team photo ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-xs font-mono">{photo.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </AnimatedSection>
      )}

      {/* Interactive Guestbook / Drawing Pad Section */}
      <AnimatedSection delay={0.4} className="mt-32 pt-16 border-t border-black/10 dark:border-white/10 w-full relative z-10">

        <DrawingPad />

        <GuestbookGallery entries={guestbookEntries} />

      </AnimatedSection>

    </main>
  )
}
