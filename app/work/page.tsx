import { getProjects, getAboutData } from '@/sanity/lib/api'
import ProjectList from '@/components/ProjectList'
import { AnimatedSection } from '@/components/AnimatedSection'

export const revalidate = 60

export const metadata = {
  title: 'Work | Studio Pilz',
  description: 'Selected creative technology and design projects by Studio Pilz.',
}

const OFFERINGS = [
  {
    title: 'Installations',
    description: 'Site-specific interactive works. Generative visuals, CRT signal chains, sensor-driven environments, and live AV systems for museums, exhibitions and festivals.',
  },
  {
    title: 'Web Development',
    description: 'Custom websites, web apps, and digital experiences. From concept to deployment. Clean, performant, and uniquely customized.',
  },
  {
    title: 'Design',
    description: 'Visual identity, graphic design, and art direction. We bridge the conceptual with the physical. From screen to print to space.',
  },
]

const FALLBACK_SKILLS = [
  'TouchDesigner', 'Python', 'JS / p5.js', 'local LLMs (Whisper, Ollama)',
  'Blender / 3D Modelling', '3D Printing / Fabrication', 'CRT signal chain',
  'OSC', 'Audio-reactive systems', 'Web Development (React, APIs, etc.)',
  'Adobe CC', 'AI image & video generation tools'
]

export default async function WorkPage() {
  const [projects, about] = await Promise.all([getProjects(), getAboutData()])
  const skills = about?.skills?.length ? about.skills : FALLBACK_SKILLS

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-16 border-b border-foreground/10 pb-8 flex flex-col md:flex-row items-baseline justify-between gap-4">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter">Work</h1>
        </div>

        {/* Offerings */}
        <AnimatedSection className="mb-24">
          <div className="mb-10">
            <h2 className="text-xl font-bold tracking-tight mb-2">Offerings</h2>
            <div className="w-12 h-px bg-black dark:bg-white opacity-20"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {OFFERINGS.map((o) => (
              <div key={o.title} className="border border-foreground/10 p-6">
                <h3 className="font-bold text-lg mb-3">{o.title}</h3>
                <p className="text-sm opacity-70 leading-relaxed">{o.description}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Technical Practice */}
        <AnimatedSection delay={0.1} className="mb-24">
          <div className="mb-10">
            <h2 className="text-xl font-bold tracking-tight mb-2">Technical Practice</h2>
            <div className="w-12 h-px bg-black dark:bg-white opacity-20"></div>
            <p className="mt-4 text-sm opacity-60">The primary tools and mediums that form our ecosystem.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {skills.map((skill, i) => (
              <div
                key={i}
                className="px-4 py-2 border border-foreground/15 rounded-full text-sm font-mono hover:bg-foreground/5 hover:border-foreground/30 transition-colors"
              >
                {skill}
              </div>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.15} className="mb-12 border-t border-foreground/10 pt-12">
          <h2 className="text-xl font-bold tracking-tight">Projects</h2>
        </AnimatedSection>

        <ProjectList projects={projects} />

        <AnimatedSection delay={0.2} className="mt-32 border-t border-foreground/10 pt-24 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">About the Work</h2>
              <div className="w-12 h-px bg-black dark:bg-white opacity-20 mb-6"></div>
              <p className="font-mono text-xs uppercase tracking-widest opacity-60">Practice & Methodology</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-16 text-lg text-foreground/80 leading-relaxed">
              
              <div>
                <h3 className="text-xl font-bold mb-4 text-foreground">Tech Stack & Tools</h3>
                <p className="mb-4">
                  There is always a software and a hardware component to our work. We heavily utilize <strong>TouchDesigner</strong> as our "Quarterback", orchestrating and collating all sources and tools.
                </p>
                <p>
                  We build custom signal chains blending Python scripts, creative coding libraries (like p5.js), local LLMs (Ollama, Whisper), and vintage CRT video synthesis alongside modern web technologies and APIs.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4 text-foreground">Conceptual Interests</h3>
                <p>
                  Our work explores the tension between the forgotten analog and the modern digital. We subvert traditional broadcast media consumption patterns—taking power back and challenging a viewer’s conception of observation and participation, often using AI and surveillance aesthetics to provoke critical thought around technology.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4 text-foreground">Working Methodology</h3>
                <p>
                  I/O (Inputs and Outputs) sits at the core of the art we make. What information are we inputting, and what mechanisms parse this to form a captivating output? We use dynamic human inputs (movement, language, fine motor control of knobs and sliders) alongside environmental data (heat, light, noise) to drive generative systems.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4 text-foreground">Hardware & Fabrication</h3>
                <p>
                  To complement and modify salvaged analog hardware (like our flagship CRT Televisions), we utilize industrial design processes. 3D modeling, CAD, material research, and 3D printing grant us total freedom to ideate and build new physical interfaces tailored to unique, interactive use cases.
                </p>
              </div>

            </div>
          </div>
        </AnimatedSection>
      </div>
    </main>
  )
}
