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

  const fallbackSkills = [
    'TouchDesigner', 'Python', 'JS / p5.js', 'local LLMs (Whisper, Ollama)', 
    'Blender / 3D Modelling', '3D Printing / Fabrication', 'CRT signal chain', 
    'OSC', 'Audio-reactive systems', 'Web Development (React, APIs, etc.)', 
    'Adobe CC', 'AI image & video generation tools'
  ]

  const skillsToRender = about?.skills && about.skills.length > 0 ? about.skills : fallbackSkills

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
              <PortableText value={about.philosophy as any} components={components} />
            ) : (
              <>
                <p className="mb-6 leading-relaxed text-lg">
                  Gathering data and information from the environment to create novel, generative visuals and sounds. From a more open-ended approach, we explain that as artists we have been working in these spaces, employing a diverse tech stack, techniques, tools, and processes.
                </p>
                <p className="mb-6 leading-relaxed text-lg">
                  The data is fed into TouchDesigner—this software acts as our composer or Quarterback, orchestrating and collating all sources and other tools, defining and holding the logic and structure of the system. I/O inputs and outputs are at the core of the art we make: what information are we inputting, and what mechanisms change or parse this information to form an interesting, visually striking, engaging, thought-provoking or convention-defying output.
                </p>
                <p className="mb-6 leading-relaxed text-lg">
                  We are particularly interested in dynamic human inputs (movement, sound, language, even fine-motor-skill adjustments of parameter controls like knobs, switches, and sliders), as well as environmental factors—heat, humidity, air pollution, noise, population density, and light. There is always a software and hardware component to our work.
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
              <PortableText value={about.artistStatement as any} components={components} />
            ) : (
              <>
                <p className="mb-6 leading-relaxed text-lg">
                  We take advantage of our unique perspectives as digital natives born into a world where floppy disks, dial-up, VCRs, landlines, and FAX machines were still used alongside the burgeoning world-wide-web. We aim to explore the relationships between the forgotten analog and the modern digital, and how humans interact and shape our lives around such ubiquitous yet often transitory technologies.
                </p>
                <p className="mb-6 leading-relaxed text-lg">
                  Up until now, we have worked primarily with vintage CRT Televisions—a technology that has been largely abandoned. We derive great pleasure and satisfaction in giving this old tech another shot at life, demonstrating the huge value it still has in bringing joy to people, subverting expectations, and provoking critical thought around technology and media consumption. Television has historically been one of the most powerful tools for propaganda, with media production and presentation almost entirely a top-down exercise. 
                </p>
                <p className="mb-6 leading-relaxed text-lg">
                  Our work subverts this entire media consumption pattern, taking power back and challenging the viewer's conceptions of television—to be more mindful and critical of their consumption. In our work, we control the channels, the content on screen, and we radically switch up the physical context—from the comfort of the private lounge to the unpredictability, aliveness, and chaos of a public exhibition space or festival dancefloor. To further democratise the process, we turn viewers into participants, showing themselves mirrored by multiple camera feeds atop algorithmic imagery, sparking a deep sense of involvement and collaboration.
                </p>
              </>
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

        {/* Skills & Technical Capabilities */}
        <AnimatedSection delay={0.25} className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-x-12 gap-y-8 border-t border-black/10 dark:border-white/10 pt-24">
          <div>
            <h2 className="text-xl font-bold tracking-tight mb-2">Technical Practice</h2>
            <div className="w-12 h-px bg-black dark:bg-white opacity-20"></div>
            <p className="mt-4 text-sm opacity-60">The primary tools and mediums that form our ecosystem.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {skillsToRender.map((skill, index) => (
              <div 
                key={index}
                className="px-4 py-2 border border-foreground/15 rounded-full text-sm font-mono hover:bg-foreground/5 hover:border-foreground/30 transition-colors"
              >
                {skill}
              </div>
            ))}
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
                  {member.bio && (
                    <details className="text-sm opacity-80 leading-relaxed mt-4 cursor-pointer group/details outline-none">
                      <summary className="font-semibold select-none list-none text-foreground/60 hover:text-foreground transition-colors flex items-center gap-2">
                        + Read full bio
                      </summary>
                      <div className="pt-4 prose prose-sm dark:prose-invert max-w-none text-foreground/80 border-t border-foreground/10 mt-4">
                        <PortableText value={member.bio as any} components={components} />
                      </div>
                    </details>
                  )}
                </div>
              ))
            ) : (
              <>
                <div className="group">
                  <div className="aspect-[4/5] w-full mb-4 overflow-hidden bg-black/10 dark:bg-white/10"></div>
                  <h3 className="text-lg font-bold">Liam Strickland</h3>
                  <p className="font-mono text-xs tracking-widest uppercase opacity-50 mb-3">Creative Technologist</p>
                  <details className="text-sm opacity-80 leading-relaxed mt-4 cursor-pointer group/details outline-none">
                    <summary className="font-semibold select-none list-none text-foreground/60 hover:text-foreground transition-colors flex items-center gap-2">
                      + Read full bio
                    </summary>
                    <div className="pt-4 prose prose-sm dark:prose-invert max-w-none text-foreground/80 border-t border-foreground/10 mt-4">
                      <p>Liam brings a strong background in software engineering and creative coding. Exploring intersections of data and human presence...</p>
                    </div>
                  </details>
                </div>
                <div className="group">
                  <div className="aspect-[4/5] w-full mb-4 overflow-hidden bg-black/10 dark:bg-white/10"></div>
                  <h3 className="text-lg font-bold">Lisbeth Purrucker</h3>
                  <p className="font-mono text-xs tracking-widest uppercase opacity-50 mb-3">Experience Designer & Maker</p>
                  <details className="text-sm opacity-80 leading-relaxed mt-4 cursor-pointer group/details outline-none">
                    <summary className="font-semibold select-none list-none text-foreground/60 hover:text-foreground transition-colors flex items-center gap-2">
                      + Read full bio
                    </summary>
                    <div className="pt-4 prose prose-sm dark:prose-invert max-w-none text-foreground/80 border-t border-foreground/10 mt-4">
                      <p>Lisbeth specializes in spatial design, 3D fabrication, and bridging the conceptual with the physical embodiment of the artwork...</p>
                    </div>
                  </details>
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
