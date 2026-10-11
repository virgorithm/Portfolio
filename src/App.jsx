
import { useEffect, useLayoutEffect, useState } from "react";

import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Skills from "./pages/Skills.jsx";
import Projects from "./pages/Projects.jsx";
import Contact from "./pages/Contact.jsx";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    if (window.location.hash) {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}`
      );
    }

    window.scrollTo(0, 0);

    return () => {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "auto";
      }
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll(".scroll-reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("show", entry.isIntersecting);
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const travelingPhoto = document.querySelector(".traveling-photo");
    const homePhoto = document.querySelector(".home-photo-motion");
    const aboutPhoto = document.querySelector(".about-photo img");
    const homeSection = document.querySelector("#home");
    const aboutSection = document.querySelector("#about");

    if (
      reduceMotion.matches ||
      !travelingPhoto ||
      !homePhoto ||
      !aboutPhoto ||
      !homeSection ||
      !aboutSection
    ) {
      return;
    }

    let frameId = 0;

    const updateTravelingPhoto = () => {
      frameId = 0;

      const scrollY = window.scrollY;
      const nav = document.querySelector(".nav");
      const navHeight = nav ? nav.getBoundingClientRect().height : 0;
      const start = homeSection.offsetTop + homeSection.offsetHeight * 0.16;
      const end = aboutSection.offsetTop - navHeight - 24;
      const rawProgress = (scrollY - start) / Math.max(end - start, 1);
      const progress = Math.min(Math.max(rawProgress, 0), 1);
      const isActive = rawProgress > 0 && rawProgress < 1;

      if (!isActive) {
        document.documentElement.style.setProperty("--travel-opacity", "0");
        aboutPhoto.classList.remove("is-traveling");
        return;
      }

      const homeRect = homePhoto.getBoundingClientRect();
      const aboutRect = aboutPhoto.getBoundingClientRect();
      const easedProgress = progress * progress * (3 - 2 * progress);
      const x = homeRect.left + (aboutRect.left - homeRect.left) * easedProgress;
      const y = homeRect.top + (aboutRect.top - homeRect.top) * easedProgress;
      const width = homeRect.width + (aboutRect.width - homeRect.width) * easedProgress;
      const height = homeRect.height + (aboutRect.height - homeRect.height) * easedProgress;
      const fadeIn = Math.min(progress / 0.06, 1);
      const fadeOut = Math.min((1 - progress) / 0.06, 1);
      const opacity = Math.min(fadeIn, fadeOut);

      document.documentElement.style.setProperty("--travel-x", `${x}px`);
      document.documentElement.style.setProperty("--travel-y", `${y}px`);
      document.documentElement.style.setProperty("--travel-width", `${width}px`);
      document.documentElement.style.setProperty("--travel-height", `${height}px`);
      document.documentElement.style.setProperty("--travel-opacity", `${opacity}`);

      aboutPhoto.classList.toggle("is-traveling", progress < 0.94);
    };

    const requestUpdate = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(updateTravelingPhoto);
    };

    updateTravelingPhoto();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      aboutPhoto.classList.remove("is-traveling");
    };
  }, []);

  return (
    <>
      <div
        className={isLoading ? "loading-screen" : "loading-screen is-hidden"}
        role="status"
        aria-live="polite"
        aria-hidden={!isLoading}
      >
        <div className="loading-mark">
          <img src="/logo.png" alt="Imari Calado" />
          <span>Loading...</span>
        </div>
        <div className="loading-bar" aria-hidden="true">
          <span />
        </div>
      </div>

      <img className="traveling-photo" src="/front-pic.png" alt="" aria-hidden="true" />

      <div className={isLoading ? "site-shell is-loading" : "site-shell"}>
        <Layout>
          <Home />
          <About />
          <Skills />
          <Projects />
          <Contact />
        </Layout>
      </div>
    </>
  );
}
