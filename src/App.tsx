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

function MainContainer({ children }: { children: ReactNode }) {
  return <main className="main-container"><div className="folder-stack">{children}</div></main>
}

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <MainContainer>
        <Folder orientation="right" backgroundColor="#063f36" label="2026" labelColor="#e6f2df" />
        <Folder orientation="left" backgroundColor="#9ac8b0" label="Projects" />
        <Folder orientation="right" backgroundColor="#d9d2c7" label="Contact" />
        <Folder orientation="left" backgroundColor="#a7cfb9" label="About" />
      </MainContainer>
    </div>
  )
}
