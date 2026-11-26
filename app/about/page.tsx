/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import { getAboutData, getGuestbookEntries } from '@/sanity/lib/api'
import { urlForImage } from '@/sanity/lib/image'
import { PortableText } from '@portabletext/react'
import { AnimatedSection } from '@/components/AnimatedSection'
import DrawingPad from '@/components/DrawingPad'
import GuestbookGallery from '@/components/GuestbookGallery'
import InkTrail from '@/components/InkTrail'
import ScrambleText from '@/components/ScrambleText'
import StackCards from '@/components/StackCards'
import PixelPortrait from '@/components/PixelPortrait'

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


  const bioComponents = {
    block: {
      normal: ({ children }: any) => <p className="mb-3 leading-relaxed text-sm opacity-80">{children}</p>,
    }
  }

  const cards = [
    {
      title: 'Philosophy',
      body: (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-x-12 gap-y-8 items-start">
            {about?.philosophyImage?.url && (
              <div className="overflow-hidden rounded">
                <img
                  src={about.philosophyImage.url}
                  alt="Philosophy"
                  className="w-full object-cover"
                />
              </div>
            )}
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
          </div>
      ),
    },
    {
      title: 'Artist Statement',
      body: (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-x-12 gap-y-8 items-start">
            {about?.artistStatementImage?.url && (
              <div className="overflow-hidden rounded">
                <img
                  src={about.artistStatementImage.url}
                  alt="Artist Statement"
                  className="w-full object-cover"
                />
              </div>
            )}
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
                    Our work subverts this entire media consumption pattern, taking power back and challenging the viewer&apos;s conceptions of television—to be more mindful and critical of their consumption. In our work, we control the channels, the content on screen, and we radically switch up the physical context—from the comfort of the private lounge to the unpredictability, aliveness, and chaos of a public exhibition space or festival dancefloor. To further democratise the process, we turn viewers into participants, showing themselves mirrored by multiple camera feeds atop algorithmic imagery, sparking a deep sense of involvement and collaboration.
                  </p>
                </>
              )}
            </div>
          </div>
      ),
    },
    {
      title: 'Exhibitions & Events',
      body: (
          <div className="space-y-4 font-mono text-sm tracking-wide">
            {about?.exhibitions && about.exhibitions.length > 0 ? (
              about.exhibitions.map((ex, i) => (
                <div key={i} className="border-b border-black/5 dark:border-white/5 pb-4 flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-baseline">
                  <div>
                    <span className="opacity-50 mr-4">{ex.year}</span>
                    <span className="font-semibold uppercase">{ex.name}</span>
                  </div>
                  <span className="opacity-70 pl-0 sm:pl-4 shrink-0">{ex.location}</span>
                </div>
              ))
            ) : (
              <>
                <div className="border-b border-black/5 dark:border-white/5 pb-4 flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-baseline">
                  <div><span className="opacity-50 mr-4">2024</span><span className="font-semibold uppercase">Lumina Festival of Lights</span></div>
                  <span className="opacity-70 shrink-0">Berlin, DE</span>
                </div>
                <div className="border-b border-black/5 dark:border-white/5 pb-4 flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-baseline">
                  <div><span className="opacity-50 mr-4">2023</span><span className="font-semibold uppercase">Digital Mycology</span></div>
                  <span className="opacity-70 shrink-0">London, UK</span>
                </div>
                <div className="border-b border-black/5 dark:border-white/5 pb-4 flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-baseline">
                  <div><span className="opacity-50 mr-4">2022</span><span className="font-semibold uppercase">Echoes of the Network</span></div>
                  <span className="opacity-70 shrink-0">New York, NY</span>
                </div>
              </>
            )}
          </div>
      ),
    },
  ]

  return (
    <main className="min-h-screen pb-24 overflow-x-clip">

      {/* Header: threads grow wherever the cursor or a finger moves */}
      <section className="relative flex min-h-[70svh] items-end">
        <InkTrail />
        <div className="relative mx-auto flex w-full max-w-5xl flex-col justify-between gap-8 border-b border-black/10 px-4 pb-12 pt-32 sm:px-6 md:flex-row md:items-end dark:border-white/10">
          <div>
            <ScrambleText
              as="h1"
              text={title}
              duration={1400}
              className="block text-5xl font-bold leading-none tracking-tighter break-words md:text-8xl"
            />
          </div>
          <a
            href={`mailto:${email}`}
            className="inline-flex min-h-11 items-center font-mono text-sm uppercase tracking-widest underline-offset-4 hover:underline"
          >
            {email.replace(/\.[^.]+$/, '')} ↗
          </a>
        </div>
      </section>

      <div className="mx-auto mt-16 flex max-w-5xl flex-col gap-y-24 px-4 sm:px-6 md:mt-24">

        <StackCards cards={cards} />

        {/* Team: our portraits rest as pixels and reveal themselves under a cursor or a touch */}
        <AnimatedSection delay={0.3} className="flex flex-col gap-10 md:gap-12 md:border-t border-black/10 dark:border-white/10 md:pt-24">
          <div className="max-w-xl">
            <ScrambleText as="h2" text="The Network" className="block text-xl font-bold tracking-tight mb-2" />
            <div className="w-12 h-px bg-black dark:bg-white opacity-20"></div>
            <p className="mt-4 text-sm opacity-60">Key nodes in the Studio Pilz ecosystem.</p>
          </div>
          <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 sm:gap-8 lg:gap-12">
            {(about?.team ?? []).map((member) => (
              <article key={member.name} className="flex flex-col">
                {member.image ? (
                  <PixelPortrait
                    src={urlForImage(member.image).width(1000).height(1250).url()}
                    alt={member.name}
                    className="aspect-[4/5] w-full"
                  />
                ) : (
                  <div className="aspect-[4/5] w-full bg-black/5 dark:bg-white/5" />
                )}
                <ScrambleText as="h3" text={member.name} className="mt-6 block text-lg font-bold" />
                <p className="mb-4 font-mono text-xs uppercase tracking-widest opacity-50">{member.role}</p>
                {member.bio && <PortableText value={member.bio as any} components={bioComponents} />}
              </article>
            ))}
          </div>
        </AnimatedSection>

      {/* Interactive Guestbook / Drawing Pad Section */}
      <AnimatedSection delay={0.4} className="mt-32 md:pt-16 md:border-t border-black/10 dark:border-white/10 w-full relative z-10">

        <DrawingPad />

        <GuestbookGallery entries={guestbookEntries} />

      </AnimatedSection>

      </div>

    </main>
  )
}
