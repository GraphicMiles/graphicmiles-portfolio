import { Children, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowUpRight, Github, Mail, Globe, MapPin, Terminal, MonitorPlay, Zap, Database } from "lucide-react";

// Components
import { ProjectVisuals } from "./components/ProjectVisuals";

// Schema for contact form
const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  message: z.string().min(10, "Message is required (min 10 chars)"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

function WorkTimeline({ children }: { children: ReactNode }) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const timeline = timelineRef.current;
    const overlay = overlayRef.current;
    if (!timeline || !overlay) return;

    let timelineTop = 0;
    let timelineHeight = 0;
    let currentReveal = 0;
    let targetReveal = 0;
    let frame = 0;
    let running = false;

    const measure = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const rect = timeline.getBoundingClientRect();
      timelineTop = rect.top + scrollY;
      timelineHeight = rect.height;
    };

    const computeTarget = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const triggerY = scrollY + window.innerHeight * 0.35;
      return Math.min(timelineHeight, Math.max(0, triggerY - timelineTop));
    };

    const onFrame = () => {
      targetReveal = computeTarget();
      currentReveal += (targetReveal - currentReveal) * 0.35;

      if (Math.abs(targetReveal - currentReveal) < 0.25) currentReveal = targetReveal;

      overlay.style.clipPath = `inset(0px 0px ${Math.max(0, timelineHeight - currentReveal)}px 0px)`;

      if (currentReveal !== targetReveal) {
        frame = requestAnimationFrame(onFrame);
      } else {
        running = false;
      }
    };

    const requestTick = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(onFrame);
    };

    const onResize = () => {
      measure();
      requestTick();
    };

    measure();
    requestTick();
    window.addEventListener("scroll", requestTick, { passive: true });
    window.addEventListener("resize", onResize);

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(timeline);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestTick);
      window.removeEventListener("resize", onResize);
      resizeObserver.disconnect();
    };
  }, []);

  const projectRows = Children.toArray(children);

  const renderLayer = (layer: "base" | "overlay") => (
    <div className={`work-timeline__layer work-timeline__layer--${layer}`}>
      {projectRows.map((project, index) => (
        <div className="timeline-row" key={`${layer}-project-${index}`}>
          <div className="timeline-node-col" aria-hidden="true">
            <span className="timeline-dot" />
            <span className="timeline-line" />
          </div>
          <div className="timeline-content">{project}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="work-timeline" ref={timelineRef}>
      {renderLayer("base")}
      <div ref={overlayRef} className="work-timeline__overlay" aria-hidden="true">
        {renderLayer("overlay")}
      </div>
    </div>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    const subject = encodeURIComponent(`Contact from ${data.name}`);
    const body = encodeURIComponent(`${data.message}\n\nFrom: ${data.name} (${data.email})`);
    window.location.href = `mailto:rfarouq69@gmail.com?subject=${subject}&body=${body}`;
  };

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen w-full bg-background selection:bg-primary selection:text-primary-foreground">
      <div className="noise-overlay" />

      {/* Navigation / Header */}
      <header className="site-nav">
        <div className="site-nav__inner">
          <a href="#hero" className="site-nav__brand" aria-label="Graphic Miles home">GRAPHIC MILES</a>
          <nav className="site-nav__links" aria-label="Primary navigation">
            <a href="#work" data-testid="link-nav-work">Work</a>
            <a href="#about" data-testid="link-nav-about">About</a>
            <a href="#contact" data-testid="link-nav-contact">Contact</a>
          </nav>
        </div>
      </header>

      <main className="site-main">
        {/* HERO SECTION */}
        <section id="hero" className="hero-section" aria-labelledby="hero-title">
          <div className="hero-section__inner">
            <div className="hero-section__left">
              <div className="hero-status">
                <span className="hero-status__dot" />
                <span>Available — Open to new builds</span>
              </div>

              <h1 id="hero-title" className="hero-title">
                Raji Farouq <br />
                <span>Adewunmi</span>
              </h1>

              <p className="hero-lede">
                Product designer and fullstack engineer building systems that scale.
              </p>
            </div>

            <aside className="hero-section__right" aria-label="Profile details">
              <div className="hero-meta">
                <span><MapPin className="hero-meta__icon" /> Lagos, NG — Available Worldwide</span>
                <span>Alias: Graphic Miles</span>
              </div>
            </aside>
          </div>
        </section>

        {/* WORK SECTION */}
        <section id="work" className="px-6 md:px-12 py-24 md:py-32 bg-muted/20">
          <div className="max-w-6xl mx-auto w-full">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="flex items-end justify-between mb-16 border-b border-border pb-6"
            >
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight uppercase">Selected Work</h2>
              <span className="font-mono text-sm text-muted-foreground">01</span>
            </motion.div>

            <WorkTimeline>
              {/* Project 3 - Toddler / ForgeAI (FEATURED) */}
              <ProjectCard 
                title="Toddler / ForgeAI"
                status="Live"
                featured={true}
                description="Local-first coding assistant for Android. Direct CPU llama.cpp inference via JNI — no cloud, no Ollama server. Token streaming, cancellation during prefill, CodeMirror VS Code-style editor, SAF workspace, SKILL.md import, approval-gated patches."
                tags={["On-Device LLM", "GGUF", "JNI", "CodeMirror", "SAF", "RAG", "Android"]}
                link="https://toddler-kappa.vercel.app"
                stack="React · Capacitor · JNI · llama.cpp · CodeMirror"
                visual={<ProjectVisuals.Toddler />}
              />

              {/* Project 1 - Nearspace */}
              <ProjectCard 
                title="Nearspace"
                status="Live"
                description="Proximity-first network helping creators find builders nearby. Geohash radius queries, presence via Firebase Realtime DB, offline-first PWA, installable on Android."
                tags={["Proximity", "Geohash", "Firebase", "Offline", "PWA", "Maps"]}
                link="https://nearspace.com.ng"
                stack="React Vite · Firebase · Leaflet · Geohash · PWA"
                visual={<ProjectVisuals.Nearspace />}
              />

              {/* Project 2 - Chan */}
              <ProjectCard 
                title="Chan — Watch Together"
                status="Live"
                description="Realtime sync watch party. Host around YouTube, invite viewers, chat together, switch to screen sharing via LiveKit. Moderate kick/promote/mute. Android packaged via Capacitor 8. MKV remux H.264/HEVC/VP9/AV1."
                tags={["LiveKit", "Realtime", "Firebase", "Capacitor", "Android APK", "HLS"]}
                link="https://chan-yz3p.vercel.app"
                stack="React Vite · Firebase · LiveKit · Capacitor"
                visual={<ProjectVisuals.Chan />}
              />
            </WorkTimeline>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="px-6 md:px-12 py-24 md:py-32">
          <div className="max-w-6xl mx-auto w-full">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="flex items-end justify-between mb-16 border-b border-border pb-6"
            >
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight uppercase">About & Philosophy</h2>
              <span className="font-mono text-sm text-muted-foreground">02</span>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-24">
              <div className="md:col-span-5 order-2 md:order-1 flex flex-col gap-8">
                <div className="aspect-[3/4] relative overflow-hidden bg-muted rounded-sm w-full max-w-md">
                  <img 
                    src="/images/raji-color.jpg" 
                    alt="Portrait of Raji Farouq Adewunmi" 
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                    loading="lazy"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4 border-t border-border pt-8">
                  <div>
                    <div className="text-3xl font-bold">3+</div>
                    <div className="text-xs font-mono text-muted-foreground uppercase mt-1">Years Shipping</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">3</div>
                    <div className="text-xs font-mono text-muted-foreground uppercase mt-1">Live Products</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">99.9<span className="text-sm">%</span></div>
                    <div className="text-xs font-mono text-muted-foreground uppercase mt-1">Uptime Focus</div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-7 order-1 md:order-2 space-y-12">
                <div>
                  <h3 className="text-xl font-bold mb-4 font-mono text-muted-foreground">02.1 // BIO</h3>
                  <p className="text-lg leading-[1.7] text-foreground/90 max-w-[66ch]">
                    I design and build proximity-first networks, realtime watch parties, and on-device AI tools — shipped to real users, not demos. 3+ years shipping production apps. Founder mindset: idea → design → build → ship → iterate. Obsessed with performance, offline-first, and clean interaction design.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4 font-mono text-muted-foreground">02.2 // PRINCIPLES</h3>
                  <ul className="space-y-4 text-lg">
                    <li className="flex gap-4 border-b border-border/50 pb-4">
                      <span className="font-mono text-muted-foreground">01</span>
                      <span className="font-medium">Make it correct. Then fast. Then beautiful.</span>
                    </li>
                    <li className="flex gap-4 border-b border-border/50 pb-4">
                      <span className="font-mono text-muted-foreground">02</span>
                      <span className="font-medium">Offline-first beats online-only. Every time.</span>
                    </li>
                    <li className="flex gap-4 border-b border-border/50 pb-4">
                      <span className="font-mono text-muted-foreground">03</span>
                      <span className="font-medium">Realtime is a feature, not a demo.</span>
                    </li>
                    <li className="flex gap-4 border-b border-border/50 pb-4">
                      <span className="font-mono text-muted-foreground">04</span>
                      <span className="font-medium">The best abstraction is the one you can delete.</span>
                    </li>
                    <li className="flex gap-4">
                      <span className="font-mono text-muted-foreground">05</span>
                      <span className="font-medium">Ship to 1 user {'>'} pitch to 100.</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4 font-mono text-muted-foreground">02.3 // WHAT I BUILD</h3>
                  <div className="grid gap-6">
                    <div className="bg-muted/30 p-6 rounded-sm border border-border/50">
                      <div className="flex items-center gap-3 mb-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        <h4 className="font-bold uppercase tracking-tight">Proximity Systems</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">Nearby maps, geohash queries, presence via Realtime DB, radius filtering, PWA offline.</p>
                    </div>
                    <div className="bg-muted/30 p-6 rounded-sm border border-border/50">
                      <div className="flex items-center gap-3 mb-2">
                        <MonitorPlay className="w-5 h-5 text-primary" />
                        <h4 className="font-bold uppercase tracking-tight">Realtime & Watch Party</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">Sync playback, chat, presence, LiveKit screen share, moderator controls, Android APK via Capacitor.</p>
                    </div>
                    <div className="bg-muted/30 p-6 rounded-sm border border-border/50">
                      <div className="flex items-center gap-3 mb-2">
                        <Terminal className="w-5 h-5 text-primary" />
                        <h4 className="font-bold uppercase tracking-tight">On-Device AI</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">Local GGUF inference, JNI native layer, token streaming, Android packaging, no cloud dependency.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4 font-mono text-muted-foreground">02.4 // STACK</h3>
                  <div className="flex flex-wrap gap-2">
                    {["React", "Next.js", "TypeScript", "Firebase", "Supabase", "Leaflet", "LiveKit", "Capacitor", "Three.js", "GSAP", "TailwindCSS", "Vercel", "PWA", "Geohash"].map((tech) => (
                      <span key={tech} className="px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="px-6 md:px-12 py-24 md:py-32 bg-primary text-primary-foreground">
          <div className="max-w-6xl mx-auto w-full">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="flex items-end justify-between mb-16 border-b border-primary-foreground/20 pb-6"
            >
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight uppercase">Let's Build</h2>
              <span className="font-mono text-sm text-primary-foreground/50">03</span>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
              <div>
                <p className="text-2xl md:text-3xl font-medium leading-tight mb-12 max-w-[20ch]">
                  I design and build proximity, realtime, and on-device products — from database and rules to APK and PWA. 
                </p>
                <p className="text-xl text-primary-foreground/70 mb-12 max-w-[30ch]">
                  If you have a hard distribution, sync, or offline problem, I'm in.
                </p>

                <div className="flex flex-col gap-6 font-mono">
                  <a href="mailto:rfarouq69@gmail.com" className="flex items-center gap-4 hover:opacity-70 transition-opacity group" data-testid="link-contact-email">
                    <div className="w-10 h-10 rounded-full border border-primary-foreground/20 flex items-center justify-center group-hover:bg-primary-foreground group-hover:text-primary transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span>rfarouq69@gmail.com</span>
                  </a>
                  <a href="https://github.com/GraphicMiles" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 hover:opacity-70 transition-opacity group" data-testid="link-contact-github">
                    <div className="w-10 h-10 rounded-full border border-primary-foreground/20 flex items-center justify-center group-hover:bg-primary-foreground group-hover:text-primary transition-colors">
                      <Github className="w-4 h-4" />
                    </div>
                    <span>github.com/GraphicMiles</span>
                  </a>
                  <a href="https://nearspace.com.ng" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 hover:opacity-70 transition-opacity group" data-testid="link-contact-website">
                    <div className="w-10 h-10 rounded-full border border-primary-foreground/20 flex items-center justify-center group-hover:bg-primary-foreground group-hover:text-primary transition-colors">
                      <Globe className="w-4 h-4" />
                    </div>
                    <span>nearspace.com.ng</span>
                  </a>
                </div>
              </div>

              <div>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="form-contact">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-mono uppercase tracking-wider text-primary-foreground/60">Name</label>
                    <input 
                      {...form.register("name")}
                      id="name"
                      type="text" 
                      className="w-full bg-transparent border-b border-primary-foreground/30 py-3 px-0 focus:outline-none focus:border-primary-foreground transition-colors placeholder:text-primary-foreground/20"
                      placeholder="Jane Doe"
                      data-testid="input-contact-name"
                    />
                    {form.formState.errors.name && (
                      <p className="text-red-400 text-sm mt-1">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-mono uppercase tracking-wider text-primary-foreground/60">Email</label>
                    <input 
                      {...form.register("email")}
                      id="email"
                      type="email" 
                      className="w-full bg-transparent border-b border-primary-foreground/30 py-3 px-0 focus:outline-none focus:border-primary-foreground transition-colors placeholder:text-primary-foreground/20"
                      placeholder="jane@example.com"
                      data-testid="input-contact-email"
                    />
                    {form.formState.errors.email && (
                      <p className="text-red-400 text-sm mt-1">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2 pt-2">
                    <label htmlFor="message" className="text-sm font-mono uppercase tracking-wider text-primary-foreground/60">Message</label>
                    <textarea 
                      {...form.register("message")}
                      id="message"
                      rows={4}
                      className="w-full bg-transparent border-b border-primary-foreground/30 py-3 px-0 focus:outline-none focus:border-primary-foreground transition-colors resize-none placeholder:text-primary-foreground/20"
                      placeholder="Tell me about the problem..."
                      data-testid="input-contact-message"
                    />
                    {form.formState.errors.message && (
                      <p className="text-red-400 text-sm mt-1">{form.formState.errors.message.message}</p>
                    )}
                  </div>

                  <button 
                    type="submit" 
                    className="mt-8 bg-primary-foreground text-primary px-8 py-4 font-bold tracking-wider uppercase text-sm flex items-center justify-between w-full hover:bg-primary-foreground/90 transition-colors group"
                    data-testid="button-contact-submit"
                  >
                    Send Message
                    <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </form>
              </div>
            </div>
            
            <div className="mt-32 pt-8 border-t border-primary-foreground/20 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-mono text-primary-foreground/50">
              <p>© {new Date().getFullYear()} Raji Farouq Adewunmi.</p>
              <p>Lagos, Nigeria.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

// Sub-components

interface ProjectCardProps {
  title: string;
  description: string;
  tags: string[];
  link: string;
  stack: string;
  status: string;
  featured?: boolean;
  visual: React.ReactNode;
}

function ProjectCard({ title, description, tags, link, stack, status, featured, visual }: ProjectCardProps) {
  return (
    <motion.div 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeInUp}
      className="group"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
        <div className="lg:col-span-7 order-2 lg:order-1">
          <div className="w-full aspect-video md:aspect-[4/3] rounded-sm overflow-hidden bg-background border border-border shadow-sm p-2 relative">
            {visual}
          </div>
        </div>
        
        <div className="lg:col-span-5 order-1 lg:order-2 flex flex-col pt-4">
          <div className="flex items-center gap-3 mb-4">
            {featured && (
              <span className="px-2 py-0.5 bg-foreground text-background text-[10px] font-bold uppercase tracking-wider rounded-sm">Featured</span>
            )}
            <span className="flex items-center gap-1.5 text-xs font-mono border border-border px-2 py-0.5 rounded-sm bg-muted/50">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              {status}
            </span>
          </div>
          
          <h3 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">{title}</h3>
          
          <p className="text-base text-muted-foreground mb-6 font-mono">
            {stack}
          </p>
          
          <p className="text-lg leading-relaxed mb-8 max-w-[60ch]">
            {description}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-10">
            {tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-muted text-foreground text-xs font-mono rounded-full border border-border/50">
                {tag}
              </span>
            ))}
          </div>
          
          <div className="mt-auto">
            <a 
              href={link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 border-b-2 border-primary pb-1 font-bold uppercase tracking-wider text-sm hover:text-muted-foreground hover:border-muted-foreground transition-colors group-hover:gap-4 duration-300"
              data-testid={`link-project-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
            >
              View Live App
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
