import { Children, useEffect, useLayoutEffect, useRef, useState } from 'react'

const links = [
  { to: '#home', label: 'Home' },
  { to: '#about', label: 'About' },
  { to: '#skills', label: 'Skills' },
  { to: '#contact', label: 'Contact' },
]

export default function Layout({ children }) {
  const [activeSection, setActiveSection] = useState('#home')
  const animationFrame = useRef(0)
  const headerRef = useRef(null)
  const pageRef = useRef(null)

  useLayoutEffect(() => {
    const updateHeaderHeight = () => {
      pageRef.current?.style.setProperty('--nav-height', `${headerRef.current.getBoundingClientRect().height}px`)
    }
    updateHeaderHeight()
    const observer = new ResizeObserver(updateHeaderHeight)
    observer.observe(headerRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let scrollFrame = 0
    const updateActiveSection = () => {
      scrollFrame = 0
      const marker = (headerRef.current?.getBoundingClientRect().height ?? 0) + 100
      let current = '#home'
      for (const link of links) {
        if (document.querySelector(link.to)?.closest('.section-viewport')?.getBoundingClientRect().top <= marker) {
          current = link.to
        }
      }
      if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) {
        current = '#contact'
      }
      setActiveSection(current)
    }
    const scheduleUpdate = () => {
      if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateActiveSection)
    }
    const cancelAnimation = (event) => {
      if (event.type === 'keydown' && !['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) return
      window.cancelAnimationFrame(animationFrame.current)
    }
    updateActiveSection()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    window.addEventListener('resize', cancelAnimation)
    window.addEventListener('wheel', cancelAnimation, { passive: true })
    window.addEventListener('touchstart', cancelAnimation, { passive: true })
    window.addEventListener('keydown', cancelAnimation)
    return () => {
      window.cancelAnimationFrame(scrollFrame)
      window.cancelAnimationFrame(animationFrame.current)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      window.removeEventListener('resize', cancelAnimation)
      window.removeEventListener('wheel', cancelAnimation)
      window.removeEventListener('touchstart', cancelAnimation)
      window.removeEventListener('keydown', cancelAnimation)
    }
  }, [])

  const handlePageClick = (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const anchor = event.target.closest('a[href^="#"]')
    const targetId = anchor?.getAttribute('href')
    if (!links.some((link) => link.to === targetId)) return
    const target = document.querySelector(targetId)
    if (!target) return
    event.preventDefault()
    window.cancelAnimationFrame(animationFrame.current)

    const navHeight = headerRef.current?.getBoundingClientRect().height ?? 0
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
    const sectionFrame = target.closest('.section-viewport') ?? target
    const destination = targetId === '#home' ? 0 : sectionFrame.getBoundingClientRect().top + window.scrollY - navHeight
    const top = Math.min(Math.max(destination, 0), maxScroll)
    if (window.location.hash !== targetId) window.history.pushState(null, '', targetId)

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.scrollTo({ top, behavior: 'instant' })
      return
    }
    const startY = window.scrollY
    const distance = top - startY
    const duration = Math.min(1800, 1100 + Math.abs(distance) * 0.15)
    let startTime
    const animate = (time) => {
      startTime ??= time
      const progress = Math.min((time - startTime) / duration, 1)
      const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2
      window.scrollTo({ top: startY + distance * eased, behavior: 'instant' })
      if (progress < 1) animationFrame.current = window.requestAnimationFrame(animate)
    }
    animationFrame.current = window.requestAnimationFrame(animate)
  }

  return (
    <div className="page" ref={pageRef} onClick={handlePageClick}>
      <header className="nav" ref={headerRef}>
        <a href="#home" className="brand">
          <img src="/logo.png" alt="Imari Calado" />
        </a>
        <nav aria-label="Main navigation">
          {links.map((link) => (
            <a key={link.to} href={link.to} className={activeSection === link.to ? 'is-active' : undefined} aria-current={activeSection === link.to ? 'location' : undefined}>
              {link.label}
            </a>
          ))}
        </nav>
      </header>
      <div className="page-transition">
        {Children.map(children, (child) => <ViewportSection>{child}</ViewportSection>)}
      </div>
    </div>
  )
}

function ViewportSection({ children }) {
  return (
    <div className="section-viewport">
      <div className="section-fit">{children}</div>
    </div>
  )
}
