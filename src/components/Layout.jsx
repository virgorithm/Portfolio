const links = [
  { to: '#home', label: 'Home' },
  { to: '#about', label: 'About' },
  { to: '#skills', label: 'Skills' },
  { to: '#contact', label: 'Contact' },
]

export default function Layout({ children }) {
  const handleNavClick = (event, targetId) => {
    const target = document.querySelector(targetId)

    if (!target) return

    event.preventDefault()

    const nav = document.querySelector(".nav")
    const navHeight = nav ? nav.getBoundingClientRect().height : 0
    const top =
      targetId === "#home"
        ? 0
        : target.getBoundingClientRect().top + window.scrollY - navHeight

    window.history.pushState(null, "", targetId)
    window.scrollTo({
      top: Math.max(top, 0),
      behavior: "smooth",
    })
  }

  return (
    <div className="page">
      <header className="nav">
        <a href="#home" className="brand" onClick={(event) => handleNavClick(event, "#home")}>
          <img src="/logo.png" alt="Imari Calado" style={{ height: "60px", width: "auto" }} />
        </a>
        <nav>
          {links.map((l) => (
            <a key={l.to} href={l.to} onClick={(event) => handleNavClick(event, l.to)}>
              {l.label}
            </a>
          ))}
        </nav>
      </header>
      <div className="page-transition">
        {children}
      </div>
    </div>
  )
}
