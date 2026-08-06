import type { ReactNode } from 'react'

function Navbar() {
  return <header className="navbar" aria-label="Site navigation" />
}

function Folder() {
  return <div className="folder" aria-label="Portfolio folder" role="img" />
}

function MainContainer({ children }: { children: ReactNode }) {
  return <main className="main-container">{children}</main>
}

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <MainContainer>
        <Folder />
      </MainContainer>
    </div>
  )
}
