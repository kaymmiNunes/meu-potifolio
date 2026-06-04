// Atualiza automaticamente o ano, caso exista um elemento com id="year"
const yearElement = document.getElementById("year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

// Faz rolagem suave para uma seção específica, caso ela exista na página
function scrollToSection(id) {
  const section = document.getElementById(id);

  if (section) {
    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

// ------------------------------
// Menu ativo
// ------------------------------

const menuLinks = document.querySelectorAll(".menu-nav a");

function normalizePath(path) {
  return path.replace(/\/index\.html$/, "/");
}

function getCurrentSection(path) {
  const normalizedPath = normalizePath(path);
  const segments = normalizedPath.split("/").filter(Boolean);

  // Remove o nome do repositório quando estiver no GitHub Pages.
  // Exemplo: /meu-portfolio/sobre/ -> /sobre/
  if (segments[0] === "meu-portfolio") {
    segments.shift();
  }

  const firstSegment = segments[0] || "";
  const lastSegment = segments[segments.length - 1] || "index.html";

  if (
    firstSegment === "projetos" ||
    lastSegment === "projects.html" ||
    lastSegment.startsWith("projects")
  ) {
    return "projects";
  }

  if (
    firstSegment === "sobre" ||
    lastSegment === "sobremim.html" ||
    lastSegment === "experience.html"
  ) {
    return "about";
  }

  if (firstSegment === "contato" || lastSegment === "contact.html") {
    return "contact";
  }

  return "home";
}

function updateActiveMenuLink() {
  const currentSection = getCurrentSection(window.location.pathname);

  menuLinks.forEach((link) => {
    const linkUrl = new URL(link.getAttribute("href"), window.location.href);
    const linkSection = getCurrentSection(linkUrl.pathname);

    if (currentSection === linkSection) {
      link.classList.add("active-link");
    } else {
      link.classList.remove("active-link");
    }
  });
}

updateActiveMenuLink();

// ------------------------------
// Efeito fade-up
// ------------------------------

const faders = document.querySelectorAll(".fade-up");

function showElementsOnScroll() {
  faders.forEach((fader) => {
    const rect = fader.getBoundingClientRect();

    if (rect.top <= window.innerHeight * 0.85) {
      fader.classList.add("show");
    }
  });
}

window.addEventListener("scroll", showElementsOnScroll);
window.addEventListener("load", showElementsOnScroll);

// ------------------------------
// Pré-carregamento inteligente
// ------------------------------

const prefetchedPages = new Set();

function getSiteBaseUrl() {
  const path = window.location.pathname;

  // GitHub Pages:
  // /meu-portfolio/
  // /meu-portfolio/sobre/
  // /meu-portfolio/contato/
  if (path.includes("/meu-portfolio/")) {
    return `${window.location.origin}/meu-portfolio/`;
  }

  // Estrutura antiga:
  // /pages/projects.html
  // /pages/sobremim.html
  // /pages/contact.html
  if (path.includes("/pages/")) {
    return `${window.location.origin}${path.split("/pages/")[0]}/`;
  }

  // Domínio próprio ou Cloudflare:
  // /
  // /sobre/
  // /contato/
  // /projetos/
  return `${window.location.origin}/`;
}

function getConnectionInfo() {
  return (
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection ||
    null
  );
}

function isVeryLimitedConnection() {
  const connection = getConnectionInfo();

  if (!connection) {
    return false;
  }

  return (
    connection.saveData === true ||
    connection.effectiveType === "slow-2g" ||
    connection.effectiveType === "2g"
  );
}

function isInternalPage(url) {
  return (
    url.origin === window.location.origin &&
    (url.pathname.endsWith(".html") || url.pathname.endsWith("/"))
  );
}

function prefetchPage(pageUrl) {
  const url = new URL(pageUrl, window.location.href);

  if (!isInternalPage(url)) {
    return;
  }

  if (url.href === window.location.href) {
    return;
  }

  if (prefetchedPages.has(url.href)) {
    return;
  }

  prefetchedPages.add(url.href);

  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = url.href;
  link.as = "document";

  document.head.appendChild(link);
}

function runWhenBrowserIsIdle(callback) {
  if ("requestIdleCallback" in window) {
    requestIdleCallback(callback, { timeout: 3000 });
  } else {
    setTimeout(callback, 1000);
  }
}

function preloadInternalPages() {
  const siteBaseUrl = getSiteBaseUrl();

  const knownPages = [
    "./",
    "projetos/",
    "sobre/",
    "contato/",
    "projetos/irrigacao/",
    "projetos/irrigacao-inteligente/",
    "projetos/haven-cafeteria/",
  ].map((page) => new URL(page, siteBaseUrl).href);

  const detectedPages = Array.from(document.querySelectorAll("a[href]"))
    .map((link) => new URL(link.getAttribute("href"), window.location.href))
    .filter(isInternalPage)
    .map((url) => url.href);

  const pagesToPreload = [...new Set([...knownPages, ...detectedPages])];

  const initialDelay = isVeryLimitedConnection() ? 3000 : 800;
  const intervalBetweenPages = isVeryLimitedConnection() ? 1400 : 250;

  setTimeout(() => {
    pagesToPreload.forEach((page, index) => {
      setTimeout(() => {
        prefetchPage(page);
      }, index * intervalBetweenPages);
    });
  }, initialDelay);
}

window.addEventListener("load", () => {
  runWhenBrowserIsIdle(preloadInternalPages);
});

// Pré-carrega um link quando o usuário demonstra intenção de acessá-lo.
document.querySelectorAll("a[href]").forEach((link) => {
  const prepareLink = () => {
    prefetchPage(link.href);
  };

  link.addEventListener("mouseenter", prepareLink, { once: true });
  link.addEventListener("touchstart", prepareLink, { once: true });
  link.addEventListener("focus", prepareLink, { once: true });
});

// ------------------------------
// Transição de saída entre páginas
// ------------------------------

document.querySelectorAll("a[href]").forEach((link) => {
  link.addEventListener("click", (event) => {
    const rawHref = link.getAttribute("href");
    const url = new URL(link.href, window.location.href);

    const isInternalLink = url.origin === window.location.origin;
    const isSamePage = url.href === window.location.href;
    const opensInNewTab = link.target === "_blank";
    const isAnchorLink = rawHref.startsWith("#");
    const isDownload = link.hasAttribute("download");
    const isMailOrPhone =
      url.protocol === "mailto:" || url.protocol === "tel:";

    if (
      !isInternalLink ||
      isSamePage ||
      opensInNewTab ||
      isAnchorLink ||
      isDownload ||
      isMailOrPhone
    ) {
      return;
    }

    event.preventDefault();
    document.body.classList.add("is-leaving");

    setTimeout(() => {
      window.location.href = url.href;
    }, 260);
  });
});
