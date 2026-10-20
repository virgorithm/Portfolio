import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { contact } from '../data.js'
import './ContactMessage.css'

export default function ContactMessage() {
  const [notice, setNotice] = useState('')
  const [sending, setSending] = useState(false)
  const [topic, setTopic] = useState('')
  const [topicError, setTopicError] = useState(false)
  const topicTrigger = useRef(null)
  const submitting = useRef(false)
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    const previousTitle = document.title
    document.title = 'Say Hello! — Imari Calado'
    document.getElementById('hello-title')?.focus({ preventScroll: true })
    return () => { document.title = previousTitle }
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    if (!topic) {
      setTopicError(true)
      topicTrigger.current?.focus()
      return
    }
    if (submitting.current) return
    submitting.current = true
    const form = event.currentTarget
    const values = Object.fromEntries(new FormData(form))
    setSending(true)
    setNotice('')
    try {
      const csrfResponse = await fetch('/api/contact/csrf/', { credentials: 'same-origin' })
      if (!csrfResponse.ok) throw new Error('Could not connect. Please try again.')
      const { csrfToken } = await csrfResponse.json()
      const response = await fetch('/api/contact/', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
        body: JSON.stringify(values),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        const details = Object.values(result.fields ?? {}).flat().join(' ')
        throw new Error(details || result.error || 'Could not send your message. Please try again.')
      }
      form.reset()
      setTopic('')
      setNotice(result.message)
    } catch (error) {
      setNotice(error instanceof TypeError ? 'Could not connect. Please try again.' : error.message)
    } finally {
      submitting.current = false
      setSending(false)
    }
  }

  return (
    <div className="page hello-page">
      <header className="nav">
        <Link className="brand" to="/#home" aria-label="Imari Calado — home"><img src="/logo.png" alt="Imari Calado" /></Link>
        <nav aria-label="Main navigation">
          {['Home', 'About', 'Skills', 'Contact'].map((section) => <Link key={section} to={`/#${section.toLowerCase()}`}>{section}</Link>)}
        </nav>
      </header>
      <main className="hello-main" aria-labelledby="hello-title">
        <div className="hello-intro hello-enter">
          <h1 id="hello-title" className="hello-title text-shimmer" tabIndex={-1}>Say Hello!</h1>
          <p>Have a project, an internship opportunity, or a question about my work? Kindly send a message, and<br className="hello-desktop-break" /> I will respond at my earliest convenience.</p>
        </div>
        <div className="hello-content">
          <form className="hello-form hello-enter" onSubmit={handleSubmit} aria-busy={sending}>
            <h2>Send me a message</h2>
            <div className="hello-field">
              <label htmlFor="hello-name">Your name</label>
              <input id="hello-name" name="name" placeholder="ex: Imari Calado" autoComplete="name" required maxLength={100} pattern=".*\S.*" />
            </div>
            <div className="hello-field">
              <label htmlFor="hello-email">Email address</label>
              <input id="hello-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required maxLength={254} />
            </div>
            <div className="hello-field">
              <label id="hello-topic-label" htmlFor="hello-topic">What is this about?</label>
              <TopicSelect value={topic} onChange={(value) => { setTopic(value); setTopicError(false) }} invalid={topicError} triggerRef={topicTrigger} />
              {topicError && <p id="hello-topic-error" className="hello-topic-error" role="alert">Please select a topic.</p>}
            </div>
            <div className="hello-field">
              <label htmlFor="hello-message">Message</label>
              <textarea id="hello-message" name="message" rows={5} placeholder="Tell me a little about it…" required maxLength={3000} />
            </div>
            <button className="hello-send" type="submit" disabled={sending}>
              {sending ? 'Sending…' : 'Send message'}
              <span aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17 17 7M7 7h10v10" />
                </svg>
              </span>
            </button>
            <p className="hello-notice" role="status">{notice}</p>
          </form>
          <aside className="hello-details hello-enter" aria-label="Contact details">
            <Link className="contact-signature" to="/#contact" aria-label="Back to portfolio" title="Back to portfolio">
              <img src="/logo.png" alt="" /><strong>IMARI CALADO</strong>
            </Link>
            <div className="contact-detail">
              <h2>Email</h2>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
              <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a>
            </div>
            <div className="contact-detail">
              <h2>Find me on</h2>
              <ul>{contact.links.map((link) => <li key={link.label}><a href={link.href} target="_blank" rel="noreferrer">{link.label}</a></li>)}</ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

const topics = ['Project collaboration', 'Internship opportunity', 'Question about my work', 'Just saying hello']

function TopicSelect({ value, onChange, invalid, triggerRef }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const wrapper = useRef(null)
  const search = useRef({ text: '', time: 0 })

  useEffect(() => {
    if (!open) return
    const closeOutside = (event) => {
      if (!wrapper.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    return () => document.removeEventListener('pointerdown', closeOutside)
  }, [open])

  function choose(index) {
    onChange(topics[index])
    setOpen(false)
    triggerRef.current?.focus()
  }

  function handleKeyDown(event) {
    if (event.key === 'Tab' || event.key === 'Escape') {
      setOpen(false)
      if (event.key === 'Escape') event.preventDefault()
      return
    }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault()
      const start = open ? active : Math.max(0, topics.indexOf(value))
      setActive(event.key === 'Home' ? 0 : event.key === 'End' ? topics.length - 1 : !open ? start : (start + (event.key === 'ArrowDown' ? 1 : -1) + topics.length) % topics.length)
      setOpen(true)
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (open) choose(active)
      else { setActive(Math.max(0, topics.indexOf(value))); setOpen(true) }
    } else if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
      event.preventDefault()
      const now = Date.now()
      search.current = { text: (now - search.current.time < 700 ? search.current.text : '') + event.key.toLowerCase(), time: now }
      const match = topics.findIndex((topic) => topic.toLowerCase().startsWith(search.current.text))
      if (match !== -1) { setActive(match); setOpen(true) }
    }
  }

  return (
    <div className="hello-select" ref={wrapper}>
      <input type="hidden" name="topic" value={value} />
      <button id="hello-topic" ref={triggerRef} type="button" role="combobox"
        className={`hello-topic-trigger${value ? '' : ' is-placeholder'}`}
        aria-labelledby="hello-topic-label" aria-haspopup="listbox" aria-expanded={open}
        aria-controls="hello-topic-options" aria-required="true" aria-invalid={invalid}
        aria-describedby={invalid ? 'hello-topic-error' : undefined}
        aria-activedescendant={open ? `hello-topic-option-${active}` : undefined}
        onClick={() => { setActive(Math.max(0, topics.indexOf(value))); setOpen(!open) }}
        onKeyDown={handleKeyDown} onBlur={() => setOpen(false)}>
        {value || 'Select a topic'}
        <svg className="hello-select-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </button>
      {open && <ul id="hello-topic-options" className="hello-topic-options" role="listbox" aria-labelledby="hello-topic-label">
        {topics.map((topic, index) => <li key={topic} id={`hello-topic-option-${index}`} role="option"
          aria-selected={value === topic} className={active === index ? 'is-highlighted' : undefined}
          onPointerMove={() => setActive(index)} onMouseDown={(event) => event.preventDefault()}
          onClick={() => choose(index)}>{topic}<span aria-hidden="true">{value === topic ? '✓' : ''}</span></li>)}
      </ul>}
    </div>
  )
}
