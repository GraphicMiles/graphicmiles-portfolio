import type { ReactNode } from 'react'

type FolderProps = {
  tone: 'black' | 'red'
  flipped?: boolean
  layer: 'back' | 'front'
}

function Navbar() {
  return <header className="navbar" aria-label="Site navigation" />
}

function Folder({ tone, flipped = false, layer }: FolderProps) {
  return <div className={`folder folder--${tone} folder--${layer} ${flipped ? 'folder--flipped' : ''}`} aria-label={`${tone} portfolio folder`} role="img" />
}

function MainContainer({ children }: { children: ReactNode }) {
  return <main className="main-container">{children}</main>
}

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <MainContainer>
        <Folder tone="black" layer="back" />
        <Folder tone="red" layer="front" flipped />
      </MainContainer>
    </div>
  )
}
