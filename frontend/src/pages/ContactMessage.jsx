import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { contact } from '../data.js'
import './ContactMessage.css'

export default function ContactMessage() {
  const [notice, setNotice] = useState('')
  const [messageSent, setMessageSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [topic, setTopic] = useState('')
  const [errors, setErrors] = useState({})
  const [verification, setVerification] = useState(null)
  const [requestingCode, setRequestingCode] = useState(false)
  const requesting = useRef(false)
  const topicTrigger = useRef(null)
  const submitting = useRef(false)
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    const previousTitle = document.title
    document.title = 'Say Hello! — Imari Calado'
    document.getElementById('hello-title')?.focus({ preventScroll: true })
    return () => { document.title = previousTitle }
  }, [])

  async function requestCode(event) {
    setMessageSent(false)
    setNotice('')
    const form = event.currentTarget.form
    const emailField = form.elements.namedItem('email')
    const error = fieldError(emailField)
    if (error) {
      setErrors((previous) => ({ ...previous, email: error }))
      emailField.focus()
      return
    }
    if (requesting.current) return
    requesting.current = true
    setRequestingCode(true)
    setNotice('')
    const email = emailField.value.trim().toLowerCase()
    try {
      const result = await postContact('/api/contact/verification/', { email })
      if (emailField.value.trim().toLowerCase() === email) {
        setVerification({ id: result.verificationId, email })
        setNotice(result.message)
      }
    } catch (error) {
      setNotice(error instanceof TypeError ? 'Could not connect. Please try again.' : error.message)
    } finally {
      requesting.current = false
      setRequestingCode(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setMessageSent(false)
    setNotice('')
    const form = event.currentTarget
    const nextErrors = {}
    for (const name of ['name', 'email', 'message']) {
      const error = fieldError(form.elements.namedItem(name))
      if (error) nextErrors[name] = error
    }
    if (!topic) nextErrors.topic = 'Please select a topic.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      form.querySelector(`#hello-${['name', 'email', 'topic', 'message'].find((name) => nextErrors[name])}`)?.focus()
      return
    }
    if (!verification || verification.email !== form.elements.namedItem('email').value.trim().toLowerCase()) {
      setNotice('Please request a verification code for your email address first.')
      form.querySelector('.hello-verify-button')?.focus()
      return
    }
    const codeField = form.elements.namedItem('verificationCode')
    if (!codeField || !codeField.validity.valid) {
      setErrors((previous) => ({ ...previous, verificationCode: 'Please enter the 6-digit code.' }))
      codeField?.focus()
      return
    }
    if (submitting.current) return
    submitting.current = true
    const values = Object.fromEntries(new FormData(form))
    values.verificationId = verification.id
    setSending(true)
    setNotice('')
    try {
      const result = await postContact('/api/contact/', values)
      form.reset()
      setTopic('')
      setVerification(null)
      setNotice(result.message)
      setMessageSent(true)
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
          <form className="hello-form hello-enter" noValidate onSubmit={handleSubmit} aria-busy={sending}
            onInput={(event) => {
              const field = event.target
              if (messageSent) { setMessageSent(false); setNotice('') }
              if (field.name === 'email') setVerification(null)
              if (errors[field.name]) setErrors((previous) => ({ ...previous, [field.name]: fieldError(field) }))
            }}>
            <h2>Send me a message</h2>
            <div className="hello-field">
              <label htmlFor="hello-name">Your name</label>
              <ValidatedInput error={errors.name} id="hello-name" name="name" placeholder="ex: Imari Calado" autoComplete="name" required maxLength={100} pattern=".*\S.*" />
            </div>
            <div className="hello-field">
              <label htmlFor="hello-email">Email address</label>
              <ValidatedInput error={errors.email} id="hello-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required maxLength={254}
                action={<button className="hello-verify-button" type="button" onClick={requestCode} disabled={requestingCode || sending}
                  aria-label={requestingCode ? 'Sending verification code' : verification ? 'Resend verification code' : 'Send verification code'}
                  title={verification ? 'Resend verification code' : 'Send verification code'}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="14" rx="3" /><path d="m3 7 9 6 9-6" />
                  </svg>
                  <span>{requestingCode ? 'Sending…' : verification ? 'Resend code' : 'Send code'}</span>
                </button>} />
              <p className="hello-verification-help">Verify your email so I can reply to you. Your code expires in 10 minutes.</p>
            </div>
            {verification && <div className="hello-field">
              <label htmlFor="hello-code">Email verification code</label>
              <ValidatedInput error={errors.verificationCode} id="hello-code" name="verificationCode" placeholder="6-digit code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required />
            </div>}
            <div className="hello-field">
              <label id="hello-topic-label" htmlFor="hello-topic">What is this about?</label>
              <TopicSelect value={topic} onChange={(value) => { setTopic(value); setErrors((previous) => ({ ...previous, topic: '' })) }} invalid={Boolean(errors.topic)} triggerRef={topicTrigger} />
            </div>
            <div className="hello-field">
              <label htmlFor="hello-message">Message</label>
              <ValidatedInput multiline error={errors.message} id="hello-message" name="message" rows={5} placeholder="Tell me a little about it…" required maxLength={3000} />
            </div>
            <button className="hello-send" type="submit" disabled={sending || requestingCode}>
              {sending ? 'Sending…' : 'Send message'}
              <span aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17 17 7M7 7h10v10" />
                </svg>
              </span>
            </button>
            {notice && (messageSent ? <div className="hello-success" role="status">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" />
              </svg>
              <p>{notice}</p>
            </div> : <p className="hello-notice" role="status">{notice}</p>)}
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

async function postContact(url, values) {
  const csrfResponse = await fetch('/api/contact/csrf/', { credentials: 'same-origin' })
  if (!csrfResponse.ok) throw new Error('Could not connect. Please try again.')
  const { csrfToken } = await csrfResponse.json()
  const response = await fetch(url, {
    method: 'POST', credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
    body: JSON.stringify(values),
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    const details = Object.values(result.fields ?? {}).flat().join(' ')
    throw new Error(details || result.error || 'Could not send your message. Please try again.')
  }
  return result
}

function fieldError(field) {
  if (!field.value.trim()) return 'Please fill out this field.'
  if (field.validity.typeMismatch) return 'Please enter a valid email address.'
  return field.validity.valid ? '' : field.validationMessage
}

function InlineError({ id, children }) {
  return <span id={id} className="hello-input-error" role="alert">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v6m0 4h.01" />
    </svg>
    <span>{children}</span>
  </span>
}

function ValidatedInput({ error, multiline, action, ...props }) {
  const Control = multiline ? 'textarea' : 'input'
  return <div className={`hello-input-wrap${error ? ' has-error' : ''}${action ? ' has-action' : ''}`}>
    <Control {...props} aria-invalid={Boolean(error)} aria-describedby={error ? `${props.id}-error` : undefined} />
    {action}
    {error && <InlineError id={`${props.id}-error`}>{error}</InlineError>}
  </div>
}

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
        {invalid ? <InlineError id="hello-topic-error">Please select a topic.</InlineError> : value || 'Select a topic'}
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
