// Scroll-triggered fade-in animation for sections
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('section');
    const observer = new window.IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-visible');
            }
        });
    }, {
        threshold: 0.15
    });
    sections.forEach(section => {
        observer.observe(section);
    });
});
// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Initialize scroll functionality
    initScrollFeatures();
    
    // Initialize video carousel
    initVideoCarousel();
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
            
            // Close mobile menu if open
            closeMobileMenu();
        });
    });

    // Header scroll effect
    const header = document.querySelector('.header');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            header.style.backgroundColor = 'rgba(1, 0, 0, 0.95)';
        } else {
            header.style.backgroundColor = 'transparent';
        }
        
        lastScrollTop = scrollTop;
    });

    // Pagination functionality
    const paginationDots = document.querySelectorAll('.pagination .dot');
    paginationDots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            // Remove active class from all dots
            paginationDots.forEach(d => d.classList.remove('active'));
            // Add active class to clicked dot
            this.classList.add('active');
            
            // Here you can add logic to show different content based on the selected dot
            console.log(`Selected page: ${index + 1}`);
        });
    });

    // Testimonial navigation
    const prevBtn = document.querySelector('.nav-btn.prev');
    const nextBtn = document.querySelector('.nav-btn.next');
    
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', function() {
            // Add logic to show previous testimonial
            console.log('Show previous testimonial');
        });
        
        nextBtn.addEventListener('click', function() {
            // Add logic to show next testimonial
            console.log('Show next testimonial');
        });
    }

    // Hero navigation arrows
    const leftArrow = document.querySelector('.nav-arrow.left');
    const rightArrow = document.querySelector('.nav-arrow.right');
    
    if (leftArrow && rightArrow) {
        leftArrow.addEventListener('click', function() {
            // Add logic to navigate to previous hero slide
            console.log('Navigate to previous hero slide');
        });
        
        rightArrow.addEventListener('click', function() {
            // Add logic to navigate to next hero slide
            console.log('Navigate to next hero slide');
        });
    }

    // Email form submission
    const emailForm = document.querySelector('.email-form');
    const emailInput = document.querySelector('.email-input');
    
    if (emailForm && emailInput) {
        emailForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = emailInput.value.trim();
            if (email && isValidEmail(email)) {
                // Here you would typically send the email to your backend
                alert('Thank you for subscribing! Welcome to the Pro Form community.');
                emailInput.value = '';
            } else {
                alert('Please enter a valid email address.');
            }
        });
    }

    // Button click effects
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Add ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Mobile menu functionality
    const mobileMenuToggle = document.createElement('button');
    mobileMenuToggle.className = 'mobile-menu-toggle';
    mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    mobileMenuToggle.style.display = 'none';
    
    const logo = document.querySelector('.logo');
    logo.parentNode.insertBefore(mobileMenuToggle, logo.nextSibling);
    
    // Show mobile menu toggle on small screens
    function checkMobile() {
        if (window.innerWidth <= 768) {
            mobileMenuToggle.style.display = 'block';
            document.querySelector('.nav').style.display = 'none';
        } else {
            mobileMenuToggle.style.display = 'none';
            document.querySelector('.nav').style.display = 'flex';
            closeMobileMenu();
        }
    }
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Mobile menu toggle functionality
    mobileMenuToggle.addEventListener('click', function() {
        const nav = document.querySelector('.nav');
        
        if (nav.classList.contains('active')) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });
    
    // Close mobile menu function
    function closeMobileMenu() {
        const nav = document.querySelector('.nav');
        
        nav.classList.remove('active');
        
        // Update toggle button icon
        mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    }
    
    // Open mobile menu function
    function openMobileMenu() {
        const nav = document.querySelector('.nav');
        
        nav.classList.add('active');
        
        // Update toggle button icon
        mobileMenuToggle.innerHTML = '<i class="fas fa-times"></i>';
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        const nav = document.querySelector('.nav');
        const header = document.querySelector('.header');
        
        if (!header.contains(e.target) && nav.classList.contains('active')) {
            closeMobileMenu();
        }
    });
    
    // Touch events for mobile
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', function(e) {
        touchStartY = e.changedTouches[0].screenY;
    });
    
    document.addEventListener('touchend', function(e) {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartY - touchEndY;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe up - could be used for navigation
                console.log('Swipe up detected');
            } else {
                // Swipe down - could be used for navigation
                console.log('Swipe down detected');
            }
        }
    }
    
    // Performance optimization for mobile
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            // Register service worker for better performance
            console.log('Service Worker support available');
        });
    }
    
    // Lazy loading for images on mobile
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Background images for hero section
    const heroImages = [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=800&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=1200&h=800&fit=crop'
    ];
    let currentHeroIndex = 0;
    function changeHeroBg() {
      const heroBg = document.querySelector('.hero-bg');
      if (heroBg) {
        heroBg.classList.add('fade-out');
        setTimeout(() => {
          heroBg.style.backgroundImage = `url('${heroImages[currentHeroIndex]}')`;
          currentHeroIndex = (currentHeroIndex + 1) % heroImages.length;
          heroBg.classList.remove('fade-out');
          heroBg.classList.add('fade-in');
          setTimeout(() => {
            heroBg.classList.remove('fade-in');
          }, 1000);
        }, 500);
      }
    }
    setInterval(changeHeroBg, 5000);
    window.addEventListener('DOMContentLoaded', changeHeroBg);
});

// Initialize scroll features
function initScrollFeatures() {
    const scrollProgress = document.querySelector('.scroll-progress');
    const scrollDots = document.querySelectorAll('.scroll-dot');
    const sections = document.querySelectorAll('section');
    
    // Update scroll progress bar
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        scrollProgress.style.width = scrollPercent + '%';
        
        // Update active scroll dot
        updateActiveScrollDot(scrollTop);
    });
    
    // Scroll dot click navigation
    scrollDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            if (sections[index]) {
                sections[index].scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize video carousel
function initVideoCarousel() {
    const videoContainer = document.querySelector('.video-container');
    const prevBtn = document.getElementById('prevVideo');
    const nextBtn = document.getElementById('nextVideo');
    const dots = document.querySelectorAll('.video-dot');
    
    let currentVideo = 0;
    const totalVideos = document.querySelectorAll('.video-slide').length;
    
    // Update video carousel
    function updateVideoCarousel() {
        const translateX = -currentVideo * 100;
        videoContainer.style.transform = `translateX(${translateX}%)`;
        
        // Update navigation buttons
        prevBtn.disabled = currentVideo === 0;
        nextBtn.disabled = currentVideo === totalVideos - 1;
        
        // Update dots
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentVideo);
        });
        
        // Pause all videos
        const videos = document.querySelectorAll('.video-player');
        videos.forEach(video => video.pause());
    }
    
    // Next video
    nextBtn.addEventListener('click', () => {
        if (currentVideo < totalVideos - 1) {
            currentVideo++;
            updateVideoCarousel();
        }
    });
    
    // Previous video
    prevBtn.addEventListener('click', () => {
        if (currentVideo > 0) {
            currentVideo--;
            updateVideoCarousel();
        }
    });
    
    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentVideo = index;
            updateVideoCarousel();
        });
    });
    
    // Touch/swipe support for mobile
    let startX = 0;
    let endX = 0;
    
    videoContainer.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    });
    
    videoContainer.addEventListener('touchend', (e) => {
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
    
    // Auto-advance (optional)
    let autoAdvance = setInterval(() => {
        if (currentVideo < totalVideos - 1) {
            currentVideo++;
        } else {
            currentVideo = 0;
        }
        updateVideoCarousel();
    }, 8000);
    
    // Pause auto-advance on user interaction
    videoContainer.addEventListener('mouseenter', () => clearInterval(autoAdvance));
    videoContainer.addEventListener('mouseleave', () => {
        autoAdvance = setInterval(() => {
            if (currentVideo < totalVideos - 1) {
                currentVideo++;
            } else {
                currentVideo = 0;
            }
            updateVideoCarousel();
        }, 8000);
    });
}

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function animateCounter(element, start, end, duration, prefix = '') {
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

function updateActiveScrollDot(scrollTop) {
    const sections = document.querySelectorAll('section');
    const scrollDots = document.querySelectorAll('.scroll-dot');
    
    sections.forEach((section, index) => {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;
        
        if (scrollTop >= sectionTop - 100 && scrollTop < sectionBottom - 100) {
            scrollDots.forEach(dot => dot.classList.remove('active'));
            if (scrollDots[index]) {
                scrollDots[index].classList.add('active');
            }
        }
    });
}

// Add CSS for ripple effect and mobile optimizations
const style = document.createElement('style');
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
