const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".site-nav");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const desktopQuery = window.matchMedia("(min-width: 921px)");

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    document.body.classList.toggle("is-menu-open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "メニューを閉じる" : "メニューを開く");
  });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    const target = targetId === "#" ? null : document.querySelector(targetId);

    if (!target) return;

    event.preventDefault();
    nav?.classList.remove("is-open");
    document.body.classList.remove("is-menu-open");
    menuButton?.setAttribute("aria-expanded", "false");

    const headerHeight = document.querySelector(".site-header")?.offsetHeight || 0;
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 10;

    window.scrollTo({
      top,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  });
});

document.querySelectorAll(".faq-question").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".faq-item");
    const answer = item?.querySelector(".faq-answer");
    const isOpen = item?.classList.contains("is-open");

    if (!item || !answer) return;

    item.classList.toggle("is-open", !isOpen);
    button.setAttribute("aria-expanded", String(!isOpen));
    answer.style.maxHeight = isOpen ? "0px" : `${answer.scrollHeight}px`;
  });
});

document.querySelectorAll(".hero-image, .problem-image, .service-image, .reason-image, .voice-image, .course-list img, .offer-image, .exterior-image").forEach((image) => {
  const markMissing = () => image.classList.add("is-missing");

  image.addEventListener("error", markMissing);
  if (image.complete && image.naturalWidth === 0) {
    markMissing();
  }
});

const staggerGroups = [
  [".concern-list li", 90],
  [".course-list li", 75],
  [".flow-item", 95],
  [".mini-list li", 70],
  [".faq-item", 70],
  [".info-card dl > div", 50],
  [".offer-panel", 130],
  [".final-offer", 120],
];

staggerGroups.forEach(([selector, interval]) => {
  document.querySelectorAll(selector).forEach((target, index) => {
    target.classList.add("js-reveal");
    if (!target.dataset.delay) {
      target.dataset.delay = String(index * interval);
    }
  });
});

const revealTargets = [...new Set(document.querySelectorAll(".reveal, .js-reveal"))];

if (prefersReducedMotion) {
  revealTargets.forEach((target) => {
    target.style.transitionDelay = "0ms";
    target.classList.add("is-visible");
  });
} else if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = Number(entry.target.dataset.delay || 0);
          entry.target.style.transitionDelay = `${delay}ms`;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "0px 0px -8% 0px",
      threshold: 0.14,
    }
  );

  revealTargets.forEach((target) => observer.observe(target));
} else {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
}

const parallaxItems = [...document.querySelectorAll(".js-parallax, .js-float-parallax, .js-parallax-card")];
const voiceSlider = document.querySelector(".voice-slider");
const voiceTrack = document.querySelector(".js-voice-track");
const stickySection = document.querySelector(".js-sticky-horizontal");
const stickyState = {
  section: stickySection,
  viewport: stickySection?.querySelector(".reason-viewport"),
  track: stickySection?.querySelector(".sticky-track"),
  cards: stickySection ? [...stickySection.querySelectorAll(".sticky-card")] : [],
  dots: stickySection ? [...stickySection.querySelectorAll(".progress-dot")] : [],
  startX: 0,
  endX: 0,
};

let ticking = false;

const measureVoiceSlider = () => {
  if (!voiceTrack) return;

  if (prefersReducedMotion) {
    voiceTrack.classList.add("is-paused");
    return;
  }

  const cards = [...voiceTrack.querySelectorAll(".voice-card")];
  const firstDuplicateIndex = cards.findIndex((card) => card.getAttribute("aria-hidden") === "true");
  const firstDuplicate = firstDuplicateIndex >= 0 ? cards[firstDuplicateIndex] : null;
  const shift = firstDuplicate ? firstDuplicate.offsetLeft : voiceTrack.scrollWidth / 2;

  voiceTrack.style.setProperty("--voice-shift", `-${Math.round(shift)}px`);
};

if (voiceSlider && voiceTrack) {
  const setVoicePaused = (paused) => {
    if (prefersReducedMotion) return;
    voiceTrack.classList.toggle("is-paused", paused);
  };

  voiceSlider.addEventListener("pointerenter", () => setVoicePaused(true));
  voiceSlider.addEventListener("pointerleave", () => setVoicePaused(false));
  voiceSlider.addEventListener("focusin", () => setVoicePaused(true));
  voiceSlider.addEventListener("focusout", () => setVoicePaused(false));
}

const measureSticky = () => {
  if (!stickyState.section || !stickyState.viewport || !stickyState.track || !stickyState.cards.length) return;

  if (!desktopQuery.matches || prefersReducedMotion) {
    stickyState.track.style.removeProperty("--sticky-x");
    stickyState.cards.forEach((card) => {
      card.style.removeProperty("--card-opacity");
      card.style.removeProperty("--card-scale");
    });
    return;
  }

  const viewportWidth = stickyState.viewport.clientWidth;
  const first = stickyState.cards[0];
  const last = stickyState.cards[stickyState.cards.length - 1];

  stickyState.startX = viewportWidth / 2 - (first.offsetLeft + first.offsetWidth / 2);
  stickyState.endX = viewportWidth / 2 - (last.offsetLeft + last.offsetWidth / 2);
};

const updateParallax = () => {
  if (prefersReducedMotion) return;

  const viewportHeight = window.innerHeight || 1;

  parallaxItems.forEach((item) => {
    const rect = item.getBoundingClientRect();
    if (rect.bottom < -120 || rect.top > viewportHeight + 120) return;

    const speed = Number(item.dataset.parallaxSpeed || -0.06);
    const centerProgress = clamp((viewportHeight / 2 - (rect.top + rect.height / 2)) / viewportHeight, -1, 1);
    const y = centerProgress * speed * 180;

    if (item.classList.contains("js-float-parallax")) {
      item.style.setProperty("--float-y", `${y}px`);
      return;
    }

    if (item.classList.contains("js-parallax-card")) {
      item.style.setProperty("--card-parallax-y", `${y}px`);
      item.style.setProperty("--card-parallax-scale", "1.012");
      return;
    }

    const startScale = Number(item.dataset.parallaxScale || 1.04);
    const endScale = Number(item.dataset.parallaxScaleEnd || startScale);
    const localProgress = clamp(-rect.top / Math.max(rect.height, 1));
    const scale = startScale + (endScale - startScale) * localProgress;

    item.style.setProperty("--parallax-y", `${y}px`);
    item.style.setProperty("--parallax-scale", scale.toFixed(3));
  });
};

const updateStickyHorizontal = () => {
  if (!stickyState.section || !stickyState.track || !stickyState.cards.length) return;

  if (!desktopQuery.matches || prefersReducedMotion) {
    stickyState.dots.forEach((dot, index) => dot.classList.toggle("is-active", index === 0));
    return;
  }

  const rect = stickyState.section.getBoundingClientRect();
  const scrollable = Math.max(stickyState.section.offsetHeight - window.innerHeight, 1);
  const progress = clamp(-rect.top / scrollable);
  const x = stickyState.startX + (stickyState.endX - stickyState.startX) * progress;
  const activeFloat = progress * (stickyState.cards.length - 1);
  const activeIndex = Math.round(activeFloat);

  stickyState.track.style.setProperty("--sticky-x", `${x}px`);

  stickyState.cards.forEach((card, index) => {
    const distance = Math.abs(index - activeFloat);
    const opacity = 1 - Math.min(distance * 0.34, 0.38);
    const scale = 1 - Math.min(distance * 0.06, 0.08);

    card.style.setProperty("--card-opacity", opacity.toFixed(3));
    card.style.setProperty("--card-scale", scale.toFixed(3));
  });

  stickyState.dots.forEach((dot, index) => dot.classList.toggle("is-active", index === activeIndex));
};

const updateScrollAnimations = () => {
  ticking = false;
  updateParallax();
  updateStickyHorizontal();
};

const requestScrollUpdate = () => {
  if (ticking) return;
  ticking = true;
  window.requestAnimationFrame(updateScrollAnimations);
};

measureSticky();
measureVoiceSlider();
updateScrollAnimations();

window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener(
  "resize",
  () => {
    measureSticky();
    measureVoiceSlider();
    requestScrollUpdate();
  },
  { passive: true }
);

window.addEventListener(
  "load",
  () => {
    measureSticky();
    measureVoiceSlider();
    requestScrollUpdate();
  },
  { passive: true }
);

desktopQuery.addEventListener?.("change", () => {
  measureSticky();
  measureVoiceSlider();
  requestScrollUpdate();
});
