import { getProjects } from '@/sanity/lib/api'
import ProjectList from '@/components/ProjectList'
import { AnimatedSection } from '@/components/AnimatedSection'

export const revalidate = 60

export const metadata = {
  title: 'Work | Studio Pilz',
  description: 'Selected creative technology and design projects by Studio Pilz.',
}

export default async function WorkPage() {
  const projects = await getProjects()

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-16 border-b border-foreground/10 pb-8 flex flex-col md:flex-row items-baseline justify-between gap-4">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter">Projects</h1>
          <span className="font-mono text-sm tracking-widest uppercase opacity-50">Selected Works — 2021-Present</span>
        </div>
        
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
