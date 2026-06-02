function scrollToSection(id) {
  const section = document.getElementById(id);

  if (!section) return;

  section.scrollIntoView({ behavior: "smooth", block: "start" });
}

function isInternalPageLink(link) {
  const href = link.getAttribute("href");

  if (!href) return false;
  if (href.startsWith("#")) return false;
  if (href.startsWith("mailto:")) return false;
  if (href.startsWith("tel:")) return false;
  if (link.target === "_blank") return false;
  if (link.hasAttribute("download")) return false;

  const url = new URL(link.href, window.location.href);

  if (url.origin !== window.location.origin) return false;
  if (url.href === window.location.href) return false;

  return true;
}

function isModifiedClick(event) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

document.addEventListener("DOMContentLoaded", () => {
  const currentYear = document.getElementById("year");

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  const transitionTime = 260;
  const links = document.querySelectorAll("a");

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.defaultPrevented) return;
      if (isModifiedClick(event)) return;
      if (!isInternalPageLink(link)) return;

      event.preventDefault();
      document.body.classList.add("is-leaving");

      window.setTimeout(() => {
        window.location.href = link.href;
      }, transitionTime);
    });
  });

  const faders = document.querySelectorAll(".fade-up");

  if (!faders.length) return;

  const appearOnScroll = () => {
    faders.forEach((fader) => {
      const rect = fader.getBoundingClientRect();

      if (rect.top <= window.innerHeight * 0.85) {
        fader.classList.add("show");
      }
    });
  };

  window.addEventListener("scroll", appearOnScroll);
  appearOnScroll();
});

window.addEventListener("pageshow", () => {
  document.body.classList.remove("is-leaving");
});
