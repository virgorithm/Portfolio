export default function About() {
  return (
    <section className="section about-page" id="about">
      <div className="about">
        <div className="about-backdrop" aria-hidden="true">
          <span className="about-hey">Hey,</span>
          <span className="about-there">there</span>
        </div>

        <div className="about-intro scroll-reveal reveal-left">
          <span>I AM</span>
          <strong className="about-imari shimmer-title">IMARI</strong>
        </div>

        <div className="about-photo scroll-reveal reveal-up">
          <img src="/front-pic.png" alt="Portrait of Imari" />
        </div>

        <div className="about-text scroll-reveal reveal-right">
          <p>
            Passionate about turning creative ideas into clean, functional, and visually engaging designs using Figma.
          </p>
        </div>

        <div className="about-role scroll-reveal reveal-right">
          <strong>UI/UX</strong>
          <strong>DESIGNER</strong>
          <span>Figma - Wireframing - Prototyping</span>
        </div>
      </div>
    </section>
  );
}
