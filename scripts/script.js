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

// Marca automaticamente o link ativo no menu de acordo com a página atual
const menuLinks = document.querySelectorAll(".menu-nav a");

function updateActiveMenuLink() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  menuLinks.forEach((link) => {
    const linkPage = link.getAttribute("href").split("/").pop();

    const isHomePage = currentPage === "index.html" && linkPage === "index.html";

    const isProjectsPage =
      currentPage.startsWith("projects") && linkPage === "projects.html";

    const isAboutPage =
      currentPage === "sobremim.html" && linkPage === "sobremim.html";

    const isContactPage =
      currentPage === "contact.html" && linkPage === "contact.html";

    if (isHomePage || isProjectsPage || isAboutPage || isContactPage) {
      link.classList.add("active-link");
    } else {
      link.classList.remove("active-link");
    }
  });
}
updateActiveMenuLink();

// Efeito de aparição suave para elementos com a classe .fade-up
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

// Adiciona uma classe quando a página termina de carregar.
// Útil para aplicar transições suaves via CSS.
window.addEventListener("load", () => {
  document.body.classList.add("page-loaded");
});

// ------------------------------
// Pré-carregamento inteligente
// ------------------------------

const prefetchedPages = new Set();

function getSiteBaseUrl() {
  const path = window.location.pathname;

  // Quando estiver dentro da pasta /pages/, volta para a raiz do projeto.
  // Exemplo:
  // /meu-potifolio/pages/projects.html -> /meu-potifolio/
  if (path.includes("/pages/")) {
    return `${window.location.origin}${path.split("/pages/")[0]}/`;
  }

  // Quando estiver na raiz do projeto.
  // Exemplo:
  // /meu-potifolio/index.html -> /meu-potifolio/
  return `${window.location.origin}${path.substring(0, path.lastIndexOf("/") + 1)}`;
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

  // Lista das páginas conhecidas do portfólio.
  // Se criar novas páginas no futuro, adicione aqui.
  const knownPages = [
    "index.html",
    "pages/projects.html",
    "pages/sobremim.html",
    "pages/contact.html",
    "pages/projects1.html",
    "pages/projects2.html",
    "pages/projects3.html",
  ].map((page) => new URL(page, siteBaseUrl).href);

  // Também pega automaticamente os links internos existentes na página atual.
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

// Pré-carrega as páginas depois que a página principal já terminou de carregar.
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

// Aplica animação de saída antes de navegar para links internos
document.querySelectorAll("a[href]").forEach((link) => {
  link.addEventListener("click", (event) => {
    const url = new URL(link.href, window.location.href);

    const isInternalLink = url.origin === window.location.origin;
    const isSamePage = url.href === window.location.href;
    const opensInNewTab = link.target === "_blank";

    if (!isInternalLink || isSamePage || opensInNewTab) {
      return;
    }

    event.preventDefault();
    document.body.classList.add("is-leaving");

    setTimeout(() => {
      window.location.href = url.href;
    }, 260);
  });
});