/* ═══════════════════════════════════════════
   STICHTING HAMIËD — JAVASCRIPT
   GSAP ScrollTrigger + Quiz + Forms + Nav
═══════════════════════════════════════════ */

'use strict';

// ─── GSAP Registration ───────────────────────────────────────────────────────
gsap.registerPlugin(
  ScrollTrigger,
  ScrollToPlugin,
  typeof Flip !== 'undefined' ? Flip : undefined,
  typeof Draggable !== 'undefined' ? Draggable : undefined
);

// ─── Reduced motion preference (used across modules) ─────────────────────────
const PREFERS_REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ─── DOM Ready ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initSplash();
  initNav();
  initScrollAnimations();
  initLocationCards();
  initQuiz();
  initForms();
  initJobCarousel();
  initMobileNav();
  initHeroMedia();
  initHeroAnimations();
});

// ═══════════════════════════════════════════
// SPLASH SCREEN — zoom-in logo, 2s, then dismiss
// ═══════════════════════════════════════════
function initSplash() {
  const splash = document.getElementById('splash-screen');
  const logo   = splash ? splash.querySelector('.splash-logo') : null;
  if (!splash || !logo) return;

  // Prevent scroll while splash is visible
  document.body.style.overflow = 'hidden';

  const tl = gsap.timeline({
    onComplete: () => {
      document.body.style.overflow = '';
      splash.classList.add('splash-hidden');
    }
  });

  // Start small + invisible, zoom smoothly to full size in 2 s
  tl.fromTo(logo,
    { scale: 0.35, opacity: 0 },
    { scale: 1, opacity: 1, duration: 2, ease: 'power3.out' }
  )
  // Brief pause at full size, then fade the whole screen out
  .to(splash,
    { opacity: 0, duration: 0.55, ease: 'power2.inOut' },
    '+=0.25'
  );
}

// ═══════════════════════════════════════════
// NAV — sticky scroll + active section + smooth scroll
// ═══════════════════════════════════════════
function initNav() {
  const header = document.getElementById('site-header');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');
  const sections = document.querySelectorAll('section[id]');
  const navHeight = () => {
    const cssVar = getComputedStyle(document.documentElement).getPropertyValue('--nav-h').trim();
    return Number(cssVar.replace('px', '')) || 80;
  };

  // Keep nav styling persistent from initial paint
  if (header) {
    header.classList.add('scrolled');
  }

  // Scroll → add class
  ScrollTrigger.create({
    start: 'top -10',
    onUpdate: (self) => {
      header.classList.toggle('scrolled', self.scroll() > 60);
    }
  });

  // Smooth scroll on nav click
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      gsap.to(window, {
        duration: 1.1,
        scrollTo: { y: target, offsetY: navHeight() },
        ease: 'power3.inOut'
      });
      // Close mobile nav
      const mobileNav = document.querySelector('.mobile-nav');
      if (mobileNav) {
        mobileNav.classList.remove('open');
        mobileNav.setAttribute('aria-hidden', 'true');
      }
    });
  });

  // Active nav link on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.section === entry.target.id);
        });
      }
    });
  }, { threshold: 0.3, rootMargin: `-${navHeight()}px 0px -40% 0px` });

  sections.forEach(s => observer.observe(s));
}

// ═══════════════════════════════════════════
// MOBILE NAV
// ═══════════════════════════════════════════
function initMobileNav() {
  const burger = document.querySelector('.nav-hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (!burger || !mobileNav) return;

  let isOpen = false;
  burger.addEventListener('click', () => {
    isOpen = !isOpen;
    mobileNav.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    mobileNav.setAttribute('aria-hidden', String(!isOpen));

    // Animate burger → X
    const spans = burger.querySelectorAll('span');
    if (isOpen) {
      gsap.to(spans[0], { rotation: 45, y: 7, duration: 0.25, ease: 'power2.out' });
      gsap.to(spans[1], { opacity: 0, duration: 0.2 });
      gsap.to(spans[2], { rotation: -45, y: -7, duration: 0.25, ease: 'power2.out' });
    } else {
      gsap.to(spans[0], { rotation: 0, y: 0, duration: 0.25, ease: 'power2.out' });
      gsap.to(spans[1], { opacity: 1, duration: 0.2 });
      gsap.to(spans[2], { rotation: 0, y: 0, duration: 0.25, ease: 'power2.out' });
    }
  });
}

// ═══════════════════════════════════════════
// HERO ANIMATIONS
// ═══════════════════════════════════════════
function initHeroAnimations() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.from('.hero-eyebrow', { opacity: 0, y: 20, duration: 0.8, delay: 0.3 })
    .from('.hero-title', { opacity: 0, y: 40, duration: 1.1 }, '-=0.5')
    .from('.hero-sub', { opacity: 0, y: 24, duration: 0.8 }, '-=0.7')
    .from('.btn-hero', { opacity: 0, y: 20, duration: 0.7 }, '-=0.5')
    .from('.scroll-cue', { opacity: 0, duration: 0.5 }, '-=0.2');
}

// ═══════════════════════════════════════════
// HERO VIDEO — lazy start + fallback handling
// ═══════════════════════════════════════════
function initHeroMedia() {
  const heroVideo = document.querySelector('.hero-video');
  const heroVideoWrap = document.querySelector('.hero-video-wrap');
  const heroFallback = document.querySelector('.hero-video-fallback');

  if (!heroVideo || !heroVideoWrap || !heroFallback) return;

  const showFallback = () => heroVideoWrap.classList.remove('media-ready');
  const showVideo = () => heroVideoWrap.classList.add('media-ready');

  heroVideo.muted = true;
  heroVideo.setAttribute('muted', '');
  heroVideo.setAttribute('playsinline', '');
  heroVideo.preload = 'auto';

  const tryPlay = () => {
    const playPromise = heroVideo.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.then(() => {
        showVideo();
      }).catch(() => {
        showFallback();
      });
    } else {
      showFallback();
    }
  };

  if (heroVideo.readyState >= 3) {
    tryPlay();
  } else {
    heroVideo.addEventListener('canplay', tryPlay, { once: true });
  }

  heroVideo.addEventListener('playing', showVideo, { once: true });
  heroVideo.addEventListener('error', showFallback, { once: true });
}

// ═══════════════════════════════════════════
// SCROLL ANIMATIONS — GSAP ScrollTrigger
// ═══════════════════════════════════════════
function initScrollAnimations() {
  const ease = 'power3.out';

  // Section headers
  gsap.utils.toArray('.section-eyebrow, .section-title, .section-desc').forEach(el => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      opacity: 0, y: 30, duration: 0.8, ease,
    });
  });

  // Service cards — stagger
  const serviceCards = gsap.utils.toArray('.service-card');
  if (serviceCards.length) {
    gsap.from(serviceCards, {
      scrollTrigger: { trigger: '.services-grid', start: 'top 80%', once: true },
      opacity: 0, y: 36, duration: 0.7, ease,
      stagger: { amount: 0.5, from: 'start' }
    });
  }

  // (Job carousel reveal is handled inside initJobCarousel)

  // Location cards — stagger from left
  const locCards = gsap.utils.toArray('.location-card');
  if (locCards.length) {
    gsap.from(locCards, {
      scrollTrigger: { trigger: '.locations-grid', start: 'top 85%', once: true },
      opacity: 0, y: 24, duration: 0.8, ease,
      stagger: { amount: 0.4 }
    });
  }

  // About layout
  const aboutText = document.querySelector('.about-text');
  const aboutVisuals = document.querySelector('.about-visuals');
  if (aboutText) {
    gsap.from(aboutText, {
      scrollTrigger: { trigger: aboutText, start: 'top 80%', once: true },
      opacity: 0, x: -40, duration: 0.9, ease
    });
  }
  if (aboutVisuals) {
    gsap.from(aboutVisuals, {
      scrollTrigger: { trigger: aboutVisuals, start: 'top 80%', once: true },
      opacity: 0, x: 40, duration: 0.9, ease
    });
  }

  // Stat cards count-up
  document.querySelectorAll('.about-stat-card').forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: { trigger: card, start: 'top 85%', once: true },
      opacity: 0, scale: 0.88, duration: 0.6, ease,
      delay: i * 0.12
    });
  });

  // Donor cards
  const donorCards = gsap.utils.toArray('.donor-card');
  if (donorCards.length) {
    gsap.from(donorCards, {
      scrollTrigger: { trigger: '.donors-grid', start: 'top 82%', once: true },
      opacity: 0, y: 24, duration: 0.6, ease,
      stagger: { amount: 0.35 }
    });
  }

  // FAQ items
  const faqItems = gsap.utils.toArray('.faq-item');
  if (faqItems.length) {
    gsap.from(faqItems, {
      scrollTrigger: { trigger: '.faq-list', start: 'top 80%', once: true },
      opacity: 0, y: 16, duration: 0.55, ease,
      stagger: { amount: 0.3 }
    });
  }

  // Quiz container
  const quizContainer = document.querySelector('.quiz-container');
  if (quizContainer) {
    gsap.from(quizContainer, {
      scrollTrigger: { trigger: quizContainer, start: 'top 80%', once: true },
      opacity: 0, y: 32, scale: 0.97, duration: 0.8, ease
    });
  }

  // (Apply form is now inside the carousel modal; no reveal needed here)

  // Contact form wrap
  const contactForms = document.querySelectorAll('.contact-form-wrap, .contact-info-wrap');
  contactForms.forEach((el, i) => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 82%', once: true },
      opacity: 0, y: 28, duration: 0.75, ease,
      delay: i * 0.15
    });
  });

  // Donate layout
  const donateInfo = document.querySelector('.donate-info');
  const donateRecognition = document.querySelector('.donate-recognition');
  if (donateInfo) {
    gsap.from(donateInfo, {
      scrollTrigger: { trigger: donateInfo, start: 'top 82%', once: true },
      opacity: 0, x: -30, duration: 0.8, ease
    });
  }
  if (donateRecognition) {
    gsap.from(donateRecognition, {
      scrollTrigger: { trigger: donateRecognition, start: 'top 82%', once: true },
      opacity: 0, x: 30, duration: 0.8, ease
    });
  }
}

// ═══════════════════════════════════════════
// LOCATION CARDS — hover scale
// ═══════════════════════════════════════════
function initLocationCards() {
  const cards = document.querySelectorAll('.location-card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      gsap.to(card, { scale: 1.02, duration: 0.45, ease: 'power2.out', zIndex: 2 });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { scale: 1, duration: 0.45, ease: 'power2.out', zIndex: 1 });
    });
  });
}

// ═══════════════════════════════════════════
// CARE QUIZ
// ═══════════════════════════════════════════
function initQuiz() {
  const slides = document.querySelectorAll('.quiz-slide:not(.quiz-result)');
  const resultSlide = document.getElementById('quiz-result');
  const prevBtn = document.getElementById('quiz-prev');
  const nextBtn = document.getElementById('quiz-next');
  const progressBar = document.getElementById('quiz-progress-bar');
  const stepLabel = document.getElementById('quiz-step-label');
  const dots = document.querySelectorAll('.quiz-dot');
  const quizNav = document.getElementById('quiz-nav');
  const totalSteps = slides.length;

  let currentStep = 0;
  let answers = {};

  function updateProgress() {
    const pct = ((currentStep + 1) / totalSteps) * 100;
    gsap.to(progressBar, { width: pct + '%', duration: 0.5, ease: 'power2.out' });
    stepLabel.textContent = currentStep < totalSteps
      ? `Stap ${currentStep + 1} van ${totalSteps}`
      : 'Uw advies';
    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentStep));
    prevBtn.disabled = currentStep === 0;
  }

  function showSlide(index, direction = 1) {
    const from = direction === 1 ? 40 : -40;
    if (index >= totalSteps) {
      // Show result
      slides.forEach(s => s.classList.remove('active'));
      resultSlide.classList.add('active');
      quizNav.style.display = 'none';
      stepLabel.textContent = 'Uw persoonlijk advies';
      gsap.from(resultSlide, { opacity: 0, y: from, duration: 0.5, ease: 'power3.out' });
      showResult();
      return;
    }
    slides.forEach((slide, i) => {
      if (i === index) {
        slide.classList.add('active');
        gsap.from(slide, { opacity: 0, x: from, duration: 0.4, ease: 'power3.out' });
      } else {
        slide.classList.remove('active');
      }
    });
  }

  function showResult() {
    const titleEl = document.getElementById('quiz-result-title');
    const textEl = document.getElementById('quiz-result-text');
    const hiddenEl = document.getElementById('quiz-result-hidden');

    // Simple algorithm
    let recommendation = '';
    let resultText = '';

    if (answers[4] === 'yes') {
      recommendation = 'Palliatieve zorg';
      resultText = 'Op basis van uw antwoorden lijkt palliatieve/terminale zorg het meest passend. Ons gespecialiseerd team biedt liefdevolle begeleiding in de laatste levensfase, gericht op comfort, waardigheid en geborgenheid voor zowel de bewoner als de familie.';
    } else if (answers[2] === 'memory') {
      recommendation = 'Gespecialiseerde dementiezorg';
      resultText = 'Ons gespecialiseerde dementiezorgprogramma biedt een veilige, gestructureerde omgeving met individuele begeleiding voor mensen met geheugenproblematiek.';
    } else if (answers[3] === 'fulltime' || answers[3] === 'intensive') {
      recommendation = '24-uurszorg / Residentiële zorg';
      resultText = 'Op basis van uw antwoorden lijkt voltijdse residentiële zorg de meest geschikte optie. In een van onze vier locaties krijgt uw naaste 24/7 professionele verpleging en een warme, thuisachtige omgeving.';
    } else if (answers[3] === 'home' || answers[3] === 'daycare') {
      recommendation = 'Thuiszorg of Dagopvang';
      resultText = 'Thuiszorg of dagopvang sluit goed aan bij uw situatie. Uw naaste kan thuis blijven wonen en overdag professionele begeleiding en activiteiten ontvangen bij Stichting Hamiëd.';
    } else if (answers[2] === 'daily') {
      recommendation = 'Dagopvang of Thuiszorg';
      resultText = 'Voor ondersteuning bij dagelijkse activiteiten bieden wij uitstekende dagopvang en thuiszorgdiensten. Uw naaste behoudt zoveel mogelijk zelfstandigheid met de juiste begeleiding.';
    } else {
      recommendation = 'Persoonlijk intakegesprek';
      resultText = 'Op basis van uw antwoorden adviseren wij een persoonlijk intakegesprek met ons zorgteam. Samen bespreken wij de best passende zorgvorm voor uw specifieke situatie.';
    }

    titleEl.textContent = `Aanbeveling: ${recommendation}`;
    textEl.textContent = resultText;
    hiddenEl.value = recommendation;
    gsap.to(progressBar, { width: '100%', duration: 0.5, ease: 'power2.out' });
  }

  // Option selection
  document.querySelectorAll('.quiz-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const slide = opt.closest('.quiz-slide');
      const step = parseInt(slide.dataset.step);
      slide.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      answers[step] = opt.dataset.value;

      // Pulse animation
      gsap.from(opt, { scale: 0.97, duration: 0.2, ease: 'power2.out' });

      // Enable next
      nextBtn.disabled = false;
      nextBtn.textContent = currentStep < totalSteps - 1 ? 'Volgende →' : 'Bekijk advies →';
    });
  });

  // Next button
  nextBtn.addEventListener('click', () => {
    if (!answers[currentStep + 1]) return; // No answer selected
    currentStep++;
    updateProgress();
    showSlide(currentStep, 1);
  });

  // Prev button
  prevBtn.addEventListener('click', () => {
    if (currentStep === 0) return;
    currentStep--;
    updateProgress();
    showSlide(currentStep, -1);
    nextBtn.disabled = false;
    nextBtn.textContent = currentStep < totalSteps - 1 ? 'Volgende →' : 'Bekijk advies →';
  });

  updateProgress();

  // Quiz contact form
  const quizForm = document.getElementById('quiz-contact-form');
  if (quizForm) {
    quizForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateForm(quizForm)) return;
      showToast('Uw aanvraag is verstuurd! Wij nemen spoedig contact op.', 'success');
      quizForm.reset();
    });
  }
}

// ═══════════════════════════════════════════
// FORMS
// ═══════════════════════════════════════════
function initForms() {
  // Contact form
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateForm(contactForm)) return;
      showToast('Bericht verstuurd! Wij reageren binnen 1 werkdag.', 'success');
      contactForm.reset();
    });
  }

  // Apply form (job applications) — inside modal
  const applyForm = document.getElementById('apply-form');
  if (applyForm) {
    applyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateForm(applyForm)) return;
      showToast('Sollicitatie verstuurd naar hr@hamied.cw!', 'success');

      // Show in-card success state, then close modal back to carousel
      const successEl = document.getElementById('apply-modal-success');
      if (successEl) {
        successEl.hidden = false;
        // force reflow so the transition runs
        // eslint-disable-next-line no-unused-expressions
        successEl.offsetWidth;
        successEl.classList.add('show');
      }

      setTimeout(() => {
        applyForm.reset();
        const fs = document.getElementById('file-selected');
        if (fs) fs.textContent = 'Geen bestand gekozen';

        // Notify the carousel module to close the modal
        document.dispatchEvent(new CustomEvent('apply-modal:close'));

        // Reset success state for next submission (after fade-out)
        setTimeout(() => {
          if (successEl) {
            successEl.classList.remove('show');
            successEl.hidden = true;
          }
        }, 600);
      }, 1500);
    });
  }

  // (Job apply buttons are wired by initJobCarousel; modal handles prefill + flip.)

  // File input display
  const cvInput = document.getElementById('af-cv');
  const fileSelected = document.getElementById('file-selected');
  if (cvInput && fileSelected) {
    cvInput.addEventListener('change', () => {
      const fileName = cvInput.files[0]?.name;
      fileSelected.textContent = fileName || 'Geen bestand gekozen';
      if (fileName) fileSelected.style.color = 'var(--color-violet)';
    });
  }
}

// ═══════════════════════════════════════════
// FORM VALIDATION
// ═══════════════════════════════════════════
function validateForm(form) {
  let isValid = true;
  const requiredFields = form.querySelectorAll('[required]');

  requiredFields.forEach(field => {
    const parent = field.closest('.form-group');
    field.style.borderColor = '';
    if (parent) parent.querySelector('.field-error')?.remove();

    let fieldValid = true;
    if (!field.value.trim()) {
      fieldValid = false;
    } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
      fieldValid = false;
    }

    if (!fieldValid) {
      isValid = false;
      field.style.borderColor = '#e591c4';
      gsap.from(field, { x: -6, duration: 0.3, ease: 'power2.out', yoyo: true, repeat: 3 });
    }
  });

  if (!isValid) {
    showToast('Vul alle verplichte velden correct in.', 'error');
  }
  return isValid;
}

// ═══════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════
function showToast(message, type = 'default') {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.className = 'toast show';
  if (type === 'success') toast.classList.add('success');

  gsap.fromTo(toast,
    { y: 30, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out' }
  );

  setTimeout(() => {
    gsap.to(toast, {
      y: 20, opacity: 0, duration: 0.35, ease: 'power2.in',
      onComplete: () => toast.classList.remove('show', 'success')
    });
  }, 4000);
}

// ═══════════════════════════════════════════
// JOB CAROUSEL — liquid-glass + flip-to-modal
// ═══════════════════════════════════════════
function initJobCarousel() {
  const section   = document.getElementById('join-team');
  const carousel  = document.getElementById('job-carousel');
  const track     = document.getElementById('carousel-track');
  if (!section || !carousel || !track) return;

  const cards     = Array.from(track.querySelectorAll('.job-card'));
  if (!cards.length) return;

  const prevBtn   = document.getElementById('carousel-prev');
  const nextBtn   = document.getElementById('carousel-next');
  const counter   = document.getElementById('carousel-counter');
  const liveEl    = document.getElementById('carousel-live');
  const badgeEl   = document.getElementById('carousel-badge');
  const total     = cards.length;

  const modal       = document.getElementById('apply-modal');
  const modalCard   = document.getElementById('apply-modal-card');
  const modalClose  = document.getElementById('apply-modal-close');
  const modalBackdrop = document.getElementById('apply-modal-backdrop');
  const positionInput = document.getElementById('apply-position');
  const jobNameSpan   = document.getElementById('apply-job-name');

  let activeIndex = 0;
  let isModalOpen = false;
  let currentFlippedCard = null;
  let lastFocusedBeforeModal = null;

  function updatePositions() {
    cards.forEach((card, i) => {
      const offset = ((i - activeIndex) % total + total) % total;
      // map offset → position label (relative to active)
      let pos = 'hidden';
      if (offset === 0) pos = 'center';
      else if (offset === 1) pos = 'right';
      else if (offset === total - 1) pos = 'left';
      else if (offset === 2) pos = 'far-right';
      else if (offset === total - 2) pos = 'far-left';
      card.dataset.position = pos;
      card.setAttribute('aria-hidden', pos === 'center' ? 'false' : 'true');
    });

    // counter
    if (counter) counter.textContent = `${activeIndex + 1} / ${total}`;

    // badge
    const centerCard = cards[activeIndex];
    const badgeText  = centerCard?.dataset.badge;
    if (badgeEl) {
      badgeEl.classList.remove('show', 'is-nieuw', 'is-urgent');
      if (badgeText) {
        badgeEl.textContent = badgeText;
        badgeEl.hidden = false;
        if (badgeText.toLowerCase() === 'nieuw') badgeEl.classList.add('is-nieuw');
        else if (badgeText.toLowerCase() === 'urgent') badgeEl.classList.add('is-urgent');
        // double-rAF to ensure transition runs
        requestAnimationFrame(() => requestAnimationFrame(() => badgeEl.classList.add('show')));
      } else {
        badgeEl.hidden = true;
      }
    }

    // live region
    if (liveEl && centerCard) {
      liveEl.textContent = `Vacature ${activeIndex + 1} van ${total}: ${centerCard.dataset.job}`;
    }
  }

  function goTo(index) {
    activeIndex = ((index % total) + total) % total;
    updatePositions();
  }
  function next() { goTo(activeIndex + 1); }
  function prev() { goTo(activeIndex - 1); }

  // Click on a side card → bring it to center
  cards.forEach((card, i) => {
    card.addEventListener('click', (e) => {
      // Apply button click on centered card → open modal (handled below)
      if (e.target.closest('.job-apply-btn')) return;
      if (i === activeIndex) return;
      goTo(i);
    });
  });

  // Apply buttons → open modal (only fires from centered card thanks to CSS pointer-events)
  cards.forEach((card) => {
    const btn = card.querySelector('.job-apply-btn');
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openModal(card);
    });
  });

  // Nav buttons
  if (prevBtn) prevBtn.addEventListener('click', prev);
  if (nextBtn) nextBtn.addEventListener('click', next);

  // Keyboard navigation when section is focused / hovered
  function handleKey(e) {
    if (isModalOpen) {
      if (e.key === 'Escape') { e.preventDefault(); closeModal(); }
      return;
    }
    // Only react when carousel or section is in viewport AND focus is inside
    if (!section.contains(document.activeElement) && !carousel.matches(':hover')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
  }
  document.addEventListener('keydown', handleKey);

  // Touch / swipe via Draggable on a proxy element
  if (typeof Draggable !== 'undefined') {
    const proxy = document.createElement('div');
    proxy.style.position = 'absolute';
    proxy.style.inset = '0';
    proxy.style.zIndex = '3';
    proxy.style.background = 'transparent';
    proxy.style.cursor = 'grab';
    track.appendChild(proxy);

    let startX = 0;
    Draggable.create(proxy, {
      type: 'x',
      inertia: false,
      onPress(e) { startX = this.x; proxy.style.cursor = 'grabbing'; },
      onRelease() {
        proxy.style.cursor = 'grab';
        const dx = this.x - startX;
        gsap.set(proxy, { x: 0 });
        if (dx < -40) next();
        else if (dx > 40) prev();
      },
      allowEventDefault: false
    });

    // Make sure clicks on cards still bubble: stop the Draggable from
    // hijacking clicks when there was no drag. We also let underlying
    // elements receive pointer events when dragging hasn't started.
    proxy.addEventListener('click', (e) => {
      // Forward the click to whatever is under the cursor
      proxy.style.pointerEvents = 'none';
      const below = document.elementFromPoint(e.clientX, e.clientY);
      proxy.style.pointerEvents = '';
      if (below && below !== proxy) {
        below.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, clientX: e.clientX, clientY: e.clientY }));
      }
    });
  }

  // ── MODAL OPEN / CLOSE with Flip ────────────────────────────────────────
  function openModal(card) {
    if (isModalOpen) return;
    const jobName = card.dataset.job;
    if (positionInput) positionInput.value = jobName;
    if (jobNameSpan) jobNameSpan.textContent = `— ${jobName}`;

    isModalOpen = true;
    currentFlippedCard = card;
    lastFocusedBeforeModal = document.activeElement;

    // Mark and show modal
    modal.hidden = false;
    requestAnimationFrame(() => {
      modal.classList.add('is-open');
    });

    // Add a flip class to the source card for visual continuity
    card.classList.add('is-flipping');

    // Animate the modal card in (flip + scale). We use a simple GSAP timeline
    // because Flip on a fixed-positioned modal of different markup is brittle.
    if (PREFERS_REDUCED_MOTION) {
      gsap.set(modalCard, { opacity: 1, scale: 1, rotationY: 0 });
    } else {
      gsap.fromTo(modalCard,
        { opacity: 0, scale: 0.85, rotationY: -90, transformPerspective: 1200 },
        { opacity: 1, scale: 1, rotationY: 0, duration: 0.65, ease: 'power3.out' }
      );
    }

    // Lock scroll
    document.body.style.overflow = 'hidden';

    // Focus management
    setTimeout(() => {
      const firstField = modal.querySelector('input, textarea, button');
      if (firstField) firstField.focus();
    }, 100);

    document.addEventListener('keydown', trapFocus);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
  }

  function closeModal() {
    if (!isModalOpen) return;

    const finish = () => {
      modal.classList.remove('is-open');
      modal.hidden = true;
      document.body.style.overflow = '';
      if (currentFlippedCard) currentFlippedCard.classList.remove('is-flipping');
      currentFlippedCard = null;
      isModalOpen = false;
      document.removeEventListener('keydown', trapFocus);
      if (modalBackdrop) modalBackdrop.removeEventListener('click', closeModal);
      if (lastFocusedBeforeModal && lastFocusedBeforeModal.focus) lastFocusedBeforeModal.focus();
    };

    if (PREFERS_REDUCED_MOTION) { finish(); return; }

    gsap.to(modalCard, {
      opacity: 0,
      scale: 0.85,
      rotationY: 90,
      duration: 0.5,
      ease: 'power3.in',
      onComplete: finish
    });
  }

  // Focus trap inside modal
  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    const focusables = modal.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last  = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  document.addEventListener('apply-modal:close', closeModal);

  // Initial state FIRST — so data-position transforms are applied before any animation
  updatePositions();

  // ── Scroll reveal ───────────────────────────────────────────────────────
  // Animate the inner element (which does NOT carry position transforms),
  // so the carousel's data-position offsets on .job-card remain intact.
  if (!PREFERS_REDUCED_MOTION) {
    const inners = cards.map(c => c.querySelector('.job-card-inner')).filter(Boolean);
    gsap.from(inners, {
      scrollTrigger: { trigger: section, start: 'top 75%', once: true },
      opacity: 0,
      scale: 0.9,
      duration: 0.7,
      stagger: 0.08,
      ease: 'power3.out'
    });
  }
}

// ═══════════════════════════════════════════
// PARALLAX HERO VIDEO (subtle)
// ═══════════════════════════════════════════
window.addEventListener('scroll', () => {
  const video = document.querySelector('.hero-video');
  const fallback = document.querySelector('.hero-video-fallback');
  const scrollY = window.scrollY;
  const el = video || fallback;
  if (el) {
    el.style.transform = `translateY(${scrollY * 0.35}px)`;
  }
}, { passive: true });
