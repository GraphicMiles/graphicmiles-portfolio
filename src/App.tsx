import type { CSSProperties, ReactNode } from 'react'

type FolderProps = {
  orientation: 'left' | 'right'
  backgroundColor: string
  label: string
  children?: ReactNode
  labelColor?: string
}

function Navbar() {
  return <header className="navbar" aria-label="Site navigation" />
}

function Folder({ orientation, backgroundColor, label, children, labelColor = '#0b302a' }: FolderProps) {
  const style = {
    '--folder-color': backgroundColor,
    '--folder-label-color': labelColor,
  } as CSSProperties

  return (
    <section className={`folder folder--${orientation}`} style={style} aria-label={`${label} folder`}>
      <span className="folder__label">{label}</span>
      <div className="folder__content">{children}</div>
    </section>
  )
}

function CoverContent() {
  return (
    <div className="folder-cover" aria-label="Portfolio cover">
      <p className="folder-cover__credit">Designed By<br /><strong>Miles</strong></p>
      <h1>Portfolio <span>*</span></h1>
    </div>
  )
}

function MainContainer({ children }: { children: ReactNode }) {
  return <main className="main-container"><div className="folder-stack">{children}</div></main>
}

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <MainContainer>
        <Folder orientation="left" backgroundColor="#ff424b" label="Portfolio" labelColor="#fff">
          <CoverContent />
        </Folder>
      </MainContainer>
    </div>
  )
}
