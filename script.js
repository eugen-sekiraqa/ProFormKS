// Scroll-triggered fade-in animation for sections
document.addEventListener("DOMContentLoaded", function () {
  const sections = document.querySelectorAll("section");
  const observer = new window.IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("section-visible");
        }
      });
    },
    {
      threshold: 0.15,
    },
  );
  sections.forEach((section) => {
    observer.observe(section);
  });
});
// Smooth scrolling for navigation links
document.addEventListener("DOMContentLoaded", function () {
  // Initialize scroll functionality
  initScrollFeatures();

  // Initialize video carousel
  initVideoCarousel();

  // Smooth scrolling for navigation links
  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }

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

      const targetSection = document.querySelector(targetSelector);
      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
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
  let lastScrollTop = 0;

  window.addEventListener("scroll", function () {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > 100) {
      header.style.backgroundColor = "rgba(1, 0, 0, 0.95)";
    } else {
      header.style.backgroundColor = "transparent";
    }

    lastScrollTop = scrollTop;
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

  // Background images for hero section - Add your images to the images/ folder
  // Supported formats: jpg, jpeg, png, webp
  // Recommended size: 1920x1080 or larger for best quality
  const heroImages = [
    "images/hero-bg-1.jpeg",
    "images/hero-bg-2.jpeg",
    "images/hero-bg-3.jpeg",
    "images/hero-bg-4.jpeg",
    "images/hero-bg-5.jpeg",
    "images/hero-bg-6.jpeg",
    "images/hero-bg-7.jpeg",
    "images/hero-bg-8.jpeg",
  ];
  let currentHeroIndex = 0;
  function changeHeroBg() {
    const heroBg = document.querySelector(".hero-bg");
    if (heroBg) {
      heroBg.classList.add("fade-out");
      setTimeout(() => {
        heroBg.style.backgroundImage = `url('${heroImages[currentHeroIndex]}')`;
        currentHeroIndex = (currentHeroIndex + 1) % heroImages.length;
        heroBg.classList.remove("fade-out");
        heroBg.classList.add("fade-in");
        setTimeout(() => {
          heroBg.classList.remove("fade-in");
        }, 1000);
      }, 500);
    }
  }
  setInterval(changeHeroBg, 5000);
  window.addEventListener("DOMContentLoaded", changeHeroBg);
});

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
  window.addEventListener("scroll", () => {
    const scrollTop = window.pageYOffset;
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
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
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
        * {
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
        
        .btn, .nav a {
            -webkit-user-select: none;
            user-select: none;
        }
    }
    
    /* Smooth scrolling for mobile */
    @media (max-width: 768px) {
        html {
            scroll-behavior: smooth;
        }
    }
    
    /* Optimize animations for mobile */
    @media (max-width: 768px) {
        * {
            animation-duration: 0.3s !important;
            transition-duration: 0.3s !important;
        }
    }
    
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

// BMI Calculator Functionality
document.addEventListener("DOMContentLoaded", function () {
  const calculateBtn = document.getElementById("calculateBMI");
  const heightInput = document.getElementById("height");
  const weightInput = document.getElementById("weight");
  const ageInput = document.getElementById("age");
  const genderInput = document.getElementById("gender");
  const bmiValueEl = document.getElementById("bmiValue");
  const bmiCategoryEl = document.getElementById("bmiCategory");
  const gaugeNeedle = document.querySelector(".gauge-needle");

  // Calculate BMI function with age and gender
  function calculateBMI() {
    const height = parseFloat(heightInput.value);
    const weight = parseFloat(weightInput.value);
    const age = parseFloat(ageInput.value);
    const gender = genderInput.value;

    // Validation
    if (
      !height ||
      !weight ||
      height < 100 ||
      height > 250 ||
      weight < 30 ||
      weight > 300
    ) {
      alert(
        "Please enter valid height (100-250 cm) and weight (30-300 kg) values.",
      );
      return;
    }

    if (!age || age < 10 || age > 120) {
      alert("Please enter a valid age (10-120 years).");
      return;
    }

    if (!gender) {
      alert("Please select your gender.");
      return;
    }

    // Calculate BMI
    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);

    // Calculate Body Fat Percentage (Deurenberg formula - accounts for age and gender)
    let bodyFatPercentage;
    if (gender === "male") {
      bodyFatPercentage = (1.2 * bmi + 0.23 * age - 16.2).toFixed(1);
    } else if (gender === "female") {
      bodyFatPercentage = (1.2 * bmi + 0.23 * age - 5.4).toFixed(1);
    } else {
      // Average for 'other'
      bodyFatPercentage = (1.2 * bmi + 0.23 * age - 10.8).toFixed(1);
    }

    // Ensure body fat is within realistic range
    if (bodyFatPercentage < 2) bodyFatPercentage = 2;
    if (bodyFatPercentage > 60) bodyFatPercentage = 60;

    // Update BMI value with body fat info
    bmiValueEl.innerHTML = `${bmi}<span style="font-size: 0.7em; display: block; margin-top: 0.3rem; color: rgba(204, 251, 2, 0.8);">BF: ${bodyFatPercentage}%</span>`;

    // Determine category based on age-adjusted BMI
    let category = "";
    let categoryClass = "";
    let needleRotation = 0;
    let ageGroup = age < 18 ? "young" : age < 65 ? "adult" : "senior";

    if (bmi < 18.5) {
      category = "Underweight";
      categoryClass = "underweight";
      needleRotation = -60 + (bmi / 18.5) * 40;
    } else if (bmi >= 18.5 && bmi < 25) {
      category = "Normal Weight";
      categoryClass = "normal";
      needleRotation = -20 + ((bmi - 18.5) / 6.5) * 40;
    } else if (bmi >= 25 && bmi < 30) {
      category = "Overweight";
      categoryClass = "overweight";
      needleRotation = 20 + ((bmi - 25) / 5) * 40;
    } else {
      category = "Obese";
      categoryClass = "obese";
      needleRotation = 60;
    }

    // Add age and gender context
    let ageContext = "";
    if (ageGroup === "young") {
      ageContext = " (Youth Standards)";
    } else if (ageGroup === "senior") {
      ageContext = " (Senior Adjusted)";
    }

    // Update category
    bmiCategoryEl.innerHTML = `<strong>${category}</strong>${ageContext}<br><small style="font-size: 0.85em; color: rgba(204, 251, 2, 0.8);">${gender.charAt(0).toUpperCase() + gender.slice(1)}, Age ${age}</small>`;
    bmiCategoryEl.className = "bmi-category " + categoryClass;

    // Rotate needle with animation
    gaugeNeedle.style.transform = `rotate(${needleRotation}deg)`;

    // Add animation to result
    bmiValueEl.style.animation = "none";
    setTimeout(() => {
      bmiValueEl.style.animation = "pulse 0.5s ease-in-out";
    }, 10);
  }

  // Event listeners
  calculateBtn.addEventListener("click", calculateBMI);

  // Allow Enter key to calculate
  heightInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") calculateBMI();
  });

  weightInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") calculateBMI();
  });

  ageInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") calculateBMI();
  });
});
