export default function Home() {
  return (
    <section className="hero" id="home">
      <div className="frame">
        <div className="echoes" aria-hidden="true">
          <span>UI/UX DESIGNER</span>
          <span>UI/UX DESIGNER</span>
          
        </div>
        <h1 className="title shimmer-title">UI/UX DESIGNER</h1>

       
        <img className="photo home-photo-motion" src="/hero.png" alt="Imari Calado" />

        <div className="intro">
          <p>
            I'm Imari Calado, An aspiring UI/UX designer passionate about creating clean, modern, and user-friendly interfaces, with a growing expertise in Figma and a creative approach to digital design.
          </p>
          <div className="actions">
            <a href="#skills" className="btn solid">View my skills</a>
            <a href="#contact" className="btn ghost">Let's Connect</a>
          </div>
        </div>
      </div>
    </section>
  )
}
