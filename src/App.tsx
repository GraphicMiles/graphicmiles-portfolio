import { Children, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { process, principles, profile, projects, tools, type Project } from './content'
import { ProjectVisuals } from './components/ProjectVisuals'

const navigation = [
  { id: 'work', label: 'Work' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
]

function ArrowUpRight({ size = 15 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 12.5 12.5 3.5M5 3.5h7.5V11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

function ArrowRight({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2.5 8h10M8.75 4.25 12.5 8l-3.75 3.75" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

function MapPin() {
  return <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 14s4-3.46 4-7a4 4 0 1 0-8 0c0 3.54 4 7 4 7Z" stroke="currentColor" strokeWidth="1.2" /><circle cx="8" cy="7" r="1.4" stroke="currentColor" strokeWidth="1.2" /></svg>
}

function SectionHeading({ number, label, title, detail }: { number: string; label: string; title: string; detail: string }) {
  return (
    <header className="section-heading">
      <span className="section-heading__number">{number}</span>
      <div>
        <p className="eyebrow">{label}</p>
        <h2>{title}</h2>
      </div>
      <p className="section-heading__detail">{detail}</p>
    </header>
  )
}

function ProjectRow({ project }: { project: Project }) {
  const Visual = project.id === 'forgeai' ? ProjectVisuals.ForgeAI : project.id === 'nearspace' ? ProjectVisuals.Nearspace : ProjectVisuals.Chan

  return (
    <article className="project-row-card">
      <div className="project-row-card__copy">
        <div className="project-row-card__kicker"><span>{project.number}</span><span className="status"><i />{project.status}</span></div>
        <h3>{project.title}</h3>
        <p className="project-summary">{project.summary}</p>
        <p className="project-description">{project.description}</p>
        <dl className="project-facts">
          <div><dt>Role</dt><dd>{project.role}</dd></div>
          <div><dt>Built with</dt><dd>{project.stack}</dd></div>
          <div><dt>Platform</dt><dd>{project.platform}</dd></div>
        </dl>
        <div className="project-row-card__footer">
          <div className="project-tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
          <a className="text-link" href={project.link} target="_blank" rel="noreferrer">Open project <ArrowUpRight /></a>
        </div>
      </div>
      <div className="project-row-card__visual"><Visual /></div>
    </article>
  )
}

function WorkTimeline({ children }: { children: ReactNode }) {
  const timelineRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const timeline = timelineRef.current
    const overlay = overlayRef.current
    if (!timeline || !overlay) return

    let timelineTop = 0
    let timelineHeight = 0
    let currentReveal = 0
    let targetReveal = 0
    let frame = 0
    let running = false

    const measure = () => {
      const rect = timeline.getBoundingClientRect()
      timelineTop = rect.top + (window.scrollY || window.pageYOffset)
      timelineHeight = rect.height
    }

    const computeTarget = () => {
      const triggerY = (window.scrollY || window.pageYOffset) + window.innerHeight * 0.35
      return Math.min(timelineHeight, Math.max(0, triggerY - timelineTop))
    }

    const onFrame = () => {
      targetReveal = computeTarget()
      currentReveal += (targetReveal - currentReveal) * 0.35
      if (Math.abs(targetReveal - currentReveal) < 0.25) currentReveal = targetReveal
      overlay.style.clipPath = `inset(0 0 ${Math.max(0, timelineHeight - currentReveal)}px 0)`

      if (currentReveal !== targetReveal) frame = requestAnimationFrame(onFrame)
      else running = false
    }

    const requestTick = () => {
      if (running) return
      running = true
      frame = requestAnimationFrame(onFrame)
    }

    const onResize = () => {
      measure()
      requestTick()
    }

    measure()
    requestTick()
    window.addEventListener('scroll', requestTick, { passive: true })
    window.addEventListener('resize', onResize)
    const resizeObserver = new ResizeObserver(onResize)
    resizeObserver.observe(timeline)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', requestTick)
      window.removeEventListener('resize', onResize)
      resizeObserver.disconnect()
    }
  }, [])

  const rows = Children.toArray(children)
  const renderLayer = (type: 'base' | 'overlay') => (
    <div className={`work-timeline__layer work-timeline__layer--${type}`}>
      {rows.map((row, index) => (
        <div className="timeline-row" key={`${type}-${index}`}>
          <div className="timeline-node-col" aria-hidden="true"><span className="timeline-dot" /><span className="timeline-line" /></div>
          <div className="timeline-content">{row}</div>
        </div>
      ))}
    </div>
  )

  return <div className="work-timeline" ref={timelineRef}>{renderLayer('base')}<div className="work-timeline__overlay" ref={overlayRef} aria-hidden="true">{renderLayer('overlay')}</div></div>
}

function InlineLink({ href, children, external = false }: { href: string; children: ReactNode; external?: boolean }) {
  return <a className="inline-link" href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>{children}<ArrowUpRight size={13} /></a>
}

export default function App() {
  const [active, setActive] = useState('work')

  useEffect(() => {
    const elements = navigation.map(({ id }) => document.getElementById(id)).filter((element): element is HTMLElement => Boolean(element))
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (visible) setActive(visible.target.id)
    }, { rootMargin: '-18% 0px -68% 0px', threshold: [0.1, 0.35, 0.65] })
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="portfolio-shell">
      <a className="skip-link" href="#main">Skip to content</a>

      <header className="site-nav">
        <div className="site-nav__inner">
          <a className="site-nav__brand" href="#top" aria-label="Graphic Miles home">GRAPHIC MILES</a>
          <nav className="site-nav__links" aria-label="Primary navigation">
            {navigation.map((item) => <a className={active === item.id ? 'is-active' : ''} href={`#${item.id}`} key={item.id}>{item.label}</a>)}
          </nav>
        </div>
      </header>

      <main id="main" className="site-main">
        <section className="hero-section" id="top" aria-labelledby="hero-title">
          <div className="hero-section__inner">
            <div className="hero-section__left">
              <div className="hero-status"><span className="hero-status__dot" />Available — open to new builds</div>
              <h1 id="hero-title" className="hero-title">Raji Farouq<br /><span>Adewunmi</span></h1>
              <p className="hero-lede">Product designer and fullstack engineer building systems that scale.</p>
            </div>
            <aside className="hero-section__right" aria-label="Profile details">
              <div className="hero-meta"><span><MapPin /> Lagos, NG — Available Worldwide</span><span>Alias: Graphic Miles</span></div>
            </aside>
          </div>
        </section>

        <section className="section work-section" id="work" aria-labelledby="work-title">
          <div className="page-width">
            <SectionHeading number="01" label="Selected work" title="A few things I have shipped." detail="Three live products, from product thinking to production code." />
            <h2 id="work-title" className="sr-only">Selected work</h2>
            <WorkTimeline>{projects.map((project) => <ProjectRow project={project} key={project.id} />)}</WorkTimeline>
          </div>
        </section>

        <section className="section about-section" id="about" aria-labelledby="about-title">
          <div className="page-width">
            <SectionHeading number="02" label="About" title="The work is practical on purpose." detail="Design the interface. Respect the system underneath it." />
            <h2 id="about-title" className="sr-only">About Graphic Miles</h2>
            <div className="about-layout">
              <div className="about-copy"><p className="about-lede">I care about the parts of a product users do not name — confidence, speed, and recovery when something goes wrong.</p><p>I’m a product designer and fullstack engineer based in Lagos. I work across interface, data, realtime behavior, and the release path that gets a product into someone’s hands.</p><div className="about-links"><InlineLink href={profile.github} external>GitHub</InlineLink><InlineLink href={`mailto:${profile.email}`}>Get in touch</InlineLink></div></div>
              <div className="about-aside"><figure className="about-portrait"><img src="/images/raji-bw.jpg" alt="Black and white portrait of Raji Farouq Adewunmi" loading="lazy" /><figcaption>Graphic Miles / Lagos</figcaption></figure><div className="principles"><div className="small-label">Working principles</div><ol>{principles.map((principle, index) => <li key={principle}><span>0{index + 1}</span><strong>{principle}</strong></li>)}</ol></div><div className="tools"><div className="small-label">Tools I use</div><div className="tool-list">{tools.map((tool) => <span key={tool}>{tool}</span>)}</div></div></div>
            </div>
          </div>
        </section>

        <section className="section process-section" id="process" aria-labelledby="process-title">
          <div className="page-width">
            <SectionHeading number="03" label="How I work" title="Small loops. Solid outcomes." detail="A clear path from the first question to the first useful release." />
            <h2 id="process-title" className="sr-only">How I work</h2>
            <div className="process-list">{process.map(([number, title, body]) => <article className="process-item" key={number}><span>{number}</span><div><h3>{title}</h3><p>{body}</p></div></article>)}</div>
          </div>
        </section>

        <section className="contact-section" id="contact" aria-labelledby="contact-title">
          <div className="page-width contact-inner"><div><p className="eyebrow eyebrow--light">04 / Contact</p><h2 id="contact-title">Have a useful problem? <em>Let’s talk.</em></h2></div><div className="contact-details"><p>Tell me what you are building, where it is stuck, and what a useful next release would look like.</p><a className="contact-email" href={`mailto:${profile.email}`}>{profile.email}<ArrowUpRight size={19} /></a><div className="contact-links"><InlineLink href={profile.github} external>GitHub</InlineLink><InlineLink href="https://nearspace.com.ng" external>Nearspace</InlineLink><InlineLink href={`mailto:${profile.email}`}>Email</InlineLink></div></div></div>
        </section>
      </main>

      <footer className="site-footer page-width"><span>© {new Date().getFullYear()} {profile.name} / Graphic Miles</span><span><MapPin /> {profile.location}</span><a href="#top">Back to top ↑</a></footer>
    </div>
  )
}
