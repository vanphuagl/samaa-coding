"use strict";

// ===== globals =====
const isMobile = window.matchMedia("(max-width: 1024px)");
const eventsTrigger = ["pageshow", "scroll"];
const detectScroll = (detect) => {
  if (detect) {
    lenis.stop();
    document.body.style.overflow = "hidden";
  } else {
    lenis.start();
    document.body.style.removeProperty("overflow");
  }
};

// ===== init =====
const init = () => {
  // # app height
  appHeight();
  // # init menu
  initMenu();
  // # init product swipers
  initProductSwipers();
  // # lazy load
  const ll = new LazyLoad({
    threshold: 100,
    elements_selector: ".lazy",
  });
};

// ===== lenis =====
const lenis = new Lenis({
  lerp: 0.05,
  smoothWheel: true,
});
const raf = (t) => {
  lenis.raf(t);
  requestAnimationFrame(raf);
};
requestAnimationFrame(raf);

// ===== app height =====
const appHeight = () => {
  const doc = document.documentElement;
  const menuH = Math.max(doc.clientHeight, window.innerHeight || 0);

  if (isMobile.matches) {
    doc.style.setProperty("--app-height", `${doc.clientHeight}px`);
    doc.style.setProperty("--menu-height", `${menuH}px`);
  } else {
    doc.style.removeProperty("--app-height");
    doc.style.removeProperty("--menu-height");
  }
};
window.addEventListener("resize", appHeight);

// ===== href fadeout =====
document.addEventListener("click", (evt) => {
  const link = evt.target.closest(
    'a:not([href^="#"]):not([href^="/#"]):not([target]):not([href^="mailto"]):not([href^="tel"])'
  );
  if (!link) return;

  evt.preventDefault();
  const url = link.getAttribute("href");
  const currentUrl = window.location.pathname + window.location.search;

  if (url && url !== "") {
    const urlOnly = url.split("#")[0];
    const idx = url.indexOf("#");
    const hash = idx !== -1 ? url.substring(idx) : "";

    if (hash && hash !== "#") {
      try {
        const targetElement = document.querySelector(hash);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
          return false;
        }
      } catch (err) {
        console.error("Invalid hash selector:", hash, err);
      }
    }

    if (currentUrl !== urlOnly) {
      document.body.classList.add("fadeout");
      setTimeout(function () {
        window.location = url;
      }, 500);
    }
  }

  return false;
});

// ===== menu =====
const initMenu = () => {
  const [menus, toggleMenus] = [
    document.querySelector("[data-menu]"),
    document.querySelectorAll("[data-menu-toggle]"),
  ];
  if (!menus || !toggleMenus.length) return;

  // # toggle menu
  toggleMenus.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const shouldBeActive = !menus.classList.contains("--show");

      menus.classList.toggle("--show", shouldBeActive);
      toggle.textContent = shouldBeActive ? "CLOSE" : "MENU";
      detectScroll(shouldBeActive);
    });
  });

  // # toggle link
  const links = document.querySelectorAll("[data-menu-link] li a");
  links.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      menus.classList.remove("--show");
      toggleMenus.forEach((btn) => (btn.textContent = "Menu"));
      detectScroll(false);
    });
  });
};

// ===== products =====
const initProductSwipers = () => {
  const containers = document.querySelectorAll("[data-product-swiper]");
  if (!containers.length) return;

  const swipers = [];

  containers.forEach((container) => {
    const wrapper = container.querySelector(".swiper-wrapper");
    const slides = wrapper.querySelectorAll(".swiper-slide");

    // init swiper
    const swiper = new Swiper(container, {
      loop: true,
      speed: 200,
      effect: "fade",
      slidesPerView: 1,
      allowTouchMove: false,
      pagination: {
        el: container.querySelector(".swiper-pagination"),
        clickable: true,
        renderBullet: (index, className) => {
          if (slides >= slides.length) return "";
          return `<span class="${className}">${index + 1}</span>`;
        },
      },
      on: {
        slideChange: (swiper) => {
          setActiveBullet(swiper, slides.length);
        },
      },
    });

    // push swiper
    swipers.push(swiper);
  });

  return swipers;
};

// # active bullet when slide change
const setActiveBullet = (swiper, realSlidesCount) => {
  const bullets = swiper.pagination.bullets;
  bullets.forEach((bullet, idx) => {
    bullet.classList.toggle(
      swiper.params.pagination.bulletActiveClass,
      idx === swiper.realIndex % realSlidesCount
    );
  });
};

// ### ===== DOMCONTENTLOADED ===== ###
window.addEventListener("pageshow", () => {
  document.body.classList.remove("fadeout");
});
window.addEventListener("DOMContentLoaded", init);
