function Navbar() {
  return (
    <header className="navbar">
      <nav className="navbar__links" aria-label="Primary navigation">
        <a href="#about">about</a>
        <a href="#project">Project</a>
        <a href="#contact">Contact</a>
      </nav>
    </header>
  )
}

export default function App() {
  return (
    <div className="app">
      <Navbar />
    </div>
  )
}
