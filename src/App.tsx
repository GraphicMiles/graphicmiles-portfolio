import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type KeyboardEvent } from 'react'

const projects = [
  {
    id: 'forgeai',
    number: '01 / 03',
    title: 'Toddler / ForgeAI',
    label: 'Local-first AI',
    description: 'An Android coding assistant that keeps inference on the device. JNI, llama.cpp, token streaming, and an approval-gated workspace.',
    role: 'Product design · mobile engineering',
    stack: 'React · Capacitor · JNI · llama.cpp',
    link: 'https://toddler-kappa.vercel.app',
    accent: 'page-accent--yellow',
  },
  {
    id: 'nearspace',
    number: '02 / 03',
    title: 'Nearspace',
    label: 'Proximity network',
    description: 'A professional network for Nigerian creators. Find builders nearby, make an orbit, and keep the useful parts working offline.',
    role: 'Product design · frontend · architecture',
    stack: 'React · Firebase · Leaflet · Geohash',
    link: 'https://nearspace.com.ng',
    accent: 'page-accent--green',
  },
  {
    id: 'chan',
    number: '03 / 03',
    title: 'Chan — Watch Together',
    label: 'Realtime rooms',
    description: 'A shared watch room with synchronized playback, chat, presence, and LiveKit screen share, packaged for Android.',
    role: 'Product design · realtime engineering',
    stack: 'React · Firebase · LiveKit · Capacitor',
    link: 'https://chan-yz3p.vercel.app',
    accent: 'page-accent--blue',
  },
]

type Turn = { direction: 'next' | 'prev'; from: number; to: number; phase: 'start' | 'animate' }

function Arrow({ direction }: { direction: 'next' | 'prev' }) {
  return <span aria-hidden="true">{direction === 'next' ? '→' : '←'}</span>
}

function ProjectPage({ project }: { project: typeof projects[number] }) {
  return (
    <article className="page-sheet">
      <div className="page-sheet__topline"><span>{project.number}</span><span>GRAPHIC MILES / PROJECT FILE</span></div>
      <div className="page-sheet__main">
        <div className="page-sheet__copy">
          <p className="page-label">{project.label}</p>
          <h2>{project.title}</h2>
          <p className="page-sheet__description">{project.description}</p>
          <dl className="page-facts"><div><dt>Role</dt><dd>{project.role}</dd></div><div><dt>Stack</dt><dd>{project.stack}</dd></div></dl>
          <a className="page-link" href={project.link} target="_blank" rel="noreferrer">Open project <Arrow direction="next" /></a>
        </div>
        <div className={`page-accent ${project.accent}`} aria-hidden="true"><span>{project.id === 'forgeai' ? 'LOCAL' : project.id === 'nearspace' ? 'NEAR' : 'SYNC'}</span><strong>0{project.number.charAt(0)}</strong><small>{project.id === 'forgeai' ? 'DEVICE' : project.id === 'nearspace' ? 'SPACE' : 'ROOM'}</small></div>
      </div>
      <div className="page-sheet__bottomline"><span>01—26</span><span>Raji Farouq Adewunmi</span></div>
    </article>
  )
}

export default function App() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [turn, setTurn] = useState<Turn | null>(null)
  const [isLifted, setIsLifted] = useState(false)
  const longPress = useRef<number | undefined>(undefined)
  const pointerStart = useRef<{ x: number; y: number } | null>(null)

  const openFolder = () => setIsOpen(true)
  const closeFolder = () => { setIsOpen(false); setTurn(null); setIsLifted(false) }

  const turnPage = (direction: 'next' | 'prev') => {
    if (!isOpen || turn) return
    const nextIndex = direction === 'next' ? activeIndex + 1 : activeIndex - 1
    if (nextIndex < 0 || nextIndex >= projects.length) return
    setTurn({ direction, from: activeIndex, to: nextIndex, phase: 'start' })
    requestAnimationFrame(() => requestAnimationFrame(() => setTurn((current) => current ? { ...current, phase: 'animate' } : current)))
  }

  const finishTurn = () => {
    if (!turn) return
    setActiveIndex(turn.to)
    setTurn(null)
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isOpen) return
    pointerStart.current = { x: event.clientX, y: event.clientY }
    event.currentTarget.setPointerCapture?.(event.pointerId)
    longPress.current = window.setTimeout(() => setIsLifted(true), 420)
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (longPress.current) window.clearTimeout(longPress.current)
    const start = pointerStart.current
    pointerStart.current = null
    setIsLifted(false)
    if (!start || !isOpen) return
    const deltaX = event.clientX - start.x
    const deltaY = event.clientY - start.y
    if (Math.abs(deltaX) > 44 && Math.abs(deltaX) > Math.abs(deltaY)) turnPage(deltaX < 0 ? 'next' : 'prev')
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); isOpen ? closeFolder() : openFolder() }
    if (event.key === 'Escape' && isOpen) closeFolder()
    if (event.key === 'ArrowRight') { event.preventDefault(); turnPage('next') }
    if (event.key === 'ArrowLeft') { event.preventDefault(); turnPage('prev') }
  }

  useEffect(() => () => { if (longPress.current) window.clearTimeout(longPress.current) }, [])

  const baseIndex = turn?.direction === 'next' ? turn.to : activeIndex
  const turningIndex = turn?.direction === 'next' ? turn.from : turn?.to

  return (
    <main className="folder-site">
      <h1 className="sr-only">Graphic Miles portfolio folder</h1>
      <div className={`folder-stage ${isOpen ? 'is-open' : ''} ${isLifted ? 'is-lifted' : ''}`} role="button" tabIndex={0} aria-label={isOpen ? 'Portfolio folder open. Use arrow keys to turn pages, Escape to close.' : 'Open Graphic Miles portfolio folder'} onClick={() => isOpen ? undefined : openFolder()} onKeyDown={handleKeyDown} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}>
        <div className="folder-tab" aria-hidden="true" />
        <div className="folder-body">
          <div className="paper-stack" aria-live="polite">
            <span className="paper paper--back" aria-hidden="true" />
            <span className="paper paper--middle" aria-hidden="true" />
            <div className="page-base"><ProjectPage project={projects[baseIndex]} /></div>
            {turn && turningIndex !== undefined && <div className={`turning-page turning-page--${turn.direction} ${turn.phase === 'animate' ? 'is-animating' : ''}`} onTransitionEnd={finishTurn}><ProjectPage project={projects[turningIndex]} /></div>}
          </div>
          {isOpen && <div className="folder-controls" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()}><button type="button" onClick={() => turnPage('prev')} disabled={activeIndex === 0 || Boolean(turn)} aria-label="Previous project"><Arrow direction="prev" /></button><span>{activeIndex + 1} / {projects.length}</span><button type="button" onClick={() => turnPage('next')} disabled={activeIndex === projects.length - 1 || Boolean(turn)} aria-label="Next project"><Arrow direction="next" /></button></div>}
        </div>
      </div>
    </main>
  )
}
