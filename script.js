// Enable CSS that depends on JavaScript presence
document.documentElement.classList.add("js");

/* Smooth scroll (Lenis) ----------------------------------------------------
   Lenis drives the page on a rAF loop but still moves the real document scroll
   position, so window.pageYOffset and native scroll events keep working — every
   scroll-position read further down this file is unchanged.
   Disabled outright under prefers-reduced-motion; native scrolling is the
   fallback and all the code below behaves identically without it. */
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;
let lenis = null;

function initSmoothScroll() {
  if (prefersReducedMotion || typeof Lenis === "undefined") return;

  lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    // Touch is left native: the video carousel and the what-is carousel both
    // run their own touchstart/touchend handlers, and syncing touch here
    // fights them on mobile.
    syncTouch: false,
  });

  // Only drive our own loop when GSAP is absent. When it loads, initReveals()
  // hands Lenis to gsap.ticker instead — two independent rAF loops is exactly
  // what makes scroll-linked motion feel loose.
  if (typeof gsap === "undefined") {
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  document.documentElement.classList.add("lenis-active");
}

// Single entry point for in-page jumps so nav links, the hero buttons and the
// scroll dots all travel the same way whether or not Lenis is running.
function smoothScrollTo(target) {
  if (!target) return;

  if (lenis) {
    lenis.scrollTo(target);
  } else {
    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }
}

/* One rAF-throttled scroll pass shared by the header, the progress bar, the
   nav highlight and the scroll dots. These used to be three separate listeners
   each doing its own layout reads on every scroll event. */
const scrollHandlers = [];
let scrollTicking = false;

function onScroll(handler) {
  scrollHandlers.push(handler);
}

function runScrollHandlers() {
  const scrollTop = window.pageYOffset;
  scrollHandlers.forEach((handler) => handler(scrollTop));
  scrollTicking = false;
}

function requestScrollUpdate() {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(runScrollHandlers);
}

window.addEventListener("scroll", requestScrollUpdate, { passive: true });

// Stat counter animation
document.addEventListener("DOMContentLoaded", function () {
  const counters = [
    { selector: ".hero-stats .stat-card:nth-child(1) .stat-number", end: 5, suffix: "+" },
    { selector: ".hero-stats .stat-card:nth-child(3) .stat-number", end: 100, suffix: "%" },
  ];

  function runCounter(el, end, suffix) {
    const duration = 1500;
    const startTime = performance.now();
    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * end) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // Delay to let hero entrance animation finish first
  setTimeout(() => {
    counters.forEach(({ selector, end, suffix }) => {
      const el = document.querySelector(selector);
      if (el) runCounter(el, end, suffix);
    });
  }, 900);
});

/* Scroll reveals (GSAP + ScrollTrigger + SplitText) -------------------------
   The reveal CSS hides things only while <html> has .js and lacks .no-anim.
   Anything that goes wrong in here adds .no-anim, which un-hides the whole
   page — a previous scroll-reveal attempt on this site shipped a black screen
   on load, and that must not be repeatable. */

const CARD_SELECTOR =
  ".feature-item, .program-card, .service-card, .coach-card, .lab-feature";

// One easing curve for the whole site. The CSS twin is --ease in styles.css;
// keep the two in step if either changes.
const EASE = "power3.out";

// Everything the reveal code touches, so the failsafe can put it all back.
const REVEAL_TARGETS =
  CARD_SELECTOR +
  ", .service-card img, .coach-card img, .section-subtitle, .sline, .sline-mask" +
  // Step 3 targets. .hero-bg especially: .no-anim drops the CSS slack that
  // makes room for the drift, so a leftover inline transform would bare a
  // strip at the top of the hero.
  ", .hero-bg, .logos-scroll, .program-card-number";

// SplitText instances, kept so a failure can un-split the headings.
const splits = [];

function disableAnimations() {
  document.documentElement.classList.add("no-anim");

  // Dropping the class is not enough on its own: a tween that started and did
  // not finish leaves inline styles behind, and inline beats every CSS rule we
  // could write. Clear those too, or a mid-flight failure leaves the page
  // blank — which is exactly how the earlier scroll-reveal attempt here
  // shipped a black screen.
  if (typeof gsap === "undefined") return;

  try {
    splits.forEach((split) => split.revert());
    splits.length = 0;
    if (typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill(true));
    }
    gsap.killTweensOf(REVEAL_TARGETS);
    gsap.set(REVEAL_TARGETS, { clearProps: "all" });
  } catch (err) {
    console.error("Could not fully reset reveal styles:", err);
  }
}

function initReveals() {
  // Must come first: the gsap.ticker handoff below needs a live Lenis instance,
  // and this handler runs before the main DOMContentLoaded block further down.
  initSmoothScroll();

  const hasGsap =
    typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";

  if (prefersReducedMotion || !hasGsap) {
    disableAnimations();
    return;
  }

  try {
    gsap.registerPlugin(ScrollTrigger);

    // Lenis and ScrollTrigger on one clock
    if (lenis) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    // Masked line-by-line headline reveals. SplitText re-splits on resize via
    // autoSplit, and onSplit rebuilds the tween against the new lines.
    if (typeof SplitText !== "undefined") {
      gsap.registerPlugin(SplitText);

      document
        .querySelectorAll(".hero-title, .section-title")
        .forEach((heading) => {
          splits.push(
            SplitText.create(heading, {
              type: "lines",
              linesClass: "sline",
              mask: "lines",
              autoSplit: true,
              onSplit(self) {
                return gsap.from(self.lines, {
                  yPercent: 110,
                  duration: 0.9,
                  ease: EASE,
                  stagger: 0.11,
                  scrollTrigger: {
                    trigger: heading,
                    start: "top 85%",
                    once: true,
                  },
                });
              },
            })
          );
        });
    }

    // Subtitles trail their heading
    gsap.utils.toArray(".section-subtitle").forEach((el) => {
      gsap.from(el, {
        y: 24,
        opacity: 0,
        duration: 0.7,
        ease: EASE,
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    });

    // Cards, staggered per screenful rather than per element
    ScrollTrigger.batch(CARD_SELECTOR, {
      start: "top 88%",
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: EASE,
          stagger: 0.1,
          overwrite: true,
          // Hands the CSS hover transition back once the reveal is done
          onComplete: () => batch.forEach((el) => el.classList.add("is-revealed")),
        }),
    });

    // Images wipe up instead of fading — reads deliberate rather than default
    gsap.utils
      .toArray(".service-card img, .coach-card img")
      .forEach((img) => {
        gsap.to(img, {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1,
          ease: EASE,
          scrollTrigger: { trigger: img, start: "top 88%", once: true },
          onComplete: () => img.classList.add("is-revealed"),
        });
      });

    initParallax();
    initMarquee();

    // Late-loading media changes every trigger position on the page
    window.addEventListener("load", () => ScrollTrigger.refresh());

    document.documentElement.classList.add("anim-ready");
  } catch (err) {
    console.error("Reveal setup failed, showing everything:", err);
    disableAnimations();
  }
}

/* Hero background drifts slower than the content over it. The CSS gives
   .hero-bg 120vh of height at top: -10vh so there is slack to move into —
   without that, drifting exposes a bare strip at the top of the hero. */
function initParallax() {
  const heroBg = document.querySelector(".hero-bg");
  if (heroBg) {
    gsap.fromTo(
      heroBg,
      { yPercent: -8 },
      {
        yPercent: 8,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      }
    );
  }

  // The oversized 01/02/03 watermarks drift against their cards
  gsap.utils.toArray(".program-card-number").forEach((num) => {
    gsap.fromTo(
      num,
      { y: 18 },
      {
        y: -18,
        ease: "none",
        scrollTrigger: {
          trigger: num.closest(".program-card"),
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );
  });
}

/* The age-group strip runs as a CSS marquee by default. With JS up, GSAP owns
   it instead so its speed and direction can follow the scroll — a constant
   crawl is the giveaway that a marquee is decorative rather than reactive. */
function initMarquee() {
  const track = document.querySelector(".logos-scroll");
  if (!track || !lenis) return;

  const marquee = gsap.to(track, {
    xPercent: -50,
    duration: 30,
    ease: "none",
    repeat: -1,
  });

  lenis.on("scroll", ({ velocity }) => {
    const direction = velocity < 0 ? -1 : 1;
    const boost = gsap.utils.clamp(1, 6, 1 + Math.abs(velocity) / 12);
    gsap.to(marquee, {
      timeScale: direction * boost,
      duration: 0.4,
      overwrite: true,
    });
  });
}

document.addEventListener("DOMContentLoaded", initReveals);

// Last resort: if initReveals never reached the end, un-hide the page anyway.
window.setTimeout(function () {
  const root = document.documentElement;
  if (!root.classList.contains("anim-ready")) {
    disableAnimations();
  }
}, 4000);
// Smooth scrolling for navigation links
document.addEventListener("DOMContentLoaded", function () {
  // Smooth scroll is already up — initReveals() starts it, since it has to
  // exist before the gsap.ticker handoff.

  // Initialize scroll functionality
  initScrollFeatures();

  // Initialize nav highlight
  initNavHighlight();

  // Initialize video carousel
  initVideoCarousel();

  // Initialize what-is image carousel
  initWhatIsCarousel();

  // Smooth scrolling for navigation links
  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      // A bare href="#" would make this querySelector throw a SyntaxError and
      // kill the handler, so anything without an actual id is ignored.
      const targetId = this.getAttribute("href");
      const targetSection =
        targetId && targetId.length > 1 ? document.querySelector(targetId) : null;

      smoothScrollTo(targetSection);

      // Close mobile menu if open
      closeMobileMenu();
    });
  });

  // Smooth scrolling for buttons with data-scroll-target
  const scrollButtons = document.querySelectorAll("[data-scroll-target]");
  scrollButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const targetSelector = this.getAttribute("data-scroll-target");
      if (!targetSelector) {
        return;
      }

      smoothScrollTo(document.querySelector(targetSelector));
    });
  });

  // Service card read more toggles - Event delegation approach
  document.addEventListener("click", function (e) {
    const button = e.target.closest("[data-toggle=\"service\"]");
    if (!button) return;

    e.preventDefault();
    e.stopPropagation();

    const card = button.closest(".service-card");
    if (!card) {
      console.error("Card not found");
      return;
    }

    // Toggle ONLY this specific card
    const isExpanded = card.classList.toggle("is-expanded");

    if (isExpanded) {
      button.textContent = "Shfaq më pak";
    } else {
      button.textContent = "Lexo më shumë";
    }
  });

  // Header scroll effect
  const header = document.querySelector(".header");

  onScroll(function (scrollTop) {
    if (scrollTop > 100) {
      header.style.backgroundColor = "rgba(1, 0, 0, 0.95)";
    } else {
      header.style.backgroundColor = "transparent";
    }
  });

  // Pagination functionality
  const paginationDots = document.querySelectorAll(".pagination .dot");
  paginationDots.forEach((dot, index) => {
    dot.addEventListener("click", function () {
      // Remove active class from all dots
      paginationDots.forEach((d) => d.classList.remove("active"));
      // Add active class to clicked dot
      this.classList.add("active");

      // Here you can add logic to show different content based on the selected dot
      console.log(`Selected page: ${index + 1}`);
    });
  });

  // Testimonial navigation
  const prevBtn = document.querySelector(".nav-btn.prev");
  const nextBtn = document.querySelector(".nav-btn.next");

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener("click", function () {
      // Add logic to show previous testimonial
      console.log("Show previous testimonial");
    });

    nextBtn.addEventListener("click", function () {
      // Add logic to show next testimonial
      console.log("Show next testimonial");
    });
  }

  // Hero navigation arrows
  const leftArrow = document.querySelector(".nav-arrow.left");
  const rightArrow = document.querySelector(".nav-arrow.right");

  if (leftArrow && rightArrow) {
    leftArrow.addEventListener("click", function () {
      // Add logic to navigate to previous hero slide
      console.log("Navigate to previous hero slide");
    });

    rightArrow.addEventListener("click", function () {
      // Add logic to navigate to next hero slide
      console.log("Navigate to next hero slide");
    });
  }

  // Email form submission
  const emailForm = document.querySelector(".email-form");
  const emailInput = document.querySelector(".email-input");

  if (emailForm && emailInput) {
    emailForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const email = emailInput.value.trim();
      if (email && isValidEmail(email)) {
        // Here you would typically send the email to your backend
        alert("Thank you for subscribing! Welcome to the Pro Form community.");
        emailInput.value = "";
      } else {
        alert("Please enter a valid email address.");
      }
    });
  }

  // Button click effects
  const buttons = document.querySelectorAll(".btn");
  buttons.forEach((button) => {
    button.addEventListener("click", function (e) {
      // Add ripple effect
      const ripple = document.createElement("span");
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = x + "px";
      ripple.style.top = y + "px";
      ripple.classList.add("ripple");

      this.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });

  // Mobile menu functionality
  const mobileMenuToggle = document.createElement("button");
  mobileMenuToggle.className = "mobile-menu-toggle";
  mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
  mobileMenuToggle.style.display = "none";

  const logo = document.querySelector(".logo");
  logo.parentNode.insertBefore(mobileMenuToggle, logo.nextSibling);

  // Show mobile menu toggle on small screens
  function checkMobile() {
    if (window.innerWidth <= 768) {
      mobileMenuToggle.style.display = "block";
      document.querySelector(".nav").style.display = "none";
    } else {
      mobileMenuToggle.style.display = "none";
      document.querySelector(".nav").style.display = "flex";
      closeMobileMenu();
    }
  }

  checkMobile();
  window.addEventListener("resize", checkMobile);

  // Mobile menu toggle functionality
  mobileMenuToggle.addEventListener("click", function () {
    const nav = document.querySelector(".nav");

    if (nav.classList.contains("active")) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  // Close mobile menu function
  function closeMobileMenu() {
    const nav = document.querySelector(".nav");

    nav.classList.remove("active");

    // Update toggle button icon
    mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
  }

  // Open mobile menu function
  function openMobileMenu() {
    const nav = document.querySelector(".nav");

    nav.classList.add("active");

    // Update toggle button icon
    mobileMenuToggle.innerHTML = '<i class="fas fa-times"></i>';
  }

  // Close mobile menu when clicking outside
  document.addEventListener("click", function (e) {
    const nav = document.querySelector(".nav");
    const header = document.querySelector(".header");

    if (!header.contains(e.target) && nav.classList.contains("active")) {
      closeMobileMenu();
    }
  });

  // Touch events for mobile
  let touchStartY = 0;
  let touchEndY = 0;

  document.addEventListener("touchstart", function (e) {
    touchStartY = e.changedTouches[0].screenY;
  });

  document.addEventListener("touchend", function (e) {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
  });

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartY - touchEndY;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe up - could be used for navigation
        console.log("Swipe up detected");
      } else {
        // Swipe down - could be used for navigation
        console.log("Swipe down detected");
      }
    }
  }

  // Performance optimization for mobile
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      // Register service worker for better performance
      console.log("Service Worker support available");
    });
  }

  // Lazy loading for images on mobile
  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove("lazy");
          imageObserver.unobserve(img);
        }
      });
    });

    document.querySelectorAll("img[data-src]").forEach((img) => {
      imageObserver.observe(img);
    });
  }

  // Hero background: video mode (see videos/1.mov – 4.mov)
  // To switch video, change the src in index.html hero-bg video tag
});

// Nav highlight on scroll
function initNavHighlight() {
  const navLinks = document.querySelectorAll(".nav a[href^='#']");
  const sectionIds = Array.from(navLinks).map((a) => a.getAttribute("href").slice(1));
  const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);

  function updateActiveNav(y) {
    const scrollTop = (y === undefined ? window.pageYOffset : y) + 120;
    let currentId = sectionIds[0];

    sections.forEach((section) => {
      if (scrollTop >= section.offsetTop) {
        currentId = section.id;
      }
    });

    navLinks.forEach((a) => {
      if (a.getAttribute("href") === "#" + currentId) {
        a.classList.add("nav-active");
      } else {
        a.classList.remove("nav-active");
      }
    });
  }

  onScroll(updateActiveNav);
  updateActiveNav();
}

// Initialize scroll features
function initScrollFeatures() {
  const scrollProgress = document.querySelector(".scroll-progress");
  const scrollDots = document.querySelectorAll(".scroll-dot");

  const sectionSelectorsByName = {
    Home: "#home",
    Partners: ".partners",
    About: "#about",
    Programs: "#programs",
    "Programs Offers": ".services",
    Coaches: "#coaches",
    Performance: "#performance",
    BMI: "#bmi-calculator",
    Videos: "#videos",
    Footer: ".footer-section",
  };

  const mappedSections = Array.from(scrollDots)
    .map((dot) => {
      const sectionName = dot.dataset.section;
      const selector =
        sectionSelectorsByName[sectionName] ||
        `#${String(sectionName || "").toLowerCase()}`;
      const section = document.querySelector(selector);
      return section ? { dot, section } : null;
    })
    .filter(Boolean);

  // Update scroll progress bar
  onScroll((scrollTop) => {
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    if (scrollProgress) {
      scrollProgress.style.width = scrollPercent + "%";
    }

    // Update active scroll dot
    updateActiveScrollDot(scrollTop, mappedSections);
  });

  // Scroll dot click navigation
  mappedSections.forEach(({ dot, section }) => {
    dot.addEventListener("click", () => {
      smoothScrollTo(section);
    });
  });
}

// Initialize video carousel
function initVideoCarousel() {
  const videoContainer = document.querySelector(".video-container");
  const prevBtn = document.getElementById("prevVideo");
  const nextBtn = document.getElementById("nextVideo");
  const dots = document.querySelectorAll(".video-dot");

  let currentVideo = 0;
  const totalVideos = document.querySelectorAll(".video-slide").length;

  // Update video carousel
  function updateVideoCarousel() {
    const translateX = -currentVideo * 100;
    videoContainer.style.transform = `translateX(${translateX}%)`;

    // Update navigation buttons
    prevBtn.disabled = currentVideo === 0;
    nextBtn.disabled = currentVideo === totalVideos - 1;

    // Update dots
    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === currentVideo);
    });

    // Pause all videos
    const videos = document.querySelectorAll(".video-player");
    videos.forEach((video) => video.pause());

    // Nudge the incoming video so its native control bar re-measures. Every
    // slide past the first is clipped outside .video-carousel's overflow when
    // the page first lays out, and browsers can leave the UA controls widget
    // sized against that stale box — the control bar then renders short and
    // left-aligned until playback forces a rebuild. Toggling `controls` does
    // that rebuild up front. Run twice: once now, once after the slide has
    // finished travelling and is fully unclipped.
    const active = videos[currentVideo];
    if (active) {
      const refreshControls = () => {
        if (!active.hasAttribute("controls")) return;
        active.removeAttribute("controls");
        void active.offsetWidth;
        active.setAttribute("controls", "");
      };
      refreshControls();
      window.setTimeout(refreshControls, 550);
    }
  }

  // Next video
  nextBtn.addEventListener("click", () => {
    if (currentVideo < totalVideos - 1) {
      currentVideo++;
      updateVideoCarousel();
    }
  });

  // Previous video
  prevBtn.addEventListener("click", () => {
    if (currentVideo > 0) {
      currentVideo--;
      updateVideoCarousel();
    }
  });

  // Dot navigation
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      currentVideo = index;
      updateVideoCarousel();
    });
  });

  // Touch/swipe support for mobile
  let startX = 0;
  let endX = 0;

  videoContainer.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
  });

  videoContainer.addEventListener("touchend", (e) => {
    endX = e.changedTouches[0].clientX;
    const diff = startX - endX;

    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentVideo < totalVideos - 1) {
        // Swipe left - next video
        currentVideo++;
        updateVideoCarousel();
      } else if (diff < 0 && currentVideo > 0) {
        // Swipe right - previous video
        currentVideo--;
        updateVideoCarousel();
      }
    }
  });

  // Auto-advance disabled - manual control only
  // Uncomment below to enable auto-advance every 8 seconds
  /*
  let autoAdvance = setInterval(() => {
    if (currentVideo < totalVideos - 1) {
      currentVideo++;
    } else {
      currentVideo = 0;
    }
    updateVideoCarousel();
  }, 8000);

  // Pause auto-advance on user interaction
  videoContainer.addEventListener("mouseenter", () =>
    clearInterval(autoAdvance),
  );
  videoContainer.addEventListener("mouseleave", () => {
    autoAdvance = setInterval(() => {
      if (currentVideo < totalVideos - 1) {
        currentVideo++;
      } else {
        currentVideo = 0;
      }
      updateVideoCarousel();
    }, 8000);
  });
  */
}

// Utility functions
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function animateCounter(element, start, end, duration, prefix = "") {
  const startTime = performance.now();

  function updateCounter(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const current = Math.floor(start + (end - start) * progress);
    element.textContent = prefix + current;

    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    }
  }

  requestAnimationFrame(updateCounter);
}

function updateActiveScrollDot(scrollTop, mappedSections) {
  if (!mappedSections || mappedSections.length === 0) {
    return;
  }

  let activeIndex = -1;
  mappedSections.forEach(({ section }, index) => {
    const sectionTop = section.offsetTop;
    const sectionBottom = sectionTop + section.offsetHeight;

    if (scrollTop >= sectionTop - 120 && scrollTop < sectionBottom - 120) {
      activeIndex = index;
    }
  });

  if (activeIndex >= 0) {
    mappedSections.forEach(({ dot }) => dot.classList.remove("active"));
    mappedSections[activeIndex].dot.classList.add("active");
  }

  const maxScrollTop = document.body.scrollHeight - window.innerHeight - 5;
  if (scrollTop >= maxScrollTop) {
    mappedSections.forEach(({ dot }) => dot.classList.remove("active"));
    mappedSections[mappedSections.length - 1].dot.classList.add("active");
  }
}

// Add CSS for ripple effect and mobile optimizations
const style = document.createElement("style");
style.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .mobile-menu-toggle {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0.5rem;
        z-index: 1001;
    }
    
    /* Mobile menu animations */
    .nav {
        transition: all 0.3s ease;
    }
    
    .nav.active {
        display: flex !important;
    }
    
    /* Touch-friendly button sizes */
    @media (max-width: 768px) {
        .btn {
            min-height: 44px;
            min-width: 44px;
        }
        
        .nav a {
            padding: 12px 16px;
            min-height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }
    
    /* Prevent text selection on mobile */
    @media (max-width: 768px) {
        .btn, .nav a, .scroll-dot, .video-nav-btn, .video-dot {
            -webkit-user-select: none;
            user-select: none;
            -webkit-touch-callout: none;
        }

        input, select, textarea, video {
            -webkit-user-select: text;
            user-select: text;
            -webkit-touch-callout: default;
        }
    }
    
    /* Keep animations smooth without overriding everything */
    
    /* High contrast mode support */
    @media (prefers-contrast: high) {
        .btn {
            border: 2px solid currentColor;
        }
        
        .stat-card, .metric-card {
            border: 2px solid currentColor;
        }
    }
    
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
        * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    }
`;
document.head.appendChild(style);

// What-Is Section Image Carousel
function initWhatIsCarousel() {
  const carousel = document.querySelector(".what-is-carousel");
  if (!carousel) return;

  const track = carousel.querySelector(".carousel-track");
  const images = track.querySelectorAll("img");
  const dotsContainer = carousel.querySelector(".carousel-dots");
  const prevBtn = carousel.querySelector(".carousel-prev");
  const nextBtn = carousel.querySelector(".carousel-next");
  const total = images.length;
  let current = 0;
  let autoTimer = null;

  // Build dots
  images.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "carousel-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", "Slide " + (i + 1));
    dot.addEventListener("click", () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = "translateX(-" + current * 100 + "%)";
    dotsContainer.querySelectorAll(".carousel-dot").forEach((d, i) => {
      d.classList.toggle("active", i === current);
    });
  }

  prevBtn.addEventListener("click", () => { resetAuto(); goTo(current - 1); });
  nextBtn.addEventListener("click", () => { resetAuto(); goTo(current + 1); });

  // Touch/swipe support
  let touchStartX = 0;
  carousel.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  carousel.addEventListener("touchend", (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { resetAuto(); goTo(current + (diff > 0 ? 1 : -1)); }
  }, { passive: true });

  // Auto-advance every 4 seconds
  function startAuto() {
    autoTimer = setInterval(() => goTo(current + 1), 4000);
  }
  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  startAuto();
}

// BMI Calculator Functionality
document.addEventListener("DOMContentLoaded", function () {
  const calculateBtn  = document.getElementById("calculateBMI");
  const heightInput   = document.getElementById("height");
  const weightInput   = document.getElementById("weight");
  const ageInput      = document.getElementById("age");
  const genderInput   = document.getElementById("gender");
  const bmiNumberEl   = document.getElementById("bmiValue");
  const bmiCategoryEl = document.getElementById("bmiCategory");
  const bodyFatEl     = document.getElementById("bodyFatValue");
  const ageGenderEl   = document.getElementById("ageGenderDisplay");
  const gaugeNeedle   = document.querySelector(".gauge-needle");
  const gaugeArcs     = document.querySelectorAll(".gauge-arc");

  // Floating label: mark select as has-value when an option is picked
  genderInput.addEventListener("change", function () {
    this.closest(".bmi-field").classList.toggle("has-value", this.value !== "");
  });

  // BMI to needle rotation — aligned to the 4 arc segments
  function bmiToRotation(bmi) {
    if (bmi < 18.5)       return -90 + (Math.max(bmi, 10) - 10) / 8.5 * 45;
    if (bmi < 25)         return -45 + (bmi - 18.5) / 6.5 * 63;
    if (bmi < 30)         return  18 + (bmi - 25)   / 5   * 45;
    return Math.min(90,    63 + (bmi - 30)   / 10  * 27);
  }

  // Animate BMI number counting up
  function animateBmiNumber(target) {
    const duration = 900;
    const start = performance.now();
    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      bmiNumberEl.textContent = (eased * target).toFixed(1);
      if (t < 1) requestAnimationFrame(tick);
      else bmiNumberEl.textContent = target.toFixed(1);
    }
    requestAnimationFrame(tick);
  }

  function calculateBMI() {
    const height = parseFloat(heightInput.value);
    const weight = parseFloat(weightInput.value);
    const age    = parseFloat(ageInput.value);
    const gender = genderInput.value;

    if (!height || !weight || height < 100 || height > 250 || weight < 30 || weight > 300) {
      alert("Shkruani lartësinë (100–250 cm) dhe peshën (30–300 kg) saktë.");
      return;
    }
    if (!age || age < 10 || age > 120) {
      alert("Shkruani moshën saktë (10–120 vjet).");
      return;
    }
    if (!gender) {
      alert("Zgjidhni gjininë.");
      return;
    }

    const bmi = weight / Math.pow(height / 100, 2);

    // Body fat (Deurenberg)
    let bf = gender === "male"
      ? 1.2 * bmi + 0.23 * age - 16.2
      : gender === "female"
        ? 1.2 * bmi + 0.23 * age - 5.4
        : 1.2 * bmi + 0.23 * age - 10.8;
    bf = Math.min(60, Math.max(2, bf));

    // Category
    let category, categoryClass;
    if      (bmi < 18.5) { category = "Nënpeshë"; categoryClass = "underweight"; }
    else if (bmi < 25)   { category = "Normal";    categoryClass = "normal"; }
    else if (bmi < 30)   { category = "Mbipeshë";  categoryClass = "overweight"; }
    else                 { category = "Obez";       categoryClass = "obese"; }

    const genderText = gender === "male" ? "Mashkull" : gender === "female" ? "Femër" : "Tjetër";

    // Animate needle
    gaugeNeedle.style.transform = `rotate(${bmiToRotation(bmi)}deg)`;

    // Highlight active arc
    gaugeArcs.forEach(arc => arc.classList.remove("active-arc"));
    document.querySelector(`.gauge-arc.${categoryClass}`)?.classList.add("active-arc");

    // Animate BMI number
    animateBmiNumber(bmi);

    // Update rest
    bmiCategoryEl.textContent = category;
    bmiCategoryEl.className   = "bmi-category " + categoryClass;
    bodyFatEl.textContent     = bf.toFixed(1) + "%";
    ageGenderEl.textContent   = `${age} vj · ${genderText}`;
  }

  calculateBtn.addEventListener("click", calculateBMI);
  [heightInput, weightInput, ageInput].forEach(inp =>
    inp.addEventListener("keypress", e => { if (e.key === "Enter") calculateBMI(); })
  );
});
