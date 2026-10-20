import { contact } from '../data.js'

import { Link } from 'react-router-dom'

export default function Contact() {
  return (
    <section className="contact-page section" id="contact" aria-labelledby="contact-title">
      <div className="contact-hero">
        <p className="contact-availability">
          <span aria-hidden="true" />
          Open to UI/UX internship opportunities
        </p>
        <h2 id="contact-title" className="contact-title text-shimmer">
          Let’s create something<br />meaningful
        </h2>
        <p className="contact-description">
          Have a project, an internship opportunity, or a question about my work? Kindly send a
          message, and I will respond at my earliest convenience.
        </p>
        <div className="contact-actions">
          <Link className="contact-primary" to="/contact">
            Contact me
            <span className="contact-arrow" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </span>
          </Link>
          {contact.resume ? (
            <a className="contact-resume" href={contact.resume} download>
              <DownloadIcon /> Download Resume
            </a>
          ) : (
            <button className="contact-resume" type="button" disabled title="Résumé coming soon">
              <DownloadIcon /> Download Resume
            </button>
          )}
        </div>
      </div>
      <footer className="contact-footer">
        <a className="contact-signature" href="#home" aria-label="Imari Calado — back to home">
          <img src="/logo.png" alt="" />
          <strong>IMARI CALADO</strong>
          <span>UI/UX DESIGNER</span>
        </a>
        <div className="contact-detail">
          <h3>Email</h3>
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
          <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a>
        </div>
        <div className="contact-detail">
          <h3>Find me on</h3>
          <ul>
            {contact.links.map((link) => (
              <li key={link.label}>
                {link.href ? (
                  <a href={link.href} target="_blank" rel="noreferrer">{link.label}</a>
                ) : <span>{link.label}</span>}
              </li>
            ))}
          </ul>
        </div>
        <div className="contact-detail">
          <h3>Looking for</h3>
          <p>UI/UX Design Intern<br />Remote / Onsite / Hybrid</p>
        </div>
      </footer>
    </section>
  )
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v12m-4-4 4 4 4-4M5 15v5h14v-5" />
    </svg>
  )
}
