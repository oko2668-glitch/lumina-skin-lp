const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const fixedCta = document.querySelector("[data-fixed-cta]");
const footer = document.querySelector(".site-footer");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let footerInView = false;

const closeMenu = () => {
  if (!menuToggle || !mobileMenu) return;
  menuToggle.setAttribute("aria-expanded", "false");
  mobileMenu.classList.remove("is-open");
  document.body.classList.remove("menu-open");
};

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    mobileMenu.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    closeMenu();
    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start"
    });
  });
});

document.querySelectorAll(".faq-item").forEach((item, index) => {
  const button = item.querySelector("button");
  const panel = item.querySelector(".faq-panel");
  if (!button || !panel) return;

  const panelId = `faq-panel-${index + 1}`;
  panel.id = panelId;
  button.setAttribute("aria-controls", panelId);

  button.addEventListener("click", () => {
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    item.classList.toggle("is-open", !expanded);
    panel.style.maxHeight = expanded ? null : `${panel.scrollHeight}px`;
  });
});

const updateScrollState = () => {
  const scrolled = window.scrollY > 16;
  header?.classList.toggle("is-scrolled", scrolled);
  fixedCta?.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.45 && !footerInView);
};

updateScrollState();
window.addEventListener("scroll", updateScrollState, { passive: true });

if (fixedCta && footer && "IntersectionObserver" in window) {
  const footerObserver = new IntersectionObserver((entries) => {
    footerInView = entries.some((entry) => entry.isIntersecting);
    fixedCta.classList.toggle("is-footer-visible", footerInView);
    updateScrollState();
  }, { threshold: 0.08 });

  footerObserver.observe(footer);
}

const staggerGroups = [
  ".worry-checklist li",
  ".reason-sources article",
  ".concept-points article",
  ".reason-feature",
  ".service-menu",
  ".first-flow article",
  ".first-assurance-grid article",
  ".timeline-step",
  ".price-card",
  ".voice-card",
  ".profile-list",
  ".staff-message-card",
  ".access-card",
  ".map-placeholder",
  ".faq-item"
];

staggerGroups.forEach((selector) => {
  document.querySelectorAll(selector).forEach((element, index) => {
    element.classList.add("fade-up");
    element.style.setProperty("--reveal-delay", `${Math.min(index * 70, 420)}ms`);
  });
});

if (!prefersReducedMotion && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

  document.querySelectorAll(".reveal, .fade-up").forEach((element) => {
    revealObserver.observe(element);
  });
} else {
  document.querySelectorAll(".reveal, .fade-up").forEach((element) => {
    element.classList.add("is-visible");
  });
}

document.querySelectorAll(".image-card img").forEach((image) => {
  const markMissing = () => {
    image.closest(".image-card")?.classList.add("image-missing");
  };

  if (image.complete && image.naturalWidth === 0) {
    markMissing();
  }

  image.addEventListener("error", markMissing);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});
