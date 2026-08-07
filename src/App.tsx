const navItems = [
  { href: '#about', label: 'about', icon: 'fa-regular fa-circle-user' },
  { href: '#project', label: 'Project', icon: 'fa-regular fa-folder-open' },
  { href: '#contact', label: 'Contact', icon: 'fa-regular fa-envelope' },
]

function Navbar() {
  return (
    <header className="navbar">
      <nav className="navbar__links" aria-label="Primary navigation">
        {navItems.map(({ href, label, icon }) => (
          <a href={href} key={label}>
            <i className={`nav-icon ${icon}`} aria-hidden="true" />
            <span>{label}</span>
          </a>
        ))}
      </nav>
    </header>
  )
}

export default function App() {
  return <div className="app"><Navbar /></div>
}
