import type { CSSProperties, ReactNode } from 'react'

type FolderProps = {
  orientation: 'left' | 'right'
  backgroundColor: string
  label: string
  children?: ReactNode
  labelColor?: string
}

const folderCollection = [
  { label: '2026', orientation: 'right' as const, backgroundColor: '#063f36', labelColor: '#e6f2df' },
  { label: 'Projects', orientation: 'left' as const, backgroundColor: '#9ac8b0' },
  { label: 'Contact', orientation: 'right' as const, backgroundColor: '#d9d2c7' },
  { label: 'About', orientation: 'left' as const, backgroundColor: '#a7cfb9' },
  { label: 'Branding', orientation: 'right' as const, backgroundColor: '#0b4b40', labelColor: '#e6f2df' },
  { label: 'Packaging', orientation: 'left' as const, backgroundColor: '#b7d3c1' },
  { label: 'Content', orientation: 'right' as const, backgroundColor: '#d9d2c7' },
  { label: 'Illustration', orientation: 'left' as const, backgroundColor: '#9ac8b0' },
  { label: 'Archive', orientation: 'right' as const, backgroundColor: '#0b4b40', labelColor: '#e6f2df' },
  { label: 'Portfolio', orientation: 'left' as const, backgroundColor: '#ff424b', labelColor: '#fff' },
]

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
        {folderCollection.map((folder, index) => (
          <Folder key={folder.label} {...folder}>
            {index === folderCollection.length - 1 ? <CoverContent /> : null}
          </Folder>
        ))}
      </MainContainer>
    </div>
  )
}
